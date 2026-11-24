import * as Linking from 'expo-linking';
import { getSupabaseClient } from './supabase';

const DATA_DD_MM_AAAA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function dataParaISO(data) {
  const partes = DATA_DD_MM_AAAA.exec(data);
  if (!partes) {
    throw new Error('Data de nascimento inválida.');
  }

  return `${partes[3]}-${partes[2]}-${partes[1]}`;
}

export async function entrarComEmail(email, senha) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });

  if (error) throw error;
  return data;
}

export async function cadastrarComEmail(email, senha, perfil) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: {
      data: perfil,
      emailRedirectTo: Linking.createURL('AuthCallback'),
    },
  });

  if (error) throw error;
  return data;
}

export async function enviarRecuperacaoSenha(email) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: Linking.createURL('AlterarSenha') }
  );

  if (error) throw error;
}

export async function trocarCodigoPorSessao(code) {
  const { data, error } = await getSupabaseClient().auth.exchangeCodeForSession(code);
  if (error) throw error;
  return data;
}

export async function definirSenhaRecuperacao(novaSenha) {
  const { error } = await getSupabaseClient().auth.updateUser({ password: novaSenha });
  if (error) throw error;
}

export async function alterarSenha(senhaAtual, novaSenha) {
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user?.email) {
    throw new Error('Entre na sua conta para alterar a senha.');
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  });
  if (signInError) throw signInError;

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}

export async function buscarPerfil(id) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select(
      'id, account_type, full_name, phone, cpf, birth_date, city, state, profession, professional_registration, professional_document_path, verification_status, preferences'
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarPerfil(id, campos) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update(campos)
    .eq('id', id)
    .select(
      'id, account_type, full_name, phone, cpf, birth_date, city, state, profession, professional_registration, professional_document_path, verification_status, preferences'
    )
    .single();

  if (error) throw error;
  return data;
}

export function mensagemErroAuth(error) {
  const mensagens = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    user_already_exists: 'Já existe uma conta com este e-mail.',
    weak_password: 'A senha não atende aos requisitos do Supabase.',
    over_email_send_rate_limit:
      'Muitas tentativas de envio. Aguarde um pouco e tente novamente.',
  };

  return mensagens[error?.code] || error?.message || 'Ocorreu um erro inesperado.';
}
