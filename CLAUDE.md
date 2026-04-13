# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server on port 3002
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
npm run test:coverage # Vitest with v8 coverage
```

Run a single test file: `npx vitest run src/path/to/file.test.ts`

## Architecture

This is a B2C online bookstore built with Next.js 16 (App Router), Supabase (PostgreSQL + Auth), Zustand (cart state), TossPayments (Korean payment gateway), and Tailwind CSS v4.

### Route Groups

- `/(shop)/*` — Customer-facing pages with shared Header/Footer/MobileNav layout
- `/auth/*` — Login, signup, password reset
- `/admin/*` — Admin dashboard, book/order/user/review management (requires `role = 'admin'`)
- `/api/*` — API route handlers

### Protected Routes

Middleware (`middleware.ts` → `lib/supabase/middleware.ts`) protects routes before page load:
- `/checkout`, `/orders`, `/mypage` — require authenticated user
- `/admin/*` — require user with `role = 'admin'` in `users` table

### Supabase Client Tiers

- **Client** (`lib/supabase/client.ts`): Browser-side, anon key, for public reads
- **Server** (`lib/supabase/server.ts`): Server Components/API routes, anon key + cookie auth, subject to RLS
- **Admin** (`lib/supabase/admin.ts`): Service role key, bypasses RLS — use only for privileged server operations

All tables have RLS enabled. Admin policies use the `is_admin()` Postgres function which checks `users.role = 'admin'`.

### State Management

- Cart: Zustand store (`stores/cart-store.ts`) persisted to localStorage (key: `bookshop-cart`), syncs to DB via `/api/cart` on login
- Auth: `useAuth` hook wraps Supabase session state

### Payment Flow

TossPayments SDK → `/checkout` → redirect to TossPayments → callback to `/checkout/success` or `/checkout/fail` → `/api/payments/confirm` confirms with TossPayments server → order created

### Data Masking

All personal data (email, phone, name, address, card number) must be masked server-side via `lib/utils.ts` helpers before API response. This is a compliance requirement.

## Conventions

- **Server Components first**: Use `"use client"` only where interactivity is needed. Pattern: `page.tsx` (server) + `*-client.tsx` (client)
- **API responses**: `NextResponse.json({ error: message }, { status })` for errors
- **Book pagination**: Cursor-based for infinite scroll on the shop; offset-based in admin
- **Order numbers**: Format `ORD-YYYYMMDD-RANDOM`
- **Styling**: Tailwind v4 with CSS custom properties as design tokens in `globals.css`. Color palette: cream, charcoal, warm-brown, terracotta, olive, beige, sand. Fonts: Noto Serif KR (headings), Noto Sans KR (body), Gowun Batang (accents)
- **Icons**: Lucide React exclusively
- **Images**: Next Image remote patterns configured only for `contents.kyobobook.co.kr`

## Testing

Vitest + jsdom + React Testing Library. Tests are collocated (e.g., `route.test.ts` next to `route.ts`).

Mock Supabase with `vi.hoisted()` + `vi.mock()`. Test helpers: `makeQueryBuilder()`, `makeRequest()` in test fixtures.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client config
- `SUPABASE_SERVICE_ROLE_KEY` — Admin client (server-only, never expose)
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` — TossPayments
- `NEXT_PUBLIC_BASE_URL` — Base URL for payment redirects
