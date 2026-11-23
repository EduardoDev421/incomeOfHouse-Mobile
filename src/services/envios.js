// Ponto único dos envios de formulário que AINDA NÃO estão ligados ao backend.
// Hoje estas funções não enviam nada (e não registram dados no console).
// Quando as tabelas existirem no Supabase, implemente cada uma usando
// getSupabaseClient() de './supabase' e lance um Error se o envio falhar:
// as telas já tratam o erro e avisam o usuário.

function naoConectado(nome) {
  if (__DEV__) {
    console.warn(`[envios] "${nome}" ainda não está conectado ao backend; nada foi enviado.`);
  }
  return Promise.resolve({ enviado: false });
}

/** Fale Conosco: { nome, email, assunto, mensagem } */
export function enviarContato(/* contato */) {
  return naoConectado('contato');
}

/** Publicar Planta: { titulo, descricao, ..., imagem } */
export function enviarPlanta(/* planta */) {
  return naoConectado('planta');
}

/** Registro de profissional (solicitação com documentos anexados) */
export function enviarSolicitacaoProfissional(/* solicitacao */) {
  return naoConectado('solicitacao-profissional');
}