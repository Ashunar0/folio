-- RPC for approval / rejection

create or replace function public.approve_expense(p_expense_id uuid, p_approved_by uuid default auth.uid())
returns uuid
language plpgsql
security definer
as $$
declare
  exp_record public.expenses%rowtype;
  inserted_id uuid;
begin
  select * into exp_record
  from public.expenses
  where id = p_expense_id
    and status in ('submitted', 'draft')
  for update;

  if not found then
    raise exception 'Expense not found or not approvable';
  end if;

  if not public.has_role(exp_record.team_id, array['admin','manager']) then
    raise exception 'Not allowed to approve';
  end if;

  update public.expenses
    set status = 'approved',
        approval_comment = null,
        updated_at = now()
    where id = exp_record.id;

  insert into public.transactions (
    id,
    team_id,
    expense_id,
    date,
    amount,
    type,
    category_id,
    event_id,
    created_by,
    approved_by,
    created_at
  ) values (
    gen_random_uuid(),
    exp_record.team_id,
    exp_record.id,
    exp_record.date,
    exp_record.amount,
    exp_record.type,
    exp_record.category_id,
    exp_record.event_id,
    exp_record.created_by,
    coalesce(p_approved_by, auth.uid()),
    now()
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

create or replace function public.reject_expense(p_expense_id uuid, p_comment text default null)
returns void
language plpgsql
security definer
as $$
declare
  exp_record public.expenses%rowtype;
begin
  select * into exp_record
  from public.expenses
  where id = p_expense_id
    and status in ('submitted', 'draft')
  for update;

  if not found then
    raise exception 'Expense not found or not rejectable';
  end if;

  if not public.has_role(exp_record.team_id, array['admin','manager']) then
    raise exception 'Not allowed to reject';
  end if;

  update public.expenses
    set status = 'rejected',
        approval_comment = p_comment,
        updated_at = now()
    where id = exp_record.id;
end;
$$;
