import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';
import { mensagemErroAuth } from '../services/auth';
import { enviarComprovanteProfissional, tipoComprovante } from '../services/documentos';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const AMARELO = '#f0ca4c';
const LARGURA_DRAWER = 290;
const TAMANHO_MAX_COMPROVANTE = 10 * 1024 * 1024;

// Em coluna, "flex: 0" / "flex: 1" colapsam a altura (flex-basis: 0).
// Use isto para deixar o item com a altura do próprio conteúdo.
const ALTURA_AUTO = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
};

const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

const formatarTelefone = (valor) => {
  const digitos = (valor || '').replace(/\D/g, '');
  if (digitos.length === 11) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digitos.length === 10) return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return valor;
};

/* ================================================= */
/* DADOS                                             */
/* ================================================= */

const LINKS_SITE = [
  { nome: 'Início', icone: 'home-outline', rota: '/' },
  { nome: 'Plantas', icone: 'map-outline', rota: '/planta' },
  { nome: 'Profissionais', icone: 'people-outline', rota: '/profissionais' },
  { nome: 'Sobre Nós', icone: 'information-circle-outline', rota: '/sobreNos' },
];


/* ================================================= */
/* COMPONENTES PEQUENOS                              */
/* ================================================= */


function ItemMenu({ nome, icone, ativo, mobile, medio, onPress }) {
  const tamanhoIcone = mobile ? 20 : medio ? 14 : 16;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.itemMenu,
        medio && s.itemMenuMedio,
        mobile && s.itemMenuMobile,
        ativo && s.itemAtivo,
        pressed && s.pressionado,
      ]}
    >
      <Ionicons name={icone} size={tamanhoIcone} color={DOURADO} />

      <Text
        style={[
          s.textoMenu,
          medio && s.textoMenuMedio,
          mobile && s.textoMenuMobile,
        ]}
      >
        {nome}
      </Text>
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

function BotaoEditar({ mobile, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.botaoEditar, mobile && s.botaoEditarMobile, pressed && s.pressionado]}
    >
      <Ionicons name="create-outline" size={mobile ? 17 : 15} color={DOURADO} />
      <Text style={[s.textoEditar, mobile && s.textoEditarMobile]}>Editar Perfil</Text>
    </Pressable>
  );
}

function CabecalhoPagina({ mobile, onEditar }) {
  return (
    <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
      <View style={s.titulos}>
        <Text style={[s.titulo, mobile && s.tituloMobile]}>Meu Perfil</Text>
        <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
          Gerencie suas informações pessoais e preferências.
        </Text>
      </View>

      {!mobile && <BotaoEditar onPress={onEditar} />}
    </View>
  );
}

function Selo({ texto, verificado }) {
  return (
    <View style={[s.selo, verificado && s.seloVerificado]}>
      {verificado && <Ionicons name="checkmark-circle" size={12} color="#8bd7b3" />}
      <Text style={[s.textoSelo, verificado && s.textoSeloVerificado]}>{texto}</Text>
    </View>
  );
}

function CardPerfil({ mobile, empilhado, onEditar, onEditarFoto, perfil }) {
  return (
    <View style={[s.perfilCard, mobile && s.perfilCardMobile]}>
      <View style={s.fotoColuna}>
        <View style={[s.foto, mobile && s.fotoMobile]}>
          <Ionicons name="person-circle-outline" size={mobile ? 84 : 66} color={DOURADO} />
        </View>
        <Pressable onPress={onEditarFoto} style={({ pressed }) => [s.botaoFoto, pressed && s.pressionado]}>
          <Text style={s.textoBotaoFoto}>Editar Foto</Text>
        </Pressable>
      </View>

      <View style={[s.dadosUsuario, mobile && s.dadosUsuarioMobile]}>
        <Text style={[s.nome, mobile && s.nomeMobile]}>{perfil.nome}</Text>
        <Text style={s.profissao}>{perfil.profissao}</Text>

        <View style={[s.selos, mobile && s.selosMobile]}>
          <Selo texto={perfil.statusTexto} verificado={perfil.verificado} />
          {perfil.selos.map((t) => (
            <Selo key={t} texto={t} />
          ))}
        </View>

        <View style={[s.linhaAvaliacao, mobile && s.linhaAvaliacaoMobile]}>
          <Text style={s.cinza}>Sem avaliações cadastradas</Text>
        </View>
      </View>

      <View style={[s.contatos, empilhado && s.contatosEmpilhados]}>
        {perfil.contatos.map((c) => (
          <View key={c.texto} style={s.contatoItem}>
            <Ionicons name={c.icone} size={16} color={DOURADO} />
            <Text style={s.textoContato} numberOfLines={1}>
              {c.texto}
            </Text>
          </View>
        ))}
      </View>

      {mobile && <BotaoEditar mobile onPress={onEditar} />}
    </View>
  );
}

