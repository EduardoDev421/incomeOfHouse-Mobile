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
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeclararConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';
import { useConta } from '../components/ContaProvider';
import { getSupabaseClient } from '../services/supabase';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#d4a63a';
const DOURADO_CLARO = '#d4af6a';
const LARGURA_DRAWER = 290;
const GAP_GRADE = 18;
const LARGURA_MIN_CARD = 290;

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

const FILTROS_STATUS = [
  { chave: 'todos', texto: 'Todas' },
  { chave: 'publicada', texto: 'Publicadas' },
  { chave: 'rascunho', texto: 'Rascunhos' },
  { chave: 'inativa', texto: 'Inativas' },
];

const STATUS = {
  publicada: { texto: 'Publicada', cor: '#54db83' },
  rascunho: { texto: 'Rascunho', cor: '#f0ca61' },
  inativa: { texto: 'Inativa', cor: '#c3c6d4' },
};

const ORDENS = [
  { chave: 'recentes', texto: 'Mais recentes' },
  { chave: 'antigos', texto: 'Mais antigas' },
  { chave: 'valor', texto: 'Maior valor' },
  { chave: 'nome', texto: 'Nome (A-Z)' },
];

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const formatarMoeda = (n) =>
  `R$ ${Number(n || 0)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const plural = (n, singular, pluralTexto) => `${n} ${n === 1 ? singular : pluralTexto}`;

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

function Topo({ mobile, insets, onAbrirMenu, onNavegar }) {
  return (
    <View
      style={[
        s.topo,
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
        <Image source={LOGO} style={[s.logo, mobile && s.logoMobile]} resizeMode="contain" />
      </Pressable>

      {!mobile && (
        <View style={s.linksTopo} pointerEvents="box-none">
          {LINKS_SITE.map((link) => (
            <Pressable
              key={link.nome}
              onPress={() => onNavegar(link.rota)}
              style={({ pressed }) => [s.linkTopoBotao, pressed && s.linkTopoPressionado]}
            >
              <Text style={s.linkTopo}>{link.nome}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {mobile && (
        <Pressable
          onPress={() => onNavegar('/PerfilProfissional')}
          style={({ pressed }) => [s.avatarTopo, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel="Abrir meu perfil"
        >
          <Ionicons name="person-outline" size={20} color={DOURADO} />
        </Pressable>
      )}
    </View>
  );
}

function CabecalhoPagina({ mobile }) {
  return (
    <View style={s.cabecalho}>
      <Text style={[s.titulo, mobile && s.tituloMobile]}>Projetos</Text>
      <Text style={s.subtitulo}>Todas as plantas que você já publicou.</Text>
    </View>
  );
}

function CardResumo({ rotulo, valor, basis }) {
  return (
    <View
      style={[s.cardResumo, { flexBasis: basis }]}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <Text style={s.rotuloResumo} numberOfLines={1}>
        {rotulo}
      </Text>
      <Text
        style={s.valorResumo}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {valor}
      </Text>
    </View>
  );
}

/* Select em formato de botão; a lista abre em um modal (funciona em web e celular) */
function Seletor({ opcoes, valor, onChange, mobile, rotulo }) {
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((o) => o.chave === valor) || opcoes[0];

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        style={({ pressed }) => [
          s.seletor,
          mobile && s.seletorMobile,
          pressed && s.pressionado,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${atual.texto}`}
      >
        <Text style={s.textoSeletor} numberOfLines={1}>
          {atual.texto}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#eee" />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={s.modalFundo} onPress={() => setAberto(false)}>
          <View style={s.modalCaixa}>
            <Text style={s.modalTitulo}>{rotulo}</Text>
            {opcoes.map((o) => {
              const ativo = o.chave === valor;
              return (
                <Pressable
                  key={o.chave}
                  onPress={() => {
                    onChange(o.chave);
                    setAberto(false);
                  }}
                  style={({ pressed }) => [
                    s.modalOpcao,
                    ativo && s.modalOpcaoAtiva,
                    pressed && s.pressionado,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Text style={[s.modalTextoOpcao, ativo && s.modalTextoOpcaoAtiva]}>
                    {o.texto}
                  </Text>
                  {ativo && <Ionicons name="checkmark" size={18} color={DOURADO} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function CardProjeto({ projeto, largura, onAcessar, onRemover }) {
  const status = STATUS[projeto.status] || STATUS.rascunho;

  return (
    <View style={[s.card, { width: largura }]}>
      <View style={s.thumb}>
        {projeto.foto ? (
          <Image source={projeto.foto} style={s.fotoThumb} resizeMode="cover" />
        ) : (
          <Ionicons name="home-outline" size={54} color={DOURADO} style={s.iconeThumb} />
        )}

        <Pressable
          onPress={onRemover}
          style={({ pressed }) => [s.btnRemover, pressed && s.pressionado]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${projeto.nome}`}
        >
          <Ionicons name="trash-outline" size={18} color="#d0d0d0" />
        </Pressable>

        <View style={s.status}>
          <View style={[s.statusPonto, { backgroundColor: status.cor }]} />
          <Text style={[s.textoStatus, { color: status.cor }]}>{status.texto}</Text>
        </View>
      </View>

      <View style={s.corpo}>
        <Text style={s.nome} numberOfLines={2}>
          {projeto.nome}
        </Text>
        <Text style={s.descricao} numberOfLines={2}>
          {projeto.descricao}
        </Text>

        <View style={s.tag}>
          <Text style={s.textoTag}>{projeto.tipo}</Text>
        </View>

        <View style={s.meta}>
          <View style={s.metaItem}>
            <Text style={s.metaRotulo}>Quartos</Text>
            <Text style={s.metaValor}>{projeto.quartos}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaRotulo}>Vagas</Text>
            <Text style={s.metaValor}>{projeto.garagens}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaRotulo}>Área</Text>
            <Text style={s.metaValor}>{projeto.area} m²</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaRotulo}>Adicionado em</Text>
            <Text style={s.metaValor}>{formatarData(projeto.data)}</Text>
          </View>
        </View>

        <View style={s.rodapeCard}>
          <Text style={s.valorCard}>{formatarMoeda(projeto.valor)}</Text>
          <Pressable
            onPress={onAcessar}
            style={({ pressed }) => [s.btnDetalhes, pressed && s.pressionado]}
            accessibilityRole="button"
            accessibilityLabel={`Acessar projeto ${projeto.nome}`}
          >
            <Text style={s.textoDetalhes}>Acessar projeto</Text>
          </Pressable>
        </View>
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
          <Text style={primario ? s.textoBtnPrincipal : s.textoSecundario}>{acao}</Text>
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
        { paddingBottom: 20 + insets.bottom },
      ]}
    >
      <Text style={s.textoRodape}>©IncomeOfHouses. Todos os direitos reservados.</Text>
      <View style={s.rodapeLinks}>
        <Text style={s.linkRodape}>Termos de Uso</Text>
        <Text style={s.separadorRodape}>|</Text>
        <Text style={s.linkRodape}>Política de Privacidade</Text>
      </View>
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
              <Text style={s.drawerSub}>Profissional não identificado</Text>
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

export default function Projetos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('profissional');
  const { user } = useConta();
  const { width, height } = useWindowDimensions();

  // Breakpoints (iguais ao CSS da versão web: 850 / 1100)
  const mobile = width < 650;
  const medio = !mobile && width < 1100;
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

  /* ----- Projetos publicados no Supabase ----- */
  const [projetos, setProjetos] = useState([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);
  const [erroProjetos, setErroProjetos] = useState('');
  useFocusEffect(useCallback(() => {
    let ativo = true;
    async function carregarProjetos() {
      setCarregandoProjetos(true);
      setErroProjetos('');
      try {
        if (!user?.id) { if (ativo) setProjetos([]); return; }
        const { data, error } = await getSupabaseClient().from('plantas')
          .select('id,nome,descricao,categoria,ativa,preco,quartos,garagem,area,criado_em,imagem_url')
          .eq('profissional_id', user.id)
          .order('criado_em', { ascending: false });
        if (error) throw error;
        const lista = (data || []).map((item) => ({
          id: String(item.id),
          nome: item.nome || 'Planta sem título',
          descricao: item.descricao || 'Sem descrição cadastrada.',
          tipo: item.categoria || 'Outros',
          status: item.ativa ? 'publicada' : 'inativa',
          valor: Number(item.preco) || 0,
          quartos: Number(item.quartos) || 0,
          garagens: Number(item.garagem) || 0,
          area: Number(item.area) || 0,
          data: (item.criado_em || new Date().toISOString()).slice(0, 10),
          foto: item.imagem_url ? { uri: item.imagem_url } : null,
        }));
        if (ativo) setProjetos(lista);
      } catch (falha) {
        console.error('Erro ao carregar projetos do profissional:', falha);
        if (ativo) setErroProjetos(falha?.message || 'Não foi possível carregar seus projetos.');
      } finally { if (ativo) setCarregandoProjetos(false); }
    }
    carregarProjetos();
    return () => { ativo = false; };
  }, [user?.id]));
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [tipo, setTipo] = useState('todos');
  const [ordemChave, setOrdemChave] = useState('recentes');
  const [removido, setRemovido] = useState(null);

  // Some o aviso de "desfazer" depois de 6 segundos
  useEffect(() => {
    if (!removido) return undefined;
    const t = setTimeout(() => setRemovido(null), 6000);
    return () => clearTimeout(t);
  }, [removido]);

  const opcoesTipo = useMemo(() => {
    const unicos = [...new Set(projetos.map((p) => p.tipo))];
    return [
      { chave: 'todos', texto: 'Todos os tipos' },
      ...unicos.map((t) => ({ chave: t, texto: t })),
    ];
  }, [projetos]);

  // Se o tipo selecionado deixou de existir (ex.: removeu o último), volta para "todos"
  const tipoAtivo = opcoesTipo.some((t) => t.chave === tipo) ? tipo : 'todos';

  const resumo = useMemo(() => {
    const publicadas = projetos.filter((p) => p.status === 'publicada');
    return {
      total: projetos.length,
      publicadas: publicadas.length,
      rascunhos: projetos.filter((p) => p.status === 'rascunho').length,
      valor: publicadas.reduce((soma, p) => soma + (p.valor || 0), 0),
    };
  }, [projetos]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtrados = projetos.filter(
      (p) =>
        (statusFiltro === 'todos' || p.status === statusFiltro) &&
        (tipoAtivo === 'todos' || p.tipo === tipoAtivo) &&
        (!termo ||
          normalizar(p.nome).includes(termo) ||
          normalizar(p.descricao).includes(termo))
    );

    return [...filtrados].sort((a, b) => {
      switch (ordemChave) {
        case 'antigos':
          return a.data.localeCompare(b.data);
        case 'valor':
          return (b.valor || 0) - (a.valor || 0);
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR');
        default:
          return b.data.localeCompare(a.data);
      }
    });
  }, [projetos, busca, statusFiltro, tipoAtivo, ordemChave]);

  const filtrosAtivos = statusFiltro !== 'todos' || tipoAtivo !== 'todos' || !!busca.trim();

  const limparFiltros = () => {
    setStatusFiltro('todos');
    setTipo('todos');
    setBusca('');
  };

  const remover = async (projeto) => {
    try {
      const { error } = await getSupabaseClient().from('plantas')
        .update({ ativa: false }).eq('id', projeto.id)
        .eq('profissional_id', user.id);
      if (error) throw error;
      setRemovido({ projeto, indice: projetos.findIndex((p) => p.id === projeto.id) });
      setProjetos((lista) => lista.filter((p) => p.id !== projeto.id));
    } catch (falha) {
      console.error('Erro ao arquivar projeto:', falha);
      Alert.alert('Não foi possível excluir', falha?.message || 'Tente novamente.');
    }
  };

  const desfazer = async () => {
    if (!removido || !user?.id) return;
    try {
      const { error } = await getSupabaseClient().from('plantas')
        .update({ ativa: true }).eq('id', removido.projeto.id)
        .eq('profissional_id', user.id);
      if (error) throw error;
      setProjetos((lista) => {
        const copia = [...lista];
        copia.splice(Math.min(removido.indice, copia.length), 0, { ...removido.projeto, status: 'publicada' });
        return copia;
      });
      setRemovido(null);
    } catch (falha) {
      console.error('Erro ao restaurar projeto:', falha);
      Alert.alert('Não foi possível restaurar', falha?.message || 'Tente novamente.');
    }
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const acessarProjeto = (projeto) =>
    router.push({
      pathname: '/detalhesPlantas',
      params: { id: projeto.id },
    });

  const menuConta = (
    <ContaMenu tipo="profissional" aoSelecionar={() => setMenuAberto(false)} />
  );

  /* ----- Medidas da grade (auto-fill, mínimo de 290px por card) ----- */
  const larguraMenu = mobile ? 0 : medio ? 220 : 250;
  const paddingLateral = mobile ? 16 : 32;
  const larguraUtil = Math.max(width - larguraMenu - paddingLateral * 2 - (mobile ? 0 : 1), 0);
  const colunas = Math.max(1, Math.floor((larguraUtil + GAP_GRADE) / (LARGURA_MIN_CARD + GAP_GRADE)));
  const larguraCard = Math.floor((larguraUtil - GAP_GRADE * (colunas - 1)) / colunas);

  const basisResumo = mobile || medio ? '46%' : '22%';

  /* ----- Conteúdo ----- */
  const grade = carregandoProjetos ? (
    <Vazio icone="hourglass-outline" titulo="Carregando seus projetos..." />
  ) : erroProjetos ? (
    <Vazio icone="alert-circle-outline" titulo="Não foi possível carregar os projetos" texto={erroProjetos} />
  ) : projetos.length === 0 && !removido ? (
      <Vazio
        icone="grid-outline"
        titulo="Você ainda não tem nenhum projeto"
        texto="Publique uma planta para começar a montar a sua lista de projetos."
        acao="Publicar planta"
        onAcao={() => navegar('/publicarPlanta')}
        primario
      />
    ) : visiveis.length === 0 ? (
      <Vazio
        icone="folder-open-outline"
        titulo="Nenhum projeto encontrado"
        texto="Tente buscar por outro nome ou mudar o filtro."
        acao={filtrosAtivos ? 'Limpar filtros' : undefined}
        onAcao={limparFiltros}
      />
    ) : (
      <View style={s.grade}>
        {visiveis.map((projeto) => (
          <CardProjeto
            key={projeto.id}
            projeto={projeto}
            largura={larguraCard}
            onAcessar={() => acessarProjeto(projeto)}
            onRemover={() => remover(projeto)}
          />
        ))}
      </View>
    );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView
        style={s.rolagem}
        contentContainerStyle={s.conteudoScroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
      >
        <Topo
          mobile={mobile}
          insets={insets}
          onAbrirMenu={() => setMenuAberto(true)}
          onNavegar={navegar}
        />

        {/* Esta View cresce e empurra o rodapé para o fim da página */}
        <View style={[s.miolo, mobile && s.mioloMobile]}>
          {!mobile && (
            <View style={[s.menuLateral, { width: larguraMenu }]}>{menuConta}</View>
          )}

          <View style={[s.conteudo, mobile && s.conteudoMobile]}>
            <CabecalhoPagina mobile={mobile} />

            {/* Cards de resumo */}
            <View style={[s.resumo, mobile && s.resumoMobile]}>
              <CardResumo rotulo="Total de plantas" valor={String(resumo.total)} basis={basisResumo} />
              <CardResumo rotulo="Publicadas" valor={String(resumo.publicadas)} basis={basisResumo} />
              <CardResumo rotulo="Rascunhos" valor={String(resumo.rascunhos)} basis={basisResumo} />
              <CardResumo rotulo="Valor das publicadas" valor={formatarMoeda(resumo.valor)} basis={basisResumo} />
            </View>

            {/* Filtros */}
            <View style={[s.filtros, mobile && s.filtrosMobile]}>
              <View style={s.chips}>
                {FILTROS_STATUS.map((f) => {
                  const ativo = statusFiltro === f.chave;
                  return (
                    <Pressable
                      key={f.chave}
                      onPress={() => setStatusFiltro(f.chave)}
                      style={({ pressed }) => [
                        s.chip,
                        mobile && s.chipMobile,
                        ativo && s.chipAtivo,
                        pressed && s.pressionado,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativo }}
                    >
                      <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>{f.texto}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={[s.controles, mobile && s.controlesMobile]}>
                <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
                  <Ionicons name="search-outline" size={16} color={DOURADO} />
                  <TextInput
                    style={s.inputBusca}
                    placeholder="Buscar pelo nome da planta"
                    placeholderTextColor="#777b83"
                    selectionColor={DOURADO}
                    value={busca}
                    onChangeText={setBusca}
                    returnKeyType="search"
                    autoCorrect={false}
                    accessibilityLabel="Buscar pelo nome da planta"
                  />
                  {!!busca && (
                    <Pressable
                      onPress={() => setBusca('')}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel="Limpar busca"
                    >
                      <Ionicons name="close-circle" size={16} color="#777b83" />
                    </Pressable>
                  )}
                </View>

                <View style={[s.selects, mobile && s.selectsMobile]}>
                  <Seletor
                    rotulo="Filtrar por tipo"
                    opcoes={opcoesTipo}
                    valor={tipoAtivo}
                    onChange={setTipo}
                    mobile={mobile}
                  />
                  <Seletor
                    rotulo="Ordenar"
                    opcoes={ORDENS}
                    valor={ordemChave}
                    onChange={setOrdemChave}
                    mobile={mobile}
                  />
                </View>
              </View>
            </View>

            {projetos.length > 0 && (
              <Text style={s.contagem} accessibilityLiveRegion="polite">
                {plural(visiveis.length, 'planta', 'plantas')}
              </Text>
            )}

            {grade}
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
          <Ionicons name="trash-outline" size={18} color={DOURADO} />
          <Text style={s.textoToast} numberOfLines={2}>
            {removido.projeto.nome} removido
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
  fundo: { flex: 1, backgroundColor: '#0b0b0b' },
  sombra: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 7, 8, 0.86)' },
  rolagem: { flex: 1 },
  conteudoScroll: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  /* ----- Topo ----- */
  topo: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    backgroundColor: 'rgba(8, 8, 8, 0.95)',
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 166, 58, 0.25)',
  },
  topoMobile: {
    minHeight: 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  logo: { width: 64, height: 48 },
  logoMobile: { width: 58, height: 44 },
  // Links centralizados no cabeçalho, como na versão web
  linksTopo: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  linkTopoBotao: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 7 },
  linkTopoPressionado: { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  linkTopo: { color: '#fff', fontSize: 14, fontWeight: '500' },

  /* ----- Estrutura (menu lateral + conteúdo) ----- */
  miolo: { flexGrow: 1, flexDirection: 'row', alignItems: 'stretch' },
  mioloMobile: { flexDirection: 'column' },

  menuLateral: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#0d0d0e',
    borderRightWidth: 1,
    borderColor: '#252729',
  },

  conteudo: {
    flex: 1,
    minWidth: 0,
    gap: 18,
    paddingTop: 26,
    paddingHorizontal: 32,
    paddingBottom: 32,
    backgroundColor: 'rgba(17, 17, 17, 0.88)',
  },
  conteudoMobile: { ...ALTURA_AUTO, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 24 },

  /* ----- Item do drawer ----- */
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
    backgroundColor: '#0d0d0e',
    borderRightWidth: 1,
    borderColor: '#252729',
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

  /* ----- Cabeçalho da página ----- */
  cabecalho: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  tituloMobile: { fontSize: 26 },
  subtitulo: { marginTop: 5, color: '#999', fontSize: 13 },

  /* ----- Resumo ----- */
  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  resumoMobile: { gap: 10 },
  cardResumo: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  rotuloResumo: { color: '#999', fontSize: 13 },
  valorResumo: { color: DOURADO, fontSize: 22, fontWeight: 'bold' },

  /* ----- Filtros ----- */
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  filtrosMobile: { ...ALTURA_AUTO, flexDirection: 'column', alignItems: 'stretch', flexWrap: 'nowrap' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  chipMobile: { height: 40 },
  chipAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  controles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlesMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },

  campoBusca: {
    width: 260,
    maxWidth: '100%',
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  campoBuscaMobile: { width: '100%', height: 44 },
  inputBusca: {
    flex: 1,
    height: '100%',
    color: '#eee',
    fontSize: 13,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  selects: { flexDirection: 'row', gap: 8 },
  selectsMobile: { ...ALTURA_AUTO },
  seletor: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 10,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  seletorMobile: { flex: 1, height: 44 },
  textoSeletor: { flexShrink: 1, color: '#eee', fontSize: 13 },

  contagem: { color: '#999', fontSize: 13 },

  /* ----- Modal do seletor ----- */
  modalFundo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalCaixa: {
    width: '100%',
    maxWidth: 320,
    gap: 6,
    padding: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 12,
  },
  modalTitulo: { marginBottom: 4, marginLeft: 4, color: '#999', fontSize: 12 },
  modalOpcao: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  modalOpcaoAtiva: { backgroundColor: '#29231a', borderColor: '#59431f' },
  modalTextoOpcao: { color: '#eee', fontSize: 14 },
  modalTextoOpcaoAtiva: { color: DOURADO },

  /* ----- Grade de projetos ----- */
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP_GRADE },

  card: {
    overflow: 'hidden',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },

  thumb: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1913',
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  iconeThumb: { opacity: 0.7 },
  fotoThumb: { width: '100%', height: '100%' },
  btnRemover: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
  },
  status: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
    borderRadius: 20,
  },
  statusPonto: { width: 7, height: 7, borderRadius: 4 },
  textoStatus: { fontSize: 11 },

  corpo: { gap: 6, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 18 },
  nome: { color: '#fff', fontSize: 16, fontWeight: '500' },
  descricao: { color: '#999', fontSize: 13 },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 20,
  },
  textoTag: { color: DOURADO, fontSize: 11 },

  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    marginVertical: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  metaItem: { width: '50%', gap: 3 },
  metaRotulo: { color: '#999', fontSize: 11 },
  metaValor: { color: '#fff', fontSize: 13 },

  rodapeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  valorCard: { flexShrink: 1, color: DOURADO, fontSize: 13, fontWeight: '600' },
  btnDetalhes: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoDetalhes: { color: DOURADO, fontSize: 12 },

  /* ----- Estados vazios ----- */
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  vazioIcone: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 166, 58, 0.12)',
    borderRadius: 30,
  },
  tituloVazio: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  textoVazio: { color: '#999', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  btnPrincipal: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    backgroundColor: DOURADO,
    borderRadius: 10,
  },
  textoBtnPrincipal: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  btnSecundario: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 10,
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

  /* ----- Rodapé (igual ao da primeira imagem) ----- */
  rodape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 32,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderColor: DOURADO,
  },
  rodapeMobile: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  textoRodape: { color: '#888', fontSize: 12, textAlign: 'center' },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkRodape: { color: DOURADO_CLARO, fontSize: 12 },
  separadorRodape: { color: '#555', fontSize: 12 },
});