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
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeclararConta } from '../components/ContaProvider';
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

// Mesmos filtros do web
const CHIPS = [
  { chave: 'todos', texto: 'Todos' },
  { chave: 'Residencial', texto: 'Residenciais' },
  { chave: 'Comercial', texto: 'Comerciais' },
  { chave: 'Reforma', texto: 'Reformas' },
];

// Mesmas opções do <select> do web
const ORDENS = [
  { chave: 'recentes', texto: 'Mais recentes' },
  { chave: 'valor', texto: 'Maior valor' },
  { chave: 'nota', texto: 'Melhor avaliados' },
  { chave: 'nome', texto: 'Nome (A-Z)' },
];

const PROJETOS_INICIAIS = [
  { id: '1', nome: 'Casa Moderna', tipo: 'Residencial', profissional: 'Carlos Silva', area: 180, valor: 420000, nota: 4.8, data: '2025-06-10' },
  { id: '2', nome: 'Casa de Campo', tipo: 'Residencial', profissional: 'Fernanda Lima', area: 240, valor: 560000, nota: 4.6, data: '2025-05-22' },
  { id: '3', nome: 'Loja Conceito', tipo: 'Comercial', profissional: 'Rafael Costa', area: 90, valor: 310000, nota: 4.9, data: '2025-05-14' },
  { id: '4', nome: 'Sobrado Minimalista', tipo: 'Residencial', profissional: 'Fernanda Lima', area: 150, valor: 380000, nota: null, data: '2025-04-30' },
  { id: '5', nome: 'Reforma de Apartamento', tipo: 'Reforma', profissional: 'Juliana Martins', area: 85, valor: 95000, nota: 4.5, data: '2025-04-12' },
  { id: '6', nome: 'Escritório Corporativo', tipo: 'Comercial', profissional: 'Lucas Pereira', area: 320, valor: 780000, nota: 4.7, data: '2025-03-28' },
];

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const formatarValor = (n) => {
  const [inteiro, decimal] = n.toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
};

const formatarNota = (n) => n.toFixed(1).replace('.', ',');

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const ordenar = (lista, ordem) => {
  const copia = [...lista];
  if (ordem === 'valor') return copia.sort((a, b) => b.valor - a.valor);
  if (ordem === 'nota') return copia.sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));
  if (ordem === 'nome') return copia.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return copia.sort((a, b) => b.data.localeCompare(a.data));
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

function CabecalhoPagina({ mobile, total }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <View style={s.titulos}>
        <Text style={[s.titulo, mobile && s.tituloMobile]}>Meus Projetos Favoritos</Text>
        <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
          Visualize e gerencie os projetos que você favoritou.
        </Text>
      </View>

      <View style={s.badgeTotal}>
        <Ionicons name="heart" size={14} color={DOURADO} />
        <Text style={s.textoBadge}>{total}</Text>
      </View>
    </View>
  );
}

function CardResumo({ icone, rotulo, valor, mobile }) {
  return (
    <View
      style={[s.cardResumo, mobile && s.cardResumoMobile]}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <View style={s.iconeCirculo}>
        <Ionicons name={icone} size={16} color={DOURADO} />
      </View>
      <View style={s.textosResumo}>
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
    </View>
  );
}

function Resumo({ resumo, mobile }) {
  const cards = (
    <>
      <CardResumo icone="heart-outline" rotulo="Total de favoritos" valor={String(resumo.total)} mobile={mobile} />
      <CardResumo icone="home-outline" rotulo="Residenciais" valor={String(resumo.residenciais)} mobile={mobile} />
      <CardResumo icone="business-outline" rotulo="Comerciais" valor={String(resumo.comerciais)} mobile={mobile} />
      <CardResumo icone="cash-outline" rotulo="Valor médio" valor={formatarValor(resumo.valorMedio)} mobile={mobile} />
    </>
  );

  // Celular: carrossel horizontal (economiza altura)
  if (mobile) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.resumoCarrossel, s.sangriaConteudo]}
        style={[s.resumoScroll, s.sangria]}
      >
        {cards}
      </ScrollView>
    );
  }

  return <View style={s.resumo}>{cards}</View>;
}

