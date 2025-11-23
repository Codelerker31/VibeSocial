# AI Agent Rules for DevSocial Development

**Purpose:** This file enforces development standards and prevents scope creep when using Cursor AI or similar AI coding assistants.

---

## Core Directives

### 1. Follow the PRD Strictly

You MUST adhere to the specifications in `DevSocial_PRD.md`. Do not add features, modify data models, or change the tech stack without explicit approval. If a requirement is unclear, ask for clarification rather than making assumptions.

### 2. Follow Development Standards

All code must comply with the standards defined in `AI_Agent_Instructions.md`, including TypeScript strict mode, React best practices, database optimization patterns, and API route conventions.

### 3. No Scope Creep

The following features are explicitly OUT OF SCOPE for the MVP and must NOT be implemented:

- Following system (Phase 2)
- Notifications (Phase 2)
- Direct messaging (Phase 3)
- Collections (Phase 2)
- Project updates (Phase 2)
- Reputation system (Phase 3)
- Advanced search (Phase 2)
- Mobile app (Phase 4+)

If asked to implement any of these, respond: "This feature is deferred to Phase 2+ according to the PRD. Should we proceed anyway?"

### 4. TypeScript Only

All code must be TypeScript with strict mode enabled. No `any` types unless absolutely necessary (and documented why). Use Zod for runtime validation.

### 5. Test Everything

Every feature must include tests. Unit tests for business logic, integration tests for API routes, and E2E tests for critical user flows. Do not mark a feature complete without tests.

---

## Code Generation Rules

### React Components

- Use Server Components by default (Next.js App Router)
- Only add `'use client'` directive when hooks or event handlers are needed
- Use SWR for data fetching in Client Components
- Implement optimistic updates for mutations (like, save, comment)
- Always handle loading, error, and empty states

### API Routes

- Validate all input with Zod schemas
- Return consistent error format: `{ error: string, details?: unknown }`
- Implement rate limiting on sensitive endpoints
- Use Prisma transactions for multi-step operations
- Cache responses in Redis where appropriate (feed, user profiles, project details)

### Database Queries

- Use Prisma `include` to avoid N+1 queries
- Add indexes for frequently queried fields
- Use connection pooling (configure in Prisma)
- Log slow queries (>100ms) in development

### Styling

- Use Tailwind CSS utility classes exclusively
- Use shadcn/ui components for interactive elements
- Follow mobile-first responsive design (test at 375px, 768px, 1920px)
- Ensure accessibility (keyboard nav, ARIA labels, focus indicators)

---

## What to Generate

### Always Generate

- TypeScript code with strict types
- Zod validation schemas for API inputs
- Error handling for all API calls
- Loading skeletons (not spinners)
- Empty states with helpful messages
- Mobile-responsive layouts
- Tests for new features

### Never Generate

- Features not in the PRD
- JavaScript files (use TypeScript)
- Inline styles (use Tailwind)
- `any` types (use proper types)
- Console.log statements (use proper logging)
- Hardcoded values (use constants or env vars)

---

## File Organization

Maintain this exact structure:

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth pages
│   ├── (main)/           # Main app pages
│   ├── api/              # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── project/          # Project-specific components
│   ├── feed/             # Feed components
│   └── layout/           # Nav, footer
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   ├── redis.ts          # Redis client
│   ├── algorithm.ts      # Feed algorithm
│   └── validations.ts    # Zod schemas
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

Do not create files outside this structure without approval.

---

## Engagement Scoring Algorithm

The weighted engagement scoring is the core of DevSocial. Use these EXACT weights:

| Signal | Weight |
| --- | --- |
| Project Save | 50x |
| Comment with Author Reply | 40x |
| Click to Demo/Source | 25x |
| Time on Page (>2 min) | 20x |
| Thoughtful Comment (>100 chars) | 15x |
| Follow Creator | 10x (Phase 2, set to 0 for MVP) |
| Share | 5x |
| Like | 1x |

Formula:

```
engagementScore = (saves * 50) + (authorReplies * 40) + (demoClicks * 25) + 
                  (longViews * 20) + (longComments * 15) + (shares * 5) + (likes * 1)

recencyFactor = exp(-daysSinceSubmit / 30)

finalScore = engagementScore * recencyFactor
```

Do not modify these weights without explicit approval.

---

## Performance Requirements

All code must meet these performance targets:

- Initial page load: <2 seconds
- Time to Interactive: <3 seconds
- Lighthouse Performance score: >90
- Bundle size: <200KB initial JS
- API response time: <500ms (p95)

Optimize for performance from the start:

- Use Next.js Image component for all images
- Implement code splitting with dynamic imports
- Cache aggressively (Redis for data, CDN for assets)
- Use database indexes for all queries

---

## Security Requirements

- Never expose sensitive data in API responses (passwords, tokens, private user data)
- Validate all user input with Zod
- Use parameterized queries (Prisma handles this)
- Implement rate limiting (use Upstash Ratelimit)
- Enable CSRF protection (Next.js default)
- Use HTTPS only (Vercel handles this)

---

## Error Handling

Every API route must handle errors gracefully:

```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
  }
  console.error('Unexpected error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

Every component must handle loading and error states:

```typescript
const { data, error, isLoading } = useSWR('/api/endpoint');

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage />;
if (!data) return null;
```

---

## Git Commit Messages

Use conventional commits:

- `feat: add project submission form`
- `fix: resolve image upload bug`
- `refactor: optimize feed query`
- `test: add unit tests for algorithm`
- `docs: update README with setup instructions`

---

## When to Ask for Help

Ask for clarification if:

- A requirement in the PRD is ambiguous
- You encounter a technical limitation
- A proposed solution deviates from the PRD
- You need to add a dependency not listed in the tech stack
- A feature seems to conflict with another requirement

Do not proceed with assumptions. Ask first.

---

## Verification Before Completion

Before marking any feature as complete, verify:

- [ ] Feature works as described in PRD
- [ ] All edge cases handled (empty states, errors, loading)
- [ ] Tests written and passing
- [ ] Mobile-responsive (tested at 375px, 768px, 1920px)
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Performance targets met

---

## Summary

**DO:**

- Follow PRD specifications exactly
- Write TypeScript with strict types
- Test every feature
- Handle errors gracefully
- Optimize for performance
- Make it accessible
- Ask when unclear

**DON'T:**

- Add features not in PRD
- Use JavaScript or `any` types
- Skip tests
- Ignore errors
- Hardcode values
- Assume requirements

---

**Remember:** The goal is to build a high-quality MVP that can scale. Quality over speed. Correctness over cleverness. User experience over developer convenience.
