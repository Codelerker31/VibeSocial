import { redis } from './redis';
import { prisma } from './prisma';

const CACHE_TTL = 60 * 15; // 15 minutes

export interface ProjectScoreCache {
  engagementScore: number;
  finalScore: number;
  lastUpdated: string;
}

export async function getProjectScore(projectId: string): Promise<ProjectScoreCache | null> {
  try {
    const cacheKey = `project:${projectId}:score`;
    const cached = await redis.get<ProjectScoreCache>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fallback to database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        engagementScore: true,
        // @ts-expect-error - Stale types
        finalScore: true,
      }
    });

    if (project) {
      const scoreData: ProjectScoreCache = {
        engagementScore: project.engagementScore,
        // @ts-expect-error - Stale types
        finalScore: project.finalScore || 0,
        lastUpdated: new Date().toISOString()
      };
      
      // Set cache
      await setProjectScore(projectId, scoreData);
      return scoreData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching project score:', error);
    return null;
  }
}

export async function setProjectScore(projectId: string, scoreData: ProjectScoreCache): Promise<void> {
  try {
    const cacheKey = `project:${projectId}:score`;
    await redis.set(cacheKey, scoreData, { ex: CACHE_TTL });
  } catch (error) {
    console.error('Error setting project score cache:', error);
  }
}

export async function invalidateProjectScore(projectId: string): Promise<void> {
  try {
    const cacheKey = `project:${projectId}:score`;
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Error invalidating project score cache:', error);
  }
}
