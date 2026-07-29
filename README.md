# The Meal Box

A mobile-friendly, installable weekly meal planner: meal plan builder
(breakfast/lunch/dinner/multiple snacks), a recipe database with
single- and multi-step recipes, per-day meal prep notes, and an
auto-generated shopping list grouped by grocery section — synced across
your devices via Supabase, and usable offline as a PWA.

Stack: **Vite + React**, **Supabase** (Postgres + Auth), **vite-plugin-pwa**,
deployed on **Vercel**.

## Features

- Weekly meal plan with breakfast/lunch/dinner + unlimited snack slots per day
- Drag-to-reorder meals within a day, and days within the week
- Recipe database (single-step or multi-step) with tags and favorites
- Per-day meal prep notes
- Shopping list auto-generated from the week's planned recipes, grouped by
  grocery section, plus manually-added items and a reset button
- Print and share (native share sheet / clipboard) views for the shopping list
- "Duplicate last week" to copy last week's plan as a starting point
- Installable PWA with offline support — edits made offline are queued and
  synced automatically once you're back online
- Sign in with a magic link (or email + password) and your data follows you
  across every device
- Responsive layout: single-column with a bottom tab bar on phones, a
  sidebar-nav multi-column layout on tablet/desktop (full 7-day calendar grid
  on wide screens)
- Optional **cycle-sync**: log a period start date and average cycle length
  to see your current phase (menstrual/follicular/ovulatory/luteal) on the
  Plan tab, tag recipes with the phases they're good for, get phase-first
  recipe suggestions when picking a meal, editable daily macro targets per
  phase, and phase-relevant shopping list highlighting. Off by default and
  fully toggleable — turn it off any week for a plain meal planner. All
  cycle data lives in your own account behind the same Row Level Security as
  everything else.

## 1. Set up Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com) (free tier is
   plenty for personal use).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `recipes`, `weeks`, and `cycle_settings` tables with Row Level
   Security so every user can only ever read/write their own data. The file
   is safe to re-run any time — if you set this project up before cycle-sync
   existed, just re-run the latest copy and it'll add what's new without
   touching your existing data.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   The default Supabase email service works out of the box for the magic
   link / confirmation emails (fine for personal use; for higher volume,
   configure a custom SMTP provider under **Authentication → Settings**).
4. Under **Authentication → URL Configuration**, add the URLs you'll use the
   app from to **Redirect URLs** (e.g. `http://localhost:5173` for local dev
   and your Vercel URL once deployed, e.g. `https://your-app.vercel.app`).
5. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon/public** key — you'll need them in the next step.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from step 1.5:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env.local` is gitignored — never commit real keys. The anon key is safe to
expose in a client app; it only allows the actions your RLS policies permit.

## 3. Run locally

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL, sign up / sign in, and start
planning. To test the installed-PWA / offline experience, build and preview
a production bundle instead (the dev server doesn't register the service
worker):

```bash
npm run build
npm run preview
```

## 4. Deploy to Vercel (free tier)

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. On [vercel.com](https://vercel.com), **Add New → Project**, import the
   repo. Vercel auto-detects Vite — build command `npm run build`, output
   directory `dist`.
3. Add the same two environment variables from step 2
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under **Project Settings →
   Environment Variables**, then deploy.
4. Add the deployed URL to Supabase's **Authentication → URL Configuration
   → Redirect URLs** (step 1.4) so magic-link sign-in works in production.

## 5. Install it on your phone

Open the deployed URL on your phone in Safari (iOS) or Chrome (Android):

- **iOS Safari**: Share → **Add to Home Screen**
- **Android Chrome**: menu (⋮) → **Add to Home screen** / **Install app**

Once installed, the app opens full-screen from your home screen and keeps
working offline — any changes you make offline sync automatically the next
time you have a connection.

## How data & offline sync work

Each write (planning a meal, checking off a shopping item, editing a
recipe...) is applied to a local cache immediately, so the UI is always
instant and works offline. It's also queued and pushed to Supabase in the
background; if you're offline the queue just waits and flushes automatically
when the network comes back (and on a timer as a fallback). On load, the app
reads the local cache first for an instant paint, then reconciles with
Supabase in the background.

This is a last-write-wins sync model, which fits a single-user app used
across a few of your own devices — it does not attempt real-time
multi-writer conflict resolution.

## Project structure

```
src/
  lib/            data model, date/cycle-phase helpers, Supabase client, offline sync engine
  hooks/          useAuth, useRecipes, useWeek, useSyncStatus, useCycleSettings
  components/     PlanTab, RecipesTab, ShoppingTab, AuthGate, modals/
  styles.css      design system (index-card aesthetic, palette, type, responsive breakpoints)
supabase/
  schema.sql      tables, RLS policies, triggers — safe to re-run in the SQL editor
scripts/
  gen-icons.mjs   regenerates PWA icons from the SVG sources in scripts/
```
