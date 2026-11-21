import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AuthTela, CartaoTitulo, Campo, CaixaErro, Botao,
  Divisor, LinkConta, useLayout, dourado,
} from '../components/AuthComponentes';
import TextoLegal from '../components/TextoLegal';
import { usarConta } from '../components/ContaProvider';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conta = usarConta();
  const { mobile } = useLayout();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (carregando) return;

    if (!EMAIL_VALIDO.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }
    if (!senha) {
      setErro('Digite sua senha.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      const tipo = params.tipo === 'profissional' ? 'profissional' : 'usuario';
      await conta.definir(tipo);
      // replace: depois de logar, o botão voltar não deve retornar ao login
      router.replace('/');
    } catch (e) {
      setErro('Não foi possível entrar. Confira seus dados e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Alert.alert não funciona no navegador (react-native-web), então o aviso fica na tela
  const loginSocial = (rede) =>
    setAviso(`O login com ${rede} ainda não está disponível.`);

  return (
    <AuthTela
      titulo={'Bem-vindo\nde '}
      destaque="volta"
      texto="Acesse sua conta para gerenciar seu perfil, acompanhar projetos e conectar-se com profissionais."
    >
      <CartaoTitulo
        titulo="Entrar"
        subtitulo="Informe seus dados para acessar sua conta."
      />

      <Campo
        icone="mail-outline"
        rotulo="E-mail"
        valor={email}
        aoMudar={(t) => {
          setEmail(t);
          if (erro) setErro('');
        }}
        placeholder="Digite seu E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <Campo
        icone="lock-closed-outline"
        rotulo="Senha"
        valor={senha}
        aoMudar={(t) => {
          setSenha(t);
          if (erro) setErro('');
        }}
        placeholder="Digite sua Senha"
        senha
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={entrar}
      />

      <Pressable
        style={s.lembrar}
        onPress={() => setLembrar(!lembrar)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: lembrar }}
      >
        <Ionicons
          name={lembrar ? 'checkbox' : 'square-outline'}
          size={20}
          color={dourado}
        />
        <Text style={s.textoLembrar}>Lembrar de mim</Text>
      </Pressable>

      <CaixaErro texto={erro} />

      <TextoLegal />

      <Botao texto={carregando ? 'Entrando...' : 'Entrar'} aoPressionar={entrar} />

      <Pressable
        onPress={() => router.push('/EsqueceuSenha')}
        hitSlop={8}
        accessibilityRole="link"
        style={s.areaEsqueci}
      >
        <Text style={s.esqueci}>Esqueci minha senha</Text>
      </Pressable>

      <Divisor texto="ou continue com" />

      <View style={[s.sociais, mobile && s.sociaisMobile]}>
        <Pressable
          style={({ pressed }) => [s.social, pressed && s.pressionado]}
          onPress={() => loginSocial('Google')}
          accessibilityRole="button"
        >
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={s.textoSocial}>Entrar com Google</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.social, pressed && s.pressionado]}
          onPress={() => loginSocial('Facebook')}
          accessibilityRole="button"
        >
          <Ionicons name="logo-facebook" size={18} color="#1877F2" />
          <Text style={s.textoSocial}>Entrar com Facebook</Text>
        </Pressable>
      </View>

      {!!aviso && (
        <Text style={s.aviso} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      )}

      <View style={s.espaco} />

      <LinkConta
        pergunta="Ainda não possui um cadastro?"
        acao="Cadastre-se"
        aoPressionar={() => router.push('/cadastro')}
      />
    </AuthTela>
  );
}

const s = StyleSheet.create({
  lembrar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 14, alignSelf: 'flex-start',
  },
  textoLembrar: { color: '#ccc', fontSize: 13 },
  areaEsqueci: { paddingVertical: 8, marginTop: 6 },
  esqueci: {
    color: dourado, textAlign: 'center',
    fontSize: 13, textDecorationLine: 'underline',
  },
  sociais: { flexDirection: 'row', gap: 10 },
  sociaisMobile: { flexDirection: 'column' },
  social: {
    flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: 9,
    borderWidth: 1, borderColor: '#383838',
    backgroundColor: '#1d1d1f', borderRadius: 8,
  },
  pressionado: { opacity: 0.75 },
  textoSocial: { color: '#fff', fontSize: 13 },
  aviso: { color: '#b5b5b5', fontSize: 12, textAlign: 'center', marginTop: 12 },
  espaco: { height: 18 },
});