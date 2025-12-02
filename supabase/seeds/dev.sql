-- Development seed data for Folio
-- Run with: supabase db execute --file supabase/seeds/dev.sql --project-ref rnatvptcbafxeznvqzcg

-- Clear existing data (development only)
truncate table transactions restart identity cascade;
truncate table expenses restart identity cascade;
truncate table events restart identity cascade;
truncate table categories restart identity cascade;
truncate table team_users restart identity cascade;
truncate table teams restart identity cascade;

-- Upsert profiles (use existing auth.users ids)
insert into profiles (id, name, avatar_url, theme)
values
  ('d9b79ea3-6c4b-462c-a35b-d857f956aab7', 'Demo Admin', null, 'default'),
  ('6d6c5b2e-1111-4e22-9f4a-1234567890ab', 'Demo Manager', null, 'default')
on conflict (id) do nothing;

-- Teams
insert into teams (id, name, icon, created_by)
values
  ('a7ec413d-4e38-4d6e-8063-86f818569738', 'Team Alpha', 'A', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7'),
  ('b7ec413d-4e38-4d6e-8063-86f818569739', 'Team Beta', 'B', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7')
on conflict (id) do nothing;

-- Team users
insert into team_users (team_id, user_id, role)
values
  ('a7ec413d-4e38-4d6e-8063-86f818569738', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7', 'admin'),
  ('a7ec413d-4e38-4d6e-8063-86f818569738', '6d6c5b2e-1111-4e22-9f4a-1234567890ab', 'manager'),
  ('b7ec413d-4e38-4d6e-8063-86f818569739', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7', 'manager'),
  ('b7ec413d-4e38-4d6e-8063-86f818569739', '6d6c5b2e-1111-4e22-9f4a-1234567890ab', 'admin')
on conflict (team_id, user_id) do nothing;

-- Categories (team-specific + shared)
insert into categories (id, team_id, name, created_by)
values
  ('11111111-aaaa-4f00-8000-000000000001', null, '交通費', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7'),
  ('11111111-aaaa-4f00-8000-000000000002', null, '宿泊費', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7'),
  ('11111111-aaaa-4f00-8000-000000000003', 'a7ec413d-4e38-4d6e-8063-86f818569738', 'チーム独自カテゴリ', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7')
on conflict (id) do nothing;

-- Events
insert into events (id, team_id, name, date, created_by)
values
  ('22222222-bbbb-4f00-8000-000000000001', 'a7ec413d-4e38-4d6e-8063-86f818569738', '定期演奏会', '2024-12-01', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7'),
  ('22222222-bbbb-4f00-8000-000000000002', 'b7ec413d-4e38-4d6e-8063-86f818569739', 'ハッカソン', '2024-11-15', '6d6c5b2e-1111-4e22-9f4a-1234567890ab')
on conflict (id) do nothing;

-- Expenses
insert into expenses (
  id, team_id, date, amount, type, category_id, event_id, created_by, status, memo, receipt_url
)
values
  ('33333333-cccc-4f00-8000-000000000001', 'a7ec413d-4e38-4d6e-8063-86f818569738', '2024-12-05', 12000, 'expense', '11111111-aaaa-4f00-8000-000000000001', '22222222-bbbb-4f00-8000-000000000001', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7', 'submitted', '交通費（新幹線）', null),
  ('33333333-cccc-4f00-8000-000000000002', 'a7ec413d-4e38-4d6e-8063-86f818569738', '2024-12-06', 8000, 'expense', '11111111-aaaa-4f00-8000-000000000002', null, '6d6c5b2e-1111-4e22-9f4a-1234567890ab', 'draft', '宿泊費（ホテル）', null),
  ('33333333-cccc-4f00-8000-000000000003', 'b7ec413d-4e38-4d6e-8063-86f818569739', '2024-11-20', 5000, 'expense', '11111111-aaaa-4f00-8000-000000000001', '22222222-bbbb-4f00-8000-000000000002', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7', 'submitted', 'タクシー', null)
on conflict (id) do nothing;

-- Transactions (approved expense copies)
insert into transactions (
  id, team_id, expense_id, date, amount, type, category_id, event_id, created_by, approved_by
)
values
  ('44444444-dddd-4f00-8000-000000000001', 'a7ec413d-4e38-4d6e-8063-86f818569738', '33333333-cccc-4f00-8000-000000000001', '2024-12-05', 12000, 'expense', '11111111-aaaa-4f00-8000-000000000001', '22222222-bbbb-4f00-8000-000000000001', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7', 'd9b79ea3-6c4b-462c-a35b-d857f956aab7')
on conflict (id) do nothing;
