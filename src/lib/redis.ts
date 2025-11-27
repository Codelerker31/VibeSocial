import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  console.warn('UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN is missing. Redis features will not work.');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || 'https://mock-url.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN || 'mock-token',
});