function CardProjeto({ projeto, mobile, medio, onVer, onRemover }) {
  return (
    <View style={[s.card, medio && s.cardMedio, mobile && s.cardMobile]}>
      {/* Capa com coração */}
      <View style={[s.thumb, mobile && s.thumbMobile]}>
        {projeto.imagem ? (
          <Image source={projeto.imagem} style={s.imagemThumb} resizeMode="cover" />
        ) : (
          <Ionicons name="home-outline" size={54} color={DOURADO} style={s.iconeThumb} />
        )}

        <Pressable
          onPress={onRemover}
          style={({ pressed }) => [s.btnCoracao, pressed && s.pressionado]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${projeto.nome} dos favoritos`}
        >
          <Ionicons name="heart" size={20} color={DOURADO} />
        </Pressable>
      </View>

      {/* Nome, profissional e tipo */}
      <View style={s.corpo}>
        <Text style={[s.nome, mobile && s.nomeMobile]} numberOfLines={2}>
          {projeto.nome}
        </Text>

        <View style={s.linhaProfissional}>
          <Ionicons name="person-outline" size={14} color="#aaa" />
          <Text style={s.profissional} numberOfLines={1}>
            {projeto.profissional}
          </Text>
        </View>

        <View style={s.tag}>
          <Text style={s.textoTag}>{projeto.tipo}</Text>
        </View>
      </View>

      {/* Área + valor */}
      <View style={s.meta}>
        <View style={s.metaItem}>
          <View style={s.metaRotuloLinha}>
            <Ionicons name="resize-outline" size={13} color="#aaa" />
            <Text style={s.metaRotulo}>Área</Text>
          </View>
          <Text style={[s.metaValor, mobile && s.metaValorMobile]}>{projeto.area} m²</Text>
        </View>

        <View style={s.metaDivisor} />

        <View style={s.metaItem}>
          <View style={s.metaRotuloLinha}>
            <Ionicons name="cash-outline" size={13} color="#aaa" />
            <Text style={s.metaRotulo}>Valor</Text>
          </View>
          <Text style={[s.metaValor, mobile && s.metaValorMobile]}>
            {formatarValor(projeto.valor)}
          </Text>
        </View>
      </View>

      {/* Nota + ver detalhes */}
      <View style={s.rodapeCard}>
        <View style={s.nota}>
          <Ionicons
            name={projeto.nota != null ? 'star' : 'star-outline'}
            size={15}
            color={projeto.nota != null ? DOURADO : '#777'}
          />
          <Text style={[s.textoNota, projeto.nota == null && s.textoSemNota]}>
            {projeto.nota != null ? formatarNota(projeto.nota) : 'Sem avaliação'}
          </Text>
        </View>

        <Pressable
          onPress={onVer}
          style={({ pressed }) => [s.btnDetalhes, mobile && s.btnDetalhesMobile, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes de ${projeto.nome}`}
        >
          <Text style={[s.textoDetalhes, mobile && s.textoDetalhesMobile]}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={14} color={DOURADO} />
        </Pressable>
      </View>
    </View>
  );
}

