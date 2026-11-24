import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { getSupabaseClient } from './supabase';

// Converte o URI local retornado pelo ImagePicker em bytes.
// No navegador, fetch consegue ler URLs blob; no app nativo, usamos Expo FileSystem.
async function lerImagemComoBytes(imagem) {
  if (!imagem?.uri) {
    throw new Error('A imagem selecionada não possui um endereço válido.');
  }

  if (Platform.OS === 'web') {
    const resposta = await fetch(imagem.uri);
    if (!resposta.ok) {
      throw new Error('Não foi possível ler a imagem selecionada.');
    }
    return resposta.arrayBuffer();
  }

  const arquivo = new File(imagem.uri);
  if (!arquivo.exists) {
    throw new Error('O arquivo da imagem não foi encontrado no dispositivo.');
  }

  return arquivo.bytes();
}

function obterExtensaoImagem(imagem, mimeType) {
  const extensoesPorTipo = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const extensaoPorTipo = extensoesPorTipo[mimeType];
  if (extensaoPorTipo) return extensaoPorTipo;

  const nome = imagem.fileName || imagem.uri || '';
  const extensao = nome.split('?')[0].split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(extensao) ? extensao : 'jpg';
}

/** Fale Conosco: registra a solicitação do usuário autenticado no Supabase. */
export async function enviarContato(contato) {
  const supabase = getSupabaseClient();
  const { data: { user }, error: usuarioError } = await supabase.auth.getUser();
  if (usuarioError) throw usuarioError;
  if (!user?.id) throw new Error('Entre na sua conta para enviar uma mensagem.');
  const { data, error } = await supabase.from('mensagens_suporte_mobile')
    .insert({ user_id: user.id, nome: contato.nome, email: contato.email, assunto: contato.assunto, mensagem: contato.mensagem })
    .select('id, created_at').single();
  if (error) throw error;
  return { enviado: true, mensagem: data };
}

/**
 * Publicar Planta:
 * { titulo, descricao, estilo, categoria, distribuicao, destaques,
 *   quartos, banheiros, garagem, area, preco, imagem }
 */
export async function enviarPlanta(planta) {
  const supabase = getSupabaseClient();

  // 1. Confirma que existe uma sessão autenticada.
  const { data: usuarioData, error: usuarioError } = await supabase.auth.getUser();
  if (usuarioError) throw usuarioError;

  const usuario = usuarioData?.user;
  if (!usuario) {
    throw new Error('Sua sessão expirou. Entre novamente para publicar uma planta.');
  }

  // 2. Confirma o cadastro profissional antes de tentar o upload.
  const { data: profissional, error: profissionalError } = await supabase
    .from('profissionais')
    .select('id')
    .eq('id', usuario.id)
    .maybeSingle();

  if (profissionalError) throw profissionalError;
  if (!profissional) {
    throw new Error('É necessário concluir o cadastro profissional antes de publicar.');
  }

  if (!planta?.imagem?.uri) {
    throw new Error('Selecione uma imagem para publicar a planta.');
  }

  const mimeType = planta.imagem.mimeType || 'image/jpeg';
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(mimeType)) {
    throw new Error('A imagem deve estar no formato JPEG, PNG ou WebP.');
  }

  // 3. O primeiro nível do caminho é o UUID do usuário, exigido pela RLS.
  const extensao = obterExtensaoImagem(planta.imagem, mimeType);
  const nomeOriginal = (planta.imagem.fileName || 'planta')
    .replace(/\\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 60) || 'planta';
  const caminhoImagem = `${usuario.id}/${Date.now()}-${nomeOriginal}.${extensao}`;

  const bytesImagem = await lerImagemComoBytes(planta.imagem);
  const { error: uploadError } = await supabase.storage
    .from('plantas')
    .upload(caminhoImagem, bytesImagem, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('plantas')
    .getPublicUrl(caminhoImagem);

  // 4. Registra os dados usando os nomes reais das colunas do banco.
  const dadosPlanta = {
    profissional_id: usuario.id,
    nome: planta.titulo,
    descricao: planta.descricao || null,
    categoria: planta.categoria,
    preco: planta.preco,
    imagem_url: urlData.publicUrl,
    ativa: true,
    estilo: planta.estilo || null,
    quartos: planta.quartos,
    banheiros: planta.banheiros,
    garagem: planta.garagem,
    area: planta.area,
    destaques: planta.destaques || [],
    distribuicao_ambientes: planta.distribuicao || null,
  };

  const { data, error: cadastroError } = await supabase
    .from('plantas')
    .insert(dadosPlanta)
    .select()
    .single();

  if (cadastroError) {
    // Evita deixar uma imagem sem planta cadastrada no banco.
    const { error: remocaoError } = await supabase.storage
      .from('plantas')
      .remove([caminhoImagem]);

    if (remocaoError && __DEV__) {
      console.warn('[envios] Não foi possível remover a imagem após falha no cadastro:', remocaoError);
    }

    throw cadastroError;
  }

  return { enviado: true, planta: data };
}

/** Registro de profissional (solicitação com documentos anexados) */
export function enviarSolicitacaoProfissional(/* solicitacao */) {
  if (__DEV__) {
    console.warn('[envios] "solicitacao-profissional" ainda não está conectado ao backend.');
  }
  return Promise.resolve({ enviado: false });
}
