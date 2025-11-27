'use server';

import { calculateScoresJob } from '@/lib/jobs/calculate-scores';
import { revalidatePath } from 'next/cache';

export async function recalculateScores() {
  // In a real app, check for admin role here
  await calculateScoresJob();
  revalidatePath('/admin/scores');
}
