import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

/* =========================================================
   ROTAS
   O expo-router só abre rotas cujo ARQUIVO existe dentro da pasta "app".
   Rotas ainda não criadas ficam como null (o toque não faz nada).
========================================================= */

const ROTAS = {
  inicio: '/',
  plantas: null,         // ex.: '/plantas'
  profissionais: null,   // ex.: '/profissionais'
  sobre: null,           // ex.: '/sobre'
  termos: null,          // ex.: '/termos-de-uso'
  privacidade: null,     // ex.: '/politica-de-privacidade'
};

// Menu lateral (sem ícones)
const MENU_LATERAL = [
  { texto: 'Meu Perfil', rota: null },                    // PerfilProfissional
  { texto: 'Meus Endereços', rota: null },                // MeusEndereços
  { texto: 'Meus Pedidos', rota: null },                  // MeusPedidos
  { texto: 'Meus Profissionais Favoritos', rota: null },  // MeusProfissionais
  { texto: 'Projetos Salvos', rota: null },               // ProjetosSalvos
  { texto: 'Agendamentos', rota: null },                  // Agendamentos
  { texto: 'Mensagem', rota: null },                      // Mensagem
  { texto: 'Configurações', rota: null, ativo: true },    // ConfiguraçõesProfissionais
  { texto: 'Sair', rota: '/' },                           // index
];

/* =========================================================
   FORÇA DA SENHA (3 segmentos, como na barra do HTML)
========================================================= */

const forcaSenha = (s) => {
  if (!s) return 0;
  let pontos = 0;
  if (s.length >= 8) pontos++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s)) pontos++;
  if (/[^A-Za-z0-9]/.test(s)) pontos++;
  return Math.max(1, pontos);
};

const ROTULO_FORCA = ['', 'Fraca', 'Média', 'Forte'];
const COR_FORCA = ['#363636', '#e0594a', '#d4af6a', '#4caf50'];

/* =========================================================
   COMPONENTES (fora da tela para não serem recriados a cada tecla)
========================================================= */

function MenuLink({ texto, onPress, ativo }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuLink, ativo && styles.menuLinkAtivo]}>
      <Text style={[styles.menuTexto, ativo && styles.dourado]}>{texto}</Text>
    </Pressable>
  );
}

