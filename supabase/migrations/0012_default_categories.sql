-- Update create_team function to include default categories

create or replace function public.create_team(name text)
returns uuid
language plpgsql
security definer
as $$
declare
  new_team_id uuid;
begin
  -- Insert into teams
  insert into public.teams (name, created_by)
  values (name, auth.uid())
  returning id into new_team_id;

  -- Insert into team_users as admin
  insert into public.team_users (team_id, user_id, role)
  values (new_team_id, auth.uid(), 'admin');

  -- Insert default expense categories
  insert into public.categories (team_id, name, type, sort_order, created_by)
  values
    (new_team_id, '交通費', 'expense', 0, auth.uid()),
    (new_team_id, '備品・消耗品', 'expense', 1, auth.uid()),
    (new_team_id, '会場・設備利用費', 'expense', 2, auth.uid()),
    (new_team_id, '飲食・打ち上げ費', 'expense', 3, auth.uid()),
    (new_team_id, '合宿・イベント費', 'expense', 4, auth.uid()),
    (new_team_id, '接待交際費', 'expense', 5, auth.uid()),
    (new_team_id, '広報・印刷費', 'expense', 6, auth.uid()),
    (new_team_id, '雑費', 'expense', 7, auth.uid()),
    (new_team_id, 'その他', 'expense', 99, auth.uid()),
    -- Default income categories
    (new_team_id, '部費・会費', 'income', 0, auth.uid()),
    (new_team_id, 'イベント収益', 'income', 1, auth.uid()),
    (new_team_id, '補助金・助成金', 'income', 2, auth.uid()),
    (new_team_id, 'スポンサー・協賛', 'income', 3, auth.uid()),
    (new_team_id, 'その他', 'income', 99, auth.uid());

  return new_team_id;
end;
$$;
