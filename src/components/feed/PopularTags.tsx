import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getPopularTags = unstable_cache(
  async () => {
    return await prisma.tag.findMany({
      take: 10,
      orderBy: {
        projects: {
          _count: 'desc'
        }
      }
    });
  },
  ['popular-tags'],
  { revalidate: 3600 * 24 * 7 } // Weekly
);

export async function PopularTags() {
  const tags = await getPopularTags();

  if (tags.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border p-4 sticky top-24">
      <h3 className="font-semibold mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            {tag.name}
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <Link href="/explore" className="text-sm text-indigo-600 hover:underline">
          View all tags
        </Link>
      </div>
    </div>
  );
}
