import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getProjectsByTag = unstable_cache(
  async (slug: string) => {
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) return null;

    const projects = await prisma.project.findMany({
      where: {
        status: 'APPROVED',
        tags: {
          some: {
            tag: {
              slug,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            displayName: true,
            profilePicture: true,
            username: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        engagementScore: 'desc',
      },
      take: 20,
    });

    return { tag, projects };
  },
  ['projects-by-tag'],
  { revalidate: 3600, tags: ['projects-by-tag'] }
);
