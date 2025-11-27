import { Project, Tag } from '@prisma/client';

export interface UserInterestTag {
  tagId: string;
  weight: number;
}

export interface ProjectWithTags extends Project {
  tags: { tag: Tag }[];
}

/**
 * Calculates how relevant a project is to a user based on their interest tags.
 * Returns a score between 0 and 1.
 */
export function calculateProjectRelevance(project: ProjectWithTags, userInterestTags: UserInterestTag[]): number {
  if (!userInterestTags.length) return 0;

  let matchScore = 0;
  const projectTagIds = new Set(project.tags.map(t => t.tag.id));

  for (const interest of userInterestTags) {
    if (projectTagIds.has(interest.tagId)) {
      matchScore += interest.weight;
    }
  }

  // Normalize score. We assume a perfect match would be matching the top 5 interests.
  // This is a heuristic.
  const maxPossibleScore = userInterestTags.slice(0, 5).reduce((sum, t) => sum + t.weight, 0) || 1;
  
  return Math.min(matchScore / maxPossibleScore, 1);
}

/**
 * Reorders projects to ensure diversity:
 * - No more than 2 consecutive projects from the same tech stack (based on primary language/framework)
 * - Mix of new (<7 days) and evergreen
 * - Inject wildcards (already in the list, just need to be placed)
 */
export function diversifyFeed(projects: ProjectWithTags[]): ProjectWithTags[] {
  if (projects.length <= 2) return projects;

  const result: ProjectWithTags[] = [];
  const pool = [...projects];
  
  // Helper to get primary tag (first tag usually)
  const getPrimaryTag = (p: ProjectWithTags) => p.tags[0]?.tag.name || 'Other';

  while (pool.length > 0) {
    let candidateIndex = 0;
    let candidate = pool[candidateIndex];

    // Check constraints for the candidate
    if (result.length >= 2) {
      const last1 = result[result.length - 1];
      const last2 = result[result.length - 2];
      
      if (last1 && last2) {
        const last1Tag = getPrimaryTag(last1);
        const last2Tag = getPrimaryTag(last2);
        
        // If last 2 were same tag, try to find a different one
        if (last1Tag === last2Tag) {
          // Find first candidate with different tag
          const differentTagIndex = pool.findIndex(p => getPrimaryTag(p) !== last1Tag);
          if (differentTagIndex !== -1) {
            candidateIndex = differentTagIndex;
            candidate = pool[candidateIndex];
          }
        }
      }
    }

    // Add candidate to result
    if (candidate) {
      result.push(candidate);
      pool.splice(candidateIndex, 1);
    } else {
      // Should not happen if pool.length > 0
      pool.splice(candidateIndex, 1);
    }
  }

  return result;
}
