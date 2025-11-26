import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Soft delete user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        deletedAt: new Date(),
        email: `deleted-${Date.now()}-${session.user.email}`, // Rename email to allow re-signup or just to obfuscate
        displayName: 'Anonymous',
        username: `anonymous-${Date.now()}`,
        githubUsername: null,
        profilePicture: null,
        bio: null,
      },
    });

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
