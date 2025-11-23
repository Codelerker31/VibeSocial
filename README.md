# DevSocial

DevSocial is a content-first discovery platform designed to help developers showcase their code projects and discover innovative work from the community.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project
- A GitHub OAuth App

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devsocial.git
   cd devsocial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values:
     - `DATABASE_URL`: Your Supabase connection string (Transaction Pooler)
     - `DIRECT_URL`: Your Supabase connection string (Direct)
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: From GitHub Developer Settings

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

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

## Development Standards

- **TypeScript:** Strict mode is enabled. Avoid `any`.
- **Styling:** Use Tailwind CSS utility classes.
- **Components:** Use Server Components by default. Add `'use client'` only when necessary.
- **Commits:** Follow conventional commits (e.g., `feat: add login page`, `fix: resolve auth bug`).

## License

MIT
