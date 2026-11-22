alter table public.profiles
  add column if not exists professional_document_path text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'professional-documents',
  'professional-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Professionals upload their own document"
  on storage.objects;
create policy "Professionals upload their own document"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'professional-documents'
    and name = (select auth.uid())::text || '/comprovante'
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.account_type = 'profissional'
        and profile.verification_status in ('pending_document', 'pending_review', 'rejected')
    )
  );

drop policy if exists "Professionals read their own document"
  on storage.objects;
create policy "Professionals read their own document"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'professional-documents'
    and name = (select auth.uid())::text || '/comprovante'
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.account_type = 'profissional'
    )
  );

drop policy if exists "Professionals replace their own document"
  on storage.objects;
create policy "Professionals replace their own document"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'professional-documents'
    and name = (select auth.uid())::text || '/comprovante'
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.account_type = 'profissional'
        and profile.verification_status in ('pending_document', 'pending_review', 'rejected')
    )
  )
  with check (
    bucket_id = 'professional-documents'
    and name = (select auth.uid())::text || '/comprovante'
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.account_type = 'profissional'
        and profile.verification_status in ('pending_document', 'pending_review', 'rejected')
    )
  );

create or replace function public.protect_profile_account_type()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and (
      new.account_type is distinct from old.account_type
      or (
        (
          new.verification_status is distinct from old.verification_status
          or new.professional_document_path is distinct from old.professional_document_path
        )
        and pg_catalog.current_setting('app.allow_profile_document_update', true)
          is distinct from 'true'
      )
    ) then
    raise exception 'Protected profile fields cannot be changed by the profile owner';
  end if;

  new.id = old.id;
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.submit_professional_document()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  document_path text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  document_path := current_user_id::text || '/comprovante';

  if not exists (
    select 1
    from storage.objects
    where bucket_id = 'professional-documents'
      and name = document_path
  ) then
    raise exception 'Professional document was not uploaded';
  end if;

  perform pg_catalog.set_config('app.allow_profile_document_update', 'true', true);

  update public.profiles
  set
    professional_document_path = document_path,
    verification_status = 'pending_review'
  where id = current_user_id
    and account_type = 'profissional'
    and verification_status in ('pending_document', 'pending_review', 'rejected');

  if not found then
    raise exception 'This profile cannot submit a professional document';
  end if;
end;
$$;

revoke all on function public.submit_professional_document() from public, anon, authenticated;
grant execute on function public.submit_professional_document() to authenticated;
