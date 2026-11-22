import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  AuthTela, CartaoTitulo, Campo, CaixaErro, Botao, Divisor,
  LinkConta, validarEmail, dourado,
} from '../components/AuthComponentes';

const ESPERA_REENVIO = 30; // segundos

export default function EsqueceuSenha() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [espera, setEspera] = useState(0);

  // contagem regressiva para liberar o reenvio
  useEffect(() => {
    if (espera <= 0) return undefined;
    const t = setTimeout(() => setEspera((e) => e - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const enviar = async () => {
    if (enviando || espera > 0) return;

    const valor = email.trim();
    if (!valor) {
      setErro('Digite seu e-mail.');
      return;
    }
    if (!validarEmail(valor)) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      // TODO: chamar o seu backend para enviar o e-mail de recuperação aqui
      setEnviado(true);
      setEspera(ESPERA_REENVIO);
    } catch (e) {
      setErro('Não foi possível enviar agora. Tente novamente em instantes.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthTela
      titulo={'Esqueceu sua\n'}
      destaque="senha?"
      texto="Recupere o acesso à sua conta e volte a explorar projetos, profissionais e soluções para transformar suas ideias em realidade."
      miniCards
    >
      <CartaoTitulo
        titulo={enviado ? 'Verifique seu e-mail' : 'Esqueceu sua senha?'}
        subtitulo={
          enviado
            ? 'Se existir uma conta com esse e-mail, enviamos as instruções para redefinir sua senha.'
            : 'Digite seu e-mail para receber instruções de recuperação de senha.'
        }
      />

      {!enviado ? (
        <>
          <Campo
            rotulo="E-mail"
            valor={email}
            aoMudar={(t) => {
              setEmail(t);
              if (erro) setErro('');
            }}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={enviar}
          />

          <CaixaErro texto={erro} />

          <Botao
            texto={enviando ? 'Enviando...' : 'Enviar'}
            aoPressionar={enviar}
            desativado={enviando}
          />
        </>
      ) : (
        <>
          <View style={s.sucesso} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle-outline" size={22} color={dourado} />
            <View style={s.sucessoTextos}>
              <Text style={s.sucessoEmail} numberOfLines={1}>
                {email.trim()}
              </Text>
              <Text style={s.sucessoDica}>
                Não encontrou? Confira também a caixa de spam.
              </Text>
            </View>
          </View>

          <CaixaErro texto={erro} />

          <Botao texto="Voltar ao login" aoPressionar={() => router.replace('/login')} />

          <Pressable
            onPress={enviar}
            disabled={espera > 0 || enviando}
            hitSlop={8}
            accessibilityRole="button"
            style={s.areaReenviar}
          >
            <Text style={[s.reenviar, espera > 0 && s.reenviarInativo]}>
              {espera > 0 ? `Reenviar e-mail em ${espera}s` : 'Reenviar e-mail'}
            </Text>
          </Pressable>
        </>
      )}

      <Divisor texto="ou" />

      <LinkConta
        pergunta="Lembrou sua senha?"
        acao="Entrar"
        aoPressionar={() => router.replace('/login')}
      />
    </AuthTela>
  );
}

const s = StyleSheet.create({
  sucesso: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#594823',
    backgroundColor: '#1c1a14', borderRadius: 8,
  },
  sucessoTextos: { flex: 1, minWidth: 0 },
  sucessoEmail: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sucessoDica: { color: '#b5b5b5', fontSize: 12, marginTop: 2 },
  areaReenviar: { paddingVertical: 12, marginTop: 4 },
  reenviar: {
    color: dourado, textAlign: 'center', fontSize: 13,
    textDecorationLine: 'underline',
  },
  reenviarInativo: { color: '#777', textDecorationLine: 'none' },
});