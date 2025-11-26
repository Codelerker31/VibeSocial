import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.interaction.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
        type: 'SAVE',
      },
    });

    let saved = false;

    await prisma.$transaction(async (tx) => {
      if (existingSave) {
        // Unsave
        await tx.interaction.delete({
          where: { id: existingSave.id },
        });
        await tx.project.update({
          where: { id: projectId },
          data: { saveCount: { decrement: 1 } },
        });
        saved = false;
      } else {
        // Save
        await tx.interaction.create({
          data: {
            userId: user.id,
            projectId: projectId,
            type: 'SAVE',
          },
        });
        await tx.project.update({
          where: { id: projectId },
          data: { saveCount: { increment: 1 } },
        });
        saved = true;
      }
    });

    // Get updated count
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { saveCount: true },
    });

    return NextResponse.json({
      saved,
      saveCount: updatedProject?.saveCount || 0,
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
