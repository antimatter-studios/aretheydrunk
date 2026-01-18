# Are They Drunk?

A Supabase-backed Next.js app for hosting “party” sessions where teams add people, vote on their drunk level, and manage party visibility. Teams use capability-based auth (team_admin/team_member) and RLS to protect data. The repo includes a party manager UI, public party view, invites, team dashboards, and a shareable link system.

## Goals
- Let teams create parties and add attendees (members or guests).
- Allow public or private parties with a toggle.
- Enable voting and viewing drunk levels.
- Keep authorization consistent via scoped capabilities and RLS.

## Stack & Tooling
- **Framework**: Next.js (App Router, Server/Client Components).
- **Auth & DB**: Supabase (Postgres + RLS, Supabase Auth).
- **UI**: Custom “brutal” components (BrutalButton, BrutalCard, etc.).
- **Language**: TypeScript.
- **Package manager**: npm (package-lock present) — pnpm lock also exists but npm is canonical here.
- **Env**: `NEXT_PUBLIC_SITE_URL` for base URLs; Supabase keys/URL via standard Supabase env vars.

## Project Layout (high level)
- `app/` — Next.js routes (party pages, manage page, dashboard, auth flows, API routes).
- `components/` — shared UI primitives.
- `lib/` — helpers (supabase clients, authz, URL helpers, slug helpers, drunk-level calc).
- `scripts/` — SQL for RLS/policies, backups, and DB resets.

## Key Flows
- **Party management**: `/party/[slug]/manage` (requires team_admin on the party’s team).
- **Public view**: `/party/[slug]` (honors `is_public`).
- **Invites**: API routes and pages under `/invite/[code]` and `/api/accept-invite*` to activate memberships and grant capabilities.
- **Team dashboard**: `/dashboard` and `/dashboard/team/[slug]` for team/party listings and settings.

## Routes Overview
Auth indicates whether Supabase auth is required and what capability (if any) is needed.

### Web pages (App Router)
- `/` — Marketing/landing with recent public parties. Auth: not required.
- `/join` — Enter party code/link; redirects to `/party/[slug]`. Auth: not required.
- `/create-party` (with-header) — Create a party for a selected team. Auth: required; must be active team member of chosen team.
- `/party/[slug]` — Public/participant view of a party; respects `is_public`. Auth: not required (public parties) but RLS enforces visibility.
- `/party/[slug]/manage` — Manage attendees, visibility. Auth: required; capability `team_admin` scoped to party.team_id.
- `/party/[slug]/stats` — Party stats (if present). Auth: depends on implementation; generally same as public view.
- `/dashboard` — User’s teams overview. Auth: required.
- `/dashboard/team/[slug]` — Team dashboard listing parties/members. Auth: required; active team membership.
- `/dashboard/team/[slug]/create` — Create a party inside a team. Auth: required; active team membership.
- `/dashboard/team/[slug]/invite` — Send team invites. Auth: required; capability `team_admin` for the team.
- `/dashboard/team/[slug]/settings` — Team settings (rename/delete). Auth: required; capability `team_admin` for the team.
- `/dashboard/settings` — User settings/profile. Auth: required.
- `/invite/[code]` — Accept team invite page. Auth: optional; if logged in, must match invite email; otherwise can complete signup.
- `/auth/login` and related (with-header) — Auth pages. Auth: not required.

### API routes
- `POST /api/accept-invite` — Accept invite (unauthenticated path that can create/link auth user); body: `{ inviteCode, fullName, email, password }`. Uses admin client for creation; grants `team_member` capability. Auth: not required, but validates invite.
- `POST /api/accept-invite-logged-in` — Accept invite for already-logged-in user; form-data `inviteCode`. Auth: required; email must match invite; updates membership and grants capability.

### Server actions (selected)
- `createParty` (various locations) — Requires active team membership (and often team_admin in manage contexts); inserts into `party`.
- `togglePartyVisibility` — Requires `team_admin` via RLS on `party` updates.
- `addTeamMemberToParty` / `removePersonFromParty` / `inviteGuest` — Auth: active team member (RLS controls party_attendees writes).
- `sendTeamInvitations` — Auth: `team_admin` for team.
- `updateTeamName` / `deleteTeam` — Auth: `team_admin` for team.

> RLS ultimately enforces these rules at the database level. If a page/action fails, check the relevant policy in `scripts/` and ensure the caller has the required capability.

## Running Locally
1. **Install deps**
   ```bash
   npm install
   ```
   Ensure `vercel` and `supabase` CLI packages are available (globally or via npx):
   ```bash
   npm install -g vercel supabase   # or use npx vercel / npx supabase
   ```
2. **Env vars**: Use Vercel to pull environment variables (writes `.env.local` automatically). In the repo root:
   ```bash
   vercel login                      # authenticate once
   vercel pull --environment=preview # or production; chooses and writes .env.local
   ```
   You can then inspect/edit `.env.local` if needed.
3. **Database setup**
   - Load schema/data if needed from `scripts/0000-supabase-backup.sql` and `0001-reload-init-data.sql`.
   - Apply RLS migrations (e.g., party/team policies) from `scripts/` in order as required.
   - For a clean slate, `scripts/drop-all-tables.sql` can reset the DB (destructive!).
4. **Run dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

### Helpful CLI commands
- **Vercel login & pull env**
  ```bash
  vercel login                 # authenticate
  vercel pull --environment=preview  # pulls env into .env.local (choose target)
  ```
- **Supabase login (if needed)**
  ```bash
  supabase login   # paste your access token
  ```
- **Dump database schema/data** (adjust URL/anon keys and output paths):
  ```bash
  # Schema only
  supabase db dump --db-url "$SUPABASE_DB_URL" --schema public --file scripts/_dump_schema.sql

  # Data only
  supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --file scripts/_dump_data.sql

  # Full dump
  supabase db dump --db-url "$SUPABASE_DB_URL" --file scripts/_dump_full.sql
  ```
  `SUPABASE_DB_URL` can be constructed from the service role key (see Supabase docs) or taken from project settings. Keep service keys private.

## Authorization & RLS Notes
- Capability grants live in `user_capabilities` (scoped by `scope_type/scope_id`).
- Team admins (capability `team_admin` scoped to team) can update party fields, manage members, and toggle visibility.
- Team members (capability `team_member`) can be in parties; guests are represented as users without auth_id.
- RLS policies must be applied in the DB for updates to succeed (see `scripts/` for policy definitions). If you see update failures, ensure the party/team policies are loaded and the caller has the right capability.

## Useful Commands
- `npm run dev` — start Next dev server.
- `npm run lint` — run linters (if configured).

## Troubleshooting
- **Visibility toggle fails**: ensure party update RLS allows `team_admin` for that team.
- **Team membership reads**: RLS must allow same-team reads (see scripts).
- **Hydration/link issues**: base URLs should come from `NEXT_PUBLIC_SITE_URL`; `getBaseUrl` helper is in `lib/url`.

## Contributing / Notes
- Prefer authenticated Supabase client; avoid admin client unless explicitly needed (e.g., invite activation paths).
- Keep capability checks centralized in `lib/authz` and reuse helpers.
- When adding migrations, follow the style in `scripts/` (schema-qualified, drop then create policies, idempotent where possible).
