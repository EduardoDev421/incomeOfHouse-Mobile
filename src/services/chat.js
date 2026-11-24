import { getSupabaseClient } from './supabase';

const dataHora = (valor) => {
  if (!valor) return 0;
  const data = new Date(valor).getTime();
  return Number.isFinite(data) ? data : 0;
};

const formatarHora = (valor) => {
  if (!valor) return '';
  const data = new Date(valor);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (data.toDateString() === ontem.toDateString()) return 'Ontem';
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const iniciais = (nome) =>
  (nome || '?').trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

function mapearConversa(linha, mensagens, tipo) {
  const souUsuario = tipo === 'usuario';
  const nome = souUsuario
    ? linha.profissional_nome || 'Profissional'
    : linha.usuario_nome || 'Cliente';
  const lidoPorMim = dataHora(souUsuario ? linha.lido_usuario : linha.lido_profissional);
  const lidoPeloOutro = dataHora(souUsuario ? linha.lido_profissional : linha.lido_usuario);
  const minhasMensagens = mensagens.map((mensagem) => ({
    id: mensagem.id,
    tipo: mensagem.de === tipo ? 'enviada' : 'recebida',
    texto: mensagem.texto,
    hora: new Date(mensagem.criado_em).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    criadoEm: dataHora(mensagem.criado_em),
    remetenteId: mensagem.remetente_id,
    visualizada: mensagem.de === tipo && dataHora(mensagem.criado_em) <= lidoPeloOutro,
  }));
  const ultima = minhasMensagens[minhasMensagens.length - 1];

  return {
    id: linha.id,
    nome,
    iniciais: iniciais(nome),
    funcao: souUsuario ? 'Profissional' : 'Cliente',
    online: false,
    salvo: Boolean(souUsuario ? linha.salvo_usuario : linha.salvo_profissional),
    oculto: Boolean(souUsuario ? linha.oculto_usuario : linha.oculto_profissional),
    naoLidas: minhasMensagens.filter(
      (mensagem) => mensagem.tipo === 'recebida' && mensagem.criadoEm > lidoPorMim
    ).length,
    preview: ultima?.texto || 'Envie a primeira mensagem',
    hora: ultima ? formatarHora(ultima.criadoEm) : '',
    mensagens: minhasMensagens,
    _ultimaAtividade: ultima?.criadoEm || dataHora(linha.criado_em),
  };
}

export async function listarConversas(tipo) {
  const supabase = getSupabaseClient();
  const { data: linhas, error } = await supabase
    .from('conversas')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) throw error;
  if (!linhas?.length) return [];

  const ids = linhas.map((linha) => linha.id);
  const { data: mensagens, error: erroMensagens } = await supabase
    .from('mensagens')
    .select('id,conversa_id,de,remetente_id,texto,criado_em')
    .in('conversa_id', ids)
    .order('criado_em', { ascending: true });

  if (erroMensagens) throw erroMensagens;

  const porConversa = new Map();
  for (const mensagem of mensagens || []) {
    const lista = porConversa.get(mensagem.conversa_id) || [];
    lista.push(mensagem);
    porConversa.set(mensagem.conversa_id, lista);
  }

  return linhas
    .map((linha) => mapearConversa(linha, porConversa.get(linha.id) || [], tipo))
    .filter((conversa) => !conversa.oculto && (conversa.mensagens.length > 0 || conversa.salvo))
    .sort((a, b) => b._ultimaAtividade - a._ultimaAtividade);
}

export async function garantirConversaComProfissional({
  usuarioId,
  usuarioNome,
  profissionalId,
  profissionalNome,
}) {
  if (!usuarioId || !profissionalId || usuarioId === profissionalId) {
    throw new Error('Não foi possível identificar os participantes da conversa.');
  }

  const { data, error } = await getSupabaseClient()
    .from('conversas')
    .upsert(
      {
        usuario_id: usuarioId,
        profissional_id: profissionalId,
        usuario_nome: usuarioNome || 'Cliente',
        profissional_nome: profissionalNome || 'Profissional',
        salvo_usuario: true,
        oculto_usuario: false,
      },
      { onConflict: 'usuario_id,profissional_id' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function enviarMensagem({ conversaId, remetenteId, tipo, texto }) {
  const conteudo = texto?.trim();
  if (!conversaId || !remetenteId || !conteudo) {
    throw new Error('Não foi possível enviar uma mensagem vazia.');
  }

  const { data, error } = await getSupabaseClient()
    .from('mensagens')
    .insert({
      conversa_id: conversaId,
      de: tipo,
      remetente_id: remetenteId,
      texto: conteudo,
    })
    .select('id,conversa_id,de,remetente_id,texto,criado_em')
    .single();

  if (error) throw error;
  return data;
}

export async function marcarConversaComoLida(conversaId, tipo, mensagens) {
  const recebidas = (mensagens || []).filter((mensagem) => mensagem.tipo === 'recebida');
  const ultimaRecebida = recebidas[recebidas.length - 1];
  if (!ultimaRecebida?.criadoEm) return;

  const coluna = tipo === 'usuario' ? 'lido_usuario' : 'lido_profissional';
  const { error } = await getSupabaseClient()
    .from('conversas')
    .update({ [coluna]: new Date(ultimaRecebida.criadoEm).toISOString() })
    .eq('id', conversaId);

  if (error) throw error;
}

export async function alternarContatoSalvo(conversaId, tipo, salvo) {
  const coluna = tipo === 'usuario' ? 'salvo_usuario' : 'salvo_profissional';
  const { error } = await getSupabaseClient()
    .from('conversas')
    .update({ [coluna]: salvo })
    .eq('id', conversaId);

  if (error) throw error;
}


export async function ocultarConversa(conversaId, tipo) {
  if (!conversaId || !['usuario', 'profissional'].includes(tipo)) {
    throw new Error('Não foi possível identificar a conversa.');
  }

  const coluna = tipo === 'usuario' ? 'oculto_usuario' : 'oculto_profissional';
  const { error } = await getSupabaseClient()
    .from('conversas')
    .update({ [coluna]: true })
    .eq('id', conversaId);

  if (error) throw error;
}
