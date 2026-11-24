import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { enviarPlanta } from '../services/envios';
import { getSupabaseClient } from '../services/supabase';
import { useConta } from '../components/ContaProvider';
import { useDeclararConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const DOURADO_BOTAO = '#d9b45f';
const LARGURA_DRAWER = 290;
const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024; // 5 MB
const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];

// Em coluna, "flex: 0" / "flex: 1" colapsam a altura (flex-basis: 0).
const ALTURA_AUTO = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
};

const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

/* ================================================= */
/* DADOS (iguais aos do web)                         */
/* ================================================= */

const LINKS_SITE = [
  { nome: 'Início', icone: 'home-outline', rota: '/' },
  { nome: 'Plantas', icone: 'map-outline', rota: '/planta' },
  { nome: 'Profissionais', icone: 'people-outline', rota: '/profissionais' },
  { nome: 'Sobre Nós', icone: 'information-circle-outline', rota: '/sobreNos' },
];

const GRUPOS_CATEGORIA = {
  Residencial: ['Casa Térrea', 'Sobrado', 'Casa Geminada', 'Casa de Condomínio', 'Casa de Campo', 'Casa de Praia', 'Chácara', 'Sítio', 'Fazenda'],
  Apartamentos: ['Apartamento', 'Kitnet / Studio', 'Loft', 'Cobertura'],
  'Construções Especiais': ['Edícula', 'Casa de Madeira', 'Casa Pré-Fabricada', 'Casa Modular'],
  Comercial: ['Loja', 'Sala Comercial', 'Escritório', 'Galpão', 'Prédio Comercial'],
  Industrial: ['Galpão Industrial', 'Fábrica', 'Centro de Distribuição'],
  Lazer: ['Área de Lazer', 'Espaço Gourmet', 'Salão de Festas', 'Área de Piscina'],
  Projetos: ['Projeto Residencial', 'Projeto Comercial', 'Projeto Industrial', 'Projeto Arquitetônico'],
};

const OPCOES_CATEGORIA = [{ label: 'Selecione', valor: '' }];
Object.keys(GRUPOS_CATEGORIA).forEach((grupo) => {
  OPCOES_CATEGORIA.push({ grupo });
  GRUPOS_CATEGORIA[grupo].forEach((c) => OPCOES_CATEGORIA.push({ label: c, valor: c }));
});

const OPCOES_ESTILO = [
  { label: 'Selecione', valor: '' },
  ...[
    'Moderno',
    'Contemporâneo',
    'Clássico',
    'Rústico',
    'Minimalista',
    'Colonial',
    'Neoclássico',
    'Industrial',
    'Escandinavo',
    'Tropical',
  ].map((e) => ({ label: e, valor: e })),
];

const DESTAQUES_INICIAIS = [
  'Suíte com closet',
  'Sala e cozinha integradas',
  'Área gourmet',
  'Piscina',
  'Pé-direito duplo',
  'Varanda',
  'Escritório',
  'Lavanderia',
];

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

const soNumeros = (t) => t.replace(/[^0-9]/g, '');

// Aceita 1 separador decimal (. ou ,) e no máximo 2 casas
const sanitizarPreco = (t) => {
  const limpo = t.replace(/[^0-9.,]/g, '');
  const i = limpo.search(/[.,]/);
  if (i === -1) return limpo;
  const inteiro = limpo.slice(0, i);
  const decimal = limpo.slice(i + 1).replace(/[.,]/g, '').slice(0, 2);
  return `${inteiro}${limpo[i]}${decimal}`;
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

function CabecalhoPagina({ mobile, modoEdicao }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <Text style={[s.titulo, mobile && s.tituloMobile]}>{modoEdicao ? 'Editar Planta' : 'Publicar Nova Planta'}</Text>
      <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
        {modoEdicao ? 'Atualize as informações da sua planta.' : 'Preencha as informações abaixo para cadastrar uma nova planta.'}
      </Text>
    </View>
  );
}

// Duas colunas no site, uma por linha no celular (igual ao web)
function Linha({ duas, children }) {
  return (
    <View style={[s.linha, duas && s.linhaDuas]}>
      {React.Children.map(children, (filho) => (
        <View style={duas ? s.celula : undefined}>{filho}</View>
      ))}
    </View>
  );
}

