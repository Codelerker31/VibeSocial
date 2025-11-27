import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { invalidateCache } from '@/lib/cache-helpers';
import { Prisma } from '@prisma/client';

const InteractionSchema = z.object({
  projectId: z.string(),
  type: z.enum(['VIEW', 'LIKE', 'SAVE', 'SHARE', 'CLICK_DEMO', 'CLICK_SOURCE']),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const body = await req.json();
    const { projectId, type, metadata } = InteractionSchema.parse(body);

    // For VIEW, we might want to allow anonymous views (userId is optional in schema)
    // But for LIKE/SAVE, we need auth.
    if (!userId && ['LIKE', 'SAVE'].includes(type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent duplicate views in short timeframe?
    if (type === 'VIEW' && userId) {
      const recentView = await prisma.interaction.findFirst({
        where: {
          userId,
          projectId,
          type: 'VIEW',
          createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 mins
        }
      });
      if (recentView) {
        return NextResponse.json({ success: true, skipped: true });
      }
    }

    await prisma.interaction.create({
      data: {
        userId,
        projectId,
        type,
        metadata: (metadata as Prisma.InputJsonValue) || {},
      },
    });

    // Invalidate project cache for engagement actions
    if (['LIKE', 'SAVE', 'COMMENT'].includes(type)) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { slug: true }
      });
      
      if (project) {
        await invalidateCache(`project:full:${project.slug}`);
        await invalidateCache(`project:slug:${project.slug}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interaction Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
