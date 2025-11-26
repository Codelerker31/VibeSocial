import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LikeButton } from '@/components/project/LikeButton';
import { SaveButton } from '@/components/project/SaveButton';
import { CommentSection } from '@/components/project/CommentSection';
import { ProjectTracker } from '@/components/project/ProjectTracker';
import { MarkdownView } from '@/components/project/MarkdownView';
import { ProjectLinks } from '@/components/project/ProjectLinks';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | DevSocial`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          profilePicture: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch interaction state for current user
  let isLiked = false;
  let isSaved = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const interactions = await prisma.interaction.findMany({
        where: {
          userId: user.id,
          projectId: project.id,
          type: { in: ['LIKE', 'SAVE'] },
        },
      });

      isLiked = interactions.some(i => i.type === 'LIKE');
      isSaved = interactions.some(i => i.type === 'SAVE');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectTracker projectId={project.id} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 w-full bg-gray-100">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Cover Image
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>by</span>
                <Link href={`/users/${project.user.username}`} className="font-medium text-indigo-600 hover:underline">
                  {project.user.displayName || project.user.username}
                </Link>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(project.submittedAt), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LikeButton 
                projectId={project.id} 
                initialLikeCount={project.likeCount} 
                initialLiked={isLiked} 
              />
              <SaveButton 
                projectId={project.id} 
                initialSaveCount={project.saveCount} 
                initialSaved={isSaved} 
              />
            </div>
          </div>

          {/* Links */}
          <ProjectLinks 
            projectId={project.id} 
            demoUrl={project.demoUrl} 
            sourceUrl={project.sourceUrl} 
          />

          {/* Description */}
          <div className="prose prose-indigo max-w-none mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">{project.description}</p>
            {project.detailedDescription && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <MarkdownView content={project.detailedDescription} />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {project.tags.map(({ tag }) => (
              <Link 
                key={tag.id} 
                href={`/explore/${tag.slug}`}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* Comments */}
          <div className="border-t border-gray-200 pt-10">
            <CommentSection projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
