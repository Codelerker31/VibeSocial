import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateProfileSchema } from '@/lib/validations';
import { z } from 'zod';
import { invalidateCache } from '@/lib/cache-helpers';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = UpdateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data,
    });

    // Invalidate user profile cache
    if (user.username) {
      await invalidateCache(`user:profile:${user.username}`);
    }
    if (user.githubUsername) {
      await invalidateCache(`user:profile:${user.githubUsername}`);
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
