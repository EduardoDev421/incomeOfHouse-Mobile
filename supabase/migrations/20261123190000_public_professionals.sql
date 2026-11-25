-- Lista pública de profissionais compartilhados entre Web e Mobile.
-- A tabela profiles é específica do fluxo Mobile. Os cadastros profissionais
-- feitos tanto no site quanto no aplicativo ficam em public.profissionais.

create or replace function public.list_public_professionals()
returns table (
  id uuid,
  full_name text,
  profession text,
  city text,
  state text,
  professional_registration text,
  verification_status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profissional.id,
    profissional.nome::text,
    profissional.profissao::text,
    profissional.cidade::text,
    profissional.estado::text,
    profissional.registro::text,
    case
      when coalesce(profissional.verificado, false) then 'verified'
      else 'pending_review'
    end::text,
    profissional.criado_em
  from public.profissionais as profissional
  order by profissional.criado_em desc nulls last;
$$;

create or replace function public.get_public_professional(p_professional_id uuid)
returns table (
  id uuid,
  full_name text,
  profession text,
  city text,
  state text,
  professional_registration text,
  verification_status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profissional.id,
    profissional.nome::text,
    profissional.profissao::text,
    profissional.cidade::text,
    profissional.estado::text,
    profissional.registro::text,
    case
      when coalesce(profissional.verificado, false) then 'verified'
      else 'pending_review'
    end::text,
    profissional.criado_em
  from public.profissionais as profissional
  where profissional.id = p_professional_id
  limit 1;
$$;

revoke all on function public.list_public_professionals() from public;
revoke all on function public.get_public_professional(uuid) from public;

grant execute on function public.list_public_professionals() to anon, authenticated;
grant execute on function public.get_public_professional(uuid) to anon, authenticated;