// .field + .input-wrap (input com botão de texto para mostrar/ocultar a senha)
function CampoSenha({ rotulo, value, onChangeText, placeholder, children }) {
  const [mostrar, setMostrar] = useState(false);
  const [foco, setFoco] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.inputWrap, foco && styles.inputWrapFoco]}>
        <TextInput
          style={[styles.input, Platform.OS === 'web' && styles.semOutline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          secureTextEntry={!mostrar}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
        />
        <Pressable onPress={() => setMostrar((m) => !m)} hitSlop={8}>
          <Text style={styles.mostrar}>{mostrar ? 'Ocultar' : 'Mostrar'}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function AlterarSenha() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const menuCentralizado = width >= 900; // menu no centro do header
  const lateral = width >= 900;          // menu lateral ao lado do conteúdo

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [msg, setMsg] = useState(null); // { tipo: 'erro' | 'ok', texto }

  const forca = forcaSenha(nova);

  const alterar = () => {
    if (!atual || !nova || !confirmar) {
      setMsg({ tipo: 'erro', texto: 'Preencha todos os campos.' });
      return;
    }
    if (nova.length < 8) {
      setMsg({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (nova === atual) {
      setMsg({ tipo: 'erro', texto: 'A nova senha deve ser diferente da atual.' });
      return;
    }
    if (nova !== confirmar) {
      setMsg({ tipo: 'erro', texto: 'As senhas não conferem.' });
      return;
    }
    // TODO: enviar senha atual + nova senha para o seu backend aqui
    setMsg({ tipo: 'ok', texto: 'Senha alterada com sucesso.' });
    setAtual('');
    setNova('');
    setConfirmar('');
  };

  const menu = (
    <>
      <MenuLink texto="Início" onPress={() => ir(ROTAS.inicio)} />
      <MenuLink texto="Plantas" onPress={() => ir(ROTAS.plantas)} />
      <MenuLink texto="Profissionais" onPress={() => ir(ROTAS.profissionais)} />
      <MenuLink texto="Sobre" onPress={() => ir(ROTAS.sobre)} />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudoScroll} keyboardShouldPersistTaps="handled">
        {/* ---------- .BackGround ---------- */}
        <View style={[styles.background, { minHeight: height }]}>
          {/* ---------- .topo ---------- */}
          <View style={styles.topo}>
            <Pressable onPress={() => ir(ROTAS.inicio)}>
              <Text style={styles.logoTexto}>Income of Houses</Text>
            </Pressable>

            {menuCentralizado ? (
              <View style={styles.menuCentro} pointerEvents="box-none">
                <View style={styles.menu}>{menu}</View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.menuScroll}
                contentContainerStyle={[styles.menu, styles.menuScrollConteudo]}
              >
                {menu}
              </ScrollView>
            )}
          </View>

          {/* ---------- .container ---------- */}
          <View style={[styles.container, lateral && styles.containerLateral]}>
            {/* ---------- .menu-lateral ---------- */}
            <View style={[styles.menuLateral, lateral && styles.menuLateralLado]}>
              {MENU_LATERAL.map((item) => (
                <Pressable
                  key={item.texto}
                  onPress={() => ir(item.rota)}
                  style={[styles.itemLateral, item.ativo && styles.itemLateralAtivo]}
                >
                  <Text style={[styles.itemTexto, item.ativo && styles.dourado]} numberOfLines={2}>
                    {item.texto}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ---------- .conteudo ---------- */}
            <View style={styles.conteudo}>
              <Text style={styles.titulo}>Alterar Senha</Text>
              <Text style={styles.subtitulo}>
                Mantenha sua conta segura. Escolha uma senha forte e exclusiva.
              </Text>

              <View style={styles.panel}>
                {/* ---------- .info-side ---------- */}
                <View style={styles.infoSide}>
                  <Text style={styles.infoTitulo}>Segurança da Conta</Text>
                  <Text style={styles.infoTexto}>
                    Sua senha é a chave para manter suas informações protegidas. Utilize uma senha
                    forte e única.
                  </Text>
                </View>

                {/* ---------- .form-side ---------- */}
                <View>
                  <CampoSenha
                    rotulo="Senha atual"
                    value={atual}
                    onChangeText={setAtual}
                    placeholder="Digite sua senha atual"
                  />

                  <CampoSenha
                    rotulo="Nova senha"
                    value={nova}
                    onChangeText={setNova}
                    placeholder="Digite sua nova senha"
                  >
                    <View style={styles.forcaBarra}>
                      {[1, 2, 3].map((n) => (
                        <View
                          key={n}
                          style={[styles.seg, n <= forca && { backgroundColor: COR_FORCA[forca] }]}
                        />
                      ))}
                    </View>
                    <Text style={styles.forcaRotulo}>
                      Força da senha{forca ? `: ${ROTULO_FORCA[forca]}` : ''}
                    </Text>
                  </CampoSenha>

                  <CampoSenha
                    rotulo="Confirmar nova senha"
                    value={confirmar}
                    onChangeText={setConfirmar}
                    placeholder="Confirme sua nova senha"
                  />

                  {msg && (
                    <Text style={[styles.msg, msg.tipo === 'ok' ? styles.msgOk : styles.msgErro]}>
                      {msg.texto}
                    </Text>
                  )}

                  <Pressable style={styles.botao} onPress={alterar}>
                    <Text style={styles.botaoTexto}>Alterar senha</Text>
                  </Pressable>

                  <View style={styles.dica}>
                    <Text style={styles.dicaTexto}>
                      <Text style={styles.dicaNegrito}>Dica:</Text> Use pelo menos 8 caracteres,
                      incluindo letras maiúsculas, minúsculas, números e símbolos.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- .rodape ---------- */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.rodapeLinks}>
            <Pressable onPress={() => ir(ROTAS.termos)}>
              <Text style={styles.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>|</Text>
            <Pressable onPress={() => ir(ROTAS.privacidade)}>
              <Text style={styles.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   ESTILOS
   (o AlterarSenha.css não foi enviado: os valores abaixo seguem o
   padrão visual da tela de cadastro; ajuste conforme o seu CSS)
========================================================= */

const OURO = '#d4af6a';
const OURO_BORDA = '#cda432';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  conteudoScroll: { flexGrow: 1 },
  dourado: { color: OURO },

  /* .topo */
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    backgroundColor: 'rgba(10,10,10,0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  logoTexto: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .menu */
  menuCentro: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuScroll: { flex: 1 },
  menuScrollConteudo: { flexGrow: 1, justifyContent: 'flex-end' },
  menuLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuLinkAtivo: {
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  menuTexto: { color: '#ffffff', fontSize: 14, fontWeight: '500' },

  /* .BackGround */
  background: { backgroundColor: '#0f0f0f' },

  /* .container */
  container: {
    gap: 30,
    paddingTop: 110,
    paddingBottom: 60,
    paddingHorizontal: '6%',
  },
  containerLateral: { flexDirection: 'row', alignItems: 'flex-start' },

  /* .menu-lateral */
  menuLateral: {
    padding: 12,
    gap: 4,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
  },
  menuLateralLado: { width: 290 },
  itemLateral: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemLateralAtivo: {
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  itemTexto: { color: '#e5e5e5', fontSize: 14, fontWeight: '500' },

  /* .conteudo */
  conteudo: { flex: 1, width: '100%' },
  titulo: { color: '#f5f5f5', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitulo: { color: '#a3a3a3', fontSize: 16, marginBottom: 24 },

  /* .panel */
  panel: {
    width: '100%',
    maxWidth: 700,
    padding: 30,
    gap: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: OURO_BORDA,
    borderRadius: 20,
  },

  /* .info-side */
  infoSide: { paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: '#cfa835' },
  infoTitulo: { color: '#f5f5f5', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  infoTexto: { color: '#a3a3a3', fontSize: 14, lineHeight: 21 },

  /* .field */
  field: { marginBottom: 18 },
  rotulo: { color: '#e5e5e5', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  inputWrap: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
  },
  inputWrapFoco: { borderColor: OURO_BORDA },
  input: { flex: 1, height: '100%', color: '#e5e5e5', fontSize: 13 },
  semOutline: { outlineStyle: 'none' },
  mostrar: { color: OURO, fontSize: 12, fontWeight: '600' },

  /* .strength-bar */
  forcaBarra: { flexDirection: 'row', gap: 6, marginTop: 10 },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#363636' },
  forcaRotulo: { color: '#a3a3a3', fontSize: 12, marginTop: 6 },

  /* mensagens */
  msg: { fontSize: 13, marginBottom: 12 },
  msgErro: { color: '#e0594a' },
  msgOk: { color: '#4caf50' },

  /* .btn-submit */
  botao: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 50,
    backgroundColor: OURO,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#111111', fontSize: 14, fontWeight: '700' },

  /* .tip */
  dica: {
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.25)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  dicaTexto: { color: '#e5e5e5', fontSize: 13, lineHeight: 20 },
  dicaNegrito: { color: OURO, fontWeight: 'bold' },

  /* .rodape */
  rodape: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingVertical: 22,
    paddingHorizontal: '6%',
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#d4a63a',
  },
  rodapeTexto: { color: '#888888', fontSize: 13 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rodapeLink: { color: OURO, fontSize: 13 },
  rodapeSep: { color: '#555555', fontSize: 13 },
});