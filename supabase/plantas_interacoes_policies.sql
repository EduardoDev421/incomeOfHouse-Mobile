-- Políticas das interações de plantas (favoritos, aquisições e exclusão pelo proprietário).
-- Execute no SQL Editor do Supabase. As operações são idempotentes.

-- FAVORITOS: a tabela já é usada pelo projeto. Este script espera usuario_id e planta_id.
alter table public.plantas_favoritas enable row level security;

create unique index if not exists plantas_favoritas_usuario_planta_uidx
  on public.plantas_favoritas (usuario_id, planta_id);

drop policy if exists "Usuário consulta seus favoritos de plantas" on public.plantas_favoritas;
create policy "Usuário consulta seus favoritos de plantas"
  on public.plantas_favoritas for select to authenticated
  using (usuario_id = (select auth.uid()));

drop policy if exists "Usuário salva seus favoritos de plantas" on public.plantas_favoritas;
create policy "Usuário salva seus favoritos de plantas"
  on public.plantas_favoritas for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and exists (select 1 from public.plantas p where p.id = planta_id and p.ativa = true)
  );

drop policy if exists "Usuário remove seus favoritos de plantas" on public.plantas_favoritas;
create policy "Usuário remove seus favoritos de plantas"
  on public.plantas_favoritas for delete to authenticated
  using (usuario_id = (select auth.uid()));

grant select, insert, delete on public.plantas_favoritas to authenticated;

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

-- EXCLUSÃO: somente o profissional vinculado à planta pode removê-la.
drop policy if exists "plantas_delete_owner" on public.plantas;
create policy "plantas_delete_owner"
  on public.plantas for delete to authenticated
  using (profissional_id = (select auth.uid()));

grant delete on public.plantas to authenticated;

-- O arquivo enviado pelo profissional fica em uma pasta com o próprio UUID.
drop policy if exists "Profissional remove imagem da própria planta" on storage.objects;
create policy "Profissional remove imagem da própria planta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant delete on storage.objects to authenticated;
