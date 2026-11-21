import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* =========================================================
   LOGO
   Coloque aqui o caminho da imagem do logo (a mesma Logo.png do site).
   Exemplo: const LOGO = require('../../assets/images/Logo.png');
   Enquanto estiver null, a tela mostra o texto "Income of Houses".
========================================================= */

const LOGO = require('../assets/images/Logo.png');

/* =========================================================
   ROTAS
   O expo-router só abre rotas cujo ARQUIVO existe dentro da pasta "app".
   Rotas ainda não criadas ficam como null (o toque não faz nada).
========================================================= */

const ROTAS = {
  inicio: '/',
  plantas: null,
  profissionais: null,
  sobre: null,
  termos: null,
  privacidade: null,
};

const MENU_LATERAL = [
  { texto: 'Meu Perfil', icone: 'person-circle-outline', rota: null },
  { texto: 'Meus Endereços', icone: 'location-outline', rota: null },
  { texto: 'Meus Pedidos', icone: 'grid-outline', rota: null },
  { texto: 'Meus Profissionais Favoritos', icone: 'star-outline', rota: null },
  { texto: 'Meus Projetos Favoritos', icone: 'bookmark-outline', rota: null },
  { texto: 'Agendamentos', icone: 'calendar-outline', rota: null },
  { texto: 'Mensagem', icone: 'chatbox-ellipses-outline', rota: null },
  { texto: 'Configurações', icone: 'settings-outline', rota: null, ativo: true },
  { texto: 'Sair', icone: 'log-out-outline', rota: '/', sair: true },
];

/* =========================================================
   PALETA (mesma do AlterarSenha.css)
========================================================= */

const COR = {
  fundo: '#080a0b',
  topo: 'rgba(8,8,8,0.95)',
  lateral: '#0d0d0e',
  conteudo: '#111111',
  painel: '#141414',
  campo: '#1a1a1c',
  borda: '#292929',
  bordaTopo: 'rgba(255,255,255,0.12)',
  bordaTitulo: '#cfcfcf',
  bordaLateral: '#252729',
  ouro: '#d4a63a',
  ouroClaro: '#efd04f',
  ouroEscuro: '#c89e26',
  ouroFundo: '#29231a',
  ouroBorda: '#59431f',
  iconeCampo: '#a8832e',
  texto: '#eeeeee',
  suave: '#a8abad',
  mudo: '#8f9497',
  placeholder: '#666666',
  erro: '#e0594a',
  ok: '#4caf50',
};

/* =========================================================
   REGRAS DA SENHA
   Uma única fonte de verdade: alimenta a barra de força,
   o checklist e a validação do botão.
========================================================= */

const REGRAS = [
  { id: 'tam', texto: 'Mínimo de 8 caracteres', ok: (s) => s.length >= 8 },
  { id: 'caixa', texto: 'Letras maiúsculas e minúsculas', ok: (s) => /[a-z]/.test(s) && /[A-Z]/.test(s) },
  { id: 'num', texto: 'Pelo menos um número', ok: (s) => /\d/.test(s) },
  { id: 'sim', texto: 'Pelo menos um símbolo', ok: (s) => /[^A-Za-z0-9]/.test(s) },
];

// 0 = vazia | 1 = fraca | 2 = média | 3 = forte
const calcularForca = (s) => {
  if (!s) return 0;
  const cumpridas = REGRAS.filter((r) => r.ok(s)).length;
  if (s.length >= 8 && cumpridas === REGRAS.length) return 3;
  if (s.length >= 8 && cumpridas >= 3) return 2;
  return 1;
};

const ROTULO_FORCA = ['', 'Fraca', 'Média', 'Forte'];
const COR_FORCA = [COR.borda, COR.erro, COR.ouro, COR.ok];

/* =========================================================
   COMPONENTES (fora da tela para não serem recriados a cada tecla)
========================================================= */

function ItemMenuTopo({ texto, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={6}>
      {({ hovered, pressed }) => (
        <Text style={[styles.menuTopoTexto, (hovered || pressed) && { color: COR.ouro }]}>{texto}</Text>
      )}
    </Pressable>
  );
}

function ItemLateral({ item, onPress }) {
  const corIcone = COR.ouro;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ hovered, pressed }) => [
        styles.itemLateral,
        (hovered || pressed) && styles.itemLateralHover,
        item.ativo && styles.itemLateralAtivo,
      ]}
    >
      <Ionicons name={item.icone} size={16} color={corIcone} />
      <Text style={[styles.itemLateralTexto, item.ativo && { color: COR.ouro }]} numberOfLines={2}>
        {item.texto}
      </Text>
    </Pressable>
  );
}

const CampoSenha = React.forwardRef(function CampoSenha(
  { rotulo, value, onChangeText, placeholder, autoComplete, returnKeyType, onSubmitEditing, estado, children },
  ref
) {
  const [mostrar, setMostrar] = useState(false);
  const [foco, setFoco] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View
        style={[
          styles.inputWrap,
          foco && styles.inputWrapFoco,
          estado === 'erro' && styles.inputWrapErro,
          estado === 'ok' && styles.inputWrapOk,
        ]}
      >
        <Ionicons name="lock-closed-outline" size={16} color={foco ? COR.ouro : COR.iconeCampo} />
        <TextInput
          ref={ref}
          style={[styles.input, Platform.OS === 'web' && styles.semOutline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COR.placeholder}
          secureTextEntry={!mostrar}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={autoComplete === 'new-password' ? 'newPassword' : 'password'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          accessibilityLabel={rotulo}
        />
        <Pressable
          onPress={() => setMostrar((m) => !m)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <Ionicons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={15} color={COR.iconeCampo} />
        </Pressable>
      </View>
      {children}
    </View>
  );
});

function Requisito({ texto, cumprido }) {
  return (
    <View style={styles.requisito}>
      <Ionicons
        name={cumprido ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={cumprido ? COR.ok : COR.placeholder}
      />
      <Text style={[styles.requisitoTexto, cumprido && { color: COR.suave }]}>{texto}</Text>
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function AlterarSenha() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const largo = width >= 900;       // menu do topo centralizado + menu lateral fixo ao lado
  const compacto = width < 600;

  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [msg, setMsg] = useState(null); // { tipo: 'erro' | 'ok', texto }
  const [enviando, setEnviando] = useState(false);

  const refNova = useRef(null);
  const refConfirmar = useRef(null);

  const forca = useMemo(() => calcularForca(nova), [nova]);
  const iguais = confirmar.length > 0 && nova === confirmar;
  const diferentes = confirmar.length > 0 && nova !== confirmar;

  // limpa o aviso assim que a pessoa volta a digitar
  const mudar = (set) => (valor) => {
    set(valor);
    if (msg) setMsg(null);
  };

  const validar = () => {
    if (!atual || !nova || !confirmar) return 'Preencha todos os campos.';
    if (nova.length < 8) return 'A nova senha deve ter pelo menos 8 caracteres.';
    if (nova === atual) return 'A nova senha deve ser diferente da atual.';
    if (forca < 2) return 'Escolha uma senha mais forte: combine letras, números e símbolos.';
    if (nova !== confirmar) return 'As senhas não conferem.';
    return '';
  };

  const alterar = async () => {
    if (enviando) return;

    const erro = validar();
    if (erro) {
      setMsg({ tipo: 'erro', texto: erro });
      return;
    }

    setEnviando(true);
    try {
      // TODO: enviar senha atual + nova senha para o seu backend aqui
      // (se a senha atual estiver errada, mostre: 'A senha atual está incorreta.')
      setMsg({ tipo: 'ok', texto: 'Senha alterada com sucesso.' });
      setAtual('');
      setNova('');
      setConfirmar('');
    } catch (e) {
      setMsg({ tipo: 'erro', texto: 'Não foi possível alterar a senha. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  };

  const menuTopo = (
    <>
      <ItemMenuTopo texto="Início" onPress={() => ir(ROTAS.inicio)} />
      <ItemMenuTopo texto="Plantas" onPress={() => ir(ROTAS.plantas)} />
      <ItemMenuTopo texto="Profissionais" onPress={() => ir(ROTAS.profissionais)} />
      <ItemMenuTopo texto="Sobre" onPress={() => ir(ROTAS.sobre)} />
    </>
  );

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* ---------- .topo (fixo) ---------- */}
      <View style={styles.topo}>
        <Pressable onPress={() => ir(ROTAS.inicio)} accessibilityRole="link" accessibilityLabel="Income of Houses">
          {LOGO ? (
            <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
          ) : (
            <Text style={styles.logoTexto}>Income of Houses</Text>
          )}
        </Pressable>

        {largo ? (
          <View style={styles.menuTopoCentro} pointerEvents="box-none">
            <View style={styles.menuTopo}>{menuTopo}</View>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.menuTopoScroll}
            contentContainerStyle={[styles.menuTopo, styles.menuTopoScrollConteudo]}
          >
            {menuTopo}
          </ScrollView>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.corpo, { minHeight: height - 64 - 55 }, largo && styles.corpoLargo]}>
          {/* ---------- .menu-lateral ---------- */}
          <View style={[styles.menuLateral, largo && styles.menuLateralLado]}>
            {MENU_LATERAL.map((item) => (
              <React.Fragment key={item.texto}>
                {item.sair && <View style={styles.separadorMenu} />}
                <ItemLateral item={item} onPress={() => ir(item.rota)} />
              </React.Fragment>
            ))}
          </View>

          {/* ---------- .conteudo ---------- */}
          <View style={[styles.conteudo, compacto && styles.conteudoCompacto]}>
            <Text style={styles.titulo} accessibilityRole="header">
              Alterar Senha
            </Text>
            <Text style={styles.subtitulo}>Mantenha sua conta segura. Escolha uma senha forte e exclusiva.</Text>

            <View style={[styles.panel, compacto && styles.panelCompacto]}>
              {/* ---------- .info-side ---------- */}
              <View style={styles.infoSide}>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark-outline" size={28} color={COR.ouro} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitulo}>Segurança da Conta</Text>
                  <Text style={styles.infoTexto}>
                    Sua senha é a chave para manter suas informações protegidas. Utilize uma senha forte e única.
                  </Text>
                </View>
              </View>

              {/* ---------- formulário ---------- */}
              <CampoSenha
                rotulo="Senha atual"
                value={atual}
                onChangeText={mudar(setAtual)}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                returnKeyType="next"
                onSubmitEditing={() => refNova.current?.focus()}
              />

              <CampoSenha
                ref={refNova}
                rotulo="Nova senha"
                value={nova}
                onChangeText={mudar(setNova)}
                placeholder="Digite sua nova senha"
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => refConfirmar.current?.focus()}
              >
                <View style={styles.forcaBarra}>
                  {[1, 2, 3].map((n) => (
                    <View key={n} style={[styles.seg, n <= forca && { backgroundColor: COR_FORCA[forca] }]} />
                  ))}
                </View>
                <Text style={styles.forcaRotulo}>
                  Força da senha
                  {forca ? ': ' : ''}
                  {forca ? <Text style={{ color: COR_FORCA[forca], fontWeight: '700' }}>{ROTULO_FORCA[forca]}</Text> : null}
                </Text>

                {nova.length > 0 && (
                  <View style={styles.requisitos}>
                    {REGRAS.map((r) => (
                      <Requisito key={r.id} texto={r.texto} cumprido={r.ok(nova)} />
                    ))}
                  </View>
                )}
              </CampoSenha>

              <CampoSenha
                ref={refConfirmar}
                rotulo="Confirmar nova senha"
                value={confirmar}
                onChangeText={mudar(setConfirmar)}
                placeholder="Confirme sua nova senha"
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={alterar}
                estado={iguais ? 'ok' : diferentes ? 'erro' : undefined}
              >
                {diferentes && <Text style={[styles.ajuda, { color: COR.erro }]}>As senhas ainda não conferem.</Text>}
                {iguais && <Text style={[styles.ajuda, { color: COR.ok }]}>As senhas conferem.</Text>}
              </CampoSenha>

              {msg && (
                <View style={[styles.msg, msg.tipo === 'ok' ? styles.msgOk : styles.msgErro]} accessibilityLiveRegion="polite">
                  <Ionicons
                    name={msg.tipo === 'ok' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                    size={18}
                    color={msg.tipo === 'ok' ? COR.ok : COR.erro}
                  />
                  <Text style={[styles.msgTexto, { color: msg.tipo === 'ok' ? COR.ok : COR.erro }]}>{msg.texto}</Text>
                </View>
              )}

              <Pressable
                onPress={alterar}
                disabled={enviando}
                accessibilityRole="button"
                style={({ hovered, pressed }) => [
                  styles.botao,
                  (hovered || pressed) && { opacity: 0.9 },
                  enviando && { opacity: 0.6 },
                ]}
              >
                {enviando ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.botaoTexto}>Alterar senha</Text>
                )}
              </Pressable>

              <View style={styles.dica}>
                <Text style={styles.dicaTexto}>
                  <Text style={styles.dicaNegrito}>Dica:</Text> Use pelo menos 8 caracteres, incluindo letras
                  maiúsculas, minúsculas, números e símbolos.
                </Text>
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
   ESTILOS (baseados no AlterarSenha.css)
========================================================= */

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: COR.fundo },
  scroll: { flexGrow: 1 },
  semOutline: { outlineStyle: 'none' },

  /* .topo */
  topo: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    backgroundColor: COR.topo,
    borderBottomWidth: 1,
    borderBottomColor: COR.bordaTopo,
    zIndex: 20,
  },
  logoTexto: { color: COR.ouro, fontSize: 16, fontWeight: 'bold' },
  logoImg: { width: 58, height: 50 },
  menuTopo: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  menuTopoCentro: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  menuTopoScroll: { flex: 1, marginLeft: 16 },
  menuTopoScrollConteudo: { flexGrow: 1, justifyContent: 'flex-end', gap: 20 },
  menuTopoTexto: { color: COR.texto, fontSize: 14, fontWeight: '500' },

  /* corpo = .container */
  corpo: { backgroundColor: COR.conteudo },
  corpoLargo: { flexDirection: 'row', alignItems: 'stretch' },

  /* .menu-lateral */
  menuLateral: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 5,
    backgroundColor: COR.lateral,
    borderBottomWidth: 1,
    borderBottomColor: COR.bordaLateral,
  },
  menuLateralLado: {
    width: 250,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: COR.bordaLateral,
  },
  itemLateral: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COR.campo,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  itemLateralHover: { backgroundColor: '#302718', borderColor: COR.ouroBorda },
  itemLateralAtivo: { backgroundColor: COR.ouroFundo, borderColor: COR.ouroBorda },
  itemLateralTexto: { flex: 1, color: COR.texto, fontSize: 12, fontWeight: '500' },
  separadorMenu: { height: 1, marginVertical: 5, backgroundColor: COR.borda },

  /* .conteudo */
  conteudo: { flex: 1, paddingTop: 22, paddingHorizontal: 32, paddingBottom: 32 },
  conteudoCompacto: { paddingHorizontal: 16, paddingTop: 20 },
  titulo: { color: '#fff', fontSize: 24, fontWeight: '600', marginBottom: 6 },
  subtitulo: {
    color: COR.suave,
    fontSize: 13,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COR.bordaTitulo,
  },

  /* .panel */
  panel: {
    width: '100%',
    maxWidth: 800,
    marginTop: 20,
    padding: 28,
    backgroundColor: COR.painel,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 8,
  },
  panelCompacto: { padding: 16 },

  /* .info-side */
  infoSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: COR.borda,
  },
  badge: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COR.campo,
    borderWidth: 1,
    borderColor: COR.ouroBorda,
    borderRadius: 12,
  },
  infoTitulo: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 6 },
  infoTexto: { color: COR.mudo, fontSize: 13, lineHeight: 21 },

  /* .field / .input-wrap */
  field: { marginBottom: 18 },
  rotulo: { color: COR.suave, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrap: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: COR.campo,
    borderWidth: 1,
    borderColor: COR.borda,
    borderRadius: 6,
  },
  inputWrapFoco: { borderColor: COR.ouro },
  inputWrapErro: { borderColor: COR.erro },
  inputWrapOk: { borderColor: COR.ok },
  input: { flex: 1, minWidth: 0, height: '100%', color: '#dddddd', fontSize: 14 },

  /* força da senha */
  forcaBarra: { flexDirection: 'row', gap: 6, marginTop: 12 },
  seg: { flex: 1, height: 4, borderRadius: 3, backgroundColor: '#3a3a3a' },
  forcaRotulo: { color: COR.mudo, fontSize: 12, marginTop: 8 },

  /* checklist */
  requisitos: { marginTop: 10, gap: 6 },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  requisitoTexto: { color: COR.placeholder, fontSize: 12 },
  ajuda: { fontSize: 12, marginTop: 8 },

  /* mensagens */
  msg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  msgErro: { backgroundColor: 'rgba(224,89,74,0.08)', borderColor: 'rgba(224,89,74,0.4)' },
  msgOk: { backgroundColor: 'rgba(76,175,80,0.08)', borderColor: 'rgba(76,175,80,0.4)' },
  msgTexto: { flex: 1, fontSize: 13 },

  /* .btn-submit (degradê no navegador; cor lisa no celular) */
  botao: {
    width: '100%',
    height: 44,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    ...Platform.select({
      web: { backgroundImage: `linear-gradient(135deg, ${COR.ouroEscuro}, ${COR.ouroClaro})` },
      default: { backgroundColor: COR.ouroEscuro },
    }),
  },
  botaoTexto: { color: '#111', fontSize: 14, fontWeight: 'bold' },

  /* .tip */
  dica: { marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderTopColor: COR.borda },
  dicaTexto: { color: COR.mudo, fontSize: 12, lineHeight: 19 },
  dicaNegrito: { color: '#f0ca4c', fontWeight: 'bold' },

  /* .rodape */
  rodape: {
    minHeight: 55,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 32,
    backgroundColor: COR.fundo,
    borderTopWidth: 1,
    borderTopColor: 'rgba(213,173,50,0.65)',
  },
  rodapeTexto: { color: '#7e8385', fontSize: 12 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  rodapeLink: { color: '#7e8385', fontSize: 12 },
  rodapeSep: { color: '#7e8385', fontSize: 12 },
});