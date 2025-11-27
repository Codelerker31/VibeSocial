import { prisma } from '@/lib/prisma';
import { TagCategory } from '@prisma/client';
import { getCached } from '@/lib/cache-helpers';

export type GroupedTags = Record<TagCategory, { id: string; name: string; slug: string; category: TagCategory }[]>;

export const getTags = async () => {
  return getCached(
    'tags:all',
    async () => {
      const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
      
      // Group by category
      const grouped = tags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
          acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
      }, {} as GroupedTags);

      return grouped;
    },
    24 * 60 * 60 // 24 hours
  );
};

export const getTagsByCategory = async (category: TagCategory) => {
  return getCached(
    `tags:category:${category}`,
    async () => {
      return await prisma.tag.findMany({
        where: { category },
        orderBy: { name: 'asc' },
      });
    },
    3600 // 1 hour
  );
};

export async function searchTags(query: string) {
  if (!query) return [];
  return await prisma.tag.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 10,
    orderBy: { name: 'asc' },
  });
}

export const getPopularTags = async (limit: number = 10) => {
  return getCached(
    `tags:popular:${limit}`,
    async () => {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { projects: true },
          },
        },
        orderBy: {
          projects: {
            _count: 'desc',
          },
        },
        take: limit,
      });
      
      return tags;
    },
    7 * 24 * 60 * 60 // 7 days
  );
};
