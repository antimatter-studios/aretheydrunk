# Capability-Based, Resource-Scoped Authorization Plan

A neutral, capability-based permission system with optional resource scoping that supports global (platform owner) and team-scoped administration, with clear enforcement points and an admin UI. Team membership remains a pure association; capabilities determine what a user can do.

## Objectives
- **Neutral model:** Define granular capabilities (e.g., `team_admin`, `super_admin`) without hardcoding team logic.
- **Resource scoping:** Allow capabilities to be restricted to a specific resource, e.g., `team_admin` scoped to `team:2`.
- **Platform ownership:** Support global capabilities like `super_admin` for the site owner.
- **Extensibility & auditability:** Easy to add new capabilities and capture who changed what.
- **Low friction enforcement:** Simple helpers/middleware to check capabilities in server and client contexts.

## Data Model (proposed)
- **capabilities**
  - `id` (pk)
  - `name` (unique, e.g., `team_admin`, `super_admin`, `invite_user`, `ban_user`)
  - `description` (optional)

- **user_capabilities** (grants)
  - `id` (pk)
  - `user_id` (fk -> users)
  - `capability_id` (fk -> capabilities)
  - `scope_type` (nullable, string; e.g., `team`, `org`, `*` for global)
  - `scope_id` (nullable, string/uuid/int; id within the scope_type)
  - `expires_at` (nullable)
  - `granted_by` (fk -> users, nullable)
  - unique index on (`user_id`, `capability_id`, `scope_type`, `scope_id`)

- **associations (domain membership)**
  - Keep a separate association table for domain relationships (e.g., `team_memberships`: `user_id`, `team_id`, `joined_at`, metadata)
  - This table expresses belonging/linkage only. It does not imply permissions.
  - Authorization flows should check capabilities, not membership flags. Association is useful for listings, invitations, billing, and context resolution.

- (Optional) **roles** for bundling common sets of capabilities
  - `roles`: `id`, `name`, `description`
  - `role_capabilities`: `role_id`, `capability_id`
  - `user_roles`: `user_id`, `role_id`, `scope_type`, `scope_id`, `expires_at`

- **audit_logs** (optional but recommended)
  - `id`, `actor_user_id`, `action`, `target_type`, `target_id`, `diff`, `created_at`

Notes:
- A null `scope_type/scope_id` represents a global grant.
- For purely global capabilities (e.g., `super_admin`), omit scope.
- For team-specific permissions, grant capabilities with `scope_type = 'team'` and `scope_id = <team_id>` (e.g., `team_member`, `team_admin`).

## Examples
- Platform owner: `user_capabilities(user_id = X, capability = 'super_admin', scope_type = null, scope_id = null)`.
- Team admin for team 2: `user_capabilities(user_id = Y, capability = 'team_admin', scope_type = 'team', scope_id = '2')`.
- Team member of team 2 (authorized to basic team actions): `user_capabilities(user_id = Y, capability = 'team_member', scope_type = 'team', scope_id = '2')`. The separate `team_memberships` row provides association; the capability provides permission.

## Authorization API
- **Server helper:** `hasCapability(userId, capabilityName, scope?: { type: string; id?: string|number })`
  - Returns true if user has a matching global grant, or a grant matching scope_type and scope_id.
- **Guard utility:** `requireCapability(capabilityName, scope?)` to use in API routes/server actions/middleware.
- **Batch fetch:** `listCapabilities(userId)` for UI.

Implementation detail:
- If a user has a global grant for a capability, it satisfies all scopes of that capability.
- If `scope.id` is omitted and user has any grant for the `scope.type`, treat as wildcard-for-type only if explicitly desired; default to exact match. Add wildcard support later if needed.
 - Authorization should not depend on association flags. If desired, you can require both association AND capability for certain flows (e.g., viewing a team requires association, modifying requires capability). Default recommendation: enforce with capabilities; use association for discovery and invitations.

## Where to Enforce
- **Server-first:** API routes, server actions, tRPC procedures, and RSC loaders call `requireCapability` with the resource context.
- **UI hints (optional):** Client components use a read-only `useCapability` hook to enable/disable UI affordances. Never trust client checks.
- **Middleware:** Route-level protection (e.g., `/admin/**` requires `super_admin`).
 - **Association vs Capability:** Use association to scope listings (e.g., only list teams where association exists), but require `team_member(team:X)` for basic team operations and `team_admin(team:X)` for admin actions.

