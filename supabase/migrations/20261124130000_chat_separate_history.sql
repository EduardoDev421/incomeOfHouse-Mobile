-- Cada participante pode iniciar uma nova janela de conversa sem apagar
-- o histórico que continua disponível para a outra pessoa.
alter table public.conversas
  add column if not exists limpar_historico_usuario_em timestamptz,
  add column if not exists limpar_historico_profissional_em timestamptz;

comment on column public.conversas.limpar_historico_usuario_em is
  'Mensagens anteriores a este instante ficam ocultas apenas para o usuário.';
comment on column public.conversas.limpar_historico_profissional_em is
  'Mensagens anteriores a este instante ficam ocultas apenas para o profissional.';

create or replace function public.registrar_limite_historico_conversa()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.oculto_usuario is true and old.oculto_usuario is distinct from true then
    new.limpar_historico_usuario_em := now();
  end if;

  if new.oculto_profissional is true and old.oculto_profissional is distinct from true then
    new.limpar_historico_profissional_em := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_limite_historico_conversa on public.conversas;

create trigger trg_limite_historico_conversa
before update of oculto_usuario, oculto_profissional
on public.conversas
for each row
execute function public.registrar_limite_historico_conversa();