function Campo({ rotulo, multilinha, altura, mobile, ...resto }) {
  const [foco, setFoco] = useState(false);

  return (
    <View style={s.campo}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <TextInput
        style={[
          s.input,
          mobile && s.inputMobile,
          multilinha && { minHeight: altura, paddingTop: 14 },
          foco && s.inputFoco,
        ]}
        placeholderTextColor="#777777"
        selectionColor={DOURADO}
        multiline={multilinha}
        textAlignVertical={multilinha ? 'top' : 'center'}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        accessibilityLabel={rotulo}
        {...resto}
      />
    </View>
  );
}

// Substitui o <select> do HTML
function Seletor({ rotulo, valor, opcoes, aoMudar }) {
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((o) => !o.grupo && o.valor === valor);

  return (
    <View style={s.campo}>
      <Text style={s.rotulo}>{rotulo}</Text>

      <Pressable
        style={({ pressed }) => [s.seletor, pressed && s.pressionado]}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${atual ? atual.label : 'Selecione'}`}
      >
        <Text style={s.seletorTexto} numberOfLines={1}>
          {atual ? atual.label : 'Selecione'}
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
            <Text style={s.modalTitulo}>{rotulo}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {opcoes.map((o, i) =>
                o.grupo ? (
                  <Text key={`g${i}`} style={s.grupo}>
                    {o.grupo}
                  </Text>
                ) : (
                  <Pressable
                    key={`o${i}`}
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
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

export default function PublicarPlanta() {
  const router = useRouter();
  const { editar } = useLocalSearchParams();
  const { user } = useConta();
  const idEdicao = Array.isArray(editar) ? editar[0] : editar;
  const modoEdicao = Boolean(idEdicao);
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

  /* ----- Formulário ----- */
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estilo, setEstilo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [distribuicao, setDistribuicao] = useState('');
  const [destaques, setDestaques] = useState(DESTAQUES_INICIAIS);
  const [novoDestaque, setNovoDestaque] = useState('');
  const [focoDestaque, setFocoDestaque] = useState(false);
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [garagem, setGaragem] = useState('');
  const [area, setArea] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemAtualUrl, setImagemAtualUrl] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregarParaEdicao() {
      if (!modoEdicao || !user?.id) return;
      try {
        const { data, error } = await getSupabaseClient().from('plantas')
          .select('*').eq('id', idEdicao).eq('profissional_id', user.id).single();
        if (error) throw error;
        if (!ativo) return;
        setTitulo(data.nome || '');
        setDescricao(data.descricao || '');
        setEstilo(data.estilo || '');
        setCategoria(data.categoria || '');
        setDistribuicao(data.distribuicao_ambientes || '');
        setDestaques(Array.isArray(data.destaques) ? data.destaques : []);
        setQuartos(String(data.quartos ?? ''));
        setBanheiros(String(data.banheiros ?? ''));
        setGaragem(String(data.garagem ?? ''));
        setArea(String(data.area ?? ''));
        setPreco(String(data.preco ?? '').replace('.', ','));
        setImagemAtualUrl(data.imagem_url || '');
      } catch (falha) {
        console.error('Erro ao carregar planta para edição:', falha);
        if (ativo) setErro('Não foi possível carregar esta planta para edição. Verifique se ela pertence à sua conta.');
      }
    }
    carregarParaEdicao();
    return () => { ativo = false; };
  }, [modoEdicao, idEdicao, user?.id]);

  const adicionarDestaque = () => {
    const texto = novoDestaque.trim();
    if (!texto) return;
    const existe = destaques.some((d) => d.toLowerCase() === texto.toLowerCase());
    if (!existe) setDestaques((lista) => [...lista, texto]);
    setNovoDestaque('');
  };

  const removerDestaque = (texto) =>
    setDestaques((lista) => lista.filter((d) => d !== texto));

  const escolherImagem = async () => {
    // Qualidade 0.8: a imagem é reduzida antes do envio
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (resultado.canceled) return;

    const arquivo = resultado.assets[0];

    if (arquivo.mimeType && !TIPOS_IMAGEM.includes(arquivo.mimeType)) {
      setErro('A imagem deve ser JPEG, PNG ou WebP.');
      return;
    }

    if (arquivo.fileSize && arquivo.fileSize > TAMANHO_MAX_IMAGEM) {
      setErro('A imagem deve ter no máximo 5 MB.');
      return;
    }

    setErro('');
    setImagem(arquivo);
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setEstilo('');
    setCategoria('');
    setDistribuicao('');
    setDestaques(DESTAQUES_INICIAIS);
    setNovoDestaque('');
    setQuartos('');
    setBanheiros('');
    setGaragem('');
    setArea('');
    setPreco('');
    setImagem(null);
  };

  const publicar = async () => {
    if (publicando) return;
    setSucesso(false);

    if (!titulo.trim()) return setErro('Informe o título da planta.');
    if (!descricao.trim()) return setErro('Informe a descrição.');
    if (!categoria) return setErro('Selecione a categoria.');
    if (!quartos || Number(quartos) < 1) return setErro('Informe a quantidade de quartos (mínimo 1).');
    if (!banheiros || Number(banheiros) < 1) return setErro('Informe a quantidade de banheiros (mínimo 1).');
    if (garagem === '') return setErro('Informe as vagas na garagem (pode ser 0).');
    if (!area) return setErro('Informe a área construída.');
    if (!preco.trim()) return setErro('Informe o preço.');
    if (!modoEdicao && !imagem) return setErro('Escolha a imagem da planta.');

    setErro('');
    setPublicando(true);

    try {
      const planta = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        estilo,
        categoria,
        distribuicao: distribuicao.trim(),
        destaques,
        quartos: Number(quartos),
        banheiros: Number(banheiros),
        garagem: Number(garagem),
        area: Number(area),
        preco: Number(preco.replace(',', '.')),
        imagem, // { uri, fileName, mimeType, fileSize, ... }
      };

      if (modoEdicao) {
        const { data: atualizada, error } = await getSupabaseClient().from('plantas').update({
          nome: planta.titulo,
          descricao: planta.descricao,
          estilo: planta.estilo || null,
          categoria: planta.categoria,
          distribuicao_ambientes: planta.distribuicao || null,
          destaques: planta.destaques || [],
          quartos: planta.quartos,
          banheiros: planta.banheiros,
          garagem: planta.garagem,
          area: planta.area,
          preco: planta.preco,
        }).eq('id', idEdicao).eq('profissional_id', user.id).select('id').maybeSingle();
        if (error) throw error;
        if (!atualizada) throw new Error('Planta não encontrada ou sem permissão para editar.');
        setSucesso(true);
        router.replace({ pathname: '/detalhesPlantas', params: { id: String(idEdicao) } });
      } else {
        await enviarPlanta(planta);
        setSucesso(true);
        limparFormulario();
      }
    } catch (e) {
      setErro('Não foi possível publicar a planta. Tente novamente.');
    } finally {
      setPublicando(false);
    }
  };

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const menuConta = (
    <ContaMenu tipo="profissional" aoSelecionar={() => setMenuAberto(false)} />
  );

  const duas = !mobile;

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
              <CabecalhoPagina mobile={mobile} modoEdicao={modoEdicao} />

              <View style={s.formulario}>
                <Campo
                  rotulo="Título da Planta"
                  mobile={mobile}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ex.: Casa Moderna com 3 Quartos"
                />

                <Campo
                  rotulo="Descrição"
                  mobile={mobile}
                  multilinha
                  altura={150}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Descreva sua planta..."
                />

                <Linha duas={duas}>
                  <Seletor
                    rotulo="Estilo da Planta"
                    valor={estilo}
                    opcoes={OPCOES_ESTILO}
                    aoMudar={setEstilo}
                  />
                  <Seletor
                    rotulo="Categoria"
                    valor={categoria}
                    opcoes={OPCOES_CATEGORIA}
                    aoMudar={setCategoria}
                  />
                </Linha>

                <Campo
                  rotulo="Distribuição dos Ambientes"
                  mobile={mobile}
                  multilinha
                  altura={90}
                  value={distribuicao}
                  onChangeText={setDistribuicao}
                  placeholder="Ex.: Sala integrada com cozinha, suíte master com closet, área gourmet..."
                />

                {/* Destaques do projeto */}
                <View style={s.destaquesBox}>
                  <Text style={s.tituloDestaques}>Destaques do Projeto</Text>

                  <View style={s.chips}>
                    {destaques.length === 0 ? (
                      <Text style={s.semDestaques}>Nenhum destaque adicionado.</Text>
                    ) : (
                      destaques.map((d) => (
                        <View key={d} style={s.chip}>
                          <Text style={s.chipTexto}>{d}</Text>
                          <Pressable
                            onPress={() => removerDestaque(d)}
                            style={s.chipRemover}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel={`Remover destaque ${d}`}
                          >
                            <Ionicons name="close" size={14} color={DOURADO} />
                          </Pressable>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={s.adicionar}>
                    <TextInput
                      style={[
                        s.input,
                        s.adicionarInput,
                        mobile && s.inputMobile,
                        focoDestaque && s.inputFoco,
                      ]}
                      placeholderTextColor="#777777"
                      selectionColor={DOURADO}
                      placeholder="Digite um diferencial e pressione Enter (ex.: Energia solar)"
                      value={novoDestaque}
                      onChangeText={setNovoDestaque}
                      onSubmitEditing={adicionarDestaque}
                      onFocus={() => setFocoDestaque(true)}
                      onBlur={() => setFocoDestaque(false)}
                      returnKeyType="done"
                      blurOnSubmit={false}
                      accessibilityLabel="Novo destaque"
                    />
                    <Pressable
                      onPress={adicionarDestaque}
                      style={({ pressed }) => [s.btnAdicionar, pressed && s.pressionado]}
                      accessibilityRole="button"
                    >
                      <Text style={s.btnAdicionarTexto}>Adicionar</Text>
                    </Pressable>
                  </View>
                </View>

                <Linha duas={duas}>
                  <Campo
                    rotulo="Quantidade de Quartos"
                    mobile={mobile}
                    value={quartos}
                    onChangeText={(t) => setQuartos(soNumeros(t))}
                    keyboardType="numeric"
                    placeholder="Ex.: 3 quartos"
                  />
                  <Campo
                    rotulo="Quantidade de Banheiros"
                    mobile={mobile}
                    value={banheiros}
                    onChangeText={(t) => setBanheiros(soNumeros(t))}
                    keyboardType="numeric"
                    placeholder="Ex.: 2 banheiros"
                  />
                </Linha>

                <Linha duas={duas}>
                  <Campo
                    rotulo="Vagas na Garagem"
                    mobile={mobile}
                    value={garagem}
                    onChangeText={(t) => setGaragem(soNumeros(t))}
                    keyboardType="numeric"
                    placeholder="Ex.: 2 vagas"
                  />
                  <Campo
                    rotulo="Área Construída (m²)"
                    mobile={mobile}
                    value={area}
                    onChangeText={(t) => setArea(soNumeros(t))}
                    keyboardType="numeric"
                    placeholder="Ex.: 120 m²"
                  />
                </Linha>

                <Linha duas={duas}>
                  <Campo
                    rotulo="Preço (R$)"
                    mobile={mobile}
                    value={preco}
                    onChangeText={(t) => setPreco(sanitizarPreco(t))}
                    keyboardType="decimal-pad"
                    placeholder="Ex.: R$ 350.000,00"
                  />

                  {/* Imagem */}
                  <View style={s.campo}>
                    <Text style={s.rotulo}>Imagem da Planta</Text>
                    <Pressable
                      onPress={escolherImagem}
                      disabled={modoEdicao}
                      style={({ pressed }) => [s.arquivo, pressed && s.pressionado]}
                      accessibilityRole="button"
                      accessibilityLabel="Escolher imagem da planta"
                    >
                      <View style={s.btnArquivo}>
                        <Text style={s.btnArquivoTexto}>Escolher arquivo</Text>
                      </View>

                      {imagem ? (
                        <View style={s.arquivoEscolhido}>
                          <Image source={{ uri: imagem.uri }} style={s.miniatura} />
                          <Text style={s.arquivoTexto} numberOfLines={1}>
                            {imagem.fileName || 'Imagem selecionada'}
                          </Text>
                        </View>
                      ) : (
                        <Text style={s.arquivoTexto}>{modoEdicao && imagemAtualUrl ? 'Imagem atual mantida' : 'Nenhum arquivo escolhido'}</Text>
                      )}
                    </Pressable>
                    <Text style={s.dica}>
                      {modoEdicao ? 'A imagem atual será mantida nesta edição.' : 'JPEG, PNG ou WebP, até 5 MB. A imagem é reduzida automaticamente antes do envio.'}
                    </Text>
                  </View>
                </Linha>

                {erro !== '' && (
                  <Text style={s.erro} accessibilityLiveRegion="polite">
                    {erro}
                  </Text>
                )}
                {sucesso && (
                  <Text style={s.sucesso} accessibilityLiveRegion="polite">
                    {modoEdicao ? 'Planta atualizada com sucesso!' : 'Planta publicada com sucesso!'}
                  </Text>
                )}

                <Pressable
                  onPress={publicar}
                  disabled={publicando}
                  style={({ pressed }) => [
                    s.btnPublicar,
                    publicando && s.btnPublicarDesativado,
                    pressed && s.pressionado,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: publicando }}
                >
                  <Text style={s.btnPublicarTexto}>{publicando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Publicar Planta'}</Text>
                </Pressable>
              </View>
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

  /* ----- Formulário ----- */
  formulario: { maxWidth: 960, gap: 22 },
  linha: { gap: 22 },
  linhaDuas: { flexDirection: 'row', gap: 25 },
  celula: { flex: 1, minWidth: 0 },

  campo: { gap: 9 },
  rotulo: { color: '#eee', fontSize: 14, fontWeight: '600' },

  input: {
    minHeight: 46,
    paddingHorizontal: 15,
    color: '#eee',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#414141',
    borderRadius: 8,
    fontSize: 14,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  inputMobile: { minHeight: 48, fontSize: 16 },
  inputFoco: { borderColor: DOURADO, backgroundColor: '#181818' },

  seletor: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#414141',
    borderRadius: 8,
  },
  seletorTexto: { flex: 1, marginRight: 8, color: '#eee', fontSize: 14 },

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
  grupo: {
    marginTop: 12,
    marginBottom: 4,
    color: '#8a8a8a',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  opcao: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 8 },
  opcaoAtiva: { backgroundColor: '#29231a' },
  opcaoTexto: { color: '#fff', fontSize: 14 },
  opcaoTextoAtivo: { color: DOURADO, fontWeight: 'bold' },

  /* ----- Destaques ----- */
  destaquesBox: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 166, 58, 0.35)',
    borderRadius: 10,
  },
  tituloDestaques: { color: '#fff', fontSize: 15, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 34 },
  semDestaques: { alignSelf: 'center', color: '#777', fontSize: 13 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingLeft: 14,
    paddingRight: 6,
    backgroundColor: 'rgba(212, 166, 58, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 166, 58, 0.35)',
    borderRadius: 999,
  },
  chipTexto: { color: '#eee', fontSize: 13 },
  chipRemover: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  adicionar: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  adicionarInput: { flexGrow: 1, flexBasis: 220, minWidth: 0 },
  btnAdicionar: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  btnAdicionarTexto: { color: DOURADO, fontSize: 14, fontWeight: '600' },

  /* ----- Imagem ----- */
  arquivo: {
    minHeight: 62,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#555',
    borderRadius: 8,
  },
  btnArquivo: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 6,
  },
  btnArquivoTexto: { color: DOURADO, fontSize: 13, fontWeight: '600' },
  arquivoEscolhido: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniatura: { width: 34, height: 34, borderRadius: 4 },
  arquivoTexto: { flexShrink: 1, color: '#eee', fontSize: 13 },
  dica: { color: '#a9a9a9', fontSize: 12, lineHeight: 18 },

  /* ----- Mensagens e botão ----- */
  erro: { color: '#e57373', fontSize: 14 },
  sucesso: { color: '#8fd19e', fontSize: 14, fontWeight: 'bold' },
  btnPublicar: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: DOURADO_BOTAO,
    borderRadius: 8,
  },
  btnPublicarDesativado: { opacity: 0.6 },
  btnPublicarTexto: { color: '#111', fontSize: 15, fontWeight: 'bold' },

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