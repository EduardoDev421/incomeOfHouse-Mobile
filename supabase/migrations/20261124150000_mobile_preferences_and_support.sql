-- Persistência das configurações Mobile e mensagens do formulário Fale Conosco.
alter table public.profiles add column if not exists preferences jsonb not null default '{}'::jsonb;
create table if not exists public.mensagens_suporte_mobile (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users (id) on delete cascade,
 nome text not null, email text not null, assunto text not null, mensagem text not null, created_at timestamptz not null default now()
);
alter table public.mensagens_suporte_mobile enable row level security;
revoke all on table public.mensagens_suporte_mobile from public, anon, authenticated;
grant insert on table public.mensagens_suporte_mobile to authenticated;
drop policy if exists "Users can send their own support messages" on public.mensagens_suporte_mobile;
create policy "Users can send their own support messages" on public.mensagens_suporte_mobile for insert to authenticated
with check ((select auth.uid()) = user_id);