## Performance & Caching
- Load grants on session creation and store a compact set in the session/JWT (capability name + scope tuples).
- Include a `grants_version` in user profile; bump on changes to invalidate cached grants.
- Provide a `getGrants(userId)` that caches per-request.

## Admin UI
- **Global Admin:** List users, view their grants, grant/revoke capabilities, search by capability/scope.
- **Team Admin:** For users with `team_admin(team:X)`, allow managing team-level members/invites/etc.
- Inline audit log for sensitive changes.

## Association Authority & Consistency
Two viable patterns to reconcile rich membership metadata with capability-driven auth:

- **Option A — Capabilities as membership authority (strict):**
  - Presence of `team_member(team:X)` is the authoritative signal that a user “belongs” for permission purposes.
  - Maintain a 1:1 `team_memberships(user_id, team_id)` row as metadata storage (invite_code, timestamps, provenance).
  - Enforce consistency in application code (and optionally with DB constraints/triggers): on grant of `team_member(team:X)`, create membership row; on revoke, soft-delete membership row. Authorization checks look only at capabilities; listings can join on membership for metadata.

- **Option B — Membership as association authority (pragmatic):**
  - A `team_memberships` row indicates belonging; a synchronized `team_member(team:X)` capability is created/removed transactionally.
  - Authorization checks still use capabilities; membership drives lifecycle and metadata (invites, accepted_at, left_at, invite_code).
  - This is simpler to reason about when there are many membership-related states (pending invite, accepted, suspended), while keeping capability checks clean.

Recommendation: start with **Option B** for simpler lifecycle modeling (invites, pending, accepted), and treat `team_member` capability as the permission artifact emitted upon acceptance. We can evolve to Option A later if you want capabilities to be the single source of truth.

## Migration Plan
1. **Introduce schema** for `capabilities`, `user_capabilities` (and optionally roles tables). Keep existing `team_memberships` (association) unchanged.
2. **Seed capabilities** (`super_admin`, `team_admin`, `team_member`, plus any immediate needs).
3. **Backfill grants**
   - For every current team association, grant `team_member(team:<id>)`.
   - For current team admins, grant `team_admin(team:<id>)`.
   - Grant `super_admin` to platform owner account.
4. **Introduce helpers** (`hasCapability`, `requireCapability`) and wrap critical server operations. Replace any membership-based permission checks with capability checks.
5. **Gradual roll-out:** Start enforcing on admin routes and high-risk actions; then apply to team endpoints.
6. **Build admin UI:** Read-only listings first (users, associations, capabilities), then grant/revoke and audit.
7. **Clean-up:** Remove legacy authorization flags/logic from membership entities if present; keep associations for domain linkage only.

## Risks & Decisions
- Scope matching semantics (exact vs wildcard) need confirmation.
- Role bundles may be deferred if not immediately needed.
- Ensure consistent `team_id` type (string vs int) across DB and code.
- Decide on where to store grants in session (JWT vs server session) given NextAuth/config.

## Open Questions
- What auth/session library is in use (e.g., NextAuth)? Where is the current user model?
- Do you need wildcard-in-scope-type (e.g., `team_admin` for all teams) besides global `super_admin`?
- Any other near-term capabilities (e.g., `manage_billing`, `ban_user`, `feature_toggle_write`)?
- Do you prefer roles bundling now or later?
- For read-only actions (e.g., viewing team dashboard), should capability `team_member(team:X)` be required, or is association-only acceptable? Default recommendation: require capability.

## Finalized Decisions (defaults to start implementation)
- **Authority split:** Membership carries lifecycle/metadata; capabilities authorize access. We use Option B: membership lifecycle emits capabilities (`team_member` on accept).
- **Capabilities to ship:** `super_admin` (global), `team_member(team:X)`, `team_admin(team:X)`.
- **Scope semantics:** Exact match only. No wildcards initially.
- **Super admin:** Global bypass for all checks; not expanded into per-cap grants.
- **Read access:** Require `team_member(team:X)` for team dashboard and basic reads.
- **Caching:** Encode grants in session/JWT with `grants_version` invalidation.
- **Team ID type:** UUID (per current schema). `scope_id` uses UUID to match `team.id`.

