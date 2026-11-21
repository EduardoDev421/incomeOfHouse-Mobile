import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useDeclararConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const LARGURA_DRAWER = 290;
const TAMANHO_MAX_ARQUIVO = 10 * 1024 * 1024; // 10 MB
const EXTENSOES = ['pdf', 'docx', 'png', 'jpg', 'jpeg'];
const TIPOS_ARQUIVO = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

// Em coluna, "flex: 0" / "flex: 1" colapsam a altura (flex-basis: 0).
const ALTURA_AUTO = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
};

const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

const LINKS_SITE = [
  { nome: 'Início', icone: 'home-outline', rota: '/' },
  { nome: 'Plantas', icone: 'map-outline', rota: '/planta' },
  { nome: 'Profissionais', icone: 'people-outline', rota: '/profissionais' },
  { nome: 'Sobre Nós', icone: 'information-circle-outline', rota: '/sobreNos' },
];

// Cores do relatório de leitura (iguais às do web)
const STATUS_RELATORIO = {
  ok: { texto: 'OK', cor: '#6fcf97', fundo: '#14231b', borda: '#25503a' },
  aviso: { texto: 'Atenção', cor: '#e0b44a', fundo: '#29231a', borda: '#59431f' },
  erro: { texto: 'Erro', cor: '#f0a0a0', fundo: '#2a1717', borda: '#6b2b2b' },
};

/* ================================================= */
/* ANÁLISE DO ARQUIVO                                */
/* ================================================= */

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * TODO: trocar pela leitura real do portfólio (a mesma que o web faz).
 * Recebe o arquivo escolhido ({ uri, name, size, mimeType }) e uma função
 * para atualizar o texto da etapa. Deve devolver o objeto abaixo ou lançar
 * um Error com a mensagem que será mostrada ao usuário.
 *
 * Os campos que faltarem podem vir vazios/null: a tela mostra
 * "não encontrado" em amarelo.
 */
async function analisarPortfolio(arquivo, aoMudarEtapa) {
  aoMudarEtapa('Lendo o arquivo...');
  await esperar(900);
  aoMudarEtapa('Identificando seus dados...');
  await esperar(900);
  aoMudarEtapa('Reunindo seus projetos...');
  await esperar(900);

  return {
    nome: 'Carlos Silva',
    profissao: 'Arquiteto',
    selos: [
      { texto: 'Verificado', verificado: true },
      { texto: '8 anos de experiência' },
    ],
    sobre: 'Arquiteto com foco em projetos residenciais e reformas, buscando sempre o melhor aproveitamento do espaço e da luz natural.',
    areas: ['Residencial', 'Interiores', 'Reformas'],
    projetos: [
      {
        id: '1',
        nome: 'Casa Moderna',
        categoria: 'Residencial',
        descricao: 'Projeto residencial contemporâneo, com ambientes integrados.',
        meta: ['180 m²', '2024'],
        imagem: null,
      },
      {
        id: '2',
        nome: 'Reforma de Apartamento',
        categoria: 'Reformas',
        descricao: 'Projeto de interiores e iluminação.',
        meta: ['85 m²'],
        imagem: null,
        falta: 'Ano não encontrado no arquivo.',
      },
      {
        id: '3',
        nome: 'Casa de Campo',
        categoria: 'Residencial',
        descricao: 'Arquitetura integrada à natureza.',
        meta: ['240 m²', '2023'],
        imagem: null,
      },
    ],
    relatorio: [
      { parte: 'Nome', status: 'ok', mensagem: 'Encontrado no cabeçalho.' },
      { parte: 'Projetos', status: 'aviso', mensagem: '1 projeto com informações faltando.' },
    ],
  };
}

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const iniciais = (nome) => {
  const letras = (nome || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return letras || '?';
};

const extensao = (nome = '') => nome.split('.').pop().toLowerCase();

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

function CabecalhoPagina({ mobile, preenchido, onTrocar, onEditar }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <View style={s.titulos}>
        <Text style={[s.titulo, mobile && s.tituloMobile]}>Meu Portfólio</Text>
        <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
          Envie seu portfólio e preenchemos esta página com o que está nele.
        </Text>
      </View>

      {preenchido && (
        <View style={[s.acoesTopo, mobile && s.acoesTopoMobile]}>
          <Pressable
            onPress={onTrocar}
            style={({ pressed }) => [s.btnSecundario, mobile && s.btnMobile, pressed && s.pressionado]}
            accessibilityRole="button"
          >
            <Text style={[s.textoSecundario, mobile && s.textoBtnMobile]}>Enviar outro arquivo</Text>
          </Pressable>

          <Pressable
            onPress={onEditar}
            style={({ pressed }) => [s.btnEditar, mobile && s.btnMobile, pressed && s.pressionado]}
            accessibilityRole="button"
          >
            <Text style={[s.textoEditar, mobile && s.textoBtnMobile]}>Editar Portfólio</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ----- Estado 1: aguardando o arquivo ----- */
function AreaEnvio({ erro, onEscolher }) {
  const web = Platform.OS === 'web';

  return (
    <View style={s.areaEnvio}>
      <Pressable
        onPress={onEscolher}
        style={({ pressed }) => [s.dropzone, pressed && s.dropzoneAtiva]}
        accessibilityRole="button"
        accessibilityLabel="Escolher arquivo do portfólio"
      >
        <Ionicons name="cloud-upload-outline" size={52} color={DOURADO} style={s.dropzoneIcone} />
        <Text style={s.dropzoneTitulo}>
          {web ? 'Arraste seu portfólio aqui' : 'Envie seu portfólio'}
        </Text>
        <Text style={s.dropzoneTexto}>
          {web ? 'ou clique para escolher um arquivo' : 'Toque para escolher um arquivo'}
        </Text>
        <Text style={s.dropzoneDica}>PDF, Word (.docx), PNG ou JPG · até 10 MB</Text>
      </Pressable>

      {!!erro && (
        <View style={s.erroEnvio} accessibilityRole="alert">
          <Text style={s.erroTexto}>{erro}</Text>
        </View>
      )}

      <Text style={s.dicaEnvio}>
        Vamos ler o arquivo e preencher seu nome, projetos, capacitações e resumo. Você poderá
        revisar tudo antes de publicar.
      </Text>
    </View>
  );
}

/* ----- Estado 2: analisando ----- */
function Analisando({ nomeArquivo, etapa }) {
  return (
    <View style={s.analisando} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={DOURADO} />
      <Text style={s.analisandoTitulo}>Analisando {nomeArquivo || 'seu arquivo'}</Text>
      <Text style={s.analisandoEtapa}>{etapa}</Text>
    </View>
  );
}

/* ----- Estado 3: preenchido ----- */
function Relatorio({ itens, mobile }) {
  if (!itens?.length) return null;

  return (
    <View style={s.relatorio}>
      <Text style={s.relatorioTitulo}>O que encontramos no seu arquivo</Text>

      <View style={s.relatorioLista}>
        {itens.map((item) => {
          const st = STATUS_RELATORIO[item.status] || STATUS_RELATORIO.ok;
          const destaque = item.status !== 'ok';

          return (
            <View key={item.parte} style={[s.relItem, mobile && s.relItemMobile]}>
              <Text style={[s.relParte, mobile && s.relParteMobile]}>{item.parte}</Text>
              <View style={[s.relStatus, { backgroundColor: st.fundo, borderColor: st.borda }]}>
                <Text style={[s.relStatusTexto, { color: st.cor }]}>{st.texto}</Text>
              </View>
              <Text style={[s.relMsg, destaque && s.relMsgDestaque]}>{item.mensagem}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PerfilBloco({ dados, mobile }) {
  return (
    <View style={[s.perfil, mobile && s.perfilMobile]}>
      <View style={s.avatar}>
        <Text style={s.avatarTexto}>{iniciais(dados.nome)}</Text>
      </View>

      <View style={[s.dadosPerfil, mobile && s.dadosPerfilMobile]}>
        <Text style={[s.nomePerfil, !dados.nome && s.faltando]}>
          {dados.nome || 'Nome não encontrado'}
        </Text>
        <Text style={[s.profissao, !dados.profissao && s.faltando]}>
          {dados.profissao || 'Profissão não encontrada'}
        </Text>

        {!!dados.selos?.length && (
          <View style={s.selos}>
            {dados.selos.map((selo) => (
              <View key={selo.texto} style={[s.selo, selo.verificado && s.seloVerificado]}>
                <Text style={[s.textoSelo, selo.verificado && s.textoSeloVerificado]}>
                  {selo.texto}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function CardSobre({ dados }) {
  return (
    <View style={s.card}>
      <Text style={s.tituloCard}>Sobre o meu trabalho</Text>

      <Text style={[s.textoApresentacao, !dados.sobre && s.faltando]}>
        {dados.sobre || 'Apresentação não encontrada no arquivo.'}
      </Text>

      <View style={s.tags} accessibilityLabel="Áreas de atuação">
        {dados.areas?.length ? (
          dados.areas.map((area) => (
            <View key={area} style={s.tag}>
              <Text style={s.textoTag}>{area}</Text>
            </View>
          ))
        ) : (
          <View style={[s.tag, s.tagFaltando]}>
            <Text style={[s.textoTag, s.faltando]}>Áreas de atuação não encontradas</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CardProjeto({ projeto, colunas }) {
  const fonte =
    typeof projeto.imagem === 'string' ? { uri: projeto.imagem } : projeto.imagem;

  return (
    <View
      style={[
        s.projeto,
        colunas === 1 && s.projeto1,
        colunas === 2 && s.projeto2,
        colunas === 3 && s.projeto3,
      ]}
    >
      <View style={s.projetoImg}>
        {fonte ? (
          <Image source={fonte} style={s.imagemProjeto} resizeMode="cover" />
        ) : (
          <Text style={s.semImagem}>Sem imagem</Text>
        )}
      </View>

      <View style={s.projetoInfo}>
        <Text style={s.projetoNome} numberOfLines={2}>
          {projeto.nome}
        </Text>
        {!!projeto.categoria && <Text style={s.projetoCategoria}>{projeto.categoria}</Text>}

        {!!projeto.meta?.length && (
          <View style={s.projetoMeta}>
            {projeto.meta.map((m) => (
              <Text key={m} style={s.projetoMetaTexto}>
                {m}
              </Text>
            ))}
          </View>
        )}

        {!!projeto.descricao && (
          <Text style={s.projetoDesc} numberOfLines={4}>
            {projeto.descricao}
          </Text>
        )}

        {!!projeto.falta && <Text style={s.projetoFalta}>{projeto.falta}</Text>}
      </View>
    </View>
  );
}

function CardProjetos({ projetos, colunas, mobile }) {
  const [filtro, setFiltro] = useState('todos');

  const categorias = useMemo(
    () => [...new Set(projetos.map((p) => p.categoria).filter(Boolean))],
    [projetos]
  );

  const visiveis = useMemo(
    () => (filtro === 'todos' ? projetos : projetos.filter((p) => p.categoria === filtro)),
    [projetos, filtro]
  );

  return (
    <View style={s.card}>
      <Text style={s.tituloCard}>Projetos</Text>
      <Text style={s.subtituloCard}>
        {projetos.length === 1 ? '1 projeto' : `${projetos.length} projetos`}
      </Text>

      {categorias.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtros}
          style={s.filtrosScroll}
          accessibilityLabel="Filtrar projetos por categoria"
        >
          {['todos', ...categorias].map((item) => {
            const ativo = filtro === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFiltro(item)}
                style={({ pressed }) => [s.filtro, ativo && s.filtroAtivo, pressed && s.pressionado]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text style={[s.textoFiltro, ativo && s.textoFiltroAtivo]}>
                  {item === 'todos' ? 'Todos' : item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {visiveis.length === 0 ? (
        <Text style={s.vazio}>Nenhum projeto encontrado.</Text>
      ) : (
        <View style={s.projetos}>
          {visiveis.map((projeto) => (
            <CardProjeto key={projeto.id} projeto={projeto} colunas={colunas} />
          ))}
        </View>
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

export default function MeuPortfolio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useDeclararConta('profissional');
  const { width, height } = useWindowDimensions();

  // Mesmos breakpoints do PerfilUsuario
  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  const paisagem = height < 500;

  // Colunas da grade de projetos (igual ao web: 1 / 2 / várias)
  const colunas = width < 420 ? 1 : mobile || medio ? 2 : 3;

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

  /* ----- Envio e análise ----- */
  // 'vazio' | 'analisando' | 'preenchido'
  const [estado, setEstado] = useState('vazio');
  const [erro, setErro] = useState('');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [etapa, setEtapa] = useState('Lendo o arquivo...');
  const [dados, setDados] = useState(null);
  const analiseId = useRef(0);

  // Ignora o resultado se a tela for fechada durante a análise
  useEffect(
    () => () => {
      analiseId.current += 1;
    },
    []
  );

  const analisar = async (arquivo) => {
    const id = ++analiseId.current;

    setNomeArquivo(arquivo.name);
    setEtapa('Lendo o arquivo...');
    setEstado('analisando');

    try {
      const resultado = await analisarPortfolio(arquivo, (texto) => {
        if (id === analiseId.current) setEtapa(texto);
      });

      if (id !== analiseId.current) return;
      setDados(resultado);
      setEstado('preenchido');
    } catch (e) {
      if (id !== analiseId.current) return;
      setErro(e?.message || 'Não foi possível ler o arquivo. Tente outro.');
      setEstado('vazio');
    }
  };

  const escolherArquivo = async () => {
    setErro('');

    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: TIPOS_ARQUIVO,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (resultado.canceled) return;

      const arquivo = resultado.assets[0];

      if (!EXTENSOES.includes(extensao(arquivo.name))) {
        setErro('Envie um arquivo PDF, Word (.docx), PNG ou JPG.');
        return;
      }

      if (arquivo.size && arquivo.size > TAMANHO_MAX_ARQUIVO) {
        setErro('O arquivo deve ter no máximo 10 MB.');
        return;
      }

      analisar(arquivo);
    } catch (e) {
      setErro('Não foi possível abrir o arquivo. Tente novamente.');
    }
  };

  const trocarArquivo = () => {
    analiseId.current += 1;
    setDados(null);
    setErro('');
    setEstado('vazio');
  };

  const editarPortfolio = () =>
    // TODO: abrir a edição do portfólio
    Alert.alert('Editar Portfólio', 'A edição poderá ser conectada aqui.');

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const menuConta = (
    <ContaMenu tipo="profissional" aoSelecionar={() => setMenuAberto(false)} />
  );

  const precisaRevisar = dados?.relatorio?.some((r) => r.status !== 'ok');

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView
        contentContainerStyle={s.conteudo}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
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
            <CabecalhoPagina
              mobile={mobile}
              preenchido={estado === 'preenchido'}
              onTrocar={trocarArquivo}
              onEditar={editarPortfolio}
            />

            {estado === 'vazio' && <AreaEnvio erro={erro} onEscolher={escolherArquivo} />}

            {estado === 'analisando' && <Analisando nomeArquivo={nomeArquivo} etapa={etapa} />}

            {estado === 'preenchido' && !!dados && (
              <View style={s.preenchido}>
                <Relatorio itens={dados.relatorio} mobile={mobile} />

                {precisaRevisar && (
                  <View style={s.avisoRevisao}>
                    <Text style={s.avisoRevisaoTexto}>
                      Revise as informações destacadas antes de publicar.
                    </Text>
                  </View>
                )}

                <PerfilBloco dados={dados} mobile={mobile} />
                <CardSobre dados={dados} />
                <CardProjetos projetos={dados.projetos || []} colunas={colunas} mobile={mobile} />
              </View>
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
  faltando: { color: '#e0b44a', fontStyle: 'italic' },

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
  principal: { flex: 1, minWidth: 0, padding: 12, gap: 16 },
  principalMedio: { padding: 10 },
  principalMobile: { ...ALTURA_AUTO, padding: 16, gap: 16 },
  preenchido: { gap: 16 },

  /* ----- Cabeçalho ----- */
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 14,
  },
  cabecalhoMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    marginTop: 0,
  },
  titulos: { flexShrink: 1 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  tituloMobile: { fontSize: 26 },
  subtitulo: { marginTop: 4, color: '#999', fontSize: 12 },
  subtituloMobile: { color: '#bbb', fontSize: 14 },

  acoesTopo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  acoesTopoMobile: { ...ALTURA_AUTO, flexWrap: 'nowrap' },
  btnSecundario: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
  },
  textoSecundario: { color: '#ddd', fontSize: 13 },
  btnEditar: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoEditar: { color: DOURADO, fontSize: 13 },
  btnMobile: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  textoBtnMobile: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  /* ----- Estado 1: envio ----- */
  areaEnvio: { alignItems: 'center', gap: 14, paddingVertical: 24 },
  dropzone: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 24,
    backgroundColor: '#171717',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#59431f',
    borderRadius: 14,
  },
  dropzoneAtiva: { backgroundColor: '#1d1a14', borderColor: DOURADO },
  dropzoneIcone: { marginBottom: 8 },
  dropzoneTitulo: { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  dropzoneTexto: { color: '#bbb', fontSize: 13, textAlign: 'center' },
  dropzoneDica: { marginTop: 10, color: '#777', fontSize: 12, textAlign: 'center' },
  dicaEnvio: { maxWidth: 420, color: '#999', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  erroEnvio: {
    width: '100%',
    maxWidth: 560,
    padding: 14,
    backgroundColor: '#2a1717',
    borderWidth: 1,
    borderColor: '#6b2b2b',
    borderRadius: 8,
  },
  erroTexto: { color: '#f0a0a0', fontSize: 13 },

  /* ----- Estado 2: analisando ----- */
  analisando: { alignItems: 'center', gap: 10, paddingVertical: 48 },
  analisandoTitulo: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  analisandoEtapa: { color: '#999', fontSize: 13, textAlign: 'center' },

  /* ----- Relatório ----- */
  relatorio: {
    padding: 14,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: '#292929',
    borderLeftColor: DOURADO,
    borderRadius: 8,
  },
  relatorioTitulo: { marginBottom: 10, color: '#fff', fontSize: 14, fontWeight: 'bold' },
  relatorioLista: { gap: 8 },
  relItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  relItemMobile: { flexWrap: 'wrap' },
  relParte: { width: 130, color: '#eee', fontSize: 13, fontWeight: 'bold' },
  relParteMobile: { width: '100%' },
  relStatus: { paddingVertical: 1, paddingHorizontal: 8, borderWidth: 1, borderRadius: 12 },
  relStatusTexto: { fontSize: 11 },
  relMsg: { flex: 1, minWidth: 0, color: '#bbb', fontSize: 13, lineHeight: 18 },
  relMsgDestaque: { color: '#e6e6e6' },

  avisoRevisao: {
    padding: 12,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: '#292929',
    borderLeftColor: DOURADO,
    borderRadius: 8,
  },
  avisoRevisaoTexto: { color: '#bbb', fontSize: 13, lineHeight: 18 },

  /* ----- Perfil ----- */
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: DOURADO,
  },
  perfilMobile: { flexDirection: 'column', alignItems: 'center' },
  avatar: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DOURADO,
    borderRadius: 55,
  },
  avatarTexto: { color: DOURADO, fontSize: 36, fontWeight: 'bold' },
  dadosPerfil: { flex: 1, minWidth: 0, gap: 6 },
  dadosPerfilMobile: { ...ALTURA_AUTO, alignItems: 'center' },
  nomePerfil: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  profissao: { color: DOURADO, fontSize: 14 },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  selo: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#1f1f21',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
  },
  seloVerificado: { backgroundColor: '#14231b', borderColor: '#25503a' },
  textoSelo: { color: '#ccc', fontSize: 12 },
  textoSeloVerificado: { color: '#6fcf97' },

  /* ----- Cards ----- */
  card: {
    minWidth: 0,
    padding: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  tituloCard: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  subtituloCard: { marginTop: 4, color: '#999', fontSize: 13 },
  textoApresentacao: { marginTop: 8, marginBottom: 14, color: '#ccc', fontSize: 13, lineHeight: 20 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 6,
  },
  tagFaltando: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  textoTag: { color: DOURADO, fontSize: 12 },

  /* ----- Filtros ----- */
  filtrosScroll: { flexGrow: 0, marginVertical: 16 },
  filtros: { flexDirection: 'row', gap: 8 },
  filtro: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
  },
  filtroAtivo: { backgroundColor: '#29231a', borderColor: DOURADO },
  textoFiltro: { color: '#ccc', fontSize: 12 },
  textoFiltroAtivo: { color: DOURADO },

  /* ----- Projetos ----- */
  projetos: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  projeto: {
    overflow: 'hidden',
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  projeto1: { width: '100%' },
  projeto2: { flexBasis: '48%', flexGrow: 0 },
  projeto3: { flexBasis: '31%', flexGrow: 0 },
  projetoImg: {
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1d1d',
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  imagemProjeto: { width: '100%', height: '100%' },
  semImagem: { color: '#555', fontSize: 12 },
  projetoInfo: { padding: 12, paddingBottom: 14 },
  projetoNome: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  projetoCategoria: { marginTop: 3, color: DOURADO, fontSize: 12 },
  projetoMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  projetoMetaTexto: { color: '#999', fontSize: 12 },
  projetoDesc: { marginTop: 8, color: '#bbb', fontSize: 12, lineHeight: 18 },
  projetoFalta: { marginTop: 10, color: '#e0b44a', fontSize: 12 },

  vazio: {
    marginTop: 6,
    padding: 24,
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
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