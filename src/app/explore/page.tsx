import { Metadata } from 'next';
import Link from 'next/link';
import { getTags } from '@/lib/tags';

export const metadata: Metadata = {
  title: 'Explore Projects | DevSocial',
  description: 'Browse projects by category and tags',
};

export default async function ExplorePage() {
  const groupedTags = await getTags();
  const categories = Object.keys(groupedTags);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Topics</h1>
        <p className="text-gray-600 mb-8">
          Discover projects across different technologies and domains.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                {category.toLowerCase().replace('_', ' ')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* @ts-ignore - Iterating over keys of typed object */}
                {groupedTags[category].map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/explore/${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tags found. Please seed the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
