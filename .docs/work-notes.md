# Work Notes (Latest Changes)

- Sidebar navigation cleanup:
  - `components/sidebar/app-sidebar.tsx` now builds nav items internally (no `sidebar-config` dependency, no nav props). Paths derive from `teamId` when available, with role-based management links.
  - Fixed erroneous self-recursive call/import by removing `getSidebarItems` import and handling routes inline.

- Hydration issues (Radix Tabs):
  - Added a mount guard in `components/data-table.tsx` to delay rendering until after hydration, preventing Radix Tabs id mismatches between SSR/CSR. Shows a lightweight placeholder before mount.
  - Adjusted guard placement to maintain stable hook order (prevents React “change in order of Hooks” warning).

- Current mitigations:
  - Hydration guard trades minimal first-render content for correct Radix IDs; no security impact, negligible perf cost.

- Categories / Events masters:
  - Added Supabase-backed hooks `useCategories`/`useCreateCategory`/`useUpdateCategory`/`useDeleteCategory` and `useEvents`/`useCreateEvent`/`useUpdateEvent`/`useDeleteEvent` to fetch and manage team-scoped master data with admin/manager guard.
  - Categories (`app/(app)/[teamId]/categories/client.tsx`) and Events (`app/(app)/[teamId]/events/client.tsx`) now render live data with add, edit, delete, refresh, and drag-reorder using shared `use-drag-reorder` hook.
- Expense form categories:
  - Category select now reads from Supabase categories and filters by type (expense/income) based on the selected expense type; clears invalid selections when switching types.
- Categories UI split for expense/income:
  - `app/(app)/[teamId]/categories/client.tsx` now has separate cards for expense and income categories with independent add forms; drag-reorder persists via `useReorderCategories` (team-owned items only). Shared categories remain read-only.
  - `use-drag-reorder` supports optional `onReorder` callback to persist ordering.
- Categories schema update:
  - Added `type` and `sort_order` to `categories` via migration `0002_categories_type_sort.sql`, backfilling existing rows and indexing for order; seeds updated with type/order including a sample income category.
  - Reorder persistence now upserts id/team_id/name/type/sort_order to satisfy NOT NULL columns and avoid empty result errors.
- Categories fetch fallback:
  - `useCategories` now falls back to simple ordering if `sort_order/type` columns are missing (pre-migration DB), preventing 400 errors; reorder mutation warns clearly when sort_order column is absent.
- Reorder reliability:
  - `useReorderCategories` now throws clearer errors, coerces type/sort defaults, uses upsert with select to surface DB errors, and logging prints the actual message.
- Receipts upload RLS:
  - Added migration `0004_receipts_rls_path_only.sql` to allow storage writes based on path prefix `<team_id>/<user_id>/...` without requiring metadata; still scoped to team membership and role override.
  - `uploadReceipt` includes metadata and contentType; policy now works even if metadata is omitted.
- Receipts RLS applied:
  - Linked project `rnatvptcbafxeznvqzcg`, repaired migration history (remote-only entries marked reverted; local duplicates renumbered to 0005–0007), and pushed `0007_receipts_rls_path_only.sql`. Local migrations now 0001–0007 aligned with remote.
- Receipt preview UI:
  - Expense list/approval list: Receipt icon now opens a dialog showing the uploaded image via Supabase signed URL (10 min). Loading uses `Spinner`, errors surfaced; click is stopPropagation-safe so row click behavior is unchanged. Paths and previews are displayed up to 75vh with containment styling.

## Invitation Flow Implementation

- **Phase 1: Core Invitation Flow**
  - Created `accept_invite` RPC (`supabase/migrations/0009_accept_invite_rpc.sql`) to handle joining teams via invite token
  - Implemented `/invite/[token]` page with invite validation, expiration check, and existing member detection
  - Created `JoinTeamForm` component with team name display and accept button
  - Updated `LoginForm` with smart redirect logic based on invite token and team count
  - Added invite schemas (`inviteSchema`, `Invite` type) to `lib/schemas.ts`
  - Created server-side Supabase client (`supabase/server.ts`) for Server Components

- **Phase 2: Onboarding Page**
  - Created `/onboarding` page for users with zero teams
  - Implemented `OnboardingForm` with two options: create team or join with invite token
  - Integrated with existing `/create-team` flow

- **Phase 3: Team Switcher**
  - Added "Create new team" button to Team Switcher dropdown
  - Uses `window.location.href` for full page reload to update TeamProvider cache

- **Phase 4: Middleware & Guards**
  - Created `middleware.ts` with Supabase auth refresh and team validation
  - Implemented smart redirects for invalid teamId access based on user's team count
  - Protected routes with authentication checks

### RLS Policy Issues & Fixes

1. **Invites Table**: Initially restricted to admin/manager read access, blocking invite recipients
   - Fixed: Created policy "Invites readable by authenticated users" allowing any authenticated user to read invites
   - Migration: `0010_fix_invites_rls.sql`

2. **Teams Table**: RLS prevented invite recipients from viewing team names
   - Fixed: Added policy "Teams readable via invite" to allow reading team info when valid invite exists
   - Additionally created "Teams readable by authenticated users" for broader access to basic team info
   - Migration: `0011_teams_readable_via_invite.sql`

3. **CORS Errors**: Appeared as CORS issues but were actually RLS policy violations
   - Root cause: Supabase doesn't return CORS headers on error responses
   - Solution: Relaxed teams table RLS to allow authenticated users to read team info

### Technical Challenges

- **Next.js 15 `params` Changes**: `params` is now a Promise and must be unwrapped with `await`
  - Fixed in `/invite/[token]/page.tsx` by awaiting params before accessing token

- **React Query Cache Updates**: After joining team, TeamProvider wasn't updating
  - Fixed: Changed from `router.push()` to `window.location.href` for full page reload in `JoinTeamForm`

- **TypeScript Null Checks**: Middleware had potential null reference errors
  - Fixed: Added proper parentheses for operator precedence in conditional checks

### UI Improvements

- **Users Page Actions**: Member/viewer roles now completely hide edit/delete buttons instead of just disabling them
  - Modified `app/(app)/[teamId]/users/column.tsx` to conditionally render actions based on `canManage` flag

## Dashboard Implementation

- **Summary Cards** (`components/dashboard/summary-cards.tsx`)
  - Total Balance: 全期間の収支合計（収入 - 支出）
  - This Month's Expense: 今月の支出（前月比表示）
  - This Month's Income: 今月の収入（前月比表示）
  - Pending Approvals: 承認待ちの経費件数

- **Charts** (`components/dashboard/monthly-chart.tsx`, `category-pie.tsx`)
  - Monthly Trend: 過去6ヶ月の収入・支出の棒グラフ（recharts使用）
  - Category Breakdown: 今月の支出カテゴリ別円グラフ（上位5カテゴリ + その他）

- **Activity Lists** (`components/dashboard/recent-activity.tsx`, `pending-approvals.tsx`)
  - Recent Activity: 直近5件のトランザクション
  - Pending Approvals: 承認待ちの経費（全ユーザーに表示）

- **API Hooks** (`lib/api/dashboard.ts`)
  - `useTotalBalance`: 全期間の収支合計を計算
  - `useDashboardSummary`: 今月・先月の支出・収入を計算
  - `useMonthlyChart`: 過去6ヶ月の月別集計データ
  - `useCategoryBreakdown`: カテゴリ別支出を集計

- **User Sheet Fix**
  - Member/viewer roles: Edit button is now hidden instead of disabled
  - Modified conditional rendering in `components/sheets/user-sheet.tsx`
