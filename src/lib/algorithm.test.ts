import { calculateEngagementScore, calculateRecencyFactor, calculateFinalScore, EngagementMetrics } from './algorithm';
import { describe, it, expect } from 'vitest'; // Assuming vitest is used as per instructions

describe('Engagement Algorithm', () => {
  it('should calculate engagement score correctly with weights', () => {
    const metrics: EngagementMetrics = {
      saves: 1,         // 1 * 50 = 50
      authorReplies: 1, // 1 * 40 = 40
      demoClicks: 1,    // 1 * 25 = 25
      sourceClicks: 1,  // 1 * 25 = 25
      longViews: 1,     // 1 * 20 = 20
      longComments: 1,  // 1 * 15 = 15
      follows: 1,       // 1 * 0 = 0
      shares: 1,        // 1 * 5 = 5
      likes: 1          // 1 * 1 = 1
    };
    
    // Total: 50 + 40 + 25 + 25 + 20 + 15 + 0 + 5 + 1 = 181
    const score = calculateEngagementScore(metrics);
    expect(score).toBe(181);
  });

  it('should calculate recency factor correctly', () => {
    const now = new Date();
    const submittedAt = new Date(now.getTime()); // 0 days ago
    
    const factor = calculateRecencyFactor(submittedAt);
    expect(factor).toBeCloseTo(1, 1); // exp(0) = 1

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const factor30 = calculateRecencyFactor(thirtyDaysAgo);
    expect(factor30).toBeCloseTo(Math.exp(-1), 2); // exp(-1) ~= 0.3679
  });

  it('should calculate final score correctly', () => {
    const engagementScore = 100;
    const recencyFactor = 0.5;
    const finalScore = calculateFinalScore(engagementScore, recencyFactor);
    expect(finalScore).toBe(50);
  });
});
