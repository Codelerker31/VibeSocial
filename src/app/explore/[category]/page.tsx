import { getTagsByCategory } from '@/lib/tags';
import { TagCategory } from '@prisma/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categoryParam } = await params;
  const categorySlug = categoryParam.toUpperCase();
  
  // Validate category
  if (!Object.values(TagCategory).includes(categorySlug as TagCategory)) {
    notFound();
  }

  const category = categorySlug as TagCategory;
  const tags = await getTagsByCategory(category);

  const tagsWithCounts = await Promise.all(tags.map(async (tag) => {
    const count = await prisma.project.count({
      where: {
        tags: {
          some: {
            tagId: tag.id
          }
        },
        status: 'APPROVED'
      }
    });
    return { ...tag, count };
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/explore" className="hover:text-foreground">Explore</Link>
            <span>/</span>
            <span className="capitalize text-foreground">{category.toLowerCase().replace('_', ' ')}</span>
          </div>
          <h1 className="text-3xl font-bold capitalize">{category.toLowerCase().replace('_', ' ')}</h1>
          <p className="text-muted-foreground mt-2">
            Browse projects by {category.toLowerCase().replace('_', ' ')} technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tagsWithCounts.map((tag) => (
            <Link 
              key={tag.id} 
              href={`/tags/${tag.slug}`}
              className="group block p-4 bg-white rounded-lg border hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium group-hover:text-indigo-600">{tag.name}</span>
                <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                  {tag.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
