import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignupSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = SignupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate a unique username
    const emailPrefix = email.split('@')[0];
    let username = (emailPrefix || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (username.length < 3) {
      username = `user${Math.floor(Math.random() * 10000)}`;
    }
    
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
      const checkUsername = await prisma.user.findUnique({ where: { username } });
      if (!checkUsername) {
        isUnique = true;
      } else {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate a unique username');
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
