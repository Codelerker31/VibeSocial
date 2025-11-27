export interface EngagementMetrics {
  saves: number;
  authorReplies: number;
  demoClicks: number;
  sourceClicks: number;
  longViews: number;
  longComments: number;
  follows: number;
  shares: number;
  likes: number;
}

export const ENGAGEMENT_WEIGHTS = {
  saves: 50,
  authorReplies: 40,
  demoClicks: 25,
  sourceClicks: 25,
  longViews: 20,
  longComments: 15,
  follows: 0, // Deferred to Phase 2
  shares: 5,
  likes: 1,
};

/**
 * Calculates the raw engagement score based on weighted interactions.
 */
export function calculateEngagementScore(metrics: EngagementMetrics): number {
  let score = 0;
  score += metrics.saves * ENGAGEMENT_WEIGHTS.saves;
  score += metrics.authorReplies * ENGAGEMENT_WEIGHTS.authorReplies;
  score += metrics.demoClicks * ENGAGEMENT_WEIGHTS.demoClicks;
  score += metrics.sourceClicks * ENGAGEMENT_WEIGHTS.sourceClicks;
  score += metrics.longViews * ENGAGEMENT_WEIGHTS.longViews;
  score += metrics.longComments * ENGAGEMENT_WEIGHTS.longComments;
  score += metrics.follows * ENGAGEMENT_WEIGHTS.follows;
  score += metrics.shares * ENGAGEMENT_WEIGHTS.shares;
  score += metrics.likes * ENGAGEMENT_WEIGHTS.likes;
  return score;
}

/**
 * Calculates the recency factor using exponential decay.
 * Formula: exp(-days_since_submit / 30)
 */
export function calculateRecencyFactor(submittedAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - submittedAt.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Decay constant (30 days)
  const lambda = 30;
  
  return Math.exp(-diffDays / lambda);
}

/**
 * Calculates the final score by combining engagement score and recency factor.
 */
export function calculateFinalScore(engagementScore: number, recencyFactor: number): number {
  return engagementScore * recencyFactor;
}
