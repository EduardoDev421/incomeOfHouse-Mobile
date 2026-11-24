import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConta, useDeclararConta } from '../components/ContaProvider';
import { getSupabaseClient } from '../services/supabase';
import { listarProfissionais } from '../services/profissionais';
import ContaMenu from '../components/MenuConta';


/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const LARGURA_DRAWER = 290;

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

const FAVORITOS_INICIAIS = PROFISSIONAIS.map((profissional) => ({
  id: profissional.id,
  nome: profissional.nome,
  funcao: profissional.profissaoNome,
  especialidade: profissional.especialidade,
}));

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const iniciais = (nome) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

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

function CabecalhoPagina({ mobile, total }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <View style={s.titulos}>
        <Text style={[s.titulo, mobile && s.tituloMobile]}>
          Meus Profissionais Favoritos
        </Text>
        <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
          Encontre rapidamente os profissionais que você salvou.
        </Text>
      </View>

      <View style={s.badgeTotal}>
        <Ionicons name="heart" size={14} color={DOURADO} />
        <Text style={s.textoBadge}>{total}</Text>
      </View>
    </View>
  );
}

function CardProfissional({ profissional, mobile, medio, onPerfil, onMensagem, onRemover }) {
  return (
    <View style={[s.card, medio && s.cardMedio, mobile && s.cardMobile]}>
      <View style={s.topoCard}>
        <View style={[s.avatar, mobile && s.avatarMobile]}>
          {profissional.foto ? (
            <Image source={profissional.foto} style={s.foto} resizeMode="cover" />
          ) : (
            <Text style={s.iniciais}>{iniciais(profissional.nome)}</Text>
          )}
        </View>

        <View style={s.dados}>
          <Text style={[s.nome, mobile && s.nomeMobile]} numberOfLines={1}>
            {profissional.nome}
          </Text>
          <View style={s.tag}>
            <Text style={s.textoTag} numberOfLines={1}>
              {profissional.funcao}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onRemover}
          style={({ pressed }) => [s.btnCoracao, pressed && s.pressionado]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${profissional.nome} dos favoritos`}
        >
          <Ionicons name="heart" size={20} color={DOURADO} />
        </Pressable>
      </View>

      {!!profissional.especialidade && (
        <View style={s.linhaEspecialidade}>
          <Ionicons name="briefcase-outline" size={14} color={DOURADO} />
          <Text style={[s.especialidade, mobile && s.especialidadeMobile]} numberOfLines={2}>
            {profissional.especialidade}
          </Text>
        </View>
      )}

      <View style={s.acoes}>
        <Pressable
          onPress={onPerfil}
          style={({ pressed }) => [s.btnPerfil, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${profissional.nome}`}
        >
          <Text style={s.textoPerfil}>Ver perfil</Text>
          <Ionicons name="chevron-forward" size={15} color="#111" />
        </Pressable>

        <Pressable
          onPress={onMensagem}
          style={({ pressed }) => [s.btnMensagem, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Enviar mensagem para ${profissional.nome}`}
        >
          <Ionicons name="chatbubble-outline" size={18} color={DOURADO} />
        </Pressable>
      </View>
    </View>
  );
}

function Vazio({ icone, titulo, texto, acao, onAcao, primario }) {
  return (
    <View style={s.vazio}>
      <View style={s.vazioIcone}>
        <Ionicons name={icone} size={28} color={DOURADO} />
      </View>
      <Text style={s.tituloVazio}>{titulo}</Text>
      {!!texto && <Text style={s.textoVazio}>{texto}</Text>}
      {!!acao && (
        <Pressable
          onPress={onAcao}
          style={({ pressed }) => [
            primario ? s.btnPrincipal : s.btnSecundario,
            pressed && s.pressionado,
          ]}
          accessibilityRole="button"
        >
          <Text style={primario ? s.textoPrincipal : s.textoSecundario}>{acao}</Text>
        </Pressable>
      )}
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

export default function Meusprofissionais() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('usuario');
  const { user } = useConta();
  const { width, height } = useWindowDimensions();

  // Mesmos breakpoints do PerfilUsuario
  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  const paisagem = height < 500;

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

  /* ----- Favoritos ----- */
  const [favoritos, setFavoritos] = useState([]);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(true);
  const [erroFavoritos, setErroFavoritos] = useState('');
  const [busca, setBusca] = useState('');
  const [funcao, setFuncao] = useState('todas');
  const [removido, setRemovido] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregarFavoritos() {
      setCarregandoFavoritos(true);
      setErroFavoritos('');
      try {
        if (!user?.id) { if (ativo) setFavoritos([]); return; }
        const { data: salvos, error } = await getSupabaseClient()
          .from('profissionais_favoritos').select('profissional_id')
          .eq('usuario_id', user.id);
        if (error) throw error;
        const ids = (salvos || []).map((item) => String(item.profissional_id));
        if (!ids.length) { if (ativo) setFavoritos([]); return; }
        const todos = await listarProfissionais();
        const mapa = new Map(todos.map((item) => [String(item.id), item]));
        if (ativo) setFavoritos(ids.map((id) => mapa.get(id)).filter(Boolean).map((p) => ({
          id: String(p.id), nome: p.nome, funcao: p.profissaoNome || p.profissao || 'Profissional',
          especialidade: p.especialidade || '', foto: null,
        })));
      } catch (falha) {
        console.error('Erro ao carregar profissionais favoritos:', falha);
        if (ativo) setErroFavoritos(falha?.message || 'Não foi possível carregar seus profissionais favoritos.');
      } finally { if (ativo) setCarregandoFavoritos(false); }
    }
    carregarFavoritos();
    return () => { ativo = false; };
  }, [user?.id]);

  // Some o aviso de "desfazer" depois de 6 segundos
  useEffect(() => {
    if (!removido) return undefined;
    const t = setTimeout(() => setRemovido(null), 6000);
    return () => clearTimeout(t);
  }, [removido]);

  // Filtros por profissão, montados a partir dos favoritos atuais
  const funcoes = useMemo(
    () => [...new Set(favoritos.map((p) => p.funcao))],
    [favoritos]
  );

  // Se a profissão selecionada deixou de existir (ex.: removeu o último), volta para "todas"
  useEffect(() => {
    if (funcao !== 'todas' && !funcoes.includes(funcao)) setFuncao('todas');
  }, [funcoes, funcao]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());

    return favoritos.filter(
      (p) =>
        (funcao === 'todas' || p.funcao === funcao) &&
        (!termo ||
          normalizar(p.nome).includes(termo) ||
          normalizar(p.funcao).includes(termo) ||
          normalizar(p.especialidade).includes(termo))
    );
  }, [favoritos, busca, funcao]);

  const filtrosAtivos = funcao !== 'todas' || !!busca.trim();

  const limparFiltros = () => {
    setFuncao('todas');
    setBusca('');
  };

  const remover = async (profissional) => {
    try {
      const { error } = await getSupabaseClient().from('profissionais_favoritos')
        .delete().eq('usuario_id', user.id).eq('profissional_id', profissional.id);
      if (error) throw error;
      setFavoritos((lista) => lista.filter((p) => p.id !== profissional.id));
      setRemovido({ profissional });
    } catch (falha) {
      console.error('Erro ao remover profissional favorito:', falha);
      setErroFavoritos(falha?.message || 'Não foi possível remover este favorito.');
    }
  };

  const desfazer = async () => {
    if (!removido?.profissional || !user?.id) return;
    try {
      const { error } = await getSupabaseClient().from('profissionais_favoritos')
        .insert({ usuario_id: user.id, profissional_id: removido.profissional.id });
      if (error) throw error;
      setFavoritos((lista) => [...lista, removido.profissional]);
      setRemovido(null);
    } catch (falha) {
      console.error('Erro ao restaurar profissional favorito:', falha);
      setErroFavoritos(falha?.message || 'Não foi possível restaurar o favorito.');
    }
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const abrirPerfil = (profissional) =>
    router.push({
      pathname: '/detalhesProfissionais',
      params: { id: profissional.id },
    });

  const menuConta = (
    <ContaMenu tipo="usuario" aoSelecionar={() => setMenuAberto(false)} />
  );

  /* ----- Conteúdo ----- */
  const conteudo = carregandoFavoritos ? (
    <Vazio icone="heart-outline" titulo="Carregando favoritos..." />
  ) : erroFavoritos ? (
    <Vazio icone="alert-circle-outline" titulo="Não foi possível carregar os favoritos" texto={erroFavoritos} acao="Tentar novamente" onAcao={() => { setCarregandoFavoritos(true); setErroFavoritos(''); }} />
  ) : favoritos.length === 0 && !removido ? (
      <Vazio
        icone="heart-outline"
        titulo="Você ainda não favoritou nenhum profissional"
        texto="Explore os profissionais e favorite os que mais combinam com o seu projeto."
        acao="Encontrar profissionais"
        onAcao={() => navegar('/profissionais')}
        primario
      />
    ) : (
      <>
        <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
          <Ionicons name="search-outline" size={18} color={DOURADO} />
          <TextInput
            style={s.inputBusca}
            placeholder="Buscar por nome ou profissão"
            placeholderTextColor="#777b83"
            selectionColor={DOURADO}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Buscar por nome ou profissão"
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

        {funcoes.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
            style={s.chipsScroll}
          >
            {['todas', ...funcoes].map((item) => {
              const ativo = funcao === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFuncao(item)}
                  style={({ pressed }) => [s.chip, ativo && s.chipAtivo, pressed && s.pressionado]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>
                    {item === 'todas' ? 'Todos' : item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {visiveis.length === 0 ? (
          favoritos.length === 0 ? null : (
            <Vazio
              icone="search-outline"
              titulo="Nenhum profissional encontrado"
              texto="Tente buscar por outro nome ou profissão."
              acao={filtrosAtivos ? 'Limpar filtros' : undefined}
              onAcao={limparFiltros}
            />
          )
        ) : (
          <>
            <Text style={s.contagem} accessibilityLiveRegion="polite">
              {visiveis.length === 1 ? '1 profissional' : `${visiveis.length} profissionais`}
            </Text>

            <View style={[s.grade, mobile && s.gradeMobile]}>
              {visiveis.map((profissional) => (
                <CardProfissional
                  key={profissional.id}
                  profissional={profissional}
                  mobile={mobile}
                  medio={medio}
                  onPerfil={() => abrirPerfil(profissional)}
                  onMensagem={() => navegar('/MensagensU')}
                  onRemover={() => remover(profissional)}
                />
              ))}
            </View>
          </>
        )}
      </>
    );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView
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
            <CabecalhoPagina mobile={mobile} total={favoritos.length} />
            {conteudo}
          </View>
        </View>

        <Rodape mobile={mobile} insets={insets} />
      </ScrollView>

      {/* Aviso flutuante (estilo snackbar) */}
      {!!removido && (
        <View
          style={[s.toast, { bottom: 16 + insets.bottom }]}
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="heart-dislike-outline" size={18} color={DOURADO} />
          <Text style={s.textoToast} numberOfLines={2}>
            {removido.profissional.nome} removido dos favoritos
          </Text>
          <Pressable
            onPress={desfazer}
            hitSlop={10}
            accessibilityRole="button"
            style={({ pressed }) => pressed && s.pressionado}
          >
            <Text style={s.textoDesfazer}>Desfazer</Text>
          </Pressable>
        </View>
      )}

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
  principalMobile: { ...ALTURA_AUTO, padding: 16, gap: 16 },

  /* ----- Cabeçalho ----- */
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  cabecalhoMobile: { ...ALTURA_AUTO, marginTop: 0, paddingBottom: 12 },
  titulos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  tituloMobile: { fontSize: 24 },
  subtitulo: { color: '#eee', fontSize: 12 },
  subtituloMobile: { marginTop: 2, color: '#bbb', fontSize: 14 },
  badgeTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 16,
  },
  textoBadge: { color: DOURADO, fontSize: 13, fontWeight: 'bold' },

  /* ----- Busca ----- */
  campoBusca: {
    width: 360,
    maxWidth: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 24,
  },
  campoBuscaMobile: { width: '100%' },
  inputBusca: {
    flex: 1,
    height: '100%',
    color: '#eee',
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  /* ----- Chips de profissão (rolagem horizontal) ----- */
  chipsScroll: { flexGrow: 0 },
  chips: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  chipAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  contagem: { color: '#aaa', fontSize: 12 },

  /* ----- Cards ----- */
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gradeMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap', gap: 14 },

  card: {
    flexBasis: '48.5%',
    flexGrow: 0,
    flexShrink: 0,
    gap: 12,
    padding: 14,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  cardMedio: { flexBasis: '100%' },
  cardMobile: {
    ...ALTURA_AUTO,
    padding: 16,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderRadius: 16,
  },

  topoCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DOURADO,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarMobile: { width: 62, height: 62, borderRadius: 31 },
  foto: { width: '100%', height: '100%' },
  iniciais: { color: DOURADO, fontSize: 18, fontWeight: 'bold' },
  dados: { flex: 1, minWidth: 0, gap: 6 },
  nome: { color: '#fff', fontSize: 16, fontWeight: '600' },
  nomeMobile: { fontSize: 17 },
  tag: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  textoTag: { color: DOURADO, fontSize: 12 },

  btnCoracao: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
  },

  linhaEspecialidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#353535',
  },
  especialidade: { flex: 1, color: '#aaa', fontSize: 12 },
  especialidadeMobile: { fontSize: 14, lineHeight: 19 },

  acoes: { flexDirection: 'row', gap: 8 },
  btnPerfil: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    backgroundColor: DOURADO,
    borderRadius: 10,
  },
  textoPerfil: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  btnMensagem: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 10,
  },

  /* ----- Estados vazios ----- */
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  vazioIcone: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 30,
  },
  tituloVazio: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  textoVazio: { color: '#aaa', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  btnPrincipal: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  textoPrincipal: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  btnSecundario: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoSecundario: { color: DOURADO, fontSize: 14 },

  /* ----- Snackbar ----- */
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 480,
    alignSelf: 'center',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)' },
      default: { elevation: 8 },
    }),
  },
  textoToast: { flex: 1, color: '#eee', fontSize: 13 },
  textoDesfazer: {
    color: DOURADO,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

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