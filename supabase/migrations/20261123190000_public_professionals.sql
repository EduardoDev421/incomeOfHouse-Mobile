create or replace function public.list_public_professionals()
returns table (
  id uuid, full_name text, profession text, city text, state text,
  professional_registration text, verification_status text, created_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select profile.id, profile.full_name, profile.profession, profile.city, profile.state,
         profile.professional_registration, profile.verification_status, profile.created_at
  from public.profiles as profile
  where profile.account_type = 'profissional'
  order by profile.created_at desc;
$$;

create or replace function public.get_public_professional(p_professional_id uuid)
returns table (
  id uuid, full_name text, profession text, city text, state text,
  professional_registration text, verification_status text, created_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select profile.id, profile.full_name, profile.profession, profile.city, profile.state,
         profile.professional_registration, profile.verification_status, profile.created_at
  from public.profiles as profile
  where profile.id = p_professional_id
    and profile.account_type = 'profissional'
  limit 1;
$$;

revoke all on function public.list_public_professionals() from public;
revoke all on function public.get_public_professional(uuid) from public;
grant execute on function public.list_public_professionals() to anon, authenticated;
grant execute on function public.get_public_professional(uuid) to anon, authenticated;
