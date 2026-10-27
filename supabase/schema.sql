-- ============================================================
-- WishDrop — Supabase schema, row-level security and functions
-- Apply with `supabase db reset` (local) or paste into the SQL
-- editor of a linked Supabase project.
-- ============================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------- profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text not null check (char_length(display_name) between 2 and 40),
  anonymous    boolean not null default false,
  avatar_url   text,
  bio          text check (bio is null or char_length(bio) <= 280),
  role         text not null default 'user' check (role in ('user', 'admin')),
  status       text not null default 'active' check (status in ('active', 'banned')),
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------- wishes
create table if not exists public.wishes (
  id                 uuid primary key default gen_random_uuid(),
  author_id          uuid not null references public.profiles (id) on delete cascade,
  title              text not null check (char_length(title) between 8 and 90),
  story              text not null check (char_length(story) between 40 and 2000),
  category           text not null check (category in
                       ('education', 'technology', 'essentials', 'experiences', 'other')),
  goal_amount        numeric(10, 2) not null check (goal_amount between 5 and 2000),
  currency           text not null default 'USD'
                       check (currency in ('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD')),
  image_url          text,
  item_url           text check (item_url is null or item_url ~* '^https?://'),
  fulfillment_method text not null default 'either'
                       check (fulfillment_method in ('gift', 'contribute', 'either')),
  anonymous          boolean not null default false,
  raised_amount      numeric(10, 2) not null default 0 check (raised_amount >= 0),
  supporter_count    integer not null default 0 check (supporter_count >= 0),
  thank_you          text check (thank_you is null or char_length(thank_you) <= 1200),
  removed            boolean not null default false,
  remove_reason      text,
  featured           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint raised_within_goal check (raised_amount <= goal_amount)
);

create index if not exists wishes_category_idx on public.wishes (category);
create index if not exists wishes_created_idx on public.wishes (created_at desc);
create index if not exists wishes_author_idx on public.wishes (author_id);

-- ---------------------------------------------- contributions
create table if not exists public.contributions (
  id            uuid primary key default gen_random_uuid(),
  wish_id       uuid not null references public.wishes (id) on delete cascade,
  supporter_id  uuid not null references public.profiles (id) on delete cascade,
  amount        numeric(10, 2) not null check (amount > 0),
  currency      text not null,
  anonymous     boolean not null default false,
  method        text not null check (method in ('money', 'gift_item')),
  status        text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'refunded')),
  is_demo       boolean not null default true,
  reference     text not null,
  message       text check (message is null or char_length(message) <= 300),
  created_at    timestamptz not null default now()
);

create index if not exists contributions_wish_idx on public.contributions (wish_id);
create index if not exists contributions_supporter_idx on public.contributions (supporter_id);

-- ------------------------------------------------- saved wishes
create table if not exists public.saved_wishes (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  wish_id     uuid not null references public.wishes (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, wish_id)
);

-- ------------------------------------------------ notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind       text not null check (kind in
               ('supported', 'fulfilled', 'thank_you', 'report', 'moderation', 'welcome')),
  title      text not null,
  body       text not null,
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_idx on public.notifications (profile_id, read);

-- ---------------------------------------------------- reports
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  wish_id     uuid not null references public.wishes (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (reason in
                ('scam', 'misleading', 'harassment', 'prohibited', 'duplicate', 'privacy', 'other')),
  details     text not null check (char_length(details) between 10 and 1000),
  status      text not null default 'open'
                check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution  text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------ thank-yous
create table if not exists public.thank_yous (
  id              uuid primary key default gen_random_uuid(),
  wish_id         uuid not null references public.wishes (id) on delete cascade,
  from_profile_id uuid not null references public.profiles (id) on delete cascade,
  to_profile_id   uuid not null references public.profiles (id) on delete cascade,
  anonymous       boolean not null default false,
  message         text not null check (char_length(message) between 10 and 600),
  created_at      timestamptz not null default now()
);

-- ============================================== server logic
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  );
$$;

