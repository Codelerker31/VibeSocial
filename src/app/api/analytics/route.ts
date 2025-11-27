import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, value, rating, delta, id, navigationType } = body;
    const session = await getServerSession(authOptions);

    // Log performance metric
    console.log(`[Performance] ${name}: ${value} (Rating: ${rating})`, {
      delta,
      id,
      navigationType,
      user: session?.user?.email || 'Anonymous',
      userAgent: req.headers.get('user-agent'),
    });

    // Check for budget violations
    if (name === 'LCP' && value > 2500) {
      console.warn(`[Performance Alert] LCP exceeded budget: ${value}ms`);
    }
    if (name === 'TTI' && value > 3500) {
      console.warn(`[Performance Alert] TTI exceeded budget: ${value}ms`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
