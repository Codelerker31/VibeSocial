import { NextRequest, NextResponse } from 'next/server';
import { getFilteredFeed } from '@/lib/feed';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sortBy') as 'score' | 'newest' | 'most-liked' | 'most-saved' | undefined;

  try {
    const feedData = await getFilteredFeed(page, limit, {
      tags: [params.slug],
      sortBy
    });

    return NextResponse.json(feedData);
  } catch (error) {
    console.error('Tag Feed API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
