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