function Vazio({ icone, titulo, texto, acao, onAcao, acaoSecundaria, onAcaoSecundaria }) {
  return (
    <View style={s.vazio}>
      <View style={s.vazioIcone}>
        <Ionicons name={icone} size={28} color={DOURADO} />
      </View>
      <Text style={s.tituloVazio}>{titulo}</Text>
      {!!texto && <Text style={s.textoVazio}>{texto}</Text>}

      <View style={s.acoesVazio}>
        {!!acaoSecundaria && (
          <Pressable
            onPress={onAcaoSecundaria}
            style={({ pressed }) => [s.btnSecundario, pressed && s.pressionado]}
            accessibilityRole="button"
          >
            <Text style={s.textoSecundario}>{acaoSecundaria}</Text>
          </Pressable>
        )}
        {!!acao && (
          <Pressable
            onPress={onAcao}
            style={({ pressed }) => [s.btnPrincipal, pressed && s.pressionado]}
            accessibilityRole="button"
          >
            <Text style={s.textoPrincipal}>{acao}</Text>
          </Pressable>
        )}
      </View>
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

export default function MeusProjetos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('usuario');
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

  /* ----- Puxar para atualizar ----- */
  const [atualizando, setAtualizando] = useState(false);

  const atualizar = useCallback(() => {
    setAtualizando(true);
    // Troque pela chamada real à API quando existir
    setTimeout(() => setAtualizando(false), 800);
  }, []);

  /* ----- Favoritos ----- */
  const [favoritos, setFavoritos] = useState(PROJETOS_INICIAIS);
  const [tipo, setTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [indiceOrdem, setIndiceOrdem] = useState(0);
  const [removido, setRemovido] = useState(null);
  const ordem = ORDENS[indiceOrdem];

  // Some o aviso de "desfazer" depois de 6 segundos
  useEffect(() => {
    if (!removido) return undefined;
    const t = setTimeout(() => setRemovido(null), 6000);
    return () => clearTimeout(t);
  }, [removido]);

  // O resumo acompanha os favoritos (muda ao remover/desfazer)
  const resumo = useMemo(() => {
    const total = favoritos.length;
    const soma = favoritos.reduce((acc, p) => acc + p.valor, 0);
    return {
      total,
      residenciais: favoritos.filter((p) => p.tipo === 'Residencial').length,
      comerciais: favoritos.filter((p) => p.tipo === 'Comercial').length,
      reformas: favoritos.filter((p) => p.tipo === 'Reforma').length,
      valorMedio: total ? soma / total : 0,
    };
  }, [favoritos]);

  const contagens = {
    todos: resumo.total,
    Residencial: resumo.residenciais,
    Comercial: resumo.comerciais,
    Reforma: resumo.reformas,
  };

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtrados = favoritos.filter(
      (p) =>
        (tipo === 'todos' || p.tipo === tipo) &&
        (!termo ||
          normalizar(p.nome).includes(termo) ||
          normalizar(p.profissional).includes(termo))
    );

    return ordenar(filtrados, ordem.chave);
  }, [favoritos, tipo, busca, ordem]);

  const filtrosAtivos = tipo !== 'todos' || !!busca.trim();

  const limparFiltros = () => {
    setTipo('todos');
    setBusca('');
  };

  const remover = (projeto) => {
    setRemovido({
      projeto,
      indice: favoritos.findIndex((p) => p.id === projeto.id),
    });
    setFavoritos((lista) => lista.filter((p) => p.id !== projeto.id));
  };

  const desfazer = () => {
    if (!removido) return;
    setFavoritos((lista) => {
      const copia = [...lista];
      copia.splice(Math.min(removido.indice, copia.length), 0, removido.projeto);
      return copia;
    });
    setRemovido(null);
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const abrirProjeto = (projeto) =>
    router.push({
      pathname: '/detalhesPlantas',
      params: { id: projeto.id },
    });

  const menuConta = (
    <ContaMenu tipo="usuario" aoSelecionar={() => setMenuAberto(false)} />
  );

  /* ----- Conteúdo ----- */
  const conteudo =
    favoritos.length === 0 ? (
      <Vazio
        icone="heart-outline"
        titulo="Nenhum projeto encontrado"
        texto="Explore as plantas e projetos e favorite os que mais combinam com você."
        acao="Explorar projetos"
        onAcao={() => navegar('/planta')}
      />
    ) : (
      <>
        <Resumo resumo={resumo} mobile={mobile} />

        {/* Filtros por tipo */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.chips, mobile && s.sangriaConteudo]}
          style={[s.chipsScroll, mobile && s.sangria]}
        >
          {CHIPS.map((chip) => {
            const ativo = tipo === chip.chave;
            return (
              <Pressable
                key={chip.chave}
                onPress={() => setTipo(chip.chave)}
                style={({ pressed }) => [s.chip, ativo && s.chipAtivo, pressed && s.pressionado]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>
                  {chip.texto} ({contagens[chip.chave]})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Busca + ordenação */}
        <View style={[s.controles, mobile && s.controlesMobile]}>
          <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
            <Ionicons name="search-outline" size={18} color={DOURADO} />
            <TextInput
              style={s.inputBusca}
              placeholder="Buscar por projeto ou profissional"
              placeholderTextColor="#777b83"
              selectionColor={DOURADO}
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Buscar por projeto ou profissional"
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

          <Pressable
            onPress={() => setIndiceOrdem((i) => (i + 1) % ORDENS.length)}
            style={({ pressed }) => [s.botaoOrdem, mobile && s.botaoOrdemMobile, pressed && s.pressionado]}
            accessibilityRole="button"
            accessibilityLabel={`Ordenação: ${ordem.texto}. Tocar para alternar`}
          >
            <Ionicons name="swap-vertical-outline" size={16} color={DOURADO} />
            <Text style={s.textoOrdem}>{ordem.texto}</Text>
          </Pressable>
        </View>

        {visiveis.length === 0 ? (
          <Vazio
            icone="folder-open-outline"
            titulo="Nenhum projeto encontrado"
            texto="Explore as plantas e projetos e favorite os que mais combinam com você."
            acao="Explorar projetos"
            onAcao={() => navegar('/planta')}
            acaoSecundaria={filtrosAtivos ? 'Limpar filtros' : undefined}
            onAcaoSecundaria={limparFiltros}
          />
        ) : (
          <>
            <Text style={s.contagem} accessibilityLiveRegion="polite">
              {visiveis.length === 1 ? '1 projeto' : `${visiveis.length} projetos`}
            </Text>

            <View style={[s.grade, mobile && s.gradeMobile]}>
              {visiveis.map((projeto) => (
                <CardProjeto
                  key={projeto.id}
                  projeto={projeto}
                  mobile={mobile}
                  medio={medio}
                  onVer={() => abrirProjeto(projeto)}
                  onRemover={() => remover(projeto)}
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
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            tintColor={DOURADO}
            colors={[DOURADO]}
            progressBackgroundColor="#1d1d1f"
          />
        }
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
            {removido.projeto.nome} removido dos favoritos
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

  // Faz o carrossel ir até a borda da tela no celular (o painel tem padding 16)
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

  /* ----- Resumo ----- */
  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resumoScroll: { flexGrow: 0 },
  resumoCarrossel: { gap: 10 },
  cardResumo: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardResumoMobile: {
    flexGrow: 0,
    flexBasis: 'auto',
    width: 168,
    minWidth: 0,
    borderRadius: 14,
  },
  textosResumo: { flex: 1, minWidth: 0, gap: 2 },
  rotuloResumo: { color: '#aaa', fontSize: 11 },
  valorResumo: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  iconeCirculo: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 17,
  },

  /* ----- Chips ----- */
  chipsScroll: { flexGrow: 0 },
  chips: { flexDirection: 'row', gap: 8 },
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

  /* ----- Busca / ordenação ----- */
  controles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlesMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },
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
  botaoOrdem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 24,
  },
  botaoOrdemMobile: { alignSelf: 'flex-start' },
  textoOrdem: { color: '#eee', fontSize: 13 },

  contagem: { color: '#aaa', fontSize: 12 },

  /* ----- Grade de projetos ----- */
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gradeMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap', gap: 14 },

  card: {
    flexBasis: '48.5%',
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  cardMedio: { flexBasis: '100%' },
  cardMobile: {
    ...ALTURA_AUTO,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderRadius: 16,
  },

  thumb: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1711',
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  thumbMobile: { height: 170 },
  imagemThumb: { width: '100%', height: '100%' },
  iconeThumb: { opacity: 0.7 },
  btnCoracao: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
  },

  corpo: { gap: 6, paddingTop: 14, paddingHorizontal: 16 },
  nome: { color: '#fff', fontSize: 16, fontWeight: '600' },
  nomeMobile: { fontSize: 17 },
  linhaProfissional: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profissional: { flex: 1, color: '#aaa', fontSize: 13 },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  textoTag: { color: DOURADO, fontSize: 12 },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  metaItem: { flex: 1, gap: 4, paddingHorizontal: 12 },
  metaRotuloLinha: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaRotulo: { color: '#aaa', fontSize: 11 },
  metaValor: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  metaValorMobile: { fontSize: 15 },
  metaDivisor: { width: 1, alignSelf: 'stretch', backgroundColor: '#353535' },

  rodapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 16,
  },
  nota: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textoNota: { color: DOURADO, fontSize: 13, fontWeight: '600' },
  textoSemNota: { color: '#777', fontWeight: 'normal' },
  btnDetalhes: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  btnDetalhesMobile: { minHeight: 46, borderRadius: 10, paddingHorizontal: 18 },
  textoDetalhes: { color: DOURADO, fontSize: 13 },
  textoDetalhesMobile: { fontSize: 14, fontWeight: '600' },

  /* ----- Estados vazios ----- */
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
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
  acoesVazio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  btnPrincipal: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: DOURADO,
    borderRadius: 10,
  },
  textoPrincipal: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  btnSecundario: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
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