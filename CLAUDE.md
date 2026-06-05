# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Production build
npm run lint         # ESLint via Next.js config

npm run db:push      # Push schema changes to DB (no migration file)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Create a named migration (dev only)
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database
npm run db:setup     # db:push + db:seed
```

After any `schema.prisma` change, run `db:generate` before starting the dev server.

## Architecture

**PortfolioHub** is a full-stack SaaS platform: portfolio builder, job marketplace, application tracker, and mock interview simulator.

### Stack

- **Next.js 14** (App Router, server components by default)
- **Prisma + PostgreSQL** — single ORM, singleton client in `src/lib/db.ts`
- **NextAuth v5** — JWT sessions, Prisma adapter, providers: Google, LinkedIn, Credentials
- **TanStack React Query** — all client-side data fetching; staleTime 60s, no refetch on focus
- **React Hook Form + Zod** — forms and validation; Zod schemas live in `src/lib/validations.ts`
- **Tailwind CSS** — custom design system, no external UI library (shadcn, MUI, etc.)
- **Anthropic Claude API** — AI features (cover letters, interview eval, image gen)
- **Cloudinary** — image uploads via `next-cloudinary`
- **Resend + Twilio** — email and SMS notifications

### Route Groups

```
src/app/
  (auth)/          # Login, register, password reset — unauthenticated
  (admin)/admin/   # Admin dashboard — ADMIN role required
  (dashboard)/dashboard/  # User dashboard — authenticated
  [username]/      # Public portfolio pages — no auth
  api/             # REST API routes
```

### Data Layer

Prisma schema defines 18 models. Key groupings:
- **Auth:** Account, Session, VerificationToken, PasswordResetToken
- **Users:** User, Profile, Experience, Education, Certification, Project, Extra
- **Portfolios:** Portfolio, Template, PortfolioAnalytics
- **Jobs:** Job, Application, ApplicationTimeline, ApplicationReminder, SavedJob
- **Admin:** ActivityLog, ContactRequest

Roles: `USER`, `RECRUITER`, `ADMIN` (defined in `src/lib/enums.ts`).

### API Conventions

- All API routes live in `src/app/api/`
- Auth check: `const session = await auth(); if (!session) return 401`
- Request bodies validated with Zod before any DB call
- Standard response shape: `{ success: boolean, data?: ..., error?: string }`
- Activity logging via `ActivityLog` model for admin-visible actions

### Key Libraries in `src/lib/`

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth config (providers, callbacks, role injection) |
| `db.ts` | Prisma client singleton |
| `enums.ts` | Shared enums (UserRole, ApplicationStatus, etc.) |
| `validations.ts` | All Zod schemas |
| `utils.ts` | Shared utilities (cn, slugify wrappers, etc.) |
| `external-job.ts` | External job board API integration |
| `notify.ts` | Email/SMS notification helpers |

### Frontend Patterns

- Interactive components are `"use client"` — server components are the default
- Class merging: `cn()` from `clsx` + `tailwind-merge` (defined in `src/lib/utils.ts`)
- Icons: `@phosphor-icons/react`
- Animations: `framer-motion`
- Toasts: `react-hot-toast`
- Drag-and-drop (portfolio builder): `@dnd-kit/*`
- Charts (analytics): `recharts`
- Rich text: `react-quill`

### Portfolio Builder

Template configuration is stored as JSON in the database. The `Portfolio` model references a `Template`, and section visibility/ordering is stored as a JSON field on the portfolio record.

### Deployment

Docker multi-stage build targets `standalone` Next.js output (`next.config.mjs` sets `output: "standalone"`). The `prisma generate` step runs during the Docker build stage. Remote image domains for `next/image` are configured in `next.config.mjs` (Cloudinary, Google, LinkedIn, GitHub, Pollinations).
