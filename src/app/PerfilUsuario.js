import { Ionicons } from '@expo/vector-icons';
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
import { getSupabaseClient } from '../services/supabase';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#c9a45c';
const LARGURA_DRAWER = 290;

// Em coluna, "flex: 0" / "flex: 1" colapsam a altura (flex-basis: 0).
// Use isto para deixar o item com a altura do próprio conteúdo.
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

const formatarData = (valor) => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : 'Não informado';
};

const formatarCPF = (valor) => {
  const digitos = (valor || '').replace(/\D/g, '');
  return digitos.length === 11
    ? digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : 'Não informado';
};

const formatarTelefone = (valor) => {
  const digitos = (valor || '').replace(/\D/g, '');
  if (digitos.length === 11) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digitos.length === 10) return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return valor || 'Não informado';
};

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

function AvisoLogin({ mobile, onLogin }) {
  return (
    <View style={s.avisoCaixa}>
      <Ionicons
        name="information-circle-outline"
        size={mobile ? 22 : 18}
        color={DOURADO}
      />
      <View style={s.avisoTextos}>
        <Text style={[s.aviso, mobile && s.avisoMobile]}>
          Você precisa estar logado para visualizar seus dados.
        </Text>
        <Pressable onPress={onLogin} hitSlop={8}>
          <Text style={[s.linkLogin, mobile && s.linkLoginMobile]}>
            Ir para o login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BotaoEditar({ mobile, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.botaoEditar,
        mobile && s.botaoEditarMobile,
        pressed && s.pressionado,
      ]}
    >
      <Ionicons name="create-outline" size={mobile ? 17 : 15} color={DOURADO} />
      <Text style={[s.textoEditar, mobile && s.textoEditarMobile]}>
        Editar Perfil
      </Text>
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

function CardUsuario({ mobile, onEditar, nome, membroDesde }) {
  return (
    <View style={[s.usuario, mobile && s.usuarioMobile]}>
      <View style={[s.foto, mobile && s.fotoMobile]}>
        <Ionicons
          name="person-circle-outline"
          size={mobile ? 84 : 66}
          color={DOURADO}
        />
      </View>

      <View style={[s.dadosUsuario, mobile && s.dadosUsuarioMobile]}>
        <Text style={[s.nome, mobile && s.nomeMobile]}>{nome}</Text>
        <View style={[s.linhaMembro, mobile && s.linhaMembroMobile]}>
          <Ionicons name="calendar-outline" size={14} color={DOURADO} />
          <Text style={s.dataMembro}>Membro desde {membroDesde}</Text>
        </View>
      </View>

      {mobile && <BotaoEditar mobile onPress={onEditar} />}
    </View>
  );
}

function Estatisticas({ mobile, medio }) {
  return (
    <View style={[s.estatisticas, mobile && s.estatisticasMobile]}>
      <View style={[s.cardEstatistica, medio && s.cardEstatisticaMedio, mobile && s.cardEstatisticaMobile]}>
        <Text style={[s.nomeEstatistica, mobile && s.nomeEstatisticaMobile]}>
          Projetos, pedidos e favoritos aparecerão aqui após a integração desses módulos.
        </Text>
      </View>
    </View>
  );
}

function BotaoCard({ texto, mobile, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.botaoLargo,
        mobile && s.botaoLargoMobile,
        pressed && s.pressionado,
      ]}
    >
      <Text style={[s.textoBotao, mobile && s.textoBotaoMobile]}>{texto}</Text>
    </Pressable>
  );
}

function CardInformacoes({ mobile, onAlterarSenha, informacoes }) {
  return (
    <View style={[s.cardGrande, mobile && s.cardGrandeMobile]}>
      <Text style={s.tituloCard}>Informações Pessoais</Text>

      {informacoes.map((info, i) => (
        <View
          key={info.nome}
          style={[
            s.linhaInfo,
            mobile && s.linhaInfoMobile,
            i === informacoes.length - 1 && s.semBorda,
          ]}
        >
          <View style={s.iconeCirculo}>
            <Ionicons name={info.icone} size={16} color={DOURADO} />
          </View>

          <View style={s.textosInfo}>
            <Text style={[s.textoInfo, mobile && s.textoInfoMobile]}>
              {info.nome}
            </Text>
            <Text
              style={[s.valorInfo, mobile && s.valorInfoMobile]}
              numberOfLines={1}
            >
              {info.valor}
            </Text>
          </View>
        </View>
      ))}

      <BotaoCard texto="Alterar Senha" mobile={mobile} onPress={onAlterarSenha} />
    </View>
  );
}

