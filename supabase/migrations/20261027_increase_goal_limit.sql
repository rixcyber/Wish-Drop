-- ============================================================
-- Migration: Increase maximum requestable goal amount to 200,000
-- Target Table: public.wishes
-- Column: goal_amount
-- 
-- Description:
-- Replaces the check constraint enforcing the previous 2,000 limit
-- with an updated check constraint allowing amounts between 5 and 200,000.
--
-- Safety:
-- - Idempotent and safe to run multiple times.
-- - Does NOT drop tables or columns.
-- - Does NOT weaken RLS policies or drop unrelated constraints (e.g. raised_within_goal).
-- - Column type is numeric(10,2) which already supports up to 99,999,999.99.
--
-- How to apply:
-- Run this in the Supabase Dashboard -> SQL Editor for your project.
-- ============================================================

do $$
declare
  r record;
begin
  -- 1. Identify and drop existing check constraint(s) on wishes.goal_amount
  for r in (
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'wishes'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%goal_amount%between%'
  ) loop
    execute format('alter table public.wishes drop constraint if exists %I', r.conname);
  end loop;

  -- 2. Add the updated constraint if not already present
  if not exists (
    select 1
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'wishes'
      and con.conname = 'wishes_goal_amount_check'
  ) then
    alter table public.wishes
      add constraint wishes_goal_amount_check
      check (goal_amount between 5 and 200000);
  end if;
end $$;
