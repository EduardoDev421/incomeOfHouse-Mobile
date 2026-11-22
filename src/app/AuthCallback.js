import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buscarPerfil, mensagemErroAuth, trocarCodigoPorSessao } from '../services/auth';

export default function AuthCallback() {
  const router = useRouter();
  const parametros = useLocalSearchParams();
  const codigo = Array.isArray(parametros.code) ? parametros.code[0] : parametros.code;
  const erroLink = Array.isArray(parametros.error) ? parametros.error[0] : parametros.error;
  const [erro, setErro] = useState('');
  const codigoProcessado = useRef(false);

  useEffect(() => {
    if (!codigo || erroLink || codigoProcessado.current) return;
    codigoProcessado.current = true;

    trocarCodigoPorSessao(codigo)
      .then(async ({ user }) => {
        if (!user?.id) throw new Error('Não foi possível confirmar a conta.');
        const perfil = await buscarPerfil(user.id);
        router.replace(
          perfil.account_type === 'profissional' ? '/PerfilProfissional' : '/PerfilUsuario'
        );
      })
      .catch((error) => setErro(mensagemErroAuth(error)));
  }, [codigo, erroLink, router]);

  const erroVisivel = erroLink
    ? 'O link de confirmação é inválido ou expirou.'
    : !codigo
      ? 'Não foi encontrado um código de confirmação neste link.'
      : erro;

  return (
    <View style={styles.tela}>
      {erroVisivel ? (
        <>
          <Text style={styles.titulo}>Não foi possível confirmar</Text>
          <Text style={styles.mensagem}>{erroVisivel}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/login')}
            style={styles.botao}
          >
            <Text style={styles.textoBotao}>Voltar ao login</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#d4a63a" />
          <Text style={styles.titulo}>Confirmando sua conta...</Text>
          <Text style={styles.mensagem}>Aguarde enquanto validamos seu e-mail.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#080a0b',
  },
  titulo: {
    marginTop: 16,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  mensagem: {
    marginTop: 8,
    color: '#a8abad',
    fontSize: 14,
    textAlign: 'center',
  },
  botao: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#d4a63a',
  },
  textoBotao: {
    color: '#111',
    fontWeight: '700',
  },
});