## Implementation Specification
- **Schema (tables/indices)**
  - `capabilities(id pk, name unique, description null)`
  - `user_capabilities(id pk, user_id fk, capability_id fk, scope_type string null, scope_id (match team id type) null, expires_at ts null, granted_by fk null)
    - Unique index: (user_id, capability_id, scope_type, scope_id)
  - `team_memberships(user_id fk, team_id fk, status enum('pending','active','left','suspended'), invite_code null, invited_by fk null, invited_at ts null, accepted_at ts null, joined_at ts null, left_at ts null, metadata jsonb null)
    - Unique index: (user_id, team_id) where status in ('pending','active') as appropriate
  - (Optional later) roles, role_capabilities, user_roles

- **Seed data**
  - capabilities: `super_admin`, `team_member`, `team_admin`
  - grants: assign `super_admin` to platform owner user id

- **Authorization helpers (server)**
  - `hasCapability(userId, capabilityName, scope?: { type: string; id?: string|number }) => Promise<boolean>`
  - `requireCapability(capabilityName, scope?) => Promise<void>` throws 403 on failure
  - `listCapabilities(userId) => Promise<Array<{name:string, scope_type?:string, scope_id?:string|number}>>`
  - Evaluation rules: true if global grant exists for capability or exact (capability, scope_type, scope_id) match; `super_admin` short-circuits to true

- **Session integration**
  - On sign-in/session refresh, load compact grants: `[ [capName, scopeType|null, scopeId|null], ... ]`
  - Include `grants_version` and invalidate cache when grants change

## Database Logic Policy (No DB Functions/Triggers)
- **Principle:** Avoid Postgres functions/procedures/triggers for business logic to prevent split-brain between app code and DB. Keep orchestration in application services.
- **What the DB should still do:**
  - Enforce relational integrity: foreign keys, unique indices, check constraints, not-null, cascades.
  - Apply Row Level Security (RLS) policies as a defensive layer (Supabase standard), but keep capability evaluation in app code.
  - Use transactions for multi-step lifecycle operations (invite acceptance, revocations).
- **What to avoid:**
  - Triggers/functions that create/revoke capabilities or mutate membership state.
  - Hidden side-effects that make behavior non-obvious from app code.
- **Exceptions (rare):** If a critical integrity invariant cannot be reliably enforced at the app layer under concurrency, consider a minimal trigger/constraint; document it prominently and cover with tests. Default is app-layer enforcement.

- **Lifecycle flows**
  - Accept invite → upsert membership(status='active', accepted_at, joined_at) + grant `team_member(team:X)` (transaction)
  - Leave/revoke → revoke `team_member(team:X)` (+ `team_admin` if present), mark membership `left_at`/status='left' (transaction)
  - Promote/demote → grant/revoke `team_admin(team:X)`; membership unchanged

## Initial Enforcement Targets
- Server actions/API endpoints:
  - Team dashboard/data read → `requireCapability('team_member', {type:'team', id:X})`
  - Manage members/invites/settings → `requireCapability('team_admin', {type:'team', id:X})`
  - Delete/rename team → `requireCapability('team_admin', {type:'team', id:X})` with extra confirmation
  - Global admin routes (`/admin/**`) → `requireCapability('super_admin')` (middleware)

- UI hints (non-authoritative):
  - Hide admin controls unless `team_admin`
  - Show teams based on membership listing; disable actions without capability

## Testing Checklist
- Capability evaluation: global vs scoped, multiple scopes, revoked, expired
- Super admin bypass
- Invite acceptance creates membership and grants capability atomically
- Revocation removes access and updates session cache (`grants_version`)
- Enforcement on critical endpoints returns 403 appropriately

## Milestones (Phased)
- **M1 — Schema & Seeds:** Tables + seed `super_admin`, `team_member`, `team_admin`. Backfill owner with `super_admin`.
- **M2 — Enforcement Core:** Implement `hasCapability`/`requireCapability` and protect key routes/APIs.
- **M3 — Admin UI (Read):** View users, grants, filters.
- **M4 — Admin UI (Write) & Audit:** Grant/revoke, audit logs, and session invalidation.
- **M5 — Legacy Clean-up:** Remove old ad-hoc checks; documentation.
