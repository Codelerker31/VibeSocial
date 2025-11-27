import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { invalidateProjectScore } from '@/lib/cache';

const CommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const result = CommentSchema.safeParse(body);

    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(
        { error: 'Invalid input', details: (result.error as any).errors },
        { status: 400 }
      );
    }

    const { content, parentId } = result.data;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If parentId is provided, check if it exists and belongs to the same project
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      if (parentComment.projectId !== projectId) {
        return NextResponse.json({ error: 'Parent comment belongs to another project' }, { status: 400 });
      }
      
      // Enforce 1 level deep threading
      if (parentComment.parentId) {
         return NextResponse.json({ error: 'Nested replies are limited to 1 level' }, { status: 400 });
      }
    }

    const newComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content: content,
          projectId: projectId,
          userId: user.id,
          parentId: parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
            },
          },
        },
      });

      // Create interaction for comment
      await tx.interaction.create({
        data: {
          userId: user.id,
          projectId: projectId,
          type: 'COMMENT',
        },
      });

      // Update project comment count
      await tx.project.update({
        where: { id: projectId },
        data: { commentCount: { increment: 1 } },
      });

      return comment;
    });

    // Invalidate score cache
    await invalidateProjectScore(projectId);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
