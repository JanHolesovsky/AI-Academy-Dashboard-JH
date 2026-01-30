# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with the AI Academy Dashboard Next.js application.

## Project Overview

Full-stack Next.js 14+ application for the Kyndryl AI Academy learning management system. Features real-time leaderboards, progress tracking, team views, and mentor review capabilities.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Deployment**: Vercel

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard homepage
│   ├── leaderboard/       # Leaderboard with filters
│   ├── progress/          # Progress matrix heatmap
│   ├── teams/             # Team standings
│   ├── participant/[username]/ # Participant detail
│   ├── admin/             # Mentor review panel
│   ├── register/          # Student registration
│   └── api/               # API routes
│       ├── webhook/github/ # GitHub webhook handler
│       ├── register/      # Registration endpoint
│       └── review/        # Review submission endpoint
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Leaderboard.tsx   # Real-time leaderboard
│   ├── ProgressMatrix.tsx # Completion heatmap
│   ├── ActivityFeed.tsx  # Live activity stream
│   ├── TeamCard.tsx      # Team display card
│   ├── AchievementBadge.tsx
│   ├── ReviewForm.tsx    # Mentor review dialog
│   └── Navigation.tsx    # Main navigation
└── lib/
    ├── supabase.ts       # Browser Supabase client
    ├── supabase-server.ts # Server Supabase client
    ├── types.ts          # TypeScript types
    └── utils.ts          # Utility functions
```

## Key Features

### Real-time Updates
- Leaderboard subscribes to `leaderboard` table changes
- Activity feed subscribes to `activity_log` inserts
- Toast notifications for new achievements

### Data Flow
1. Student pushes to GitHub → webhook triggers
2. `/api/webhook/github` validates signature, processes submission
3. Supabase triggers update leaderboard
4. Real-time subscriptions notify connected clients

### Client vs Server Supabase
- **`lib/supabase.ts`**: Browser client for client components
- **`lib/supabase-server.ts`**: Server client with cookies for Server Components
- **`createServiceSupabaseClient()`**: Service role for API routes/webhooks

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
GITHUB_WEBHOOK_SECRET=
```

## Design System

- **Primary color**: #0062FF (Kyndryl blue)
- **Dark mode**: Default enabled via `className="dark"` on html
- **Achievement icons**: 🩸🐦🦉⭐🔥💪🤝🌟🏆

## Common Tasks

### Adding a New Page
1. Create directory in `src/app/`
2. Add `page.tsx` (server component by default)
3. For client interactivity, add `'use client'` directive
4. Update Navigation.tsx with new route

### Adding a New API Route
1. Create directory in `src/app/api/`
2. Add `route.ts` with HTTP method handlers
3. Use `createServiceSupabaseClient()` for database operations

### Modifying shadcn Components
- Components are in `src/components/ui/`
- Add new ones via `npx shadcn@latest add <component>`

## Important Notes

- Server Components use `supabase-server.ts`
- Client Components use `supabase.ts`
- Never import `next/headers` in client components
- Real-time subscriptions require client-side code
- Webhook signature verification is critical for security
