import { NextRequest, NextResponse } from 'next/server';
import { calculateScoresJob } from '@/lib/jobs/calculate-scores';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Verify CRON_SECRET if set (recommended for production)
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await calculateScoresJob();
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Job failed', details: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in cron route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
