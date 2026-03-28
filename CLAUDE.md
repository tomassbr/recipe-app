# PastryCalc — CLAUDE.md

Pastry recipe scaling app. Next.js 14 App Router + Supabase + TypeScript.

## Stack

- **Next.js 14.2.35** — App Router, Server Components, Server Actions
- **TypeScript** strict mode
- **Supabase** — PostgreSQL + Auth (Google OAuth) + RLS
- **Tailwind CSS** + custom design tokens (gold, glass morphism)
- **next-intl 4.8.3** — Czech (default) / English, cookie-based (`NEXT_LOCALE`), no i18n routing
- **Sentry** — production-only error tracking (`@sentry/nextjs`)
- **Framer Motion** — animations
- **Sonner** — toast notifications
- **Vitest 4.1.2** — unit tests
- **Playwright** — E2E tests

## Project structure

```
src/
  actions/        # Server Actions (account.ts, admin.ts, locale.ts, recipes.ts)
  app/            # Next.js App Router pages
    dashboard/    # Account settings page (/dashboard)
    admin/users/  # User management (admin only)
    login/        # Google OAuth login
    api/auth/callback/
  components/
    common/       # Shared UI (Button, GlassModal, …)
    features/
      account/    # LanguageSwitcher, DeleteAccountSection
      admin/      # UserManagementTable
      auth/       # LoginContent, UserNav
      home/       # HomePage, RecipeApp (client wrapper)
      layout/     # AppBrandBar, Sidebar, Providers
      recipe/     # RecipeDetail, RecipeFormModal, ConfirmDeleteModal, …
    ui/           # Low-level UI primitives (GlassCard, …)
  context/
    RecipeContext.tsx       # Global recipe state (CRUD, categories, search, editor)
    SessionProfileContext.tsx
  hooks/
  i18n/request.ts           # next-intl config (cookie locale)
  lib/
    supabase/               # Supabase client helpers (server, client, auth)
  types/                    # recipe.ts, profile.ts, calculatedRecipe.ts
  utils/                    # recipeScaling, recipeAmount, recipeDb, cn
messages/
  cs.json                   # Czech translations (default)
  en.json                   # English translations
supabase/migrations/        # SQL migrations (apply manually in Supabase Dashboard)
e2e/                        # Playwright tests
```

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run test         # Vitest unit tests (39 tests)
npm run e2e          # Playwright E2E
npm run lint         # ESLint
```

## Auth & roles

- Google OAuth via Supabase. Callback: `/api/auth/callback`
- Roles stored in `profiles` table (`role: 'admin' | 'user'`). First user is admin automatically (trigger in migration).
- Admin check: `useSessionProfile()` → `isAdmin`. All recipe mutations are admin-only.
- Middleware (`src/middleware.ts`) protects `/dashboard` and `/admin` routes.

## Data flow

- Recipes fetched server-side in `src/app/page.tsx` (async Server Component) → passed as `initialRecipes` to `RecipeProvider`
- `RecipeContext` holds all client state. Mutations call Server Actions with optimistic updates + rollback using `useRef` to avoid stale closures.
- No localStorage for recipes — Supabase is the source of truth.

## i18n

- All strings are in `messages/cs.json` and `messages/en.json` (must have identical keys)
- Server components: `getTranslations("namespace")`
- Client components: `useTranslations("namespace")`
- Locale set via `setLocale(locale)` Server Action → writes `NEXT_LOCALE` cookie → `window.location.reload()`
- JSON string values: escape special Unicode chars (`\u201e` etc.) — webpack's JSON parser is strict

## Database

Three migrations must be applied in Supabase Dashboard → SQL Editor:
1. `20250326120000_profiles_admin_trigger.sql` — profiles table + admin trigger
2. `20250328000000_recipes_table.sql` — recipes table with RLS + indexes
3. `20250328120000_delete_user_function.sql` — `public.delete_user()` SECURITY DEFINER function

Account deletion uses `supabase.rpc('delete_user')` — no service_role key needed.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SENTRY_DSN       # optional, production error tracking
SENTRY_AUTH_TOKEN             # optional, source map upload
```

## Key conventions

- `cn()` from `src/utils/cn` for conditional Tailwind classes
- Glass morphism: `border border-white/40 bg-white/50 backdrop-blur-xl shadow-glass`
- Active/selected state uses `gold` and `gold-muted` custom Tailwind colors
- Server Actions return `{ ok: true, ... }` or `{ ok: false, error: string }`
- Toast errors via `sonner`: `toast.error(result.error)`
- `effectiveManageMode = manageMode && isAdmin` — always check this, never just `manageMode`
