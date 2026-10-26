import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function EsqueceuSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviar = () => {
    const valor = email.trim();
    if (!valor) {
      setErro('Digite seu e-mail.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(valor)) {
      setErro('Digite um e-mail válido.');
      return;
    }
    setErro('');
    // TODO: chamar o seu backend para enviar o e-mail de recuperação aqui
    setEnviado(true);
  };

  return (
    <View style={styles.tela}>
      {/* ---------- Header / Menu ---------- */}
      <View style={styles.topo}>
        <Pressable onPress={() => router.push('/')}>
          {/* Para usar a imagem: <Image source={require('../assets/img/Logo.png')} style={styles.logoImg} /> */}
          <Text style={styles.logo}>Income of Houses</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menu}>
          <Pressable onPress={() => router.push('/')}>
            <Text style={styles.menuLink}>Início</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/plantas')}>
            <Text style={styles.menuLink}>Plantas</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/profissionais')}>
            <Text style={styles.menuLink}>Profissionais</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/sobre')}>
            <Text style={styles.menuLink}>Sobre Nós</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.fundo}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centro}>
          <View style={styles.card}>
            <Text style={styles.icone}>🔑</Text>
            <Text style={styles.titulo}>Esqueceu a senha?</Text>
            <Text style={styles.subtitulo}>
              {enviado
                ? 'Pronto! Se existir uma conta com esse e-mail, enviamos as instruções para você redefinir sua senha.'
                : 'Digite o e-mail da sua conta e enviaremos as instruções para redefinir sua senha.'}
            </Text>

            {!enviado ? (
              <>
                <Text style={styles.rotulo}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu E-mail"
                  placeholderTextColor="#737373"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

                <Pressable style={styles.botao} onPress={enviar}>
                  <Text style={styles.botaoTexto}>Enviar instruções</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.botao} onPress={() => router.push('/login')}>
                <Text style={styles.botaoTexto}>Voltar ao login</Text>
              </Pressable>
            )}

            {/* ---------- Divisor ---------- */}
            <View style={styles.divisor}>
              <View style={styles.divisorLinha} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.divisorLinha} />
            </View>

            {/* ---------- Links ---------- */}
            <View style={styles.links}>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.linkTexto}>
                  Lembrou a senha? <Text style={styles.dourado}>Entrar</Text>
                </Text>
              </Pressable>

              <Pressable style={styles.botaoSecundario} onPress={() => router.push('/cadastro')}>
                <Text style={styles.botaoSecundarioTexto}>Criar uma conta</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ---------- Rodapé ---------- */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.rodapeLinks}>
            <Pressable onPress={() => router.push('/termos-de-uso')}>
              <Text style={styles.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>|</Text>
            <Pressable onPress={() => router.push('/politica-de-privacidade')}>
              <Text style={styles.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const OURO = '#d4af6a';
const OURO_BORDA = '#cda432';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  fundo: { flex: 1, backgroundColor: '#0f0f0f' }, // troque por <ImageBackground> com BackGroundCadastroELogin.png
  conteudo: { flexGrow: 1 },
  dourado: { color: OURO },

  /* Header */
  topo: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logo: { color: OURO, fontSize: 16, fontWeight: 'bold' },
  logoImg: { width: 60, height: 60, resizeMode: 'contain' },
  menu: { alignItems: 'center', gap: 4, paddingLeft: 12 },
  menuLink: { color: '#fff', fontSize: 14, fontWeight: '500', paddingVertical: 10, paddingHorizontal: 12 },

  /* Card */
  centro: { flex: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    padding: 28,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: OURO_BORDA,
    borderRadius: 20,
  },
  icone: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  titulo: { color: '#f5f5f5', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitulo: { color: '#a3a3a3', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 26 },

  /* Campo */
  rotulo: { color: '#e5e5e5', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  input: {
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
    color: '#e5e5e5',
    fontSize: 14,
    marginBottom: 14,
  },
  erro: { color: '#e0594a', fontSize: 13, marginBottom: 10 },

  /* Botão */
  botao: { backgroundColor: OURO, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#111', fontSize: 14, fontWeight: '700' },

  /* Divisor */
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 22 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: '#363636' },
  divisorTexto: { color: '#737373', fontSize: 15 },

  /* Links */
  links: { alignItems: 'center', gap: 15 },
  linkTexto: { color: '#e5e5e5', fontSize: 14 },
  botaoSecundario: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
    borderRadius: 8,
  },
  botaoSecundarioTexto: { color: OURO, fontSize: 14, fontWeight: '700' },

  /* Rodapé */
  rodape: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#d4a63a',
  },
  rodapeTexto: { color: '#888', fontSize: 13, textAlign: 'center' },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rodapeLink: { color: OURO, fontSize: 13 },
  rodapeSep: { color: '#555' },
});