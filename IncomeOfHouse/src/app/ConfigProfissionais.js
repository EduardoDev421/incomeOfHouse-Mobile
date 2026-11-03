import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView, Pressable, TextInput,
  Switch, Modal, Alert, KeyboardAvoidingView, Platform, StyleSheet,
  useWindowDimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// >>> Ajuste os caminhos conforme a pasta deste arquivo
const LOGO = require('../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

const COLORS = {
  bg: '#090909',
  card: '#111315',
  cardAlt: '#191a1c',
  border: '#303235',
  gold: '#c9a45c',
  goldDim: 'rgba(201,164,92,0.45)',
  text: '#ffffff',
  muted: '#8a8a8a',
  mutedBlue: '#aab4bf',
};

const LARGURA_DRAWER = 270;

// Ajuste as rotas conforme os nomes dos arquivos em src/app
const MENU = [
  { label: 'Meu Perfil', icon: 'person-outline', route: '/perfilUsuario' },
  { label: 'Meus Endereços', icon: 'location-outline', route: '/meusEnderecos' },
  { label: 'Meus Pedidos', icon: 'grid-outline', route: '/meusPedidos' },
  { label: 'Meus Profissionais Favoritos', icon: 'star-outline', route: '/profissionaisFavoritos' },
  { label: 'Projetos Salvos', icon: 'bookmark-outline', route: '/projetosSalvos' },
  { label: 'Agendamentos', icon: 'calendar-outline', route: '/agendamentos' },
  { label: 'Mensagens', icon: 'chatbox-outline', route: '/mensagem' },
  { label: 'Configurações', icon: 'settings-outline', route: '/configuracoesProfissionais', ativo: true },
  { label: 'Sair', icon: 'log-out-outline', route: '/login', separador: true },
];

const LINKS_TOPO = [
  ['Início', '/'],
  ['Plantas', '/planta'],
  ['Profissionais', '/profissionais'],
  ['Sobre', '/sobre'],
];

/* ---------- Opções dos seletores ---------- */

const TODAS = 'Todas as regiões';

const OPCOES = {
  tipos: [
    'Arquitetos',
    'Engenheiros',
    'Designers de Interiores',
    'Paisagistas',
    'Empreiteiros',
    'Eletricistas',
    'Encanadores',
    'Pintores',
  ],
  regioes: [TODAS, 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
  contato: ['E-mail', 'WhatsApp', 'Telefone', 'SMS'],
};

const TITULOS = {
  tipos: 'Tipos de profissionais',
  regioes: 'Região de atuação',
  contato: 'Forma de contato preferida',
};

/* ---------- Switches ---------- */

const NOTIFICACOES = [
  {
    key: 'recomendados',
    icon: 'sparkles-outline',
    titulo: 'Novos profissionais recomendados',
    desc: 'Receber sugestões de profissionais com base no seu perfil.',
  },
  {
    key: 'mensagens',
    icon: 'chatbox-ellipses-outline',
    titulo: 'Mensagens de profissionais',
    desc: 'Receber novas mensagens de profissionais interessados.',
  },
  {
    key: 'projetos',
    icon: 'albums-outline',
    titulo: 'Atualizações de projetos',
    desc: 'Notificações sobre o andamento dos seus projetos.',
  },
  {
    key: 'promocoes',
    icon: 'pricetag-outline',
    titulo: 'Promoções e novidades',
    desc: 'Receber ofertas especiais e novidades da plataforma.',
  },
];

const AVALIACAO = [
  {
    key: 'exigir',
    icon: 'star-outline',
    titulo: 'Exigir avaliações',
    desc: 'Avalie o profissional após cada serviço.',
  },
  {
    key: 'publicas',
    icon: 'eye-outline',
    titulo: 'Mostrar avaliações públicas',
    desc: 'Permita que suas avaliações sejam visíveis para outros usuários.',
  },
  {
    key: 'notificar',
    icon: 'notifications-outline',
    titulo: 'Notificar sobre novas avaliações',
    desc: 'Receba alertas sobre novas avaliações dos seus profissionais.',
  },
];

const DOCUMENTOS = [
  {
    key: 'documentacao',
    icon: 'document-text-outline',
    titulo: 'Verificar documentação',
    desc: 'Exigir comprovação de documentos dos profissionais.',
  },
  {
    key: 'portfolio',
    icon: 'images-outline',
    titulo: 'Verificar portfólio',
    desc: 'Solicitar portfólio de projetos anteriores.',
  },
  {
    key: 'certificacoes',
    icon: 'ribbon-outline',
    titulo: 'Verificar certificações',
    desc: 'Confirmar certificações e especializações.',
  },
];

const SWITCHES_INICIAIS = {
  recomendados: true,
  mensagens: true,
  projetos: true,
  promocoes: true,
  exigir: true,
  publicas: true,
  notificar: true,
  documentacao: true,
  portfolio: true,
  certificacoes: true,
};

/* ---------- Utilitários ---------- */

const formatarNumero = (valor) => String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const somenteDigitos = (texto) => texto.replace(/\D/g, '');

// mobile = celular em pé | medio = celular deitado/tablet | largo = site
function useLayout() {
  const { width, height } = useWindowDimensions();
  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  return { mobile, medio, largo: !mobile && !medio, height };
}

/* ---------- Componentes auxiliares ---------- */

function Painel({ icon, titulo, descricao, estilo, children }) {
  return (
    <View style={[s.card, estilo]}>
      <View style={s.cardTitulo}>
        <View style={s.iconeCard}>
          <Ionicons name={icon} size={18} color={COLORS.gold} />
        </View>
        <View style={s.flex}>
          <Text style={s.cardTituloTxt}>{titulo}</Text>
          <Text style={s.cardDescTxt}>{descricao}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function OpcaoSeletor({ icon, titulo, descricao, valor, onPress, ultima }) {
  const { mobile } = useLayout();

  const botao = (
    <Pressable style={[s.seletor, !mobile && s.seletorInline]} onPress={onPress}>
      <Text style={s.seletorTxt} numberOfLines={1}>
        {valor}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
    </Pressable>
  );

  // Tela maior: botão fica à direita do texto (igual ao web)
  if (!mobile) {
    return (
      <View style={[s.opcao, s.opcaoLinha, ultima && s.opcaoUltima]}>
        <View style={s.opcaoIcone}>
          <Ionicons name={icon} size={18} color={COLORS.gold} />
        </View>
        <View style={s.flex}>
          <Text style={s.opcaoTitulo}>{titulo}</Text>
          <Text style={s.opcaoDesc}>{descricao}</Text>
        </View>
        {botao}
      </View>
    );
  }

  // Celular em pé: botão desce para uma linha própria
  return (
    <View style={[s.opcao, ultima && s.opcaoUltima]}>
      <View style={s.opcaoTopo}>
        <View style={s.opcaoIcone}>
          <Ionicons name={icon} size={18} color={COLORS.gold} />
        </View>
        <View style={s.flex}>
          <Text style={s.opcaoTitulo}>{titulo}</Text>
          <Text style={s.opcaoDesc}>{descricao}</Text>
        </View>
      </View>
      {botao}
    </View>
  );
}

function OpcaoSwitch({ icon, titulo, descricao, valor, onChange, ultima }) {
  return (
    <View style={[s.opcao, s.opcaoLinha, ultima && s.opcaoUltima]}>
      <View style={s.opcaoIcone}>
        <Ionicons name={icon} size={18} color={COLORS.gold} />
      </View>
      <View style={s.flex}>
        <Text style={s.opcaoTitulo}>{titulo}</Text>
        <Text style={s.opcaoDesc}>{descricao}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: '#2a2a2a', true: COLORS.gold }}
        thumbColor="#fff"
      />
    </View>
  );
}

function GrupoSwitches({ itens, estado, onChange }) {
  return itens.map((item, i) => (
    <OpcaoSwitch
      key={item.key}
      icon={item.icon}
      titulo={item.titulo}
      descricao={item.desc}
      valor={estado[item.key]}
      onChange={(v) => onChange(item.key, v)}
      ultima={i === itens.length - 1}
    />
  ));
}

/* ---------- Tela ---------- */

export default function ConfigProfissionais() {
  const router = useRouter();
  const { mobile, medio, largo, height } = useLayout();
  const paisagem = height < 500;

  /* ----- Drawer (celular em pé) ----- */
  const [menuAberto, setMenuAberto] = useState(false);
  const deslize = useRef(new Animated.Value(-LARGURA_DRAWER)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(deslize, {
        toValue: menuAberto ? 0 : -LARGURA_DRAWER,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: menuAberto ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuAberto]);

  useEffect(() => {
    if (!mobile) setMenuAberto(false);
  }, [mobile]);

  /* ----- Preferências ----- */
  const [selecoes, setSelecoes] = useState({
    tipos: ['Arquitetos', 'Engenheiros', 'Designers de Interiores', 'Paisagistas'],
    regioes: [TODAS],
    contato: ['E-mail', 'WhatsApp'],
  });
  const [faixa, setFaixa] = useState({ min: '5000', max: '50000' });
  const [switches, setSwitches] = useState(SWITCHES_INICIAIS);

  /* ----- Modal de seleção ----- */
  const [modal, setModal] = useState(null); // 'tipos' | 'regioes' | 'contato' | 'faixa' | null
  const [rascunho, setRascunho] = useState([]);
  const [faixaRascunho, setFaixaRascunho] = useState({ min: '', max: '' });

  /* ----- Toast ----- */
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const mostrarToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  };

  const ir = (route) => {
    setMenuAberto(false);
    router.push(route);
  };

  const alterarSwitch = (chave, valor) => {
    setSwitches((prev) => ({ ...prev, [chave]: valor }));
    mostrarToast('Preferência atualizada.');
  };

  /* ----- Resumos exibidos nos botões ----- */
  const resumo = (chave) => {
    const lista = selecoes[chave];
    if (chave === 'regioes') {
      if (lista.includes(TODAS)) return TODAS;
      return lista.length === 1 ? lista[0] : `${lista.length} regiões`;
    }
    if (chave === 'contato') {
      return lista.length === 2
        ? lista.join(' e ')
        : lista.length === 1
        ? lista[0]
        : `${lista.length} selecionados`;
    }
    return `${lista.length} selecionado${lista.length === 1 ? '' : 's'}`;
  };

  const resumoFaixa = `R$ ${formatarNumero(faixa.min)} — R$ ${formatarNumero(faixa.max)}`;

  /* ----- Modal ----- */
  const abrirMulti = (chave) => {
    setRascunho(selecoes[chave]);
    setModal(chave);
  };

  const abrirFaixa = () => {
    setFaixaRascunho({ min: faixa.min, max: faixa.max });
    setModal('faixa');
  };

  const alternarItem = (item) => {
    setRascunho((prev) => {
      if (modal === 'regioes') {
        if (item === TODAS) return [TODAS];
        const semTodas = prev.filter((i) => i !== TODAS);
        return semTodas.includes(item)
          ? semTodas.filter((i) => i !== item)
          : [...semTodas, item];
      }
      return prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
    });
  };

  const confirmarMulti = () => {
    if (rascunho.length === 0) {
      Alert.alert('Seleção vazia', 'Selecione pelo menos uma opção.');
      return;
    }
    setSelecoes((prev) => ({ ...prev, [modal]: rascunho }));
    setModal(null);
    mostrarToast('Preferência atualizada.');
  };

  const confirmarFaixa = () => {
    const min = Number(faixaRascunho.min);
    const max = Number(faixaRascunho.max);
    if (!min || !max) {
      Alert.alert('Valores inválidos', 'Informe o valor mínimo e o máximo.');
      return;
    }
    if (min > max) {
      Alert.alert('Faixa inválida', 'O valor mínimo não pode ser maior que o máximo.');
      return;
    }
    setFaixa({ min: String(min), max: String(max) });
    setModal(null);
    mostrarToast('Preferência atualizada.');
  };

  /* ----- Itens do menu (aside e drawer) ----- */
  const renderItensMenu = () =>
    MENU.map((item) => (
      <View key={item.label}>
        {item.separador && <View style={s.divisorMenu} />}
        <Pressable
          style={[s.itemMenu, medio && s.itemMenuMedio, item.ativo && s.itemAtivo]}
          onPress={() => {
            setMenuAberto(false);
            if (!item.ativo) router.push(item.route);
          }}
        >
          <Ionicons
            name={item.icon}
            size={mobile ? 18 : medio ? 14 : 16}
            color={COLORS.gold}
          />
          <Text
            style={[
              s.itemMenuTxt,
              medio && s.itemMenuTxtMedio,
              mobile && s.itemMenuTxtMobile,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      </View>
    ));

  const renderLinksTopo = () => (
    <View style={[s.linksTopo, mobile && s.linksTopoMobile]}>
      {LINKS_TOPO.map(([label, route]) => (
        <Pressable key={label} onPress={() => ir(route)}>
          <Text style={s.linkTopo}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView contentContainerStyle={s.pagina} showsVerticalScrollIndicator={false}>
        {/* ---------- TOPO ---------- */}
        <View style={[s.topo, medio && s.topoMedio, mobile && s.topoMobile]}>
          {mobile && (
            <Pressable onPress={() => setMenuAberto(true)} style={s.botaoHamburguer} hitSlop={10}>
              <Ionicons name="menu-outline" size={28} color={COLORS.gold} />
            </Pressable>
          )}

          <Pressable onPress={() => ir('/')}>
            <Image
              source={LOGO}
              style={[s.logo, medio && s.logoMedio, mobile && s.logoMobile]}
              resizeMode="contain"
            />
          </Pressable>

          {!mobile && renderLinksTopo()}

          <Pressable onPress={() => ir('/perfilUsuario')} style={s.botaoPerfil} hitSlop={10}>
            <Ionicons name="person-outline" size={22} color={COLORS.gold} />
          </Pressable>

          {mobile && renderLinksTopo()}
        </View>

        {/* ---------- PAINEL ---------- */}
        <View style={[s.painel, medio && s.painelMedio, mobile && s.painelMobile]}>
          {/* Aside: tela média e site */}
          {!mobile && (
            <View style={[s.menuLateral, medio && s.menuLateralMedio]}>
              {renderItensMenu()}
            </View>
          )}

          <View style={[s.principal, (medio || mobile) && s.principalCompacto]}>
            {/* Cabeçalho */}
            <View style={s.cabecalho}>
              <View style={s.iconeTitulo}>
                <Ionicons name="settings-outline" size={22} color={COLORS.gold} />
              </View>
              <View style={s.flex}>
                <Text style={[s.h1, mobile && s.h1Mobile]}>Configuração de Profissionais</Text>
                <Text style={s.sub}>
                  Gerencie as configurações relacionadas aos profissionais da sua conta.
                </Text>
              </View>
            </View>
            <View style={s.divisor} />

            {/* Grade de painéis: 2 colunas no site, 1 coluna nos demais */}
            <View style={s.grade}>
              <Painel
                estilo={largo ? s.painelMetade : s.painelCheio}
                icon="person-outline"
                titulo="Preferências de Contratação"
                descricao="Defina como você deseja encontrar e contratar profissionais."
              >
                <OpcaoSeletor
                  icon="people-outline"
                  titulo="Tipos de profissionais"
                  descricao="Selecione quais áreas deseja receber indicações."
                  valor={resumo('tipos')}
                  onPress={() => abrirMulti('tipos')}
                />
                <OpcaoSeletor
                  icon="cash-outline"
                  titulo="Faixa de preço"
                  descricao="Defina o valor que está disposto a investir nos projetos."
                  valor={resumoFaixa}
                  onPress={abrirFaixa}
                />
                <OpcaoSeletor
                  icon="location-outline"
                  titulo="Região de atuação"
                  descricao="Escolha as regiões onde deseja encontrar profissionais."
                  valor={resumo('regioes')}
                  onPress={() => abrirMulti('regioes')}
                />
                <OpcaoSeletor
                  icon="chatbubbles-outline"
                  titulo="Forma de contato preferida"
                  descricao="Defina como prefere ser contatado pelos profissionais."
                  valor={resumo('contato')}
                  onPress={() => abrirMulti('contato')}
                  ultima
                />
              </Painel>

              <Painel
                estilo={largo ? s.painelMetade : s.painelCheio}
                icon="notifications-outline"
                titulo="Notificações de Profissionais"
                descricao="Escolha quais notificações deseja receber."
              >
                <GrupoSwitches itens={NOTIFICACOES} estado={switches} onChange={alterarSwitch} />
              </Painel>

              <Painel
                estilo={largo ? s.painelMetade : s.painelCheio}
                icon="star-outline"
                titulo="Avaliação e Feedback"
                descricao="Configure como deseja avaliar os profissionais."
              >
                <GrupoSwitches itens={AVALIACAO} estado={switches} onChange={alterarSwitch} />
              </Painel>

              <Painel
                estilo={largo ? s.painelMetade : s.painelCheio}
                icon="shield-checkmark-outline"
                titulo="Documentos e Verificações"
                descricao="Gerencie as verificações dos profissionais."
              >
                <GrupoSwitches itens={DOCUMENTOS} estado={switches} onChange={alterarSwitch} />
              </Painel>
            </View>

            {/* Dica */}
            <View style={s.aviso}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.gold} />
              <Text style={s.avisoTxt}>
                <Text style={s.avisoNegrito}>Dica: </Text>
                Manter suas preferências atualizadas ajuda a encontrar os profissionais ideais para o
                seu projeto, com mais agilidade e segurança.
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- RODAPÉ ---------- */}
        <View style={s.rodape}>
          <Text style={s.rodapeTxt}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={s.rodapeLinks}>
            <Pressable onPress={() => ir('/termosUso')}>
              <Text style={s.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={s.rodapeSep}>|</Text>
            <Pressable onPress={() => ir('/politicaPrivacidade')}>
              <Text style={s.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* ---------- TOAST ---------- */}
      {!!toast && (
        <View style={s.toastWrap} pointerEvents="none">
          <View style={s.toast}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        </View>
      )}

      {/* ---------- DRAWER (celular em pé) ---------- */}
      {mobile && (
        <View style={s.camadaDrawer} pointerEvents={menuAberto ? 'auto' : 'none'}>
          <Animated.View style={[s.overlay, { opacity: fade }]}>
            <Pressable style={s.flex} onPress={() => setMenuAberto(false)} />
          </Animated.View>

          <Animated.View
            style={[
              s.drawer,
              { paddingTop: paisagem ? 16 : 40 },
              { transform: [{ translateX: deslize }] },
            ]}
          >
            <View style={s.drawerTopo}>
              <Text style={s.drawerTitulo}>Minha Conta</Text>
              <Pressable onPress={() => setMenuAberto(false)} hitSlop={10}>
                <Ionicons name="close-outline" size={26} color={COLORS.gold} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={s.drawerLista}>{renderItensMenu()}</ScrollView>
          </Animated.View>
        </View>
      )}

      {/* ---------- MODAL: seleção múltipla ---------- */}
      <Modal
        visible={modal !== null && modal !== 'faixa'}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(null)}
      >
        <Pressable style={s.sheetOverlay} onPress={() => setModal(null)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitulo}>
              {modal && modal !== 'faixa' ? TITULOS[modal] : ''}
            </Text>

            <ScrollView style={{ maxHeight: Math.min(340, height * 0.5) }}>
              {modal &&
                modal !== 'faixa' &&
                OPCOES[modal].map((op) => {
                  const marcado = rascunho.includes(op);
                  return (
                    <Pressable
                      key={op}
                      style={[s.sheetItem, marcado && s.sheetItemAtivo]}
                      onPress={() => alternarItem(op)}
                    >
                      <Ionicons
                        name={marcado ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={marcado ? COLORS.gold : COLORS.muted}
                      />
                      <Text style={[s.sheetItemTxt, marcado && { color: COLORS.gold }]}>{op}</Text>
                    </Pressable>
                  );
                })}
            </ScrollView>

            <View style={s.sheetAcoes}>
              <Pressable style={[s.btn, s.flex]} onPress={() => setModal(null)}>
                <Text style={s.btnTxt}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.btnPrincipal, s.flex]} onPress={confirmarMulti}>
                <Text style={s.btnPrincipalTxt}>Confirmar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------- MODAL: faixa de preço ---------- */}
      <Modal
        visible={modal === 'faixa'}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(null)}
      >
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={s.sheetOverlay} onPress={() => setModal(null)}>
            <Pressable style={s.sheet} onPress={() => {}}>
              <View style={s.sheetHandle} />
              <Text style={s.sheetTitulo}>Faixa de preço</Text>

              <View style={s.faixaRow}>
                <View style={s.flex}>
                  <Text style={s.faixaLabel}>Valor mínimo</Text>
                  <View style={s.faixaInputBox}>
                    <Text style={s.faixaPrefixo}>R$</Text>
                    <TextInput
                      style={s.faixaInput}
                      value={faixaRascunho.min}
                      onChangeText={(t) =>
                        setFaixaRascunho((p) => ({ ...p, min: somenteDigitos(t) }))
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <View style={s.flex}>
                  <Text style={s.faixaLabel}>Valor máximo</Text>
                  <View style={s.faixaInputBox}>
                    <Text style={s.faixaPrefixo}>R$</Text>
                    <TextInput
                      style={s.faixaInput}
                      value={faixaRascunho.max}
                      onChangeText={(t) =>
                        setFaixaRascunho((p) => ({ ...p, max: somenteDigitos(t) }))
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={s.sheetAcoes}>
                <Pressable style={[s.btn, s.flex]} onPress={() => setModal(null)}>
                  <Text style={s.btnTxt}>Cancelar</Text>
                </Pressable>
                <Pressable style={[s.btnPrincipal, s.flex]} onPress={confirmarFaixa}>
                  <Text style={s.btnPrincipalTxt}>Confirmar</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: COLORS.bg },
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  pagina: { flexGrow: 1 },
  flex: { flex: 1, minWidth: 0 },

  // ----- Topo -----
  topo: {
    minHeight: 76, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 25,
    borderBottomWidth: 1, borderColor: '#51432c',
  },
  topoMedio: { minHeight: 56, paddingHorizontal: 16 },
  topoMobile: {
    flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8, gap: 6,
  },
  botaoHamburguer: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#6e572b', borderRadius: 8,
    backgroundColor: '#1d1d1f',
  },
  botaoPerfil: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 110, height: 62 },
  logoMedio: { width: 80, height: 44 },
  logoMobile: { width: 90, height: 50 },
  linksTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 30 },
  linksTopoMobile: { width: '100%', justifyContent: 'center', gap: 18, paddingTop: 4 },
  linkTopo: { color: '#fff', fontSize: 13 },

  // ----- Painel -----
  painel: {
    width: '96%', maxWidth: 1250, alignSelf: 'center',
    flexDirection: 'row', marginTop: 22, marginBottom: 60,
    backgroundColor: 'rgba(15,15,15,0.97)',
    borderWidth: 1, borderColor: '#292929', borderRadius: 10,
    overflow: 'hidden',
  },
  painelMedio: { marginTop: 12, marginBottom: 30 },
  painelMobile: { flexDirection: 'column', marginTop: 12, marginBottom: 30 },

  // ----- Aside -----
  menuLateral: {
    width: 205, padding: 10, backgroundColor: '#090a0b',
    borderRightWidth: 1, borderColor: '#292929',
  },
  menuLateralMedio: { width: 160, padding: 8 },
  itemMenu: {
    minHeight: 37, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 5,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 6, backgroundColor: '#191a1c',
    borderWidth: 1, borderColor: 'transparent',
  },
  itemMenuMedio: { minHeight: 30, paddingVertical: 6, paddingHorizontal: 8, gap: 8 },
  itemAtivo: { borderColor: COLORS.gold, backgroundColor: '#252117' },
  itemMenuTxt: { color: '#eee', fontSize: 11, flexShrink: 1 },
  itemMenuTxtMedio: { fontSize: 10 },
  itemMenuTxtMobile: { fontSize: 14 },
  divisorMenu: { height: 1, backgroundColor: '#333', marginTop: 4, marginBottom: 10 },

  // ----- Drawer -----
  camadaDrawer: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: LARGURA_DRAWER, backgroundColor: '#101010',
    borderRightWidth: 1, borderColor: '#333',
  },
  drawerTopo: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderColor: COLORS.gold,
  },
  drawerTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  drawerLista: { padding: 12 },

  // ----- Conteúdo -----
  principal: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, padding: 20 },
  principalCompacto: { padding: 14 },

  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeTitulo: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: COLORS.goldDim, alignItems: 'center', justifyContent: 'center',
  },
  h1: { color: COLORS.text, fontSize: 23, fontWeight: '700' },
  h1Mobile: { fontSize: 19 },
  sub: { color: COLORS.mutedBlue, fontSize: 12, marginTop: 2, lineHeight: 16 },
  divisor: { height: 1, backgroundColor: '#8e7138', marginVertical: 16 },

  // ----- Grade de painéis -----
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  painelMetade: { flexGrow: 1, flexShrink: 1, flexBasis: '48%', minWidth: 0 },
  painelCheio: { width: '100%' },

  // ----- Card -----
  card: {
    backgroundColor: COLORS.card, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 11, padding: 14,
  },
  cardTitulo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 4, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  iconeCard: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    borderColor: COLORS.goldDim, alignItems: 'center', justifyContent: 'center',
  },
  cardTituloTxt: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  cardDescTxt: { color: COLORS.mutedBlue, fontSize: 11, marginTop: 2, lineHeight: 15 },

  // ----- Opções -----
  opcao: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  opcaoLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcaoUltima: { borderBottomWidth: 0, paddingBottom: 4 },
  opcaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcaoIcone: {
    width: 36, height: 36, borderRadius: 6, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: '#0d0e0f',
    alignItems: 'center', justifyContent: 'center',
  },
  opcaoTitulo: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  opcaoDesc: { color: COLORS.mutedBlue, fontSize: 10, marginTop: 2, lineHeight: 14 },

  seletor: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 8, marginTop: 10, marginLeft: 48, height: 40, paddingHorizontal: 12,
    backgroundColor: COLORS.cardAlt, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 7,
  },
  seletorInline: { marginTop: 0, marginLeft: 0, width: 150, flexShrink: 0 },
  seletorTxt: { color: COLORS.text, fontSize: 12, fontWeight: '600', flex: 1 },

  // ----- Aviso -----
  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16,
    backgroundColor: 'rgba(201,164,92,0.06)', borderWidth: 1,
    borderColor: COLORS.goldDim, borderRadius: 10, padding: 14,
  },
  avisoTxt: { flex: 1, color: COLORS.mutedBlue, fontSize: 12, lineHeight: 17 },
  avisoNegrito: { color: COLORS.gold, fontWeight: '700' },

  // ----- Rodapé -----
  rodape: {
    minHeight: 48, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', alignItems: 'center',
    gap: 10, paddingHorizontal: 25, paddingVertical: 15,
    backgroundColor: '#090909', borderTopWidth: 1, borderColor: COLORS.gold,
  },
  rodapeTxt: { color: '#aaa', fontSize: 10 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rodapeLink: { color: COLORS.gold, fontSize: 10 },
  rodapeSep: { color: '#666', fontSize: 10 },

  // ----- Toast -----
  toastWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 24,
    alignItems: 'center', paddingHorizontal: 16,
  },
  toast: {
    width: '100%', maxWidth: 420, flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: '#1c1c1c', borderWidth: 1,
    borderColor: COLORS.goldDim, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  toastTxt: { color: COLORS.text, fontSize: 12, flex: 1 },

  // ----- Bottom sheet -----
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    width: '100%', maxWidth: 520, alignSelf: 'center',
    backgroundColor: COLORS.card, borderTopWidth: 1, borderColor: COLORS.goldDim,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 16, paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, marginBottom: 14,
  },
  sheetTitulo: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  sheetItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 10, borderRadius: 6, marginBottom: 4,
  },
  sheetItemAtivo: { backgroundColor: 'rgba(201,164,92,0.08)' },
  sheetItemTxt: { color: COLORS.text, fontSize: 13 },
  sheetAcoes: { flexDirection: 'row', gap: 10, marginTop: 14 },

  // ----- Faixa de preço -----
  faixaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  faixaLabel: { color: COLORS.text, fontSize: 11, marginBottom: 6 },
  faixaInputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 44,
    paddingHorizontal: 12, backgroundColor: COLORS.cardAlt, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 6,
  },
  faixaPrefixo: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  faixaInput: {
    flex: 1, minWidth: 0, color: COLORS.text, fontSize: 14, padding: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  // ----- Botões -----
  btn: {
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    borderColor: COLORS.gold, borderRadius: 6, paddingVertical: 12,
  },
  btnTxt: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },
  btnPrincipal: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.gold, borderRadius: 6, paddingVertical: 12,
  },
  btnPrincipalTxt: { color: '#0a0a0a', fontSize: 13, fontWeight: '700' },
});