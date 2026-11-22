create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('usuario', 'profissional')),
  full_name text not null default '',
  phone text,
  cpf text,
  birth_date date,
  city text,
  state text,
  profession text,
  professional_registration text,
  verification_status text not null default 'not_applicable'
    check (verification_status in ('not_applicable', 'pending_document', 'pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant usage on schema public to authenticated;
revoke all on table public.profiles from public, anon, authenticated;
grant select, update on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile"
  on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile"
  on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.protect_profile_account_type()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and (
      new.account_type is distinct from old.account_type
      or new.verification_status is distinct from old.verification_status
    ) then
    raise exception 'Protected profile fields cannot be changed by the profile owner';
  end if;

  new.id = old.id;
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_account_type on public.profiles;
create trigger protect_profile_account_type
  before update on public.profiles
  for each row
  execute function public.protect_profile_account_type();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_account_type text;
begin
  new_account_type := coalesce(new.raw_user_meta_data ->> 'account_type', 'usuario');

  if new_account_type not in ('usuario', 'profissional') then
    raise exception 'Invalid account_type';
  end if;

  insert into public.profiles (
    id,
    account_type,
    full_name,
    phone,
    cpf,
    birth_date,
    city,
    state,
    profession,
    professional_registration,
    verification_status
  )
  values (
    new.id,
    new_account_type,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'cpf', ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'state', ''),
    nullif(new.raw_user_meta_data ->> 'profession', ''),
    nullif(new.raw_user_meta_data ->> 'professional_registration', ''),
    case
      when new_account_type = 'profissional' then 'pending_document'
      else 'not_applicable'
    end
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
;