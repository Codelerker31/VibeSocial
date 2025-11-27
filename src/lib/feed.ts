import { prisma } from '@/lib/prisma';
import { 
  calculateProjectRelevance, 
  diversifyFeed, 
  UserInterestTag
} from './personalization';
import { ProjectType, Prisma } from '@prisma/client';

type FeedProject = Prisma.ProjectGetPayload<{
  include: {
    tags: { include: { tag: true } },
    user: { select: { id: true, displayName: true, profilePicture: true } }
  }
}>;

export async function getUserInterestTags(userId: string): Promise<UserInterestTag[]> {
  // Fetch interactions
  const interactions = await prisma.interaction.findMany({
    where: {
      userId,
      type: { in: ['SAVE', 'LIKE', 'VIEW'] }
    },
    include: {
      project: {
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Look at last 100 interactions
  });

  const tagWeights = new Map<string, number>();

  for (const interaction of interactions) {
    let weight = 0;
    if (interaction.type === 'SAVE') weight = 5;
    else if (interaction.type === 'LIKE') weight = 1;
    else if (interaction.type === 'VIEW') weight = 2;

    for (const pt of interaction.project.tags) {
      const current = tagWeights.get(pt.tag.id) || 0;
      tagWeights.set(pt.tag.id, current + weight);
    }
  }

  return Array.from(tagWeights.entries())
    .map(([tagId, weight]) => ({ tagId, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}

export async function getPersonalizedFeed(userId: string, page: number = 1, limit: number = 20) {
  const interestTags = await getUserInterestTags(userId);
  const interestTagIds = interestTags.map(t => t.tagId);

  // 1. Get projects user has viewed recently to exclude
  const viewedInteractions = await prisma.interaction.findMany({
    where: {
      userId,
      type: 'VIEW',
      createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    select: { projectId: true }
  });
  const viewedIds = viewedInteractions.map(i => i.projectId);

  // 2. Fetch candidate projects
  // Fetch top scoring projects
  const topScoring = await prisma.project.findMany({
    where: {
      status: 'APPROVED',
      id: { notIn: viewedIds },
    },
    include: {
      tags: { include: { tag: true } },
      user: { select: { id: true, displayName: true, profilePicture: true } }
    },
    orderBy: { finalScore: 'desc' },
    take: 50
  });

  // Fetch niche projects matching interests
  let nicheProjects: FeedProject[] = [];
  if (interestTagIds.length > 0) {
    nicheProjects = await prisma.project.findMany({
      where: {
        status: 'APPROVED',
        id: { notIn: viewedIds },
        tags: { some: { tagId: { in: interestTagIds } } }
      },
      include: {
        tags: { include: { tag: true } },
        user: { select: { id: true, displayName: true, profilePicture: true } }
      },
      orderBy: { finalScore: 'desc' },
      take: 50
    });
  }
  
  // Merge and deduplicate
  const allProjectsMap = new Map<string, FeedProject>();
  topScoring.forEach(p => allProjectsMap.set(p.id, p));
  nicheProjects.forEach(p => allProjectsMap.set(p.id, p));
  
  const allProjects = Array.from(allProjectsMap.values());

  // 3. Calculate relevance and re-score
  const scoredProjects = allProjects.map(p => {
    const relevance = calculateProjectRelevance(p, interestTags);
    // Boost finalScore by relevance
    const personalizedScore = p.finalScore * (1 + relevance);
    return { ...p, personalizedScore };
  });

  // 4. Sort by personalized score
  scoredProjects.sort((a, b) => b.personalizedScore - a.personalizedScore);

  // 5. Diversify
  const diversified = diversifyFeed(scoredProjects);

  // 6. Paginate
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = diversified.slice(start, end);

  return {
    projects: paginated,
    hasMore: end < diversified.length
  };
}

export async function getGenericFeed(page: number = 1, limit: number = 20) {
  const projects = await prisma.project.findMany({
    where: { status: 'APPROVED' },
    include: {
      tags: { include: { tag: true } },
      user: { select: { id: true, displayName: true, profilePicture: true } }
    },
    orderBy: { finalScore: 'desc' },
    take: 100
  });

  const diversified = diversifyFeed(projects);
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = diversified.slice(start, end);

  return {
    projects: paginated,
    hasMore: end < diversified.length
  };
}

export async function getFilteredFeed(
  page: number = 1,
  limit: number = 20,
  filters: {
    tags?: string[];
    projectType?: ProjectType;
    sortBy?: 'score' | 'newest' | 'most-liked' | 'most-saved';
  }
) {
  const { tags, projectType, sortBy = 'score' } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    status: 'APPROVED',
  };

  if (projectType) {
    where.projectType = projectType;
  }

  if (tags && tags.length > 0) {
    // Filter projects that have ALL specified tags
    where.AND = tags.map(slug => ({
      tags: {
        some: {
          tag: {
            slug: slug
          }
        }
      }
    }));
  }

  let orderBy: Prisma.ProjectOrderByWithRelationInput = { finalScore: 'desc' };
  if (sortBy === 'newest') orderBy = { submittedAt: 'desc' };
  else if (sortBy === 'most-liked') orderBy = { likeCount: 'desc' };
  else if (sortBy === 'most-saved') orderBy = { saveCount: 'desc' };

  const projects = await prisma.project.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      user: { select: { id: true, displayName: true, profilePicture: true } }
    },
    orderBy,
    skip,
    take: limit + 1,
  });

  const hasMore = projects.length > limit;
  const resultProjects = hasMore ? projects.slice(0, limit) : projects;

  return {
    projects: resultProjects,
    hasMore,
    page
  };
}