-- New auth user -> profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(left(new.raw_user_meta_data ->> 'display_name', 40), ''),
      left(split_part(coalesce(new.email, 'member'), '@', 1), 40)
    )
  )
  on conflict (id) do nothing;
  update public.profiles
     set anonymous = coalesce((new.raw_user_meta_data ->> 'anonymous')::boolean, false)
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Browser clients may edit presentation fields, but may never elevate their
-- role, reactivate a suspension, alter an email, or manipulate wish totals.
-- SQL run by the project owner and service-role Edge Functions have no auth.uid
-- and therefore remain available for legitimate admin/server operations.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and (
    new.id is distinct from old.id or
    new.email is distinct from old.email or
    new.role is distinct from old.role or
    (new.status is distinct from old.status and not public.is_admin())
  ) then
    raise exception 'Profile identity, email, role, and status are server-managed.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace function public.guard_wish_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and (
    new.id is distinct from old.id or
    new.author_id is distinct from old.author_id or
    new.raised_amount is distinct from old.raised_amount or
    new.supporter_count is distinct from old.supporter_count
  ) then
    raise exception 'Wish identity and funding totals are server-managed.';
  end if;

  if auth.uid() is not null and not public.is_admin() and (
    new.removed is distinct from old.removed or
    new.remove_reason is distinct from old.remove_reason or
    new.featured is distinct from old.featured
  ) then
    raise exception 'Only moderators can change wish moderation status.';
  end if;
  return new;
end;
$$;

drop trigger if exists wishes_guard_update on public.wishes;
create trigger wishes_guard_update
  before update on public.wishes
  for each row execute function public.guard_wish_update();

create or replace function public.notify_wish_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.removed and not old.removed then
    insert into public.notifications (profile_id, kind, title, body, href)
    values (
      new.author_id,
      'moderation',
      'Your wish was removed by moderation',
      coalesce(new.remove_reason, 'It did not meet the platform rules.'),
      '/account?tab=wishes'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists wishes_moderation_notification on public.wishes;
create trigger wishes_moderation_notification
  after update on public.wishes
  for each row execute function public.notify_wish_moderation();

-- One open wish per identical title (blocks copy-paste duplicates)
create or replace function public.prevent_duplicate_wish()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.wishes w
    where w.author_id = new.author_id
      and lower(btrim(w.title)) = lower(btrim(new.title))
      and w.removed = false
  ) then
    raise exception 'You already have an open wish with that title.';
  end if;
  return new;
end;
$$;

drop trigger if exists wishes_no_duplicates on public.wishes;
create trigger wishes_no_duplicates
  before insert on public.wishes
  for each row execute function public.prevent_duplicate_wish();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wishes_touch on public.wishes;
create trigger wishes_touch before update on public.wishes
  for each row execute function public.touch_updated_at();

-- Record a contribution: validates everything server-side, updates the wish
-- atomically and notifies the author. The client never writes totals itself.
create or replace function public.support_wish(
  p_wish_id uuid,
  p_amount numeric,
  p_anonymous boolean,
  p_method text,
  p_message text,
  p_reference text,
  p_status text
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_wish public.wishes%rowtype;
  v_contrib public.contributions%rowtype;
  v_supporter uuid := auth.uid();
  v_remaining numeric;
begin
  if v_supporter is null then
    raise exception 'Sign in to support a wish.';
  end if;

  select * into v_wish from public.wishes where id = p_wish_id for update;
  if not found then
    raise exception 'Wish not found.';
  end if;
  if v_wish.removed then
    raise exception 'This wish is no longer accepting support.';
  end if;
  if v_wish.author_id = v_supporter then
    raise exception 'You cannot fund your own wish.';
  end if;

  v_remaining := v_wish.goal_amount - v_wish.raised_amount;
  if p_amount is null or p_amount <= 0 or p_amount > v_remaining then
    raise exception 'Enter an amount between 0.01 and %.', v_remaining;
  end if;

  -- Demo mode only: real payments must be confirmed by the provider webhook
  -- before a contribution may be marked confirmed.
  if p_status <> 'confirmed' and p_status <> 'pending' then
    raise exception 'Unsupported payment status.';
  end if;

  insert into public.contributions
    (wish_id, supporter_id, amount, currency, anonymous, method, status, is_demo, reference, message)
  values
    (p_wish_id, v_supporter, p_amount, v_wish.currency, coalesce(p_anonymous, false),
     coalesce(p_method, 'money'), p_status, true, p_reference, p_message)
  returning * into v_contrib;

  update public.wishes
     set raised_amount = raised_amount + p_amount,
         supporter_count = supporter_count + 1
   where id = p_wish_id
   returning * into v_wish;

  insert into public.notifications (profile_id, kind, title, body, href)
  values (
    v_wish.author_id,
    'supported',
    'Your wish received support',
    case when coalesce(p_anonymous, false)
         then 'An anonymous supporter contributed ' || p_amount || ' ' || v_wish.currency || ' (demo payment ' || p_reference || ').'
         else (select display_name from public.profiles where id = v_supporter)
              || ' contributed ' || p_amount || ' ' || v_wish.currency || ' (demo payment ' || p_reference || ').'
    end,
    '/wishes/' || p_wish_id
  );

  if v_wish.raised_amount >= v_wish.goal_amount then
    insert into public.notifications (profile_id, kind, title, body, href)
    values (v_wish.author_id, 'fulfilled', 'Your wish is fully funded',
            'Arrange delivery privately and post a thank-you when you are ready.',
            '/wishes/' || p_wish_id);
  end if;

  return jsonb_build_object('contribution', to_jsonb(v_contrib), 'wish', to_jsonb(v_wish));
end;
$$;

-- ============================================ row level security
alter table public.profiles      enable row level security;
alter table public.wishes        enable row level security;
alter table public.contributions enable row level security;
alter table public.saved_wishes  enable row level security;
alter table public.notifications enable row level security;
alter table public.reports       enable row level security;
alter table public.thank_yous    enable row level security;

-- profiles: public display data, private edits
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

-- RLS controls rows, column privileges control fields. Email addresses must
-- never be readable by other visitors, so the public can only select the
-- display-safe columns. A signed-in user's own email comes from their auth
-- session (see AuthContext), not from this table.
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, anonymous, avatar_url, bio, role, status, created_at)
  on public.profiles to anon, authenticated;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert
  with check (id = auth.uid());

