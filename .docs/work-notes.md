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
