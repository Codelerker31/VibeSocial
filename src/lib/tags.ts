import { prisma } from '@/lib/prisma';
import { TagCategory } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type GroupedTags = Record<TagCategory, { id: string; name: string; slug: string; category: TagCategory }[]>;

export const getTags = unstable_cache(
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
  ['all-tags'],
  { revalidate: 3600, tags: ['all-tags'] }
);

export const getTagsByCategory = unstable_cache(
  async (category: TagCategory) => {
    return await prisma.tag.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  },
  ['tags-by-category'],
  { revalidate: 3600, tags: ['tags-by-category'] }
);

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

export const getPopularTags = unstable_cache(
  async (limit: number = 10) => {
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
  ['popular-tags'],
  { revalidate: 3600, tags: ['popular-tags'] }
);
