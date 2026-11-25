-- Políticas das interações de plantas (favoritos, aquisições e exclusão pelo proprietário).
-- Execute no SQL Editor do Supabase. As operações são idempotentes.

-- FAVORITOS: tabela compartilhada com o site (favoritos.usuario_id,
-- favoritos.planta_id e favoritos.profissional_id).
alter table public.favoritos
  add column if not exists profissional_id uuid references public.profissionais(id) on delete cascade;
alter table public.favoritos enable row level security;

create unique index if not exists favoritos_usuario_planta_uidx
  on public.favoritos (usuario_id, planta_id)
  where planta_id is not null;

create unique index if not exists favoritos_usuario_profissional_uidx
  on public.favoritos (usuario_id, profissional_id)
  where profissional_id is not null;

drop policy if exists "Usuário consulta seus favoritos" on public.favoritos;
create policy "Usuário consulta seus favoritos"
  on public.favoritos for select to authenticated
  using (usuario_id = (select auth.uid()));

drop policy if exists "Usuário salva seus favoritos" on public.favoritos;
create policy "Usuário salva seus favoritos"
  on public.favoritos for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and (
      (planta_id is not null and profissional_id is null)
      or
      (profissional_id is not null and planta_id is null)
    )
  );

drop policy if exists "Usuário remove seus favoritos" on public.favoritos;
create policy "Usuário remove seus favoritos"
  on public.favoritos for delete to authenticated
  using (usuario_id = (select auth.uid()));

grant select, insert, delete on public.favoritos to authenticated;

-- AQUISIÇÕES: aquisição é individual por usuário, mas não torna a planta exclusiva.
alter table public.plantas_adquiridas enable row level security;

drop policy if exists "Usuário consulta suas plantas adquiridas" on public.plantas_adquiridas;
create policy "Usuário consulta suas plantas adquiridas"
  on public.plantas_adquiridas for select to authenticated
  using (usuario_id = (select auth.uid()));

drop policy if exists "Usuário adquire planta para si" on public.plantas_adquiridas;
create policy "Usuário adquire planta para si"
  on public.plantas_adquiridas for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and exists (select 1 from public.plantas p where p.id = planta_id and p.ativa = true)
  );

grant select, insert on public.plantas_adquiridas to authenticated;

-- Permite ao profissional consultar também suas plantas arquivadas e ao
-- usuário consultar as plantas que já adquiriu, mesmo após arquivamento.
drop policy if exists "Profissional consulta suas próprias plantas" on public.plantas;
create policy "Profissional consulta suas próprias plantas"
  on public.plantas for select to authenticated
  using (profissional_id = (select auth.uid()));

drop policy if exists "Usuário consulta plantas adquiridas" on public.plantas;
create policy "Usuário consulta plantas adquiridas"
  on public.plantas for select to authenticated
  using (exists (
    select 1 from public.plantas_adquiridas pa
    where pa.planta_id = plantas.id and pa.usuario_id = (select auth.uid())
  ));

-- EXCLUSÃO LÓGICA: o profissional desativa a planta sem apagar registros
-- que podem estar ligados a favoritos e aquisições.
drop policy if exists "Profissional arquiva a própria planta" on public.plantas;
create policy "Profissional arquiva a própria planta"
  on public.plantas for update to authenticated
  using (profissional_id = (select auth.uid()))
  with check (profissional_id = (select auth.uid()));

drop policy if exists "plantas_delete_owner" on public.plantas;
create policy "plantas_delete_owner"
  on public.plantas for delete to authenticated
  using (profissional_id = (select auth.uid()));

grant update, delete on public.plantas to authenticated;

-- O arquivo enviado pelo profissional fica em uma pasta com o próprio UUID.
drop policy if exists "Profissional remove imagem da própria planta" on storage.objects;
create policy "Profissional remove imagem da própria planta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant delete on storage.objects to authenticated;