function Estatisticas({ mobile }) {
  return (
    <View style={[s.estatisticas, mobile && s.estatisticasMobile]}>
      <View style={[s.cardEstatistica, mobile && s.cardEstatisticaMobile]}>
        <Text style={s.tituloEstatistica}>
          Estatísticas serão exibidas após a integração de projetos e avaliações.
        </Text>
      </View>
    </View>
  );
}

function Card({ titulo, icone, mobile, children }) {
  return (
    <View style={[s.card, mobile && s.cardMobile]}>
      <View style={s.tituloCardLinha}>
        <Ionicons name={icone} size={18} color={DOURADO} />
        <Text style={s.tituloCard}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoLinha({ rotulo, valor, selo, apagado, ultimo }) {
  return (
    <View style={[s.infoLinha, ultimo && s.semBorda]}>
      <Text style={s.rotuloInfo}>{rotulo}</Text>
      {selo ? (
        <Selo texto={valor} verificado />
      ) : (
        <Text style={[s.valorInfo, apagado && s.valorApagado]}>{valor}</Text>
      )}
    </View>
  );
}

function ListaInfo({ itens }) {
  return itens.map((item, i) => (
    <InfoLinha key={item.rotulo} {...item} ultimo={i === itens.length - 1} />
  ));
}

function Tags({ itens }) {
  return (
    <View style={s.tags}>
      {itens.map((t) => (
        <View key={t} style={s.tag}>
          <Text style={s.textoTag}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function BotaoCard({ texto, mobile, onPress, desativado = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityState={{ disabled: desativado }}
      style={({ pressed }) => [
        s.botaoLargo,
        mobile && s.botaoLargoMobile,
        pressed && s.pressionado,
        desativado && { opacity: 0.5 },
      ]}
    >
      <Text style={[s.textoBotao, mobile && s.textoBotaoMobile]}>{texto}</Text>
    </Pressable>
  );
}

function Rodape({ mobile, insets }) {
  return (
    <View style={[s.rodape, mobile && s.rodapeMobile, { paddingBottom: 15 + insets.bottom }]}>
      <Text style={s.textoRodape}>©IncomeOfHouses. Todos os direitos reservados.</Text>
      <Text style={s.termos}>Termos de Uso  |  Política de Privacidade</Text>
    </View>
  );
}

function Drawer({ aberto, deslize, fade, insets, paisagem, onFechar, onNavegar, nomeUsuario, children }) {
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
              <Text style={s.drawerSub}>{nomeUsuario}</Text>
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
              mobile
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

export default function PerfilProfissional() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, perfil, tipo, carregado, erroPerfil, recarregarPerfil } = useConta();
  const { width, height } = useWindowDimensions();
  const [arquivoComprovante, setArquivoComprovante] = useState(null);
  const [enviandoComprovante, setEnviandoComprovante] = useState(false);
  const [erroComprovante, setErroComprovante] = useState('');
  const statusTexto = {
    not_applicable: 'Não verificado',
    pending_document: 'Documento pendente',
    pending_review: 'Em análise',
    verified: 'Verificado',
    rejected: 'Verificação recusada',
  }[perfil?.verification_status] || 'Status indisponível';
  const localidade = [perfil?.city, perfil?.state].filter(Boolean).join(', ');
  const perfilTela = {
    nome: perfil?.full_name || user?.email || 'Perfil profissional',
    profissao: perfil?.profession || 'Profissão não informada',
    statusTexto,
    verificado: perfil?.verification_status === 'verified',
    selos: localidade ? [localidade] : [],
    contatos: [
      user?.email && { icone: 'mail-outline', texto: user.email },
      perfil?.phone && { icone: 'call-outline', texto: formatarTelefone(perfil.phone) },
      localidade && { icone: 'location-outline', texto: localidade },
    ].filter(Boolean),
  };
  const membroDesde = user?.created_at
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : 'Não informado';
  const resumo = [
    { rotulo: 'Membro desde', valor: membroDesde },
    { rotulo: 'Profissão', valor: perfilTela.profissao },
    { rotulo: 'Tipo de conta', valor: 'Profissional' },
  ];
  const registro = [
    { rotulo: 'Registro profissional', valor: perfil?.professional_registration || 'Não informado' },
    { rotulo: 'Verificação', valor: statusTexto, selo: perfilTela.verificado },
  ];

  // Celular em pé: menu vira drawer
  const mobile = width < 650;
  // Celular deitado / tablet: mantém o layout do site, só que menor
  const medio = !mobile && (width < 1000 || height < 500);
  const paisagem = height < 500;
  // Abaixo disso as duas colunas viram uma só (igual ao CSS: 1fr)
  const empilhado = width < 900;

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

  // Se a tela crescer para o tamanho de site, fecha o drawer
  useEffect(() => {
    if (!mobile) setMenuAberto(false);
  }, [mobile]);

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const editarFoto = () =>
    Alert.alert('Foto do perfil', 'O envio de foto ainda não está integrado.');

  const escolherComprovante = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (resultado.canceled || !resultado.assets?.length) return;

      const escolhido = resultado.assets[0];
      const mimeType = tipoComprovante(escolhido);
      if (!mimeType) {
        setErroComprovante('Escolha um comprovante em PDF, JPEG ou PNG.');
        return;
      }
      if (escolhido.size && escolhido.size > TAMANHO_MAX_COMPROVANTE) {
        setErroComprovante('O comprovante deve ter no máximo 10 MB.');
        return;
      }

      setArquivoComprovante({ ...escolhido, mimeType });
      setErroComprovante('');
    } catch (error) {
      setErroComprovante(mensagemErroAuth(error));
    }
  };

  const enviarComprovante = async () => {
    if (!arquivoComprovante || enviandoComprovante || perfilTela.verificado) return;

    setEnviandoComprovante(true);
    setErroComprovante('');
    try {
      await enviarComprovanteProfissional(arquivoComprovante);
      setArquivoComprovante(null);
      try {
        await recarregarPerfil();
      } catch (error) {
        setErroComprovante(
          `O comprovante foi enviado, mas a tela não atualizou: ${mensagemErroAuth(error)}`
        );
      }
    } catch (error) {
      setErroComprovante(mensagemErroAuth(error));
    } finally {
      setEnviandoComprovante(false);
    }
  };

  /* ----- Menu da conta (aside no site, dentro do drawer no mobile) ----- */
  const menuConta = (
    <ContaMenu tipo="profissional" />
  );

  /* ----- Colunas de conteúdo ----- */
  const colunaEsquerda = (
    <View style={[s.coluna, empilhado ? s.colunaEmpilhada : s.colunaEsquerda]}>
      <Card titulo="Sobre mim" icone="person-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Descrição profissional ainda não cadastrada.</Text>
      </Card>

      <Card titulo="Áreas de atuação" icone="compass-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Nenhuma área de atuação cadastrada.</Text>
      </Card>

      <Card titulo="Serviços oferecidos" icone="construct-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Nenhum serviço cadastrado.</Text>
      </Card>

      <Card titulo="Portfólio em destaque" icone="folder-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Nenhum item de portfólio cadastrado.</Text>
        <BotaoCard texto="Ver portfólio completo" mobile={mobile} onPress={() => navegar('/Meuportfolio')} />
      </Card>

      <Card titulo="Avaliações recentes" icone="star-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Nenhuma avaliação cadastrada.</Text>
        <BotaoCard texto="Ver todas as avaliações" mobile={mobile} onPress={() => navegar('/Comentarios')} />
      </Card>
    </View>
  );

  const colunaDireita = (
    <View style={[s.coluna, empilhado ? s.colunaEmpilhada : s.colunaDireita]}>
      <Card titulo="Resumo profissional" icone="briefcase-outline" mobile={mobile}>
        <ListaInfo itens={resumo} />
      </Card>

      <Card titulo="Registro profissional" icone="ribbon-outline" mobile={mobile}>
        <ListaInfo itens={registro} />
      </Card>

      <Card titulo="Comprovante profissional" icone="document-text-outline" mobile={mobile}>
        <Text style={s.paragrafo}>
          {perfil?.professional_document_path
            ? `Documento enviado. Status: ${statusTexto}.`
            : 'Nenhum comprovante enviado.'}
        </Text>
        {!!arquivoComprovante && (
          <Text style={s.paragrafo} numberOfLines={1}>
            Arquivo selecionado: {arquivoComprovante.name}
          </Text>
        )}
        {!!erroComprovante && <Text style={s.erroComprovante}>{erroComprovante}</Text>}
        {!perfilTela.verificado && (
          <>
            <BotaoCard
              texto={arquivoComprovante ? 'Trocar arquivo' : 'Selecionar comprovante'}
              mobile={mobile}
              onPress={escolherComprovante}
              desativado={enviandoComprovante}
            />
            {!!arquivoComprovante && (
              <BotaoCard
                texto={enviandoComprovante ? 'Enviando...' : 'Enviar comprovante'}
                mobile={mobile}
                onPress={enviarComprovante}
                desativado={enviandoComprovante}
              />
            )}
          </>
        )}
      </Card>

      <Card titulo="Disponibilidade" icone="time-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Horários de atendimento ainda não cadastrados.</Text>
      </Card>

      <Card titulo="Região de atendimento" icone="location-outline" mobile={mobile}>
        {localidade ? <Tags itens={[localidade]} /> : <Text style={s.paragrafo}>Região não informada.</Text>}
      </Card>

      <Card titulo="Orçamento" icone="cash-outline" mobile={mobile}>
        <Text style={s.paragrafo}>Informações de orçamento ainda não cadastradas.</Text>
      </Card>
    </View>
  );

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
          {!mobile && <View style={[s.menuLateral, medio && s.menuLateralMedio]}>{menuConta}</View>}

          <View style={[s.principal, medio && s.principalMedio, mobile && s.principalMobile]}>
            {!carregado ? (
              <Card titulo="Conta" icone="person-outline" mobile={mobile}>
                <Text style={s.paragrafo}>Carregando os dados da conta...</Text>
              </Card>
            ) : !user ? (
              <Card titulo="Conta" icone="person-outline" mobile={mobile}>
                <Text style={s.paragrafo}>Entre na sua conta para visualizar o perfil profissional.</Text>
                <BotaoCard texto="Ir para o login" mobile={mobile} onPress={() => navegar('/login')} />
              </Card>
            ) : erroPerfil ? (
              <Card titulo="Conta" icone="person-outline" mobile={mobile}>
                <Text style={s.paragrafo}>Não foi possível carregar seu perfil: {erroPerfil}</Text>
              </Card>
            ) : tipo !== 'profissional' ? (
              <Card titulo="Conta" icone="person-outline" mobile={mobile}>
                <Text style={s.paragrafo}>Esta tela é destinada a contas profissionais.</Text>
              </Card>
            ) : (
              <>
                <CabecalhoPagina mobile={mobile} onEditar={() => navegar('/DadosPermissoes')} />

                <View style={[s.bloco, mobile && s.blocoMobile]}>
                  <CardPerfil
                    mobile={mobile}
                    empilhado={empilhado}
                    perfil={perfilTela}
                    onEditar={() => navegar('/DadosPermissoes')}
                    onEditarFoto={editarFoto}
                  />
                  <Estatisticas mobile={mobile} />
                </View>

                <View style={[s.colunas, empilhado && s.colunasEmpilhadas]}>
                  {colunaEsquerda}
                  {colunaDireita}
                </View>
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
          nomeUsuario={perfilTela.nome}
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
  semBorda: { borderBottomWidth: 0 },
  cinza: { color: '#8f9497', fontSize: 12 },

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

  /* ----- Menu lateral (site) ----- */
  menuLateral: {
    width: 180,
    padding: 11,
    gap: 4,
    backgroundColor: '#101010',
    borderRightWidth: 1,
    borderColor: '#333',
  },
  menuLateralMedio: { width: 150, padding: 8 },
  itemMenu: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  itemMenuMedio: { minHeight: 28, padding: 6, gap: 8 },
  itemMenuMobile: { minHeight: 48, paddingHorizontal: 14, gap: 14, borderRadius: 10 },
  itemAtivo: { backgroundColor: '#29231a', borderColor: '#6e572b' },
  textoMenu: { flexShrink: 1, color: '#fff', fontSize: 11 },
  textoMenuMedio: { fontSize: 10 },
  textoMenuMobile: { fontSize: 15 },
  divisor: { height: 1, marginVertical: 6, backgroundColor: '#333' },

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
  principal: { flex: 1, minWidth: 0, padding: 12 },
  principalMedio: { padding: 10 },
  principalMobile: { ...ALTURA_AUTO, padding: 16, gap: 16 },

  /* ----- Cabeçalho da página ----- */
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  cabecalhoMobile: { ...ALTURA_AUTO, marginTop: 0, paddingBottom: 12 },
  titulos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  tituloMobile: { fontSize: 26 },
  subtitulo: { color: '#eee', fontSize: 12 },
  subtituloMobile: { marginTop: 2, color: '#bbb', fontSize: 14 },

  /* ----- Botão editar ----- */
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 9,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  botaoEditarMobile: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    backgroundColor: '#1d1b16',
    borderRadius: 10,
  },
  textoEditar: { color: DOURADO, fontSize: 11 },
  textoEditarMobile: { fontSize: 13 },

  /* ----- Bloco topo (perfil + números) ----- */
  bloco: { gap: 14, marginTop: 14 },
  blocoMobile: { ...ALTURA_AUTO, marginTop: 0, gap: 16 },

  /* ----- Card do perfil ----- */
  perfilCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 18,
    padding: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  perfilCardMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    backgroundColor: 'rgba(17, 17, 17, 0.92)',
    borderRadius: 14,
  },
  fotoColuna: { alignItems: 'center', gap: 8 },
  foto: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DOURADO,
    borderRadius: 50,
  },
  fotoMobile: { width: 110, height: 110, borderRadius: 55 },
  botaoFoto: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 12,
  },
  textoBotaoFoto: { color: DOURADO, fontSize: 10 },
  dadosUsuario: { flex: 1, minWidth: 200 },
  dadosUsuarioMobile: { ...ALTURA_AUTO, minWidth: 0, alignItems: 'center' },
  nome: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  nomeMobile: { fontSize: 20, textAlign: 'center' },
  profissao: { marginTop: 3, color: DOURADO, fontSize: 13 },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  selosMobile: { justifyContent: 'center' },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
  },
  seloVerificado: { backgroundColor: '#07583b', borderColor: '#07583b' },
  textoSelo: { color: '#c8c8c8', fontSize: 11 },
  textoSeloVerificado: { color: '#8bd7b3' },
  linhaAvaliacao: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  linhaAvaliacaoMobile: { justifyContent: 'center' },
  estrelas: { flexDirection: 'row', gap: 2 },
  notaTopo: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  /* contato rápido */
  contatos: {
    gap: 10,
    paddingLeft: 18,
    borderLeftWidth: 1,
    borderColor: '#333',
  },
  contatosEmpilhados: {
    alignSelf: 'stretch',
    paddingLeft: 0,
    paddingTop: 14,
    borderLeftWidth: 0,
    borderTopWidth: 1,
  },
  contatoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textoContato: { flexShrink: 1, color: '#c8c8c8', fontSize: 12 },

  /* ----- Estatísticas ----- */
  estatisticas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  estatisticasMobile: { ...ALTURA_AUTO, gap: 8 },
  cardEstatistica: {
    flexGrow: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardEstatisticaMobile: { minWidth: 0, padding: 10 },
  textosEstatistica: { flex: 1, minWidth: 0 },
  valorEstatistica: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  valorEstatisticaMobile: { fontSize: 17 },
  tituloEstatistica: { marginTop: 2, color: '#8f9497', fontSize: 10 },
  iconeCirculo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 18,
  },

  /* ----- Colunas ----- */
  colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 14 },
  colunasEmpilhadas: { ...ALTURA_AUTO, flexDirection: 'column', alignItems: 'stretch', gap: 16, marginTop: 0 },
  coluna: { minWidth: 0, gap: 14 },
  colunaEsquerda: { flex: 1.6 },
  colunaDireita: { flex: 1 },
  colunaEmpilhada: { ...ALTURA_AUTO, gap: 16 },

  /* ----- Card genérico ----- */
  card: {
    padding: 14,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  cardMobile: { padding: 16, backgroundColor: 'rgba(24, 24, 24, 0.95)', borderRadius: 14 },
  tituloCardLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#383838',
  },
  tituloCard: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  paragrafo: { marginTop: 8, color: '#c8c8c8', fontSize: 13, lineHeight: 21 },
  erroComprovante: { marginTop: 8, color: '#e0594a', fontSize: 12, lineHeight: 18 },

  /* ----- Tags ----- */
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 13,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 20,
  },
  textoTag: { color: AMARELO, fontSize: 12 },

  /* ----- Serviços ----- */
  servico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#353535',
  },
  servicoMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 6 },
  servicoTextos: { flex: 1 },
  servicoNome: { color: '#e7e7e7', fontSize: 13, fontWeight: '600' },
  servicoDescricao: { marginTop: 3, color: '#8f9497', fontSize: 11, lineHeight: 16 },
  servicoPreco: { color: AMARELO, fontSize: 13, fontWeight: '600' },

  /* ----- Portfólio ----- */
  portfolio: { flexDirection: 'row', gap: 10, marginTop: 10 },
  portfolioMobile: { flexDirection: 'column' },
  projeto: {
    flex: 1,
    paddingBottom: 10,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  projetoMobile: { ...ALTURA_AUTO },
  projetoImg: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#0f0e0a',
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  projetoNome: { paddingHorizontal: 12, color: '#e7e7e7', fontSize: 13, fontWeight: '600' },
  projetoDetalhe: { paddingHorizontal: 12, marginTop: 3, color: '#8f9497', fontSize: 11 },

  /* ----- Avaliações ----- */
  avaliacao: {
    gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#353535',
  },
  avaliacaoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avaliacaoAutor: { color: '#e7e7e7', fontSize: 13, fontWeight: 'bold' },
  avaliacaoTexto: { color: '#c8c8c8', fontSize: 12, lineHeight: 18 },

  /* ----- Linhas de informação ----- */
  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#353535',
  },
  rotuloInfo: { flexShrink: 1, color: '#8f9497', fontSize: 12 },
  valorInfo: { flexShrink: 1, color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  valorApagado: { color: '#8f9497', fontWeight: '400' },

  /* ----- Botão dos cards ----- */
  botaoLargo: {
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    padding: 8,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 7,
  },
  botaoLargoMobile: { minHeight: 46, borderRadius: 10 },
  textoBotao: { color: DOURADO, fontSize: 11 },
  textoBotaoMobile: { fontSize: 14, fontWeight: '600' },

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