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
  Modal,
  KeyboardAvoidingView,
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
  { chave: 'todos', texto: 'Todas' },
  { chave: 'planta', texto: 'Plantas' },
  { chave: 'projeto', texto: 'Projetos' },
];

const OPCOES_NOTA = [
  { valor: 0, label: 'Todas as notas' },
  { valor: 5, label: '5 estrelas' },
  { valor: 4, label: '4 estrelas' },
  { valor: 3, label: '3 estrelas' },
  { valor: 2, label: '2 estrelas' },
  { valor: 1, label: '1 estrela' },
];

const OPCOES_ORDEM = [
  { valor: 'recentes', label: 'Mais recentes' },
  { valor: 'melhores', label: 'Maior nota' },
  { valor: 'piores', label: 'Menor nota' },
];

// Dados de exemplo: troque pelos dados reais da API
const AVALIACOES_INICIAIS = [
  { id: '1', tipo: 'planta', item: 'Casa moderna', autor: 'Ana Paula Ribeiro', nota: 5, texto: 'Planta excelente! Os ambientes são bem integrados e a distribuição aproveita muito bem a luz natural.', data: '2026-10-28', resposta: 'Muito obrigado, Ana! Fico feliz que tenha gostado do resultado.' },
  { id: '2', tipo: 'projeto', item: 'Reforma de Apartamento', autor: 'Marcos Lima', nota: 4, texto: 'Ótimo trabalho e bom atendimento. Só atrasou um pouco na entrega do projeto final.', data: '2026-10-22', resposta: null },
  { id: '3', tipo: 'planta', item: 'Casa de campo', autor: 'Juliana Reis', nota: 5, texto: 'Exatamente o que eu procurava para o terreno da família.', data: '2026-10-15', resposta: null },
  { id: '4', tipo: 'planta', item: 'Casa moderna', autor: 'Roberto Alves', nota: 3, texto: 'Boa planta, mas senti falta de mais detalhes sobre a parte elétrica.', data: '2026-10-09', resposta: 'Obrigado pelo retorno, Roberto! Posso enviar o detalhamento elétrico, é só me chamar.' },
  { id: '5', tipo: 'projeto', item: 'Escritório Corporativo', autor: 'Camila Torres', nota: 5, texto: 'Projeto muito bem pensado, equipe elogiou o layout.', data: '2026-09-30', resposta: null },
  { id: '6', tipo: 'planta', item: 'Casa minimalista', autor: 'Paulo Mendes', nota: 4, texto: 'Design limpo e moderno. Recomendo.', data: '2026-09-18', resposta: null },
  { id: '7', tipo: 'projeto', item: 'Reforma de Apartamento', autor: 'Fernanda Souza', nota: 2, texto: 'Esperava mais comunicação durante a obra.', data: '2026-09-05', resposta: null },
  { id: '8', tipo: 'planta', item: 'Casa de campo', autor: 'Lucas Ferreira', nota: 5, texto: 'Perfeita para o que queríamos: ampla e confortável.', data: '2026-08-21', resposta: null },
];

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const formatarNota = (n) => n.toFixed(1).replace('.', ',');

const iniciais = (nome) =>
  (nome || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?';

const textoTotal = (n) => (n === 1 ? '1 avaliação' : `${n} avaliações`);

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
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <Text style={[s.titulo, mobile && s.tituloMobile]}>Avaliações</Text>
      <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
        Veja o que os clientes acharam das plantas e dos projetos que você fez.
      </Text>
    </View>
  );
}

function Estrelas({ nota, tamanho = 16 }) {
  const cheias = Math.round(nota);

  return (
    <View
      style={s.estrelas}
      accessible
      accessibilityLabel={`${cheias} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name="star"
          size={tamanho}
          color={n <= cheias ? '#d4a63a' : '#3c4148'}
        />
      ))}
    </View>
  );
}

function PainelResumo({ avaliacoes, mobile }) {
  const total = avaliacoes.length;
  const media = total ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total : 0;

  const distribuicao = [5, 4, 3, 2, 1].map((n) => {
    const qtd = avaliacoes.filter((a) => a.nota === n).length;
    return { nota: n, qtd, pct: total ? (qtd / total) * 100 : 0 };
  });

  return (
    <View style={[s.painelResumo, mobile && s.painelResumoMobile]}>
      <View style={[s.media, mobile && s.mediaMobile]}>
        <Text style={s.mediaNota}>{formatarNota(media)}</Text>
        <Estrelas nota={media} tamanho={20} />
        <Text style={s.mediaTotal}>{textoTotal(total)}</Text>
      </View>

      <View style={s.distribuicao}>
        {distribuicao.map((linha) => (
          <View
            key={linha.nota}
            style={s.distLinha}
            accessible
            accessibilityLabel={`${linha.nota} estrelas: ${linha.qtd}`}
          >
            <View style={s.distRotulo}>
              <Text style={s.distTexto}>{linha.nota}</Text>
              <Ionicons name="star" size={12} color="#d4a63a" />
            </View>
            <View style={s.barra}>
              <View style={[s.barraPreenchida, { width: `${linha.pct}%` }]} />
            </View>
            <Text style={s.distQtd}>{linha.qtd}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Substitui o <select> do HTML
function Seletor({ titulo, valor, opcoes, aoMudar, estilo }) {
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((o) => o.valor === valor) || opcoes[0];

  return (
    <View style={estilo}>
      <Pressable
        style={({ pressed }) => [s.seletor, pressed && s.pressionado]}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${atual.label}`}
      >
        <Text style={s.seletorTexto} numberOfLines={1}>
          {atual.label}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#ffffff" />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={s.modalFundo} onPress={() => setAberto(false)}>
          <Pressable style={s.modalCaixa} onPress={() => {}}>
            <Text style={s.modalTitulo}>{titulo}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {opcoes.map((o) => (
                <Pressable
                  key={String(o.valor)}
                  style={[s.opcao, o.valor === valor && s.opcaoAtiva]}
                  onPress={() => {
                    aoMudar(o.valor);
                    setAberto(false);
                  }}
                >
                  <Text style={[s.opcaoTexto, o.valor === valor && s.opcaoTextoAtivo]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CardAvaliacao({
  avaliacao,
  mobile,
  respondendo,
  textoResposta,
  onTextoResposta,
  onResponder,
  onSalvar,
  onCancelar,
}) {
  const ehPlanta = avaliacao.tipo === 'planta';

  const lado = (
    <View style={[s.lado, mobile && s.ladoMobile]}>
      <Estrelas nota={avaliacao.nota} />
      <Text style={s.data}>{formatarData(avaliacao.data)}</Text>
    </View>
  );

  return (
    <View style={[s.avaliacao, mobile && s.avaliacaoMobile]}>
      <View style={[s.avatar, mobile && s.avatarMobile]}>
        <Text style={[s.avatarTexto, mobile && s.avatarTextoMobile]}>
          {iniciais(avaliacao.autor)}
        </Text>
      </View>

      <View style={s.corpo}>
        <View style={s.itemLinha}>
          <Text style={s.itemNome} numberOfLines={2}>
            {avaliacao.item}
          </Text>
          <View style={[s.tag, ehPlanta ? s.tagPlanta : s.tagProjeto]}>
            <Text style={[s.textoTag, ehPlanta ? s.textoTagPlanta : s.textoTagProjeto]}>
              {ehPlanta ? 'Planta' : 'Projeto'}
            </Text>
          </View>
        </View>

        <Text style={s.autor}>{avaliacao.autor}</Text>

        {mobile && lado}

        <Text style={s.texto}>{avaliacao.texto}</Text>

        {!!avaliacao.resposta && (
          <View style={s.resposta}>
            <Text style={s.respostaRotulo}>Sua resposta</Text>
            <Text style={s.respostaTexto}>{avaliacao.resposta}</Text>
          </View>
        )}

        {!avaliacao.resposta && !respondendo && (
          <Pressable
            onPress={onResponder}
            style={({ pressed }) => [s.btnResponder, pressed && s.pressionado]}
            accessibilityRole="button"
            accessibilityLabel={`Responder avaliação de ${avaliacao.autor}`}
          >
            <Text style={s.textoResponder}>Responder</Text>
          </Pressable>
        )}

        {respondendo && (
          <View style={s.formResposta}>
            <TextInput
              style={s.inputResposta}
              placeholder="Escreva sua resposta..."
              placeholderTextColor="#777b83"
              selectionColor={DOURADO}
              value={textoResposta}
              onChangeText={onTextoResposta}
              multiline
              textAlignVertical="top"
              autoFocus
              accessibilityLabel="Escreva sua resposta"
            />
            <View style={s.acoesResposta}>
              <Pressable
                onPress={onSalvar}
                disabled={!textoResposta.trim()}
                style={({ pressed }) => [
                  s.btnSalvar,
                  !textoResposta.trim() && s.btnDesativado,
                  pressed && s.pressionado,
                ]}
                accessibilityRole="button"
              >
                <Text style={s.textoSalvar}>Salvar</Text>
              </Pressable>
              <Pressable
                onPress={onCancelar}
                style={({ pressed }) => [s.btnCancelar, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoCancelar}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {!mobile && lado}
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

export default function Avaliacoes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('profissional');
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

  /* ----- Avaliações ----- */
  const [avaliacoes, setAvaliacoes] = useState(AVALIACOES_INICIAIS);
  const [tipo, setTipo] = useState('todos');
  const [item, setItem] = useState('todos');
  const [nota, setNota] = useState(0);
  const [ordem, setOrdem] = useState('recentes');
  const [respondendoId, setRespondendoId] = useState(null);
  const [textoResposta, setTextoResposta] = useState('');

  // Opções do filtro "planta ou projeto" (acompanham o chip selecionado)
  const opcoesItem = useMemo(() => {
    const doTipo = avaliacoes.filter((a) => tipo === 'todos' || a.tipo === tipo);
    const nomes = [...new Set(doTipo.map((a) => a.item))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
    const rotuloTodos =
      tipo === 'planta'
        ? 'Todas as plantas'
        : tipo === 'projeto'
        ? 'Todos os projetos'
        : 'Todas as plantas e projetos';

    return [{ valor: 'todos', label: rotuloTodos }, ...nomes.map((n) => ({ valor: n, label: n }))];
  }, [avaliacoes, tipo]);

  // Se o item selecionado deixou de existir (ex.: mudou o chip), volta para "todos"
  const itemAtivo = opcoesItem.some((o) => o.valor === item) ? item : 'todos';

  const visiveis = useMemo(() => {
    const filtradas = avaliacoes.filter(
      (a) =>
        (tipo === 'todos' || a.tipo === tipo) &&
        (itemAtivo === 'todos' || a.item === itemAtivo) &&
        (nota === 0 || a.nota === nota)
    );

    return [...filtradas].sort((a, b) => {
      if (ordem === 'melhores') return b.nota - a.nota || b.data.localeCompare(a.data);
      if (ordem === 'piores') return a.nota - b.nota || b.data.localeCompare(a.data);
      return b.data.localeCompare(a.data);
    });
  }, [avaliacoes, tipo, itemAtivo, nota, ordem]);

  const abrirResposta = (id) => {
    setRespondendoId(id);
    setTextoResposta('');
  };

  const cancelarResposta = () => {
    setRespondendoId(null);
    setTextoResposta('');
  };

  const salvarResposta = (id) => {
    const texto = textoResposta.trim();
    if (!texto) return;

    // TODO: enviar a resposta para o seu backend / banco de dados aqui.
    setAvaliacoes((lista) => lista.map((a) => (a.id === id ? { ...a, resposta: texto } : a)));
    cancelarResposta();
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const menuConta = (
    <ContaMenu tipo="profissional" aoSelecionar={() => setMenuAberto(false)} />
  );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <KeyboardAvoidingView
        style={s.teclado}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <CabecalhoPagina mobile={mobile} />

              <PainelResumo avaliacoes={avaliacoes} mobile={mobile} />

              {/* Chips por tipo */}
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
                      <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>{chip.texto}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Seletores: planta/projeto, nota e ordem */}
              <View style={[s.selects, mobile && s.selectsMobile]}>
                <Seletor
                  titulo="Filtrar por planta ou projeto"
                  valor={itemAtivo}
                  opcoes={opcoesItem}
                  aoMudar={setItem}
                  estilo={mobile ? s.selectCheio : s.selectItem}
                />

                <View style={[s.selectsPar, mobile && s.selectsParMobile]}>
                  <Seletor
                    titulo="Filtrar por nota"
                    valor={nota}
                    opcoes={OPCOES_NOTA}
                    aoMudar={setNota}
                    estilo={s.selectMetade}
                  />
                  <Seletor
                    titulo="Ordenar"
                    valor={ordem}
                    opcoes={OPCOES_ORDEM}
                    aoMudar={setOrdem}
                    estilo={s.selectMetade}
                  />
                </View>
              </View>

              <Text style={s.contagem} accessibilityLiveRegion="polite">
                {textoTotal(visiveis.length)}
              </Text>

              {visiveis.length === 0 ? (
                <View style={s.vazio}>
                  <Text style={s.textoVazio}>Nenhuma avaliação encontrada.</Text>
                </View>
              ) : (
                <View style={s.lista}>
                  {visiveis.map((avaliacao) => (
                    <CardAvaliacao
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      mobile={mobile}
                      respondendo={respondendoId === avaliacao.id}
                      textoResposta={textoResposta}
                      onTextoResposta={setTextoResposta}
                      onResponder={() => abrirResposta(avaliacao.id)}
                      onSalvar={() => salvarResposta(avaliacao.id)}
                      onCancelar={cancelarResposta}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          <Rodape mobile={mobile} insets={insets} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  teclado: { flex: 1 },
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
  subtitulo: { marginTop: 4, color: '#999', fontSize: 12 },
  subtituloMobile: { color: '#bbb', fontSize: 14 },

  /* ----- Estrelas ----- */
  estrelas: { flexDirection: 'row', gap: 2 },

  /* ----- Resumo ----- */
  painelResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    padding: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  painelResumoMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 18,
    padding: 16,
    borderRadius: 14,
  },
  media: {
    width: 180,
    alignItems: 'center',
    gap: 6,
    paddingRight: 24,
    borderRightWidth: 1,
    borderColor: '#292929',
  },
  mediaMobile: {
    ...ALTURA_AUTO,
    width: '100%',
    paddingRight: 0,
    paddingBottom: 18,
    borderRightWidth: 0,
    borderBottomWidth: 1,
  },
  mediaNota: { color: '#d4a63a', fontSize: 48, fontWeight: 'bold', lineHeight: 54 },
  mediaTotal: { color: '#999', fontSize: 13 },

  distribuicao: { flex: 1, minWidth: 0, gap: 8 },
  distLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  distRotulo: { width: 36, flexDirection: 'row', alignItems: 'center', gap: 4 },
  distTexto: { color: '#d3d4d8', fontSize: 13 },
  barra: { flex: 1, height: 8, overflow: 'hidden', backgroundColor: '#0d0d0e', borderRadius: 6 },
  barraPreenchida: { height: '100%', backgroundColor: '#d4a63a', borderRadius: 6 },
  distQtd: { width: 28, color: '#999', fontSize: 12, textAlign: 'right' },

  /* ----- Chips ----- */
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
  chipAtivo: { backgroundColor: '#d4a63a', borderColor: '#d4a63a' },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  /* ----- Seletores ----- */
  selects: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectsMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },
  selectsPar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectsParMobile: { ...ALTURA_AUTO, flexWrap: 'nowrap' },
  selectItem: { width: 250 },
  selectCheio: { width: '100%' },
  selectMetade: { minWidth: 150, flexGrow: 1, flexBasis: 150 },
  seletor: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  seletorTexto: { flex: 1, color: '#eee', fontSize: 13 },

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
    maxWidth: 420,
    maxHeight: '75%',
    padding: 16,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
  },
  modalTitulo: { marginBottom: 10, color: DOURADO, fontSize: 16, fontWeight: 'bold' },
  opcao: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 8 },
  opcaoAtiva: { backgroundColor: '#29231a' },
  opcaoTexto: { color: '#fff', fontSize: 14 },
  opcaoTextoAtivo: { color: DOURADO, fontWeight: 'bold' },

  contagem: { color: '#999', fontSize: 12 },

  /* ----- Lista de avaliações ----- */
  lista: { gap: 12 },

  avaliacao: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  avaliacaoMobile: {
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(23, 23, 23, 0.95)',
    borderRadius: 14,
  },

  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 28,
  },
  avatarMobile: { width: 44, height: 44, borderRadius: 22 },
  avatarTexto: { color: '#d4a63a', fontSize: 20, fontWeight: '600' },
  avatarTextoMobile: { fontSize: 16 },

  corpo: { flex: 1, minWidth: 0, gap: 8 },
  itemLinha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  itemNome: { flexShrink: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
  tag: { paddingVertical: 2, paddingHorizontal: 10, borderWidth: 1, borderRadius: 14 },
  tagPlanta: { backgroundColor: '#29231a', borderColor: '#59431f' },
  tagProjeto: { backgroundColor: 'rgba(106, 167, 232, 0.12)', borderColor: 'rgba(106, 167, 232, 0.35)' },
  textoTag: { fontSize: 11 },
  textoTagPlanta: { color: '#d4a63a' },
  textoTagProjeto: { color: '#6aa7e8' },

  autor: { color: '#999', fontSize: 12 },
  texto: { color: '#d5d6da', fontSize: 14, lineHeight: 21 },

  lado: { alignItems: 'flex-end', gap: 6 },
  ladoMobile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  data: { color: '#999', fontSize: 12 },

  /* ----- Resposta ----- */
  resposta: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0d0d0e',
    borderLeftWidth: 3,
    borderLeftColor: '#d4a63a',
    borderRadius: 6,
  },
  respostaRotulo: { marginBottom: 4, color: '#d4a63a', fontSize: 11 },
  respostaTexto: { color: '#d5d6da', fontSize: 13, lineHeight: 19 },

  btnResponder: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#d4a63a',
    borderRadius: 8,
  },
  textoResponder: { color: '#d4a63a', fontSize: 13 },

  formResposta: { gap: 8 },
  inputResposta: {
    minHeight: 90,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#fff',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    fontSize: 15,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  acoesResposta: { flexDirection: 'row', gap: 8 },
  btnSalvar: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4a63a',
    borderRadius: 8,
  },
  btnDesativado: { opacity: 0.5 },
  textoSalvar: { color: '#111', fontSize: 13, fontWeight: 'bold' },
  btnCancelar: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292929',
    borderRadius: 8,
  },
  textoCancelar: { color: '#d3d4d8', fontSize: 13 },

  /* ----- Sem avaliações ----- */
  vazio: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  textoVazio: { color: '#999', fontSize: 13, textAlign: 'center' },

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