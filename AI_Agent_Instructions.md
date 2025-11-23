# AI Agent Development Instructions for DevSocial MVP

**Version:** 1.0  
**Date:** November 22, 2025  
**Purpose:** Guide AI agents through building the DevSocial MVP according to the PRD specifications

---

## Table of Contents

1. [Overview & Context](#overview--context)
2. [Critical Rules & Constraints](#critical-rules--constraints)
3. [Development Approach](#development-approach)
4. [Technical Stack & Setup](#technical-stack--setup)
5. [Code Quality Standards](#code-quality-standards)
6. [Testing Requirements](#testing-requirements)
7. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
8. [Verification Checklist](#verification-checklist)

---

## Overview & Context

You are building **DevSocial**, a content-first discovery platform for developers to showcase code projects. This is an MVP being built by a solo developer with the assistance of AI agents. Your role is to implement features according to the PRD while maintaining code quality, performance, and cost efficiency.

### Core Product Principles

1. **Content-First Discovery:** The algorithmic feed is the hero feature. Every technical decision should optimize for fast, relevant project discovery.

2. **Weighted Engagement:** Not all interactions are equal. The algorithm must heavily weight meaningful actions (saves, thoughtful comments) over superficial ones (likes).

3. **Developer-Centric:** The target user is a developer. Technical depth, code integration, and transparent algorithms are expected.

4. **Solo Dev Constraints:** Minimize operational complexity. Prefer managed services over self-hosted. Optimize for development speed without sacrificing quality.

### Success Criteria

The MVP is successful if it enables:
- Developers to submit projects with rich technical detail
- Users to discover relevant projects through an algorithmic feed
- Meaningful engagement through comments and saves
- All of this running on <$5/month infrastructure costs

---

## Critical Rules & Constraints

### MUST DO

1. **Follow the PRD Exactly:** The PRD (DevSocial_PRD.md) is the source of truth. Do not add features, modify data models, or change the tech stack without explicit approval.

2. **Implement Weighted Engagement:** The scoring algorithm must use the exact weights specified in the PRD (50x for saves, 40x for author replies, etc.).

3. **Use TypeScript Everywhere:** All code must be TypeScript with strict mode enabled. No `any` types except where absolutely necessary (and documented why).

4. **Mobile-Responsive:** Every UI component must work on mobile (375px width minimum) and desktop (1920px). Test at both extremes.

5. **Accessibility:** All interactive elements must be keyboard-navigable. Forms must have proper labels. Images must have alt text.

6. **Performance Budget:** 
   - Initial page load: <2 seconds
   - Time to Interactive: <3 seconds
   - Lighthouse Performance score: >90

7. **Cost Efficiency:** Stay within free tiers for all services during MVP. Monitor usage and alert if approaching limits.

### MUST NOT DO

1. **Do Not Add Scope:** No following system, no notifications, no DMs, no collections in MVP. These are explicitly Phase 2 features.

2. **Do Not Over-Engineer:** No microservices, no GraphQL, no complex state management (Redux/MobX). Use Next.js API routes and React Context.

3. **Do Not Ignore Errors:** Every API call must have error handling. Every form must validate input. Every database query must handle failures gracefully.

4. **Do Not Skip Testing:** Every feature must have at least one test (unit or integration). No PR without tests.

5. **Do Not Hardcode:** No API keys in code. No magic numbers without constants. No inline styles (use Tailwind classes).

6. **Do Not Optimize Prematurely:** Build it working first, then optimize. But do measure performance and set up monitoring from day one.

---

## Development Approach

### Phase-Based Implementation

The PRD outlines a 3-month, 12-week development plan. You will receive prompts for each phase. Complete each phase fully before moving to the next.

**Month 1: Foundation (Weeks 1-4)**
- Setup project structure and infrastructure
- Implement authentication and user profiles
- Build project submission flow
- Create project display pages

**Month 2: Discovery Engine (Weeks 5-8)**
- Implement engagement actions (like, save, comment)
- Build weighted scoring algorithm
- Create algorithmic feed with personalization
- Add tag filtering system

**Month 3: Polish & Launch (Weeks 9-12)**
- Performance optimization
- UX refinements and error handling
- Content seeding and testing
- Launch preparation

### Incremental Development

For each feature:

1. **Understand:** Read the PRD section carefully. Ask clarifying questions if requirements are ambiguous.

2. **Plan:** Break the feature into small, testable units. Identify dependencies.

3. **Implement:** Write code incrementally. Commit frequently with clear messages.

4. **Test:** Write tests as you go. Run tests locally before pushing.

5. **Verify:** Check against the PRD requirements. Test in browser at multiple screen sizes.

6. **Document:** Update README or inline comments for complex logic.

### Git Workflow

- **Main Branch:** Always deployable. Protected.
- **Feature Branches:** One branch per feature (e.g., `feature/project-submission`)
- **Commit Messages:** Use conventional commits (e.g., `feat: add project submission form`, `fix: resolve image upload bug`)
- **Pull Requests:** Self-review before merging. Check all tests pass.

---

## Technical Stack & Setup

### Required Tools & Services

Before starting development, ensure these accounts and tools are set up:

| Service | Purpose | Free Tier Limit | Setup Priority |
|---------|---------|-----------------|----------------|
| **Vercel** | Hosting (frontend + API routes) | 100GB bandwidth/month | Critical (Week 1) |
| **Supabase** | PostgreSQL database + auth | 500MB database | Critical (Week 1) |
| **Upstash** | Redis caching | 10,000 commands/day | High (Week 6) |
| **Cloudinary** | Image hosting | 25GB storage, 25GB bandwidth | High (Week 3) |
| **Resend** | Transactional emails | 3,000 emails/month | Medium (Week 4) |
| **GitHub** | Code hosting + OAuth provider | Unlimited public repos | Critical (Week 1) |
| **Plausible** | Privacy-friendly analytics | 10k pageviews/month | Medium (Week 11) |

### Initial Project Setup

When you receive the "Week 1: Setup & Architecture" prompt, follow this exact sequence:

```bash
# 1. Create Next.js project with TypeScript
npx create-next-app@latest devsocial --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. Install core dependencies
cd devsocial
npm install prisma @prisma/client
npm install next-auth
npm install swr
npm install zod
npm install react-hook-form
npm install @hookform/resolvers
npm install lucide-react

# 3. Install dev dependencies
npm install -D @types/node
npm install -D prisma

# 4. Initialize Prisma
npx prisma init

# 5. Set up environment variables
cp .env.example .env.local
```

### Environment Variables Template

Create `.env.example` with:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend
RESEND_API_KEY="your-resend-api-key"

# Upstash Redis
UPSTASH_REDIS_URL="your-redis-url"
UPSTASH_REDIS_TOKEN="your-redis-token"
```

### Project Structure

Maintain this exact folder structure:

```
devsocial/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Auto-generated migrations
│   └── seed.ts                # Seed data for tags
├── public/
│   ├── images/                # Static images
│   └── favicon.ico
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth-related pages
│   │   ├── (main)/           # Main app pages
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page (feed)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── project/          # Project-specific components
│   │   ├── feed/             # Feed-related components
│   │   └── layout/           # Layout components (nav, footer)
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── redis.ts          # Redis client
│   │   ├── cloudinary.ts     # Image upload utilities
│   │   ├── algorithm.ts      # Feed algorithm logic
│   │   └── validations.ts    # Zod schemas
│   ├── hooks/
│   │   ├── useAuth.ts        # Auth hook
│   │   ├── useProject.ts     # Project data fetching
│   │   └── useFeed.ts        # Feed data fetching
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── tests/
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── .env.local                # Local environment variables (gitignored)
├── .env.example              # Template for environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## Code Quality Standards

### TypeScript Guidelines

1. **Strict Mode:** Enable all strict checks in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true
     }
   }
   ```

2. **Type Everything:** Define types for all data structures:
   ```typescript
   // Good
   interface Project {
     id: string;
     title: string;
     description: string;
     userId: string;
     createdAt: Date;
   }

   // Bad
   const project: any = { ... }
   ```

3. **Use Zod for Runtime Validation:**
   ```typescript
   import { z } from 'zod';

   const ProjectSchema = z.object({
     title: z.string().min(1).max(80),
     description: z.string().min(1).max(150),
     sourceUrl: z.string().url(),
   });

   type ProjectInput = z.infer<typeof ProjectSchema>;
   ```

### React Best Practices

1. **Server Components by Default:** Use React Server Components unless you need interactivity:
   ```typescript
   // app/projects/[slug]/page.tsx (Server Component)
   export default async function ProjectPage({ params }: { params: { slug: string } }) {
     const project = await prisma.project.findUnique({ where: { slug: params.slug } });
     return <ProjectDetail project={project} />;
   }
   ```

2. **Client Components Only When Needed:**
   ```typescript
   'use client'; // Only add this directive when you need hooks or event handlers

   import { useState } from 'react';

   export function LikeButton({ projectId }: { projectId: string }) {
     const [liked, setLiked] = useState(false);
     // ...
   }
   ```

3. **Use SWR for Data Fetching in Client Components:**
   ```typescript
   import useSWR from 'swr';

   export function ProjectList() {
     const { data, error, isLoading } = useSWR('/api/projects', fetcher);
     
     if (isLoading) return <Skeleton />;
     if (error) return <Error />;
     return <ProjectGrid projects={data} />;
   }
   ```

### Database Best Practices

1. **Use Prisma Client Singleton:**
   ```typescript
   // lib/prisma.ts
   import { PrismaClient } from '@prisma/client';

   const globalForPrisma = global as unknown as { prisma: PrismaClient };

   export const prisma = globalForPrisma.prisma || new PrismaClient();

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
   ```

2. **Always Use Transactions for Multi-Step Operations:**
   ```typescript
   await prisma.$transaction(async (tx) => {
     const project = await tx.project.create({ data: projectData });
     await tx.interaction.create({ data: { type: 'view', projectId: project.id } });
   });
   ```

3. **Index Frequently Queried Fields:**
   ```prisma
   model Project {
     id        String   @id @default(uuid())
     slug      String   @unique
     userId    String
     status    Status   @default(PENDING)
     
     @@index([userId])
     @@index([status])
     @@index([slug])
   }
   ```

### API Route Standards

1. **Validate Input with Zod:**
   ```typescript
   // app/api/projects/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { ProjectSchema } from '@/lib/validations';

   export async function POST(req: NextRequest) {
     try {
       const body = await req.json();
       const validated = ProjectSchema.parse(body); // Throws if invalid
       
       const project = await prisma.project.create({ data: validated });
       return NextResponse.json(project, { status: 201 });
     } catch (error) {
       if (error instanceof z.ZodError) {
         return NextResponse.json({ error: error.errors }, { status: 400 });
       }
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   ```

2. **Implement Rate Limiting:**
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
   });

   export async function POST(req: NextRequest) {
     const ip = req.ip ?? '127.0.0.1';
     const { success } = await ratelimit.limit(ip);
     
     if (!success) {
       return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
     }
     // ... rest of handler
   }
   ```

3. **Return Consistent Error Format:**
   ```typescript
   interface ApiError {
     error: string;
     details?: unknown;
   }

   // Always return this shape for errors
   return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   ```

---

## Testing Requirements

### Test Coverage Goals

- **Unit Tests:** 70%+ coverage for utility functions and business logic
- **Integration Tests:** All API routes must have at least one happy path test
- **E2E Tests:** Critical user flows (signup, submit project, like/save)

### Testing Stack

```bash
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D msw # Mock Service Worker for API mocking
```

### Unit Test Example

```typescript
// lib/algorithm.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEngagementScore } from './algorithm';

describe('calculateEngagementScore', () => {
  it('should weight saves 50x more than likes', () => {
    const withSave = calculateEngagementScore({ saves: 1, likes: 0 });
    const withLikes = calculateEngagementScore({ saves: 0, likes: 50 });
    
    expect(withSave).toBe(withLikes);
  });

  it('should apply time decay factor', () => {
    const recent = calculateEngagementScore({ saves: 1 }, new Date());
    const old = calculateEngagementScore({ saves: 1 }, new Date('2024-01-01'));
    
    expect(recent).toBeGreaterThan(old);
  });
});
```

### API Route Test Example

```typescript
// app/api/projects/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';

describe('POST /api/projects', () => {
  beforeEach(async () => {
    await prisma.project.deleteMany(); // Clean database
  });

  it('should create a project with valid data', async () => {
    const req = new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'A test project',
        sourceUrl: 'https://github.com/user/repo',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('Test Project');
  });

  it('should reject invalid data', async () => {
    const req = new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: '' }), // Invalid: empty title
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
```

### When to Write Tests

- **Before implementing complex algorithms:** Write tests first for the engagement scoring and feed generation logic
- **After implementing API routes:** Write integration tests for all CRUD operations
- **After implementing UI components:** Write tests for interactive components (forms, buttons with state)
- **Before refactoring:** Ensure tests pass before and after refactoring

---

## Common Pitfalls to Avoid

### 1. N+1 Query Problem

**Bad:**
```typescript
const projects = await prisma.project.findMany();
for (const project of projects) {
  const user = await prisma.user.findUnique({ where: { id: project.userId } });
  // This makes N+1 queries!
}
```

**Good:**
```typescript
const projects = await prisma.project.findMany({
  include: { user: true }, // Single query with JOIN
});
```

### 2. Not Handling Loading States

**Bad:**
```typescript
export function ProjectList() {
  const { data } = useSWR('/api/projects');
  return <div>{data.map(p => <ProjectCard project={p} />)}</div>;
  // Crashes if data is undefined during loading
}
```

**Good:**
```typescript
export function ProjectList() {
  const { data, isLoading, error } = useSWR('/api/projects');
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  if (!data) return null;
  
  return <div>{data.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}
```

### 3. Exposing Sensitive Data in API Responses

**Bad:**
```typescript
export async function GET(req: NextRequest) {
  const user = await prisma.user.findUnique({ where: { id } });
  return NextResponse.json(user); // Includes passwordHash!
}
```

**Good:**
```typescript
export async function GET(req: NextRequest) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      profilePicture: true,
      bio: true,
      // passwordHash explicitly excluded
    },
  });
  return NextResponse.json(user);
}
```

### 4. Not Optimizing Images

**Bad:**
```typescript
<img src={project.coverImage} alt={project.title} />
// Loads full-resolution image (5MB+)
```

**Good:**
```typescript
import Image from 'next/image';

<Image
  src={project.coverImage}
  alt={project.title}
  width={1200}
  height={630}
  className="object-cover"
  priority={false}
/>
// Next.js automatically optimizes and lazy loads
```

### 5. Ignoring Mobile Responsiveness

**Bad:**
```typescript
<div className="grid grid-cols-4 gap-6">
  {/* Always 4 columns, breaks on mobile */}
</div>
```

**Good:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Responsive: 1 col mobile, 2 tablet, 3-4 desktop */}
</div>
```

### 6. Not Implementing Optimistic Updates

**Bad:**
```typescript
async function handleLike() {
  await fetch('/api/projects/like', { method: 'POST' });
  mutate(); // Refetch data (slow, shows loading spinner)
}
```

**Good:**
```typescript
async function handleLike() {
  mutate(
    async (data) => {
      // Optimistically update UI immediately
      return { ...data, liked: true, likeCount: data.likeCount + 1 };
    },
    {
      optimisticData: (current) => ({ ...current, liked: true }),
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    }
  );
  await fetch('/api/projects/like', { method: 'POST' });
}
```

---

## Verification Checklist

Before marking any feature as "complete," verify:

### Functionality
- [ ] Feature works as described in PRD
- [ ] All edge cases handled (empty states, errors, loading)
- [ ] Form validation works and shows helpful error messages
- [ ] API returns correct status codes (200, 201, 400, 404, 500)

### Performance
- [ ] Page loads in <2 seconds (test with throttled network)
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Images are optimized and lazy-loaded
- [ ] Database queries are efficient (check Prisma logs)

### Responsiveness
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)
- [ ] No horizontal scrolling on any screen size

### Accessibility
- [ ] All interactive elements are keyboard-navigable
- [ ] Focus indicators are visible
- [ ] Form inputs have labels
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA standards

### Code Quality
- [ ] No TypeScript errors or warnings
- [ ] No ESLint errors or warnings
- [ ] Code follows conventions in this document
- [ ] Complex logic has inline comments
- [ ] No console.log statements in production code

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manually tested in browser
- [ ] Tested with different user states (logged in, logged out)

### Security
- [ ] No sensitive data in API responses
- [ ] Input validation on all forms
- [ ] Rate limiting on sensitive endpoints
- [ ] CSRF protection enabled (Next.js default)
- [ ] SQL injection prevented (Prisma parameterized queries)

### Documentation
- [ ] README updated if setup steps changed
- [ ] Inline comments for complex logic
- [ ] API route documented (if new endpoint)
- [ ] Environment variables documented in .env.example

---

## Working with This Document

### How to Use These Instructions

1. **Read Fully First:** Before starting any development, read this entire document to understand the constraints and standards.

2. **Reference During Development:** Keep this document open while coding. Check the relevant sections when implementing features.

3. **Verify Before Completing:** Use the verification checklist before marking any feature as done.

4. **Ask When Unclear:** If any requirement is ambiguous, ask for clarification rather than making assumptions.

### When to Deviate

You may deviate from these instructions only if:

1. **Technical Impossibility:** The specified approach is not technically feasible (document why)
2. **Critical Bug:** Following the instructions would introduce a security vulnerability or data loss risk
3. **Significant Cost Savings:** An alternative approach reduces costs by >50% without sacrificing quality

In all cases, document the deviation and rationale in the PR description.

### Updating This Document

As you encounter issues or learn better practices, suggest updates to this document. This is a living document that should evolve with the project.

---

## Next Steps

You are now ready to begin development. Proceed to the **Phased Development Prompts** document, which contains detailed prompts for each week of the 12-week development plan.

Start with **Week 1: Setup & Architecture** and work sequentially through each phase. Do not skip ahead or work on features out of order.

Good luck building DevSocial! 🚀
