import { File } from 'expo-file-system';
import { getSupabaseClient } from './supabase';

const BUCKET = 'professional-documents';
const TAMANHO_MAX = 10 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const TIPOS_POR_EXTENSAO = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export function tipoComprovante(arquivo) {
  const mimeType = (arquivo?.mimeType || arquivo?.file?.type || '').toLowerCase();
  if (TIPOS_PERMITIDOS.has(mimeType)) return mimeType;
  if (mimeType && mimeType !== 'application/octet-stream') return null;

  const extensao = (arquivo?.name || '').split('.').pop()?.toLowerCase();
  return TIPOS_POR_EXTENSAO[extensao] || null;
}

export async function enviarComprovanteProfissional(arquivo) {
  const supabase = getSupabaseClient();
  const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
  if (erroUsuario) throw erroUsuario;
  if (!user?.id) throw new Error('Entre na sua conta para enviar o comprovante.');

  const contentType = tipoComprovante(arquivo);
  if (!contentType) {
    throw new Error('Envie o comprovante em PDF, JPEG ou PNG.');
  }

  let arquivoLocal = null;
  let tamanho = arquivo.size ?? arquivo.file?.size;
  if (arquivo.file) {
    tamanho = tamanho ?? arquivo.file.size;
  } else if (arquivo.uri) {
    arquivoLocal = new File(arquivo.uri);
    tamanho = tamanho ?? arquivoLocal.size;
  } else {
    throw new Error('Não foi possível ler o arquivo selecionado.');
  }

  if (tamanho && tamanho > TAMANHO_MAX) {
    throw new Error('O comprovante deve ter no máximo 10 MB.');
  }

  const corpo = arquivo.file || await arquivoLocal.arrayBuffer();
  const caminho = `${user.id}/comprovante`;
  const { error: erroUpload } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, corpo, {
      contentType,
      upsert: true,
    });
  if (erroUpload) throw erroUpload;

  const { error: erroEnvio } = await supabase.rpc('submit_professional_document');
  if (erroEnvio) throw erroEnvio;
}
