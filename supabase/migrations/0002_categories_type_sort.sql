-- Add type and sort_order to categories for expense/income split and ordering
alter table public.categories
  add column if not exists type text not null default 'expense',
  add column if not exists sort_order integer not null default 0;

-- Backfill type and sort_order based on created_at
update public.categories
set type = coalesce(type, 'expense');

with ranked as (
  select
    id,
    row_number() over (
      partition by team_id, coalesce(type, 'expense')
      order by created_at
    ) - 1 as rn
  from public.categories
)
update public.categories c
set sort_order = r.rn
from ranked r
where c.id = r.id;

-- Ensure deterministic ordering per team/type
create index if not exists idx_categories_team_type_sort
  on public.categories(team_id, type, sort_order);
