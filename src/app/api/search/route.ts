import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ projects: [], tags: [] });
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const [projects, tags] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        projectType: true
      },
      take: 5
    }),
    prisma.tag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true
      },
      take: 5
    })
  ]);

  const result = { projects, tags };
  await redis.set(cacheKey, result, { ex: 600 }); // 10 minutes

  return NextResponse.json(result);
}