-- wishes
drop policy if exists wishes_select on public.wishes;
create policy wishes_select on public.wishes for select
  using (removed = false or author_id = auth.uid() or public.is_admin());
drop policy if exists wishes_insert_own on public.wishes;
create policy wishes_insert_own on public.wishes for insert
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
  );
drop policy if exists wishes_update_own on public.wishes;
create policy wishes_update_own on public.wishes for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
drop policy if exists wishes_delete_own on public.wishes;
create policy wishes_delete_own on public.wishes for delete
  using (author_id = auth.uid() or public.is_admin());

-- contributions: only the supporter sees their own rows; totals are aggregated
drop policy if exists contributions_select on public.contributions;
create policy contributions_select on public.contributions for select
  using (supporter_id = auth.uid() or public.is_admin());
drop policy if exists contributions_insert_blocked on public.contributions;
create policy contributions_insert_blocked on public.contributions for insert
  with check (false); -- only support_wish() writes contributions

-- saved wishes
drop policy if exists saved_select on public.saved_wishes;
create policy saved_select on public.saved_wishes for select using (profile_id = auth.uid());
drop policy if exists saved_write_own on public.saved_wishes;
create policy saved_write_own on public.saved_wishes for insert
  with check (profile_id = auth.uid());
drop policy if exists saved_delete_own on public.saved_wishes;
create policy saved_delete_own on public.saved_wishes for delete using (profile_id = auth.uid());

-- notifications
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select using (profile_id = auth.uid());
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- reports: anyone signed in may file, only admins may triage
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid());
drop policy if exists reports_update_admin on public.reports;
create policy reports_update_admin on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- thank-yous
drop policy if exists thank_yous_select on public.thank_yous;
create policy thank_yous_select on public.thank_yous for select using (true);
drop policy if exists thank_yous_insert_own on public.thank_yous;
create policy thank_yous_insert_own on public.thank_yous for insert
  with check (from_profile_id = auth.uid());

-- ================================================ storage
insert into storage.buckets (id, name, public)
values ('wish-images', 'wish-images', true)
on conflict (id) do nothing;

drop policy if exists "wish images public read" on storage.objects;
create policy "wish images public read" on storage.objects for select
  using (bucket_id = 'wish-images');

drop policy if exists "wish images own write" on storage.objects;
create policy "wish images own write" on storage.objects for insert
  with check (bucket_id = 'wish-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wish images own delete" on storage.objects;
create policy "wish images own delete" on storage.objects for delete
  using (bucket_id = 'wish-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================ payments are closed for now
-- support_wish() is SECURITY DEFINER and would trust whatever payment_status it
-- is handed. While WishDrop has no payment provider wired up, only the service
-- role (a future trusted webhook function) may execute it. Without this revoke,
-- any signed-in visitor could call the RPC from the browser console and mark a
-- wish funded without paying.
revoke all on function public.support_wish(uuid, numeric, boolean, text, text, text, text)
  from public;
revoke all on function public.support_wish(uuid, numeric, boolean, text, text, text, text)
  from anon, authenticated;
grant execute on function public.support_wish(uuid, numeric, boolean, text, text, text, text)
  to service_role;
