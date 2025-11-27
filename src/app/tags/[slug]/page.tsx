import { prisma } from '@/lib/prisma';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug }
  });

  if (!tag) {
    notFound();
  }

  const relatedTags = await prisma.tag.findMany({
    where: { 
      category: tag.category,
      id: { not: tag.id }
    },
    take: 5
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/explore" className="hover:text-foreground">Explore</Link>
            <span>/</span>
            <Link href={`/explore/${tag.category.toLowerCase()}`} className="hover:text-foreground capitalize">
              {tag.category.toLowerCase().replace('_', ' ')}
            </Link>
            <span>/</span>
            <span className="text-foreground">{tag.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{tag.name} Projects</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Discover the best open source projects built with {tag.name}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <FeedGrid endpoint={`/api/tags/${tag.slug}/projects`} />
          </div>
          
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map(related => (
                  <Link
                    key={related.id}
                    href={`/tags/${related.slug}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {related.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
