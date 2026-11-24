import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeclararConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';
import { useConta } from '../components/ContaProvider';
import { getSupabaseClient } from '../services/supabase';
import { buscarProfissional } from '../services/profissionais';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const LARGURA_DRAWER = 290;
const POR_PAGINA = 5;

// Em coluna, "flex: 0" / "flex: 1" colapsam a altura (flex-basis: 0).
const ALTURA_AUTO = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
};

const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

/* ================================================= */
/* DADOS                                             */
/* ================================================= */

const LINKS_SITE = [
  { nome: 'Início', icone: 'home-outline', rota: '/' },
  { nome: 'Plantas', icone: 'map-outline', rota: '/planta' },
  { nome: 'Profissionais', icone: 'people-outline', rota: '/profissionais' },
  { nome: 'Sobre Nós', icone: 'information-circle-outline', rota: '/sobreNos' },
];

// Mesmas cores do web
const STATUS = {
  andamento: { texto: 'Em andamento', cor: '#f0ca61', fundo: 'rgba(174, 137, 43, 0.22)' },
  concluido: { texto: 'Adquirida', cor: '#54db83', fundo: 'rgba(30, 135, 68, 0.23)' },
  cancelado: { texto: 'Cancelado', cor: '#c3c6d4', fundo: 'rgba(115, 120, 139, 0.28)' },
};

const FILTROS = [
  { chave: 'todos', texto: 'Todas' },
  { chave: 'concluido', texto: 'Adquiridas' },
];



/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const formatarValor = (n) => {
  const [inteiro, decimal] = n.toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
};

const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Janela de até 5 páginas ao redor da página atual
const numerosPagina = (atual, total) => {
  const tamanho = Math.min(5, total);
  let inicio = Math.max(1, atual - Math.floor(tamanho / 2));
  if (inicio + tamanho - 1 > total) inicio = total - tamanho + 1;
  return Array.from({ length: tamanho }, (_, i) => inicio + i);
};

/* ================================================= */
/* COMPONENTES                                       */
/* ================================================= */

function ItemMenu({ nome, icone, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.itemMenu, pressed && s.pressionado]}
    >
      <Ionicons name={icone} size={20} color={DOURADO} />
      <Text style={s.textoMenu}>{nome}</Text>
    </Pressable>
  );
}