function CardPlantasAdquiridas({ mobile, plantas, carregando, onAbrir }) {
  return (
    <View style={[s.cardGrande, mobile && s.cardGrandeMobile]}>
      <Text style={s.tituloCard}>Plantas adquiridas</Text>
      {carregando ? (
        <Text style={s.descricaoAtividade}>Carregando suas plantas...</Text>
      ) : plantas.length === 0 ? (
        <Text style={s.descricaoAtividade}>Você ainda não adquiriu nenhuma planta.</Text>
      ) : plantas.map((planta) => (
        <Pressable key={String(planta.id)} style={s.plantaAdquirida} onPress={() => onAbrir(planta.id)}>
          <View style={s.plantaAdquiridaIcone}><Ionicons name="home-outline" size={20} color={DOURADO} /></View>
          <View style={s.plantaAdquiridaInfo}>
            <Text style={s.plantaAdquiridaNome}>{planta.nome}</Text>
            <Text style={s.plantaAdquiridaTipo}>{planta.categoria || 'Projeto'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={DOURADO} />
        </Pressable>
      ))}
    </View>
  );
}

function CardAtividades({ mobile, onVerTodas }) {
  return (
    <View style={[s.cardGrande, mobile && s.cardGrandeMobile]}>
      <Text style={s.tituloCard}>Atividades Recentes</Text>
      <Text style={[s.descricaoAtividade, mobile && s.descricaoAtividadeMobile]}>
        As atividades serão exibidas quando pedidos, mensagens e projetos estiverem conectados.
      </Text>

      <BotaoCard
        texto="Ver todas as atividades"
        mobile={mobile}
        onPress={onVerTodas}
      />
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

export default function PerfilUsuario() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, perfil, tipo, carregado, erroPerfil } = useConta();
  const [plantasAdquiridas, setPlantasAdquiridas] = useState([]);
  const [carregandoPlantas, setCarregandoPlantas] = useState(false);
  const { width, height } = useWindowDimensions();
  const nomeUsuario = perfil?.full_name || user?.email || 'Usuário';
  const membroDesde = user?.created_at
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : 'Não informado';
  const informacoes = [
    { nome: 'Nome Completo', valor: perfil?.full_name || 'Não informado', icone: 'person-outline' },
    { nome: 'Data de Nascimento', valor: formatarData(perfil?.birth_date), icone: 'calendar-outline' },
    { nome: 'CPF', valor: formatarCPF(perfil?.cpf), icone: 'card-outline' },
    { nome: 'E-mail', valor: user?.email || 'Não informado', icone: 'mail-outline' },
    { nome: 'Telefone', valor: formatarTelefone(perfil?.phone), icone: 'call-outline' },
  ];

  useEffect(() => {
    let ativo = true;
    async function carregarPlantasAdquiridas() {
      if (!user?.id || tipo !== 'usuario') { setPlantasAdquiridas([]); return; }
      setCarregandoPlantas(true);
      try {
        const supabase = getSupabaseClient();
        const { data: aquisicoes, error: erroAquisicoes } = await supabase
          .from('plantas_adquiridas').select('planta_id').eq('usuario_id', user.id)
          .order('adquirido_em', { ascending: false });
        if (erroAquisicoes) throw erroAquisicoes;
        const ids = (aquisicoes || []).map((item) => item.planta_id).filter(Boolean);
        if (!ids.length) { if (ativo) setPlantasAdquiridas([]); return; }
        const { data: plantas, error: erroPlantas } = await supabase
          .from('plantas').select('id,nome,categoria,imagem_url').in('id', ids);
        if (erroPlantas) throw erroPlantas;
        const porId = new Map((plantas || []).map((planta) => [String(planta.id), planta]));
        const ordenadas = ids.map((id) => porId.get(String(id))).filter(Boolean);
        if (ativo) setPlantasAdquiridas(ordenadas);
      } catch (falha) {
        console.error('Erro ao carregar plantas adquiridas:', falha);
        if (ativo) setPlantasAdquiridas([]);
      } finally {
        if (ativo) setCarregandoPlantas(false);
      }
    }
    carregarPlantasAdquiridas();
    return () => { ativo = false; };
  }, [user?.id, tipo]);

  // Celular em pé: menu vira drawer
  const mobile = width < 650;
  // Celular deitado / tablet: mantém o layout do site, só que menor
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

  // Se a tela crescer para o tamanho de site, fecha o drawer
  useEffect(() => {
    if (!mobile) setMenuAberto(false);
  }, [mobile]);

  /* ----- Navegação ----- */
  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const verTodasAtividades = () =>
    Alert.alert(
      'Atividades',
      'A lista completa poderá ser conectada ao histórico do usuário.'
    );

  /* ----- Menu da conta (aside no site, dentro do drawer no mobile) ----- */
  const menuConta = (
    <ContaMenu tipo="usuario" />
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
            {!carregado ? (
              <View style={s.avisoCaixa}>
                <Text style={s.aviso}>Carregando os dados da conta...</Text>
              </View>
            ) : !user ? (
              <AvisoLogin mobile={mobile} onLogin={() => navegar('/login')} />
            ) : erroPerfil ? (
              <View style={s.avisoCaixa}>
                <Text style={s.aviso}>Não foi possível carregar seu perfil: {erroPerfil}</Text>
              </View>
            ) : tipo !== 'usuario' ? (
              <View style={s.avisoCaixa}>
                <Text style={s.aviso}>Esta tela é destinada a contas de cliente.</Text>
              </View>
            ) : (
              <>
                <CabecalhoPagina
                  mobile={mobile}
                  onEditar={() => navegar('/DadosPermissoes')}
                />

                <View style={[s.resumo, mobile && s.resumoMobile]}>
                  <CardUsuario
                    mobile={mobile}
                    nome={nomeUsuario}
                    membroDesde={membroDesde}
                    onEditar={() => navegar('/DadosPermissoes')}
                  />
                  <Estatisticas mobile={mobile} medio={medio} />
                </View>

                <CardPlantasAdquiridas
                  mobile={mobile}
                  plantas={plantasAdquiridas}
                  carregando={carregandoPlantas}
                  onAbrir={(id) => navegar({ pathname: '/detalhesPlantas', params: { id: String(id) } })}
                />

                <View style={[s.colunas, mobile && s.colunasMobile]}>
                  <CardInformacoes
                    mobile={mobile}
                    informacoes={informacoes}
                    onAlterarSenha={() => navegar('/AlterarSenha')}
                  />
                  <CardAtividades mobile={mobile} onVerTodas={verTodasAtividades} />
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
          nomeUsuario={nomeUsuario}
        >
          {menuConta}
        </Drawer>
      )}
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  /* ----- Base ----- */
  fundo: {
    flex: 1,
    backgroundColor: '#090909',
  },
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  conteudo: {
    flexGrow: 1,
  },
  pressionado: {
    opacity: 0.75,
  },
  semBorda: {
    borderBottomWidth: 0,
  },

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
  topoMedio: {
    minHeight: 56,
    paddingHorizontal: 16,
  },
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
  logo: {
    width: 110,
    height: 62,
  },
  logoMedio: {
    width: 80,
    height: 44,
  },
  logoMobile: {
    width: 90,
    height: 48,
  },
  linksTopo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 30,
  },
  linkTopo: {
    color: '#fff',
    fontSize: 13,
  },

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
  painelMedio: {
    marginTop: 12,
    marginBottom: 30,
  },
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
  menuLateralMedio: {
    width: 150,
    padding: 8,
  },
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
  itemMenuMedio: {
    minHeight: 28,
    padding: 6,
    gap: 8,
  },
  itemMenuMobile: {
    minHeight: 48,
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 10,
  },
  itemAtivo: {
    backgroundColor: '#29231a',
    borderColor: '#6e572b',
  },
  textoMenu: {
    flexShrink: 1,
    color: '#fff',
    fontSize: 11,
  },
  textoMenuMedio: {
    fontSize: 10,
  },
  textoMenuMobile: {
    fontSize: 15,
  },
  divisor: {
    height: 1,
    marginVertical: 6,
    backgroundColor: '#333',
  },

  /* ----- Drawer ----- */
  camadaDrawer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  areaFechar: {
    flex: 1,
  },
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
  drawerUsuario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerTitulo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  drawerSub: {
    marginTop: 1,
    color: '#aaa',
    fontSize: 12,
  },
  drawerLista: {
    padding: 12,
    gap: 6,
  },
  drawerSecao: {
    marginLeft: 4,
    marginBottom: 2,
    color: '#777',
    fontSize: 11,
    letterSpacing: 1,
  },
  drawerSecaoSeparada: {
    marginTop: 14,
  },

  plantaAdquirida: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#292929' },
  plantaAdquiridaIcone: { width: 42, height: 42, borderRadius: 9, backgroundColor: '#29231a', alignItems: 'center', justifyContent: 'center' },
  plantaAdquiridaInfo: { flex: 1 },
  plantaAdquiridaNome: { color: '#fff', fontSize: 14, fontWeight: '600' },
  plantaAdquiridaTipo: { color: '#aaa', fontSize: 12, marginTop: 3 },

  /* ----- Conteúdo principal ----- */
  principal: {
    flex: 1,
    minWidth: 0,
    padding: 12,
  },
  principalMedio: {
    padding: 10,
  },
  principalMobile: {
    ...ALTURA_AUTO,
    padding: 16,
    gap: 16,
  },

  /* ----- Aviso de login ----- */
  avisoCaixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(201, 164, 92, 0.08)',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 10,
  },
  avisoTextos: {
    flex: 1,
  },
  aviso: {
    color: '#fff',
    fontSize: 11,
  },
  avisoMobile: {
    fontSize: 13,
    lineHeight: 18,
  },
  linkLogin: {
    marginTop: 2,
    color: DOURADO,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  linkLoginMobile: {
    marginTop: 4,
    fontSize: 14,
  },

  /* ----- Cabeçalho da página ----- */
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
  cabecalhoMobile: {
    ...ALTURA_AUTO,
    marginTop: 0,
    paddingBottom: 12,
  },
  titulos: {
    flex: 1,
  },
  titulo: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
  },
  tituloMobile: {
    fontSize: 26,
  },
  subtitulo: {
    color: '#eee',
    fontSize: 12,
  },
  subtituloMobile: {
    marginTop: 2,
    color: '#bbb',
    fontSize: 14,
  },

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
  textoEditar: {
    color: DOURADO,
    fontSize: 11,
  },
  textoEditarMobile: {
    fontSize: 13,
  },

  /* ----- Resumo (usuário + estatísticas) ----- */
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    marginVertical: 14,
  },
  resumoMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
    marginVertical: 0,
  },
  usuario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  usuarioMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    gap: 12,
    padding: 18,
    backgroundColor: 'rgba(17, 17, 17, 0.92)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
  },
  foto: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DOURADO,
    borderRadius: 60,
  },
  fotoMobile: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  dadosUsuario: {
    flex: 1,
  },
  dadosUsuarioMobile: {
    ...ALTURA_AUTO,
    alignItems: 'center',
  },
  nome: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
  },
  nomeMobile: {
    fontSize: 20,
    textAlign: 'center',
  },
  linhaMembro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
  },
  linhaMembroMobile: {
    marginTop: 6,
  },
  dataMembro: {
    color: '#ddd',
    fontSize: 12,
  },

  /* ----- Estatísticas ----- */
  estatisticas: {
    flexDirection: 'row',
    gap: 10,
  },
  estatisticasMobile: {
    ...ALTURA_AUTO,
    gap: 8,
  },
  cardEstatistica: {
    width: 105,
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 8,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardEstatisticaMedio: {
    width: 90,
    minHeight: 96,
  },
  cardEstatisticaMobile: {
    flex: 1,
    width: undefined,
    minHeight: 104,
    paddingHorizontal: 4,
  },
  numero: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  numeroMobile: {
    fontSize: 22,
  },
  nomeEstatistica: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  nomeEstatisticaMobile: {
    color: '#ccc',
  },

  /* ----- Colunas / cards grandes ----- */
  colunas: {
    flexDirection: 'row',
    gap: 18,
  },
  colunasMobile: {
    ...ALTURA_AUTO,
    flexDirection: 'column',
    gap: 16,
  },
  cardGrande: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  cardGrandeMobile: {
    ...ALTURA_AUTO,
    padding: 16,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderRadius: 14,
  },
  tituloCard: {
    paddingBottom: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#383838',
  },
  iconeCirculo: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 17,
  },

  /* ----- Informações pessoais ----- */
  linhaInfo: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#353535',
  },
  linhaInfoMobile: {
    minHeight: 60,
    paddingVertical: 8,
  },
  textosInfo: {
    flex: 1,
  },
  textoInfo: {
    color: '#aaa',
    fontSize: 11,
  },
  textoInfoMobile: {
    fontSize: 12,
  },
  valorInfo: {
    marginTop: 2,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valorInfoMobile: {
    fontSize: 15,
  },

  /* ----- Atividades ----- */
  atividade: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: '#353535',
  },
  detalhesAtividade: {
    flex: 1,
  },
  tituloAtividade: {
    color: '#fff',
    fontSize: 12,
  },
  tituloAtividadeMobile: {
    fontSize: 15,
    fontWeight: '600',
  },
  descricaoAtividade: {
    marginTop: 3,
    color: '#aaa',
    fontSize: 9,
  },
  descricaoAtividadeMobile: {
    fontSize: 13,
    lineHeight: 18,
  },
  dataAtividade: {
    color: '#aaa',
    fontSize: 10,
  },
  dataAtividadeMobile: {
    marginTop: 4,
    color: DOURADO,
    fontSize: 12,
  },

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
  botaoLargoMobile: {
    minHeight: 46,
    borderRadius: 10,
  },
  textoBotao: {
    color: DOURADO,
    fontSize: 11,
  },
  textoBotaoMobile: {
    fontSize: 14,
    fontWeight: '600',
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
  rodapeMobile: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  textoRodape: {
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
  },
  termos: {
    color: DOURADO,
    fontSize: 11,
  },
});