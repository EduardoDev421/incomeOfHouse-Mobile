import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Platform,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLegal } from '../components/LegalProvider';

// >>> Ajuste o caminho conforme a pasta deste arquivo
const LOGO = require('../../assets/images/Logo.png');

const COLORS = {
  bg: '#080a0b',
  topo: '#080808',
  lateral: '#0d0d0e',
  conteudo: '#111111',
  card: '#141414',
  campo: '#1a1a1c',
  border: '#292929',
  borderLinha: '#242424',
  borderLateral: '#252729',
  borderTopo: 'rgba(255,255,255,0.12)',
  borderTitulo: '#cfcfcf',
  gold: '#d4a63a',
  goldClaro: '#f0ca4c',
  goldBorda: '#59431f',
  goldFundo: '#29231a',
  text: '#ffffff',
  textSuave: '#e7e7e7',
  suave: '#a8abad',
  muted: '#8f9497',
  seta: '#92979a',
  rodape: '#7e8385',
};

// Ajuste as rotas conforme os nomes dos arquivos em src/app
const MENU = [
  { label: 'Meu Perfil', icon: 'person-circle-outline', route: '/PerfilProfissional' },
  { label: 'Meus Endereços', icon: 'location-outline', route: '/MeusenderecosP' },
  { label: 'Meu Portfolio', icon: 'folder-outline', route: '/Meuportfolio' },
  { label: 'Publicar Plantas', icon: 'cloud-upload-outline', route: '/publicarPlanta' },
  { label: 'Projetos', icon: 'grid-outline', route: '/Projetos' },
  { label: 'Avaliações', icon: 'star-outline', route: '/Avaliacoes' },
  { label: 'Agendamentos', icon: 'calendar-outline', route: '/AgendamentosP' },
  { label: 'Mensagem', icon: 'chatbox-ellipses-outline', route: '/MensagensP' },
  { label: 'Configurações', icon: 'settings-outline', route: '/ConfigProfissionais', ativo: true },
  { label: 'Sair', icon: 'log-out-outline', route: '/login', separador: true },
];

const LINKS_TOPO = [
  ['Início', '/'],
  ['Plantas', '/planta'],
  ['Profissionais', '/profissionais'],
  ['Sobre Nós', '/sobreNos'],
];

/* ---------- Seções (rota null = página ainda não criada: mostra "Em breve.") ---------- */

const SEGURANCA = [
  { icone: 'lock-closed-outline', titulo: 'Alterar Senha', desc: 'Atualize sua senha de acesso', rota: '/AlterarSenha' },
  { icone: 'shield-outline', titulo: 'Autenticação em duas etapas', desc: 'Aumente a segurança da sua conta', rota: '/AutenticacaoDuasEtapas' },
  { icone: 'desktop-outline', titulo: 'Dispositivos conectados', desc: 'Gerencie dispositivos e sessões ativas', rota: '/DispositivosConectados' },
];

const NOTIFICACOES = [
  { chave: 'projetos', icone: 'layers-outline', titulo: 'Novos projetos e solicitações', desc: 'Receber notificações de novos projetos' },
  { chave: 'mensagens', icone: 'chatbox-ellipses-outline', titulo: 'Mensagens', desc: 'Receber notificações de novas mensagens' },
  { chave: 'pedidos', icone: 'reader-outline', titulo: 'Atualizações de pedidos', desc: 'Receber atualizações sobre pedidos' },
  { chave: 'emails', icone: 'mail-outline', titulo: 'E-mails promocionais', desc: 'Receber ofertas e novidades por e-mail' },
];

const CONFIG_PROFISSIONAIS = [
  { icone: 'construct-outline', titulo: 'Áreas de atuação', desc: 'Gerenciar suas especialidades', rota: null },
  { icone: 'list-outline', titulo: 'Serviços oferecidos', desc: 'Adicione e edite seus serviços', rota: null },
  { icone: 'location-outline', titulo: 'Região de atendimento', desc: 'Defina onde você atende', rota: null },
  { icone: 'time-outline', titulo: 'Disponibilidade', desc: 'Configure seus horários de atendimentos', rota: null },
  { icone: 'cash-outline', titulo: 'Valor mínimo de projeto', desc: 'Defina o valor mínimo para orçamentos', rota: null },
];

const PERFIL = [
  { icone: 'business-outline', titulo: 'Dados da empresa', desc: 'Gerencie as informações da sua empresa', rota: '/DadosEmpresa' },
  { icone: 'id-card-outline', titulo: 'Registro profissional', desc: 'Adicione seu registro e certificações', rota: '/registroProfissional' },
  { icone: 'folder-outline', titulo: 'Portfólio', desc: 'Gerencie seus projetos e trabalhos', rota: '/Meuportfolio' },
  { icone: 'create-outline', titulo: 'Descrição profissional', desc: 'Conte mais sobre você e sua experiência', rota: null },
];

const FINANCEIRO = [
  { icone: 'document-text-outline', titulo: 'Dados para recebimento', desc: 'Configure suas informações bancárias', rota: '/DadosRecebimento' },
  { icone: 'card-outline', titulo: 'Histórico de pagamentos', desc: 'Acompanhe seus recebimentos', rota: '/HistoricoPagamentos' },
  { icone: 'receipt-outline', titulo: 'Configurações de cobrança', desc: 'Gerencie suas preferências de cobrança', rota: null },
  { icone: 'reader-outline', titulo: 'Notas fiscais', desc: 'Emita e gerencie suas notas fiscais', rota: null },
];

const PRIVACIDADE = [
  { icone: 'eye-outline', titulo: 'Visibilidade do perfil', desc: 'Controle quem pode ver seu perfil', rota: null },
  { icone: 'id-card-outline', titulo: 'Dados pessoais', desc: 'Gerencie seus dados pessoais', rota: '/DadosPermissoes' },
  { icone: 'trash-outline', titulo: 'Excluir conta', desc: 'Exclua sua conta permanentemente', rota: null },
];

const AJUDA = [
  { icone: 'chatbubble-ellipses-outline', titulo: 'Perguntas frequentes', desc: 'Encontre respostas para dúvidas comuns', rota: '/perguntasFrequentes' },
  { icone: 'headset-outline', titulo: 'Fale conosco', desc: 'Entre em contato com nosso suporte', rota: '/faleConosco' },
  { icone: 'document-text-outline', titulo: 'Tutoriais', desc: 'Aprenda a usar a plataforma', rota: '/Tutoriais' },
];

/* ---------- Componentes ---------- */

function Cartao({ icone, titulo, children, estilo }) {
  return (
    <View style={[s.card, estilo]}>
      <View style={s.cartaoTitulo}>
        <Ionicons name={icone} size={20} color={COLORS.gold} />
        <Text style={s.cartaoTituloTxt}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function LinhaNav({ item, onPress, ultima, estilo }) {
  return (
    <TouchableOpacity
      style={[s.linha, ultima && s.linhaUltima, estilo]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={s.linhaIcone}>
        <Ionicons name={item.icone} size={18} color={COLORS.gold} />
      </View>
      <View style={s.flex}>
        <Text style={s.linhaTitulo}>{item.titulo}</Text>
        <Text style={s.linhaDesc}>{item.desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.seta} />
    </TouchableOpacity>
  );
}

function LinhaSwitch({ item, valor, onChange, ultima }) {
  return (
    <View style={[s.linha, ultima && s.linhaUltima]}>
      <View style={s.linhaIcone}>
        <Ionicons name={item.icone} size={18} color={COLORS.gold} />
      </View>
      <View style={s.flex}>
        <Text style={s.linhaTitulo}>{item.titulo}</Text>
        <Text style={s.linhaDesc}>{item.desc}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: '#34383a', true: COLORS.gold }}
        thumbColor="#eeeeee"
        activeThumbColor="#eeeeee"
      />
    </View>
  );
}

/* ---------- Tela ---------- */

export default function ConfigProfissionais() {
  const router = useRouter();
  const { abrirLegal } = useLegal();
  const { width } = useWindowDimensions();
  const largo = width >= 900; // layout igual ao da web: menu lateral fixo + cabeçalho completo
  const [menuAberto, setMenuAberto] = useState(false);

  const [notif, setNotif] = useState({ projetos: true, mensagens: true, pedidos: true, emails: true });

  // Toast
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const mostrarToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  };

  const ir = (rota) => {
    setMenuAberto(false);
    if (!rota) {
      mostrarToast('Em breve.');
      return;
    }
    router.push(rota);
  };

  const alterarNotif = (chave, valor) => {
    setNotif((prev) => ({ ...prev, [chave]: valor }));
    mostrarToast('Preferência atualizada.');
  };

  const linhasNav = (itens) =>
    itens.map((item, i) => (
      <LinhaNav key={item.titulo} item={item} onPress={() => ir(item.rota)} ultima={i === itens.length - 1} />
    ));

  // Dois cartões lado a lado no site, um embaixo do outro no celular
  const par = (a, b) => <View style={[s.par, largo && s.parLinha]}>{[a, b]}</View>;

  const itensMenu = MENU.map((item) => (
    <View key={item.label}>
      {item.separador && <View style={s.menuSep} />}
      <TouchableOpacity
        style={[s.menuItem, item.ativo && s.menuItemAtivo]}
        onPress={() => {
          setMenuAberto(false);
          if (!item.ativo) router.push(item.route);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name={item.icon} size={16} color={COLORS.gold} />
        <Text style={[s.menuItemTxt, item.ativo && { color: COLORS.gold }]}>{item.label}</Text>
      </TouchableOpacity>
    </View>
  ));

  const conteudo = (
    <>
      <Text style={[s.h1, !largo && { fontSize: 20 }]} accessibilityRole="header">
        Configurações
      </Text>
      <Text style={s.sub}>Gerencie as configurações da sua conta profissional.</Text>
      <View style={s.divisor} />

      {par(
        <Cartao key="seg" icone="shield-checkmark-outline" titulo="Segurança da Conta" estilo={s.flex}>
          {linhasNav(SEGURANCA)}
        </Cartao>,
        <Cartao key="not" icone="notifications-outline" titulo="Notificações" estilo={s.flex}>
          {NOTIFICACOES.map((item, i) => (
            <LinhaSwitch
              key={item.chave}
              item={item}
              valor={notif[item.chave]}
              onChange={(v) => alterarNotif(item.chave, v)}
              ultima={i === NOTIFICACOES.length - 1}
            />
          ))}
        </Cartao>
      )}

      {par(
        <Cartao key="cfg" icone="briefcase-outline" titulo="Configurações Profissionais" estilo={s.flex}>
          {linhasNav(CONFIG_PROFISSIONAIS)}
        </Cartao>,
        <Cartao key="per" icone="person-outline" titulo="Perfil Profissional" estilo={s.flex}>
          {linhasNav(PERFIL)}
        </Cartao>
      )}

      {par(
        <Cartao key="fin" icone="cash-outline" titulo="Financeiro" estilo={s.flex}>
          {linhasNav(FINANCEIRO)}
        </Cartao>,
        <Cartao key="pri" icone="lock-closed-outline" titulo="Privacidade" estilo={s.flex}>
          {linhasNav(PRIVACIDADE)}
        </Cartao>
      )}

      <Cartao icone="help-circle-outline" titulo="Central de Ajuda">
        <View style={largo && s.ajudaLinha}>
          {AJUDA.map((item, i) => {
            const ultimo = i === AJUDA.length - 1;
            return (
              <LinhaNav
                key={item.titulo}
                item={item}
                onPress={() => ir(item.rota)}
                ultima={ultimo}
                estilo={largo ? [s.flex, !ultimo && s.ajudaDivisor, { borderBottomWidth: 0 }] : undefined}
              />
            );
          })}
        </View>
      </Cartao>
    </>
  );

  const rodape = (
    <View style={[s.rodape, largo ? s.rodapeLargo : s.rodapeEstreito]}>
      <Text style={s.rodapeTxt}>©IncomeOfHouses. Todos os direitos reservados.</Text>
      <View style={s.rodapeLinks}>
        <TouchableOpacity onPress={() => abrirLegal('termos')}>
          <Text style={s.rodapeTxt}>Termos de Uso</Text>
        </TouchableOpacity>
        <Text style={s.rodapeTxt}>|</Text>
        <TouchableOpacity onPress={() => abrirLegal('privacidade')}>
          <Text style={s.rodapeTxt}>Política de Privacidade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.topo} />

      {largo ? (
        <>
          {/* Topo (igual ao da web): logo à esquerda e menu centralizado */}
          <View style={s.topo}>
            <TouchableOpacity onPress={() => ir('/')}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />
            </TouchableOpacity>

            <View style={s.menuTopoCentro} pointerEvents="box-none">
              <View style={s.menuTopoLinha}>
                {LINKS_TOPO.map(([label, rota]) => (
                  <TouchableOpacity key={label} onPress={() => ir(rota)}>
                    <Text style={s.menuTopoTxtLargo}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={s.corpoLargo}>
            {/* Menu lateral fixo */}
            <View style={s.lateral}>
              <ScrollView contentContainerStyle={s.lateralScroll} showsVerticalScrollIndicator={false}>
                {itensMenu}
              </ScrollView>
            </View>

            <ScrollView
              style={s.areaConteudo}
              contentContainerStyle={s.scrollLargo}
              showsVerticalScrollIndicator={false}
            >
              <View style={s.conteudoLargo}>{conteudo}</View>
              {rodape}
            </ScrollView>
          </View>
        </>
      ) : (
        <>
          {/* Topo (celular) */}
          <View style={s.topo}>
            <TouchableOpacity onPress={() => setMenuAberto(true)} style={s.topoBtn}>
              <Ionicons name="menu" size={26} color={COLORS.gold} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => ir('/')}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />
            </TouchableOpacity>

            <View style={s.topoBtn} />
          </View>

          <View style={s.menuTopo}>
            {LINKS_TOPO.map(([label, rota]) => (
              <TouchableOpacity key={label} onPress={() => ir(rota)}>
                <Text style={s.menuTopoTxt}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={s.areaConteudo} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <View style={s.conteudoEstreito}>{conteudo}</View>
            {rodape}
          </ScrollView>
        </>
      )}

      {/* Toast */}
      {!!toast && (
        <View style={s.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
          <Text style={s.toastTxt}>{toast}</Text>
        </View>
      )}

      {/* Menu lateral (celular) */}
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <View style={s.modalRoot}>
          <SafeAreaView style={s.drawer}>
            <View style={s.drawerHeader}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Ionicons name="close" size={24} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            <ScrollView>{itensMenu}</ScrollView>
          </SafeAreaView>
          <Pressable style={s.overlay} onPress={() => setMenuAberto(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1, minWidth: 0 },

  /* ---------- Topo ---------- */
  topo: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    backgroundColor: COLORS.topo,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderTopo,
    zIndex: 20,
  },
  topoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 58, height: 50 },
  menuTopoCentro: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  menuTopoLinha: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  menuTopoTxtLargo: { color: '#eeeeee', fontSize: 14, fontWeight: '500' },

  menuTopo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.topo,
  },
  menuTopoTxt: { color: COLORS.text, fontSize: 12, fontWeight: '600' },

  /* ---------- Estrutura ---------- */
  corpoLargo: { flex: 1, flexDirection: 'row' },
  lateral: {
    width: 250,
    backgroundColor: COLORS.lateral,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLateral,
  },
  lateralScroll: { paddingVertical: 16, paddingHorizontal: 12 },
  areaConteudo: { backgroundColor: COLORS.conteudo },
  scrollLargo: { flexGrow: 1 },
  scroll: { flexGrow: 1 },
  conteudoLargo: { flexGrow: 1, paddingTop: 26, paddingHorizontal: 32, paddingBottom: 32 },
  conteudoEstreito: { flexGrow: 1, padding: 16 },

  /* ---------- Título ---------- */
  h1: { color: COLORS.text, fontSize: 24, fontWeight: '600' },
  sub: { color: COLORS.suave, fontSize: 13, marginTop: 6 },
  divisor: { height: 1, backgroundColor: COLORS.borderTitulo, marginTop: 14, marginBottom: 20 },

  /* ---------- Grade ---------- */
  par: { gap: 16, marginBottom: 16 },
  parLinha: { flexDirection: 'row', alignItems: 'stretch' },

  /* ---------- Cartão ---------- */
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cartaoTitulo: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartaoTituloTxt: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

  linha: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLinha,
  },
  linhaUltima: { borderBottomWidth: 0 },
  linhaIcone: { width: 20, alignItems: 'center' },
  linhaTitulo: { color: COLORS.textSuave, fontSize: 13, fontWeight: '700' },
  linhaDesc: { color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },

  ajudaLinha: { flexDirection: 'row' },
  ajudaDivisor: { borderRightWidth: 1, borderRightColor: COLORS.borderLinha },

  /* ---------- Rodapé ---------- */
  rodape: {
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: '#8a8a8a',
  },
  rodapeLargo: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  rodapeEstreito: { paddingVertical: 16, alignItems: 'center', gap: 8 },
  rodapeTxt: { color: COLORS.rodape, fontSize: 12 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 9 },

  /* ---------- Menu (barra lateral e menu do celular) ---------- */
  menuItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.campo,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  menuItemAtivo: { borderColor: COLORS.goldBorda, backgroundColor: COLORS.goldFundo },
  menuItemTxt: { color: '#eeeeee', fontSize: 12, fontWeight: '500', flex: 1 },
  menuSep: { height: 1, backgroundColor: COLORS.border, marginTop: 3, marginBottom: 8 },

  /* ---------- Menu do celular ---------- */
  modalRoot: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: {
    width: 260,
    backgroundColor: COLORS.lateral,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLateral,
    paddingHorizontal: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 6,
  },

  /* ---------- Toast ---------- */
  toast: {
    position: 'absolute',
    right: 24,
    left: 24,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.goldFundo,
    borderWidth: 1,
    borderColor: COLORS.goldBorda,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastTxt: { color: COLORS.goldClaro, fontSize: 12, flex: 1 },
});