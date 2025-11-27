import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPersonalizedFeed, getGenericFeed, getFilteredFeed } from '@/lib/feed';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { ProjectType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);
  const projectType = searchParams.get('projectType') as ProjectType | null;
  const sortBy = searchParams.get('sortBy') as 'score' | 'newest' | 'most-liked' | 'most-saved' | null;

  const hasFilters = (tags && tags.length > 0) || projectType || sortBy;

  const cacheKey = hasFilters
    ? `feed:filtered:${userId || 'anon'}:${JSON.stringify({ tags, projectType, sortBy })}:${page}`
    : (userId ? `feed:${userId}:${page}` : `feed:generic:${page}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feedData: any;

  try {
    // Try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      feedData = cached;
    } else {
      if (hasFilters) {
        feedData = await getFilteredFeed(page, limit, { 
          tags: tags || undefined, 
          projectType: projectType || undefined, 
          sortBy: sortBy || undefined 
        });
      } else if (userId) {
        feedData = await getPersonalizedFeed(userId, page, limit);
      } else {
        feedData = await getGenericFeed(page, limit);
      }
      // Cache for 5 minutes
      await redis.set(cacheKey, feedData, { ex: 300 });
    }

    // If user is logged in, enrich with interaction state
    if (userId && feedData.projects && feedData.projects.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectIds = feedData.projects.map((p: any) => p.id);
      
      const interactions = await prisma.interaction.findMany({
        where: {
          userId,
          projectId: { in: projectIds },
          type: { in: ['LIKE', 'SAVE'] }
        }
      });

      const likedProjectIds = new Set(
        interactions.filter(i => i.type === 'LIKE').map(i => i.projectId)
      );
      const savedProjectIds = new Set(
        interactions.filter(i => i.type === 'SAVE').map(i => i.projectId)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      feedData.projects = feedData.projects.map((p: any) => ({
        ...p,
        hasLiked: likedProjectIds.has(p.id),
        hasSaved: savedProjectIds.has(p.id)
      }));
    }

    return NextResponse.json(feedData);
  } catch (error) {
    console.error('Feed API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
