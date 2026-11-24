-- Permite ocultar uma conversa apenas para o participante que escolheu apagá-la.
-- As mensagens e a conversa continuam preservadas para a outra pessoa e para o Web.
alter table public.conversas
  add column if not exists oculto_usuario boolean not null default false,
  add column if not exists oculto_profissional boolean not null default false;

comment on column public.conversas.oculto_usuario is
  'Oculta a conversa apenas na lista do usuário; não apaga mensagens.';
comment on column public.conversas.oculto_profissional is
  'Oculta a conversa apenas na lista do profissional; não apaga mensagens.';