function Topo({ mobile, medio, insets, onAbrirMenu, onNavegar }) {
  return (
    <View
      style={[
        s.topo,
        medio && s.topoMedio,
        mobile && s.topoMobile,
        { paddingTop: insets.top + (mobile ? 8 : 0) },
      ]}
    >
      {mobile && (
        <Pressable
          onPress={onAbrirMenu}
          style={s.botaoHamburguer}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu-outline" size={26} color={DOURADO} />
        </Pressable>
      )}

      <Pressable onPress={() => onNavegar('/')} accessibilityLabel="Ir para o início">
        <Image
          source={LOGO}
          style={[s.logo, medio && s.logoMedio, mobile && s.logoMobile]}
          resizeMode="contain"
        />
      </Pressable>

      {!mobile && (
        <View style={s.linksTopo}>
          {LINKS_SITE.map((link) => (
            <Pressable key={link.nome} onPress={() => onNavegar(link.rota)}>
              <Text style={s.linkTopo}>{link.nome}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {mobile && (
        <View style={s.avatarTopo}>
          <Ionicons name="person-outline" size={20} color={DOURADO} />
        </View>
      )}
    </View>
  );
}

function CabecalhoPagina({ mobile }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <Text style={[s.titulo, mobile && s.tituloMobile]}>Meus Pedidos</Text>
      <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
        Acompanhe as plantas que você adquiriu.
      </Text>
    </View>
  );
}

function Status({ tipo }) {
  const status = STATUS[tipo];

  return (
    <View style={[s.status, { backgroundColor: status.fundo }]}>
      <View style={[s.pontoStatus, { backgroundColor: status.cor }]} />
      <Text style={[s.textoStatus, { color: status.cor }]}>{status.texto}</Text>
    </View>
  );
}

function CardPedido({ pedido, mobile, linha, onDetalhes }) {
  const icone = (
    <View style={s.iconePedido}>
      <Ionicons name="home-outline" size={26} color={DOURADO} />
    </View>
  );

  const principal = (
    <View style={s.principalPedido}>
      <Text style={[s.tituloPedido, mobile && s.tituloPedidoMobile]} numberOfLines={mobile ? 2 : 1}>
        {pedido.titulo}
      </Text>
      <Text style={[s.nomeProfissional, mobile && s.nomeProfissionalMobile]} numberOfLines={1}>
        {pedido.profissional}
      </Text>
      <Text style={s.funcao} numberOfLines={1}>
        {pedido.funcao}
      </Text>
    </View>
  );

  const pedidoEm = (
    <View style={s.detalhe}>
      <Text style={s.rotuloDetalhe}>Adquirida em</Text>
      <Text style={[s.valorDetalhe, mobile && s.valorDetalheMobile]}>
        {formatarData(pedido.data)}
      </Text>
    </View>
  );

  const valor = (
    <View style={s.detalhe}>
      <Text style={s.rotuloDetalhe}>Valor</Text>
      <Text style={[s.valorDetalhe, mobile && s.valorDetalheMobile]}>
        {pedido.valor > 0 ? formatarValor(pedido.valor) : 'Sem cobrança'}
      </Text>
    </View>
  );

  const botao = (
    <View style={[s.botaoDetalhes, linha && s.botaoDetalhesLinha, mobile && s.botaoDetalhesMobile]}>
      <Text style={[s.textoDetalhes, mobile && s.textoDetalhesMobile]}>Ver detalhes</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onDetalhes}
      style={({ pressed }) => [s.pedido, mobile && s.pedidoMobile, pressed && s.pressionado]}
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${pedido.titulo}, ${STATUS[pedido.status].texto}. Ver detalhes`}
    >
      {linha ? (
        // Tela larga: tudo em uma linha, igual ao web
        <View style={s.linhaPedido}>
          {icone}
          {principal}
          {pedidoEm}
          {valor}
          <Status tipo={pedido.status} />
          {botao}
        </View>
      ) : (
        // Celular / tablet: empilhado, igual ao web em tela pequena
        <>
          <View style={s.topoCard}>
            {icone}
            {principal}
          </View>

          <View style={s.meta}>
            {pedidoEm}
            {valor}
          </View>

          <Status tipo={pedido.status} />
          {botao}
        </>
      )}
    </Pressable>
  );
}

function Paginacao({ atual, total, onMudar }) {
  if (total <= 1) return null;

  const anteriorOff = atual === 1;
  const proximaOff = atual === total;

  return (
    <View style={s.paginacao}>
      <Pressable
        onPress={() => onMudar(atual - 1)}
        disabled={anteriorOff}
        style={({ pressed }) => [
          s.pagina,
          s.seta,
          anteriorOff && s.paginaDesativada,
          pressed && s.pressionado,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Página anterior"
        accessibilityState={{ disabled: anteriorOff }}
      >
        <Ionicons name="chevron-back" size={18} color={DOURADO} />
      </Pressable>

      {numerosPagina(atual, total).map((n) => {
        const selecionada = n === atual;
        return (
          <Pressable
            key={n}
            onPress={() => onMudar(n)}
            style={({ pressed }) => [
              s.pagina,
              selecionada && s.paginaSelecionada,
              pressed && s.pressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Página ${n}`}
            accessibilityState={{ selected: selecionada }}
          >
            <Text style={[s.textoPagina, selecionada && s.textoPaginaSelecionada]}>{n}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => onMudar(atual + 1)}
        disabled={proximaOff}
        style={({ pressed }) => [
          s.pagina,
          s.seta,
          proximaOff && s.paginaDesativada,
          pressed && s.pressionado,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Próxima página"
        accessibilityState={{ disabled: proximaOff }}
      >
        <Ionicons name="chevron-forward" size={18} color={DOURADO} />
      </Pressable>
    </View>
  );
}

function SemPedidos({ onExplorar }) {
  return (
    <View style={s.vazio}>
      <Text style={s.tituloVazio}>Nenhum pedido encontrado</Text>
      <Text style={s.textoVazio}>
        As plantas que você adquirir aparecerão aqui. Elas continuam disponíveis para outros usuários.
      </Text>
      <Pressable
        onPress={onExplorar}
        style={({ pressed }) => [s.btnPrincipal, pressed && s.pressionado]}
        accessibilityRole="button"
      >
        <Text style={s.textoPrincipal}>Explorar plantas</Text>
      </Pressable>
    </View>
  );
}

function Rodape({ mobile, insets }) {
  return (
    <View
      style={[
        s.rodape,
        mobile && s.rodapeMobile,
        { paddingBottom: 15 + insets.bottom },
      ]}
    >
      <Text style={s.textoRodape}>
        ©IncomeOfHouses. Todos os direitos reservados.
      </Text>
      <Text style={s.termos}>Termos de Uso  |  Política de Privacidade</Text>
    </View>
  );
}

function Drawer({ aberto, deslize, fade, insets, paisagem, onFechar, onNavegar, children }) {
  return (
    <View style={s.camadaDrawer} pointerEvents={aberto ? 'auto' : 'none'}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <Pressable style={s.areaFechar} onPress={onFechar} />
      </Animated.View>

      <Animated.View
        style={[
          s.drawer,
          {
            paddingTop: (paisagem ? 8 : 16) + insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: deslize }],
          },
        ]}
      >
        <View style={s.drawerTopo}>
          <View style={s.drawerUsuario}>
            <Ionicons name="person-circle-outline" size={44} color={DOURADO} />
            <View>
              <Text style={s.drawerTitulo}>Minha Conta</Text>
              <Text style={s.drawerSub}>Usuário não identificado</Text>
            </View>
          </View>

          <Pressable onPress={onFechar} hitSlop={10} accessibilityLabel="Fechar menu">
            <Ionicons name="close-outline" size={28} color={DOURADO} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.drawerLista} showsVerticalScrollIndicator={false}>
          <Text style={s.drawerSecao}>NAVEGAÇÃO</Text>
          {LINKS_SITE.map((link) => (
            <ItemMenu
              key={link.nome}
              nome={link.nome}
              icone={link.icone}
              onPress={() => onNavegar(link.rota)}
            />
          ))}

          <Text style={[s.drawerSecao, s.drawerSecaoSeparada]}>MINHA CONTA</Text>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/* ================================================= */
/* TELA                                              */
/* ================================================= */

export default function MeusPedidos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('usuario');
  const { user } = useConta();
  const { width, height } = useWindowDimensions();

  // Mesmos breakpoints do PerfilUsuario
  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  const paisagem = height < 500;

  // Tela larga mostra cada pedido em uma linha, como no web
  const linha = !mobile && !medio;

  const scrollRef = useRef(null);

  /* ----- Drawer ----- */
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

  /* ----- Filtro, busca e paginação ----- */
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(true);
  const [erroPedidos, setErroPedidos] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    async function carregarAquisições() {
      setCarregandoPedidos(true);
      setErroPedidos('');
      try {
        if (!user?.id) { if (ativo) setPedidos([]); return; }
        const supabase = getSupabaseClient();
        const { data: aquisicoes, error: erroAquisicoes } = await supabase
          .from('plantas_adquiridas').select('planta_id, adquirido_em')
          .eq('usuario_id', user.id).order('adquirido_em', { ascending: false });
        if (erroAquisicoes) throw erroAquisicoes;
        const ids = (aquisicoes || []).map((item) => item.planta_id).filter(Boolean);
        if (!ids.length) { if (ativo) setPedidos([]); return; }
        const { data: plantas, error: erroPlantas } = await supabase
          .from('plantas').select('id,nome,categoria,preco,profissional_id').in('id', ids);
        if (erroPlantas) throw erroPlantas;
        const porId = new Map((plantas || []).map((item) => [String(item.id), item]));
        const profissionaisIds = [...new Set((plantas || []).map((item) => item.profissional_id).filter(Boolean))];
        const profissionais = await Promise.all(profissionaisIds.map(async (id) => {
          try { return await buscarProfissional(id); } catch { return null; }
        }));
        const nomesProfissionais = new Map(profissionais.filter(Boolean).map((item) => [String(item.id), item]));
        const lista = (aquisicoes || []).map((aquisicao) => {
          const planta = porId.get(String(aquisicao.planta_id));
          if (!planta) return null;
          const profissional = nomesProfissionais.get(String(planta.profissional_id));
          return {
            id: String(planta.id),
            titulo: planta.nome || 'Planta adquirida',
            profissional: profissional?.nome || 'Profissional',
            funcao: profissional?.profissaoNome || 'Responsável pelo projeto',
            valor: 0,
            data: (aquisicao.adquirido_em || new Date().toISOString()).slice(0, 10),
            status: 'concluido',
          };
        }).filter(Boolean);
        if (ativo) setPedidos(lista);
      } catch (falha) {
        console.error('Erro ao carregar plantas adquiridas:', falha);
        if (ativo) setErroPedidos(falha?.message || 'Não foi possível carregar suas plantas adquiridas.');
      } finally { if (ativo) setCarregandoPedidos(false); }
    }
    carregarAquisições();
    return () => { ativo = false; };
  }, [user?.id]));

  // Qualquer mudança de filtro ou busca volta para a primeira página
  useEffect(() => {
    setPagina(1);
  }, [filtro, busca]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    return pedidos.filter((p) =>
      (filtro === 'todos' || p.status === filtro) &&
      (!termo || normalizar(p.titulo).includes(termo) || normalizar(p.profissional).includes(termo))
    );
  }, [pedidos, filtro, busca]);

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const daPagina = visiveis.slice(inicio, inicio + POR_PAGINA);

  const mudarPagina = (n) => {
    setPagina(Math.min(Math.max(n, 1), totalPaginas));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const abrirDetalhes = (pedido) =>
    router.push({ pathname: '/detalhesPlantas', params: { id: String(pedido.id) } });

  const menuConta = (
    <ContaMenu tipo="usuario" aoSelecionar={() => setMenuAberto(false)} />
  );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.conteudo}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
      >
        <Topo
          mobile={mobile}
          medio={medio}
          insets={insets}
          onAbrirMenu={() => setMenuAberto(true)}
          onNavegar={navegar}
        />

        <View style={[s.painel, medio && s.painelMedio, mobile && s.painelMobile]}>
          {!mobile && (
            <View style={[s.menuLateral, medio && s.menuLateralMedio]}>
              {menuConta}
            </View>
          )}

          <View
            style={[
              s.principal,
              medio && s.principalMedio,
              mobile && s.principalMobile,
            ]}
          >
            <CabecalhoPagina mobile={mobile} />

            {/* Chips + busca (lado a lado no site, empilhados no celular) */}
            <View style={[s.filtros, mobile && s.filtrosMobile]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[s.chips, mobile && s.sangriaConteudo]}
                style={[s.chipsScroll, mobile && s.sangria]}
              >
                {FILTROS.map((item) => {
                  const ativo = filtro === item.chave;
                  return (
                    <Pressable
                      key={item.chave}
                      onPress={() => setFiltro(item.chave)}
                      style={({ pressed }) => [s.chip, ativo && s.chipAtivo, pressed && s.pressionado]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativo }}
                    >
                      <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>{item.texto}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
                <Ionicons name="search-outline" size={18} color={DOURADO} />
                <TextInput
                  style={s.inputBusca}
                  placeholder="Buscar por planta ou profissional"
                  placeholderTextColor="#777b83"
                  selectionColor={DOURADO}
                  value={busca}
                  onChangeText={setBusca}
                  returnKeyType="search"
                  autoCorrect={false}
                  accessibilityLabel="Buscar por pedido ou profissional"
                />
                {!!busca && (
                  <Pressable
                    onPress={() => setBusca('')}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Limpar busca"
                  >
                    <Ionicons name="close-circle" size={18} color="#777b83" />
                  </Pressable>
                )}
              </View>
            </View>

            {carregandoPedidos ? (
              <Text style={s.textoVazio}>Carregando plantas adquiridas...</Text>
            ) : erroPedidos ? (
              <Text style={s.textoVazio}>Não foi possível carregar as plantas: {erroPedidos}</Text>
            ) : visiveis.length === 0 ? (
              <SemPedidos onExplorar={() => navegar('/planta')} />
            ) : (
              <>
                <View style={s.lista}>
                  {daPagina.map((pedido) => (
                    <CardPedido
                      key={pedido.id}
                      pedido={pedido}
                      mobile={mobile}
                      linha={linha}
                      onDetalhes={() => abrirDetalhes(pedido)}
                    />
                  ))}
                </View>

                <Paginacao atual={paginaAtual} total={totalPaginas} onMudar={mudarPagina} />
              </>
            )}
          </View>
        </View>

        <Rodape mobile={mobile} insets={insets} />
      </ScrollView>

      {mobile && (
        <Drawer
          aberto={menuAberto}
          deslize={deslize}
          fade={fade}
          insets={insets}
          paisagem={paisagem}
          onFechar={() => setMenuAberto(false)}
          onNavegar={navegar}
        >
          {menuConta}
        </Drawer>
      )}
    </ImageBackground>
  );
}

/* ================================================= */
/* ESTILOS                                           */
/* ================================================= */

const s = StyleSheet.create({
  /* ----- Base ----- */
  fundo: { flex: 1, backgroundColor: '#090909' },
  sombra: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  conteudo: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  // Faz os chips irem até a borda da tela no celular (o painel tem padding 16)
  sangria: { marginHorizontal: -16 },
  sangriaConteudo: { paddingHorizontal: 16 },

  /* ----- Topo ----- */
  topo: {
    minHeight: 76,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 25,
    backgroundColor: 'rgba(9, 9, 9, 0.96)',
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  topoMedio: { minHeight: 56, paddingHorizontal: 16 },
  topoMobile: {
    minHeight: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderColor: '#3a3220',
  },
  botaoHamburguer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#6e572b',
    borderRadius: 10,
  },
  avatarTopo: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 21,
  },
  logo: { width: 110, height: 62 },
  logoMedio: { width: 80, height: 44 },
  logoMobile: { width: 90, height: 48 },
  linksTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 30 },
  linkTopo: { color: '#fff', fontSize: 13 },

  /* ----- Painel ----- */
  painel: {
    width: '96%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 28,
    marginBottom: 90,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  painelMedio: { marginTop: 12, marginBottom: 30 },
  painelMobile: {
    ...ALTURA_AUTO,
    width: '100%',
    flexDirection: 'column',
    marginTop: 0,
    marginBottom: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },

  /* ----- Menu lateral ----- */
  menuLateral: {
    width: 180,
    padding: 3,
    backgroundColor: '#101010',
    borderRightWidth: 1,
    borderColor: '#333',
  },
  menuLateralMedio: { width: 150 },
  itemMenu: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  textoMenu: { flexShrink: 1, color: '#fff', fontSize: 15 },

  /* ----- Drawer ----- */
  camadaDrawer: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  areaFechar: { flex: 1 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: LARGURA_DRAWER,
    backgroundColor: '#101010',
    borderRightWidth: 1,
    borderColor: '#333',
  },
  drawerTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  drawerUsuario: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawerTitulo: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  drawerSub: { marginTop: 1, color: '#aaa', fontSize: 12 },
  drawerLista: { padding: 12, gap: 6 },
  drawerSecao: { marginLeft: 4, marginBottom: 2, color: '#777', fontSize: 11, letterSpacing: 1 },
  drawerSecaoSeparada: { marginTop: 14 },

  /* ----- Conteúdo principal ----- */
  principal: { flex: 1, minWidth: 0, padding: 12, gap: 14 },
  principalMedio: { padding: 10 },
  principalMobile: { ...ALTURA_AUTO, padding: 16, gap: 14 },

  /* ----- Cabeçalho ----- */
  cabecalho: {
    marginTop: 14,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  cabecalhoMobile: { ...ALTURA_AUTO, marginTop: 0, paddingBottom: 12 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  tituloMobile: { fontSize: 26 },
  subtitulo: { color: '#eee', fontSize: 12 },
  subtituloMobile: { marginTop: 2, color: '#bbb', fontSize: 14 },

  /* ----- Filtros + busca ----- */
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filtrosMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch' },
  chipsScroll: { flexGrow: 0 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  chipAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  campoBusca: {
    width: 340,
    maxWidth: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 22,
  },
  campoBuscaMobile: { width: '100%', height: 48, borderRadius: 24 },
  inputBusca: {
    flex: 1,
    height: '100%',
    color: '#eee',
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  /* ----- Lista de pedidos ----- */
  lista: { gap: 12 },

  pedido: {
    gap: 12,
    padding: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  pedidoMobile: {
    ...ALTURA_AUTO,
    padding: 16,
    backgroundColor: 'rgba(23, 23, 23, 0.95)',
    borderRadius: 14,
  },

  // Tela larga: ícone | info | pedido em | valor | status | botão
  linhaPedido: { flexDirection: 'row', alignItems: 'center', gap: 18 },

  topoCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  iconePedido: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 12,
  },

  principalPedido: { flex: 1, minWidth: 0, gap: 2 },
  tituloPedido: { color: '#fff', fontSize: 15, fontWeight: '500' },
  tituloPedidoMobile: { fontSize: 16 },
  nomeProfissional: { color: '#d5d6da', fontSize: 13 },
  nomeProfissionalMobile: { fontSize: 14 },
  funcao: { color: '#999', fontSize: 11 },

  meta: { flexDirection: 'row', gap: 10 },
  detalhe: { gap: 4, minWidth: 100 },
  rotuloDetalhe: { color: '#999', fontSize: 11 },
  valorDetalhe: { color: '#fff', fontSize: 13 },
  valorDetalheMobile: { fontSize: 15, fontWeight: '600' },

  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 29,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  pontoStatus: { width: 8, height: 8, borderRadius: 4 },
  textoStatus: { fontSize: 12 },

  botaoDetalhes: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  botaoDetalhesLinha: { width: 120 },
  botaoDetalhesMobile: { minHeight: 46, borderRadius: 10 },
  textoDetalhes: { color: DOURADO, fontSize: 13 },
  textoDetalhesMobile: { fontSize: 14, fontWeight: '600' },

  /* ----- Paginação ----- */
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pagina: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 20,
  },
  paginaSelecionada: { backgroundColor: DOURADO },
  paginaDesativada: { opacity: 0.35 },
  seta: { borderColor: '#343940' },
  textoPagina: { color: '#c4c6cb', fontSize: 13 },
  textoPaginaSelecionada: { color: '#111', fontWeight: 'bold' },

  /* ----- Sem pedidos ----- */
  vazio: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  tituloVazio: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  textoVazio: { color: '#999', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 360 },
  btnPrincipal: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  textoPrincipal: { color: '#111', fontSize: 14, fontWeight: '600' },

  /* ----- Rodapé ----- */
  rodape: {
    minHeight: 55,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 15,
    paddingHorizontal: 25,
    backgroundColor: '#090909',
    borderTopWidth: 1,
    borderColor: DOURADO,
  },
  rodapeMobile: { flexDirection: 'column', justifyContent: 'center', paddingHorizontal: 16 },
  textoRodape: { color: '#aaa', fontSize: 11, textAlign: 'center' },
  termos: { color: DOURADO, fontSize: 11 },
});