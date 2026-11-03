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
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usarConta } from './ContaProvider';
import { useLegal } from './LegalProvider';

const gold = '#c9a45c';
const LARGURA_DRAWER = 290;

const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/BackgroundFundo.png');

const LINKS_SITE = [
  { nome: 'Início', icone: 'home-outline', rota: '/' },
  { nome: 'Plantas', icone: 'map-outline', rota: '/planta' },
  { nome: 'Profissionais', icone: 'people-outline', rota: '/profissionais' },
  { nome: 'Sobre Nós', icone: 'information-circle-outline', rota: '/sobreNos' },
];

function ItemMenu({ nome, icone, ativo, mobile, medio, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: !!ativo }}
      style={({ pressed }) => [
        s.itemMenu,
        medio && s.itemMenuMedio,
        mobile && s.itemMenuMobile,
        ativo && s.ativo,
        pressed && s.pressionado,
      ]}
    >
      <Ionicons name={icone} size={mobile ? 20 : medio ? 15 : 17} color={gold} />
      <Text style={[s.textoMenu, medio && s.textoMenuMedio, mobile && s.textoMenuMobile]}>
        {nome}
      </Text>
    </Pressable>
  );
}

export function LayoutConta({ titulo, subtitulo, ativo, children }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { abrirLegal } = useLegal();
  const { menu, limpar } = usarConta();
  const { width, height } = useWindowDimensions();

  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  const paisagem = height < 500;

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

  const estaAtivo = (item) => item.id === ativo || item.nome === ativo;

  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const sair = () => {
    setMenuAberto(false);
    limpar();
    router.replace('/login');
  };

  const rotaPerfil = menu[0]?.rota ?? '/';

  const itensConta = (
    <>
      {menu.map((item) => {
        const ja = estaAtivo(item);
        return (
          <ItemMenu
            key={item.id}
            nome={item.nome}
            icone={item.icone}
            ativo={ja}
            mobile={mobile}
            medio={medio}
            onPress={() => (ja ? setMenuAberto(false) : navegar(item.rota))}
          />
        );
      })}

      <View style={s.divisorMenu} />

      <ItemMenu
        nome="Sair"
        icone="log-out-outline"
        mobile={mobile}
        medio={medio}
        onPress={sair}
      />
    </>
  );

  return (
    <ImageBackground source={FUNDO} style={s.fundo} resizeMode="cover">
      <View style={s.sombra} />

      <ScrollView contentContainerStyle={s.pagina} showsVerticalScrollIndicator={false}>
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
              onPress={() => setMenuAberto(true)}
              style={s.botaoHamburguer}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Abrir menu"
            >
              <Ionicons name="menu-outline" size={26} color={gold} />
            </Pressable>
          )}

          <Pressable
            onPress={() => navegar('/')}
            accessibilityRole="button"
            accessibilityLabel="Ir para o início"
          >
            <Image
              source={LOGO}
              style={[s.logo, medio && s.logoMedio, mobile && s.logoMobile]}
              resizeMode="contain"
            />
          </Pressable>

          {!mobile && (
            <View style={s.links}>
              {LINKS_SITE.map((link) => (
                <Pressable key={link.nome} onPress={() => navegar(link.rota)}>
                  <Text style={s.link}>{link.nome}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => navegar(rotaPerfil)}
            style={mobile ? s.botaoPerfilMobile : undefined}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Meu perfil"
          >
            <Ionicons name="person-outline" size={22} color={gold} />
          </Pressable>
        </View>

        <View style={[s.painel, medio && s.painelMedio, mobile && s.painelMobile]}>
          {!mobile && <View style={[s.menu, medio && s.menuMedio]}>{itensConta}</View>}

          <View style={[s.principal, medio && s.principalMedio, mobile && s.principalMobile]}>
            <Text style={[s.titulo, mobile && s.tituloMobile]}>{titulo}</Text>
            {!!subtitulo && <Text style={s.subtitulo}>{subtitulo}</Text>}

            <View style={s.divisor} />

            <View style={s.conteudo}>
              {typeof children === 'function' ? children({ mobile, medio }) : children}
            </View>
          </View>
        </View>

        <View style={[s.rodape, { paddingBottom: 15 + insets.bottom }]}>
          <Text style={s.textoRodape}>© 2026 IncomeOfHouse. Todos os direitos reservados.</Text>
          <View style={s.linksRodape}>
            <Pressable onPress={() => abrirLegal('termos')} accessibilityRole="button" hitSlop={8}>
              <Text style={s.termos}>Termos de Uso</Text>
            </Pressable>
            <Text style={s.separador}>|</Text>
            <Pressable onPress={() => abrirLegal('privacidade')} accessibilityRole="button" hitSlop={8}>
              <Text style={s.termos}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {mobile && (
        <View style={s.camadaDrawer} pointerEvents={menuAberto ? 'auto' : 'none'}>
          <Animated.View style={[s.overlay, { opacity: fade }]}>
            <Pressable style={s.areaFechar} onPress={() => setMenuAberto(false)} />
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
              <Text style={s.drawerTitulo}>Minha Conta</Text>
              <Pressable
                onPress={() => setMenuAberto(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
              >
                <Ionicons name="close-outline" size={28} color={gold} />
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
                  onPress={() => navegar(link.rota)}
                />
              ))}

              <Text style={[s.drawerSecao, s.drawerSecaoSeparada]}>MINHA CONTA</Text>
              {itensConta}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </ImageBackground>
  );
}

function CorpoConta({ tipo, titulo, subtitulo, dados }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [lista, setLista] = useState(dados);
  const [filtro, setFiltro] = useState('Todos');
  const [form, setForm] = useState({});
  const [pendente, setPendente] = useState(null);
  const [aviso, setAviso] = useState('');

  const visiveis = lista.filter(
    (item) =>
      `${item.titulo} ${item.descricao || ''} ${item.profissional || ''}`
        .toLowerCase()
        .includes(busca.toLowerCase()) &&
      (filtro === 'Todos' || !item.status || item.status === filtro)
  );

  const remover = (id) => {
    setLista((atual) => atual.filter((item) => item.id !== id));
    setPendente(null);
  };

  const mudarForm = (campo) => (valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (aviso) setAviso('');
  };

  const adicionar = () => {
    const tituloNovo = (form.titulo || '').trim();
    if (!tituloNovo) {
      setAviso('Preencha o campo principal.');
      return;
    }

    setLista((atual) => [
      ...atual,
      {
        id: String(Date.now()),
        titulo: tituloNovo,
        descricao: form.descricao || '',
        profissional: form.profissional || '',
        status: 'Em andamento',
      },
    ]);
    setForm({});
    setAviso('Item adicionado à lista.');
  };

  const removivel = ['enderecos', 'portfolio', 'favoritos'].includes(tipo);

  return (
    <View>
      {tipo === 'lista' && (
        <TextInput
          style={s.campo}
          placeholder="Buscar..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
      )}

      {tipo === 'pedidos' && (
        <View style={s.filtros}>
          {['Todos', 'Em andamento', 'Concluído', 'Cancelado'].map((opcao) => (
            <Pressable
              key={opcao}
              onPress={() => setFiltro(opcao)}
              accessibilityRole="button"
              accessibilityState={{ selected: filtro === opcao }}
              style={[s.filtro, filtro === opcao && s.filtroAtivo]}
            >
              <Text style={s.textoFiltro}>{opcao}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {(tipo === 'enderecos' || tipo === 'portfolio') && (
        <View style={s.formulario}>
          <TextInput
            style={s.campo}
            placeholder={tipo === 'enderecos' ? 'Nome do endereço' : 'Título do projeto'}
            placeholderTextColor="#999"
            value={form.titulo || ''}
            onChangeText={mudarForm('titulo')}
          />
          <TextInput
            style={s.campo}
            placeholder={tipo === 'enderecos' ? 'Rua, número e cidade' : 'Descrição do projeto'}
            placeholderTextColor="#999"
            value={form.descricao || ''}
            onChangeText={mudarForm('descricao')}
          />
          {!!aviso && (
            <Text style={s.aviso} accessibilityLiveRegion="polite">
              {aviso}
            </Text>
          )}
          <Pressable style={s.botaoPrincipal} onPress={adicionar} accessibilityRole="button">
            <Text style={s.textoBotao}>Adicionar</Text>
          </Pressable>
        </View>
      )}

      {tipo === 'detalhe' && (
        <View style={s.card}>
          <Ionicons name="receipt-outline" size={34} color={gold} />
          <Text style={s.nome}>{titulo}</Text>
          {subtitulo ? <Text style={s.descricao}>{subtitulo}</Text> : null}
          {visiveis.map((item) => (
            <View key={item.id} style={s.linha}>
              <Text style={s.nome}>{item.titulo}</Text>
              <Text style={s.descricao}>{item.descricao}</Text>
            </View>
          ))}
          <Pressable style={s.botaoPrincipal} onPress={() => router.back()} accessibilityRole="button">
            <Text style={s.textoBotao}>Voltar aos pedidos</Text>
          </Pressable>
        </View>
      )}

      {tipo === 'avaliacoes' && (
        <View style={s.card}>
          <Text style={s.nome}>Avaliações dos profissionais</Text>
          <Text style={s.nota}>★ 4,8 / 5</Text>
          <Text style={s.descricao}>
            Confira as avaliações recebidas e os comentários registrados.
          </Text>
        </View>
      )}

      {tipo !== 'detalhe' && tipo !== 'avaliacoes' && (
        <View style={s.lista}>
          {visiveis.map((item) => (
            <View key={item.id} style={s.card}>
              <View style={s.iconeCard}>
                <Ionicons
                  name={
                    tipo === 'pedidos'
                      ? 'bag-handle-outline'
                      : tipo === 'enderecos'
                      ? 'location-outline'
                      : tipo === 'portfolio'
                      ? 'folder-outline'
                      : tipo === 'favoritos'
                      ? 'person-outline'
                      : 'document-text-outline'
                  }
                  size={24}
                  color={gold}
                />
              </View>

              <View style={s.info}>
                <Text style={s.nome}>{item.titulo}</Text>
                {!!item.descricao && <Text style={s.descricao}>{item.descricao}</Text>}
                {!!item.profissional && <Text style={s.descricao}>{item.profissional}</Text>}
                {!!item.status && <Text style={s.status}>{item.status}</Text>}
              </View>

              <View style={s.acoes}>
                {tipo === 'pedidos' && (
                  <Pressable
                    style={s.botaoPequeno}
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/Pedidodetalhe',
                        params: {
                          id: item.id,
                          titulo: item.titulo,
                          descricao: item.descricao || '',
                          status: item.status || '',
                          profissional: item.profissional || '',
                        },
                      })
                    }
                  >
                    <Text style={s.textoBotaoBorda}>Ver detalhes</Text>
                  </Pressable>
                )}

                {removivel &&
                  (pendente === item.id ? (
                    <>
                      <Pressable
                        onPress={() => setPendente(null)}
                        style={s.botaoCancelar}
                        accessibilityRole="button"
                      >
                        <Text style={s.textoCancelar}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => remover(item.id)}
                        style={s.botaoConfirmar}
                        accessibilityRole="button"
                      >
                        <Text style={s.textoBotao}>Remover</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => setPendente(item.id)}
                      style={s.botaoRemover}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${item.titulo}`}
                    >
                      <Ionicons name="trash-outline" size={17} color="#ff7777" />
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}

          {visiveis.length === 0 && <Text style={s.vazio}>Nenhum item encontrado.</Text>}
        </View>
      )}
    </View>
  );
}

export default function TelaConta({
  titulo,
  subtitulo,
  ativo,
  dados = [],
  tipo = 'lista',
}) {
  return (
    <LayoutConta titulo={titulo} subtitulo={subtitulo} ativo={ativo}>
      <CorpoConta tipo={tipo} titulo={titulo} subtitulo={subtitulo} dados={dados} />
    </LayoutConta>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#090909' },
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  pagina: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  topo: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#51432c',
    backgroundColor: 'rgba(9, 9, 9, 0.96)',
  },
  topoMedio: { minHeight: 56, paddingHorizontal: 16 },
  topoMobile: {
    minHeight: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  botaoHamburguer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6e572b',
    borderRadius: 10,
    backgroundColor: '#1d1d1f',
  },
  botaoPerfilMobile: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: gold,
    borderRadius: 21,
    backgroundColor: '#1d1d1f',
  },
  logo: { width: 110, height: 60 },
  logoMedio: { width: 80, height: 44 },
  logoMobile: { width: 90, height: 48 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 },
  link: { color: '#fff', fontSize: 12 },

  painel: {
    width: '96%',
    maxWidth: 1250,
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 22,
    marginBottom: 80,
    backgroundColor: 'rgba(15,15,15,0.97)',
    borderWidth: 1,
    borderColor: '#292929',
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

  menu: {
    width: 205,
    padding: 10,
    gap: 5,
    backgroundColor: '#090a0b',
    borderRightWidth: 1,
    borderColor: '#292929',
  },
  menuMedio: { width: 160, padding: 8 },
  itemMenu: {
    minHeight: 37,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
    backgroundColor: '#191a1c',
  },
  itemMenuMedio: { minHeight: 30, paddingVertical: 6, paddingHorizontal: 8, gap: 8 },
  itemMenuMobile: { minHeight: 48, paddingHorizontal: 14, gap: 14, borderRadius: 10 },
  ativo: { borderColor: gold, backgroundColor: '#252117' },
  textoMenu: { color: '#eee', fontSize: 11, flexShrink: 1 },
  textoMenuMedio: { fontSize: 10 },
  textoMenuMobile: { fontSize: 15 },
  divisorMenu: { height: 1, backgroundColor: '#333', marginVertical: 6 },

  camadaDrawer: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
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
    borderColor: gold,
  },
  drawerTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  drawerLista: { padding: 12, gap: 6 },
  drawerSecao: {
    marginLeft: 4,
    marginBottom: 2,
    color: '#777',
    fontSize: 11,
    letterSpacing: 1,
  },
  drawerSecaoSeparada: { marginTop: 14 },

  principal: { flex: 1, minWidth: 0, padding: 20 },
  principalMedio: { padding: 14 },
  principalMobile: { ...ALTURA_AUTO, padding: 16 },
  titulo: { color: '#fff', fontSize: 25, fontWeight: 'bold' },
  tituloMobile: { fontSize: 24 },
  subtitulo: { color: '#aeb7c0', fontSize: 13, marginTop: 5 },
  divisor: { height: 1, backgroundColor: '#8e7138', marginVertical: 16 },
  conteudo: { gap: 16 },

  campo: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: '#101112',
    marginBottom: 12,
  },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filtro: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 22,
  },
  filtroAtivo: { backgroundColor: gold, borderColor: gold },
  textoFiltro: { color: '#fff', fontSize: 12 },
  formulario: { marginBottom: 12 },
  aviso: { color: gold, fontSize: 12, marginBottom: 10 },
  lista: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    padding: 14,
    backgroundColor: '#111315',
    borderWidth: 1,
    borderColor: '#303235',
    borderRadius: 11,
  },
  iconeCard: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#594823',
    borderRadius: 10,
  },
  info: { flex: 1, minWidth: 130, gap: 4 },
  nome: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  descricao: { color: '#aab4bf', fontSize: 12, marginTop: 3 },
  status: { color: gold, fontSize: 12, marginTop: 4 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoPequeno: { borderWidth: 1, borderColor: gold, borderRadius: 7, padding: 9 },
  botaoRemover: { padding: 8 },
  botaoCancelar: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 7,
    padding: 9,
  },
  textoCancelar: { color: '#fff', fontSize: 12 },
  botaoConfirmar: {
    backgroundColor: gold,
    borderRadius: 7,
    padding: 9,
  },
  botaoPrincipal: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    backgroundColor: gold,
    borderRadius: 7,
    marginBottom: 8,
  },
  textoBotao: { color: '#171512', fontSize: 12, fontWeight: 'bold' },
  textoBotaoBorda: { color: gold, fontSize: 12, fontWeight: 'bold' },
  vazio: { color: '#aaa', textAlign: 'center', padding: 25 },
  linha: { width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#333' },
  nota: { color: gold, fontSize: 24, marginTop: 12 },

  rodape: {
    minHeight: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 15,
    paddingHorizontal: 20,
    backgroundColor: '#090909',
    borderTopWidth: 1,
    borderColor: gold,
  },
  textoRodape: { color: '#aaa', fontSize: 11 },
  linksRodape: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termos: { color: gold, fontSize: 11 },
  separador: { color: '#555', fontSize: 11 },
});