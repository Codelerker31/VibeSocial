import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectsByTag } from '@/lib/projects';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Projects tagged with ${slug} | DevSocial`,
    description: `Discover the best ${slug} projects on DevSocial`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProjectsByTag(slug);

  if (!data) {
    notFound();
  }

  const { tag, projects } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/explore" className="text-sm text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
            &larr; Back to Explore
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {tag.name} Projects
          </h1>
          <p className="text-gray-600 mt-2">
            Found {projects.length} project{projects.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.slug}`}
              className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video relative bg-gray-100">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {project.user.profilePicture ? (
                    <Image
                      src={project.user.profilePicture}
                      alt={project.user.displayName || 'User'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  )}
                  <span className="text-xs text-gray-600">
                    {project.user.displayName || project.user.username}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No projects found with this tag yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-500"
            >
              Submit a project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
