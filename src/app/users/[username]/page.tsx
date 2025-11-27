import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Github, FolderPlus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCached } from '@/lib/cache-helpers';
import { EmptyState } from '@/components/EmptyState';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  
  const user = await getCached(
    `user:profile:${username}`,
    async () => prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { githubUsername: username },
        ],
      },
      include: {
        projects: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    }),
    3600 // 1 hour
  );

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.email === user.email;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-20 w-20 relative">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.displayName || user.username || 'User'}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                  {(user.displayName || user.username || 'U')?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="ml-5">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName || user.username}
              </h1>
              {user.bio && <p className="text-gray-500 mt-1">{user.bio}</p>}
              <div className="flex items-center mt-2 space-x-4">
                {user.githubUsername && (
                  <Link
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    className="text-gray-400 hover:text-gray-500 flex items-center"
                  >
                    <Github className="h-5 w-5 mr-1" />
                    <span className="text-sm">{user.githubUsername}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
      {user.projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {user.projects.map((project) => (
            <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    <Link href={`/projects/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {new Date(project.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderPlus}
          title={isOwnProfile ? "No projects yet" : "No projects found"}
          description={isOwnProfile ? "Submit your first project to showcase your work!" : "This user hasn't submitted any projects yet."}
          actionLabel={isOwnProfile ? "Submit Project" : undefined}
          actionLink={isOwnProfile ? "/submit" : undefined}
        />
      )}
    </div>
  );
}
