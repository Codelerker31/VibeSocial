import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getServerSession(authOptions);
    
    let userId = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
      }
    }

    const body = await req.json().catch(() => ({}));
    const { timeSpent, referrer } = body;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Record view
    await prisma.$transaction(async (tx) => {
      await tx.interaction.create({
        data: {
          userId: userId,
          projectId: projectId,
          type: 'VIEW',
          metadata: {
            timeSpent: timeSpent || 0,
            referrer: referrer || null,
            ip: req.headers.get('x-forwarded-for') || 'unknown',
          },
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: { viewCount: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
