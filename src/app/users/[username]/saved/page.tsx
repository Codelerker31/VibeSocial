import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function SavedProjectsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { githubUsername: username },
      ],
    },
  });

  if (!user) {
    notFound();
  }

  if (session.user?.email !== user.email) {
    redirect('/');
  }

  const savedInteractions = await prisma.interaction.findMany({
    where: {
      userId: user.id,
      type: 'SAVE',
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const savedProjects = savedInteractions.map(i => i.project);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Saved Projects</h1>
      
      {savedProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedProjects.map((project) => (
            <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    <Link href={`/projects/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h3>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {/* Add Unsave button here later */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No saved projects yet.</p>
          <Link
            href="/explore"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Explore Projects
          </Link>
        </div>
      )}
    </div>
  );
}
