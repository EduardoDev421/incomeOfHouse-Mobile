import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usarConta } from '../components/ContaProvider';
import ContaMenu from '../components/MenuConta';

const DOURADO = '#c9a45c';
const LARGURA_DRAWER = 290;

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

const ICONES_TIPO = {
  casa: 'home-outline',
  trabalho: 'briefcase-outline',
  outro: 'location-outline',
};

const ENDERECOS_INICIAIS = [
  {
    id: '1',
    titulo: 'Minha casa',
    tipo: 'casa',
    cep: '70000000',
    rua: 'Rua das Flores',
    numero: '100',
    complemento: '',
    bairro: 'Asa Sul',
    cidade: 'Brasília',
    uf: 'DF',
    padrao: true,
  },
  {
    id: '2',
    titulo: 'Trabalho',
    tipo: 'trabalho',
    cep: '70000001',
    rua: 'Avenida Central',
    numero: '250',
    complemento: 'Sala 12',
    bairro: 'Asa Norte',
    cidade: 'Brasília',
    uf: 'DF',
    padrao: false,
  },
];

const FORM_VAZIO = {
  id: null,
  titulo: '',
  tipo: 'casa',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  padrao: false,
};

const apenasDigitos = (texto) => texto.replace(/\D/g, '');

const formatarCep = (cep) => {
  const d = apenasDigitos(cep).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const linhaRua = (e) =>
  [`${e.rua}, ${e.numero}`, e.complemento].filter(Boolean).join(' · ');

const linhaCidade = (e) =>
  [e.bairro, `${e.cidade} - ${e.uf}`].filter(Boolean).join(' · ');

const validar = (f) => {
  if (!f.titulo.trim()) return 'Dê um nome ao endereço (ex.: Minha casa).';
  if (apenasDigitos(f.cep).length !== 8) return 'Informe um CEP com 8 dígitos.';
  if (!f.rua.trim()) return 'Informe a rua.';
  if (!f.numero.trim()) return 'Informe o número.';
  if (!f.cidade.trim()) return 'Informe a cidade.';
  if (f.uf.trim().length !== 2) return 'Informe a UF com 2 letras.';
  return '';
};

function ItemMenu({ nome, icone, ativo, mobile, medio, onPress }) {
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
      <Ionicons name={icone} size={mobile ? 20 : medio ? 14 : 16} color={DOURADO} />
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

function Topo({ mobile, medio, insets, onAbrirMenu, onNavegar, rotaPerfil }) {
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
          onPress={() => onNavegar(rotaPerfil)}
          style={s.avatarTopo}
          accessibilityLabel="Ir para o perfil"
        >
          <Ionicons name="person-outline" size={20} color={DOURADO} />
        </Pressable>
      )}
    </View>
  );
}

function Drawer({ aberto, deslize, fade, insets, onFechar, onNavegar, children }) {
  return (
    <View style={s.camadaDrawer} pointerEvents={aberto ? 'auto' : 'none'}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <Pressable style={s.areaFechar} onPress={onFechar} />
      </Animated.View>

      <Animated.View
        style={[
          s.drawer,
          {
            paddingTop: 16 + insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: deslize }],
          },
        ]}
      >
        <View style={s.drawerTopo}>
          <View style={s.drawerUsuario}>
            <Ionicons name="person-circle-outline" size={44} color={DOURADO} />
            <Text style={s.drawerTitulo}>Minha Conta</Text>
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

function CardEndereco({ endereco, mobile, onEditar, onExcluir, onPadrao }) {
  return (
    <View style={[s.card, mobile && s.cardMobile, endereco.padrao && s.cardPadrao]}>
      <View style={s.cardTopo}>
        <View style={s.iconeCirculo}>
          <Ionicons
            name={ICONES_TIPO[endereco.tipo] || ICONES_TIPO.outro}
            size={18}
            color={DOURADO}
          />
        </View>

        <View style={s.cardTitulos}>
          <Text style={[s.cardTitulo, mobile && s.cardTituloMobile]}>
            {endereco.titulo}
          </Text>
          {endereco.padrao && (
            <View style={s.selo}>
              <Ionicons name="checkmark-circle" size={12} color={DOURADO} />
              <Text style={s.textoSelo}>Endereço padrão</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.cardCorpo}>
        <Text style={[s.linhaPrincipal, mobile && s.linhaPrincipalMobile]}>
          {linhaRua(endereco)}
        </Text>
        <Text style={[s.linhaSecundaria, mobile && s.linhaSecundariaMobile]}>
          {linhaCidade(endereco)}
        </Text>
        <Text style={[s.linhaSecundaria, mobile && s.linhaSecundariaMobile]}>
          CEP {formatarCep(endereco.cep)}
        </Text>
      </View>

      <View style={s.cardAcoes}>
        {!endereco.padrao && (
          <Pressable
            onPress={onPadrao}
            style={({ pressed }) => [s.acao, pressed && s.pressionado]}
            hitSlop={6}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={DOURADO} />
            <Text style={s.textoAcao}>Tornar padrão</Text>
          </Pressable>
        )}

        <Pressable
          onPress={onEditar}
          style={({ pressed }) => [s.acao, pressed && s.pressionado]}
          hitSlop={6}
        >
          <Ionicons name="create-outline" size={16} color={DOURADO} />
          <Text style={s.textoAcao}>Editar</Text>
        </Pressable>

        <Pressable
          onPress={onExcluir}
          style={({ pressed }) => [s.acao, s.acaoExcluir, pressed && s.pressionado]}
          hitSlop={6}
        >
          <Ionicons name="trash-outline" size={16} color="#ff8a80" />
          <Text style={[s.textoAcao, s.textoExcluir]}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Campo({ rotulo, estilo, ...props }) {
  return (
    <View style={[s.campo, estilo]}>
      <Text style={s.rotuloCampo}>{rotulo}</Text>
      <TextInput
        style={s.input}
        placeholderTextColor="#555"
        selectionColor={DOURADO}
        {...props}
      />
    </View>
  );
}

function FormEndereco({ visivel, inicial, onFechar, onSalvar }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (visivel) {
      setForm(inicial || FORM_VAZIO);
      setErro('');
    }
  }, [visivel, inicial]);

  const mudar = (campo) => (valor) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = () => {
    const mensagem = validar(form);

    if (mensagem) {
      setErro(mensagem);
      return;
    }

    onSalvar({
      ...form,
      cep: apenasDigitos(form.cep),
      uf: form.uf.toUpperCase(),
    });
  };

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={s.modalFundo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.areaFechar} onPress={onFechar} />

        <View style={s.modalCaixa}>
          <View style={s.modalTopo}>
            <Text style={s.modalTitulo}>
              {form.id ? 'Editar endereço' : 'Novo endereço'}
            </Text>
            <Pressable onPress={onFechar} hitSlop={10}>
              <Ionicons name="close-outline" size={26} color={DOURADO} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={s.modalCorpo}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.tipos}>
              {Object.keys(ICONES_TIPO).map((tipo) => (
                <Pressable
                  key={tipo}
                  onPress={() => mudar('tipo')(tipo)}
                  style={[s.tipo, form.tipo === tipo && s.tipoAtivo]}
                >
                  <Ionicons
                    name={ICONES_TIPO[tipo]}
                    size={16}
                    color={form.tipo === tipo ? DOURADO : '#aaa'}
                  />
                  <Text style={[s.textoTipo, form.tipo === tipo && s.textoTipoAtivo]}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Campo
              rotulo="Nome do endereço"
              placeholder="Ex.: Minha casa"
              value={form.titulo}
              onChangeText={mudar('titulo')}
            />
            <Campo
              rotulo="CEP"
              placeholder="00000-000"
              keyboardType="number-pad"
              value={formatarCep(form.cep)}
              onChangeText={(v) => mudar('cep')(apenasDigitos(v).slice(0, 8))}
            />
            <Campo
              rotulo="Rua"
              placeholder="Rua, avenida..."
              value={form.rua}
              onChangeText={mudar('rua')}
            />

            <View style={s.linhaCampos}>
              <Campo
                rotulo="Número"
                estilo={s.campoPequeno}
                keyboardType="number-pad"
                value={form.numero}
                onChangeText={mudar('numero')}
              />
              <Campo
                rotulo="Complemento"
                estilo={s.campoGrande}
                placeholder="Apto, sala..."
                value={form.complemento}
                onChangeText={mudar('complemento')}
              />
            </View>

            <Campo
              rotulo="Bairro"
              value={form.bairro}
              onChangeText={mudar('bairro')}
            />

            <View style={s.linhaCampos}>
              <Campo
                rotulo="Cidade"
                estilo={s.campoGrande}
                value={form.cidade}
                onChangeText={mudar('cidade')}
              />
              <Campo
                rotulo="UF"
                estilo={s.campoPequeno}
                autoCapitalize="characters"
                maxLength={2}
                value={form.uf}
                onChangeText={mudar('uf')}
              />
            </View>

            <Pressable
              onPress={() => setForm((f) => ({ ...f, padrao: !f.padrao }))}
              style={s.linhaPadrao}
            >
              <Ionicons
                name={form.padrao ? 'checkbox' : 'square-outline'}
                size={22}
                color={DOURADO}
              />
              <Text style={s.textoPadrao}>Usar como endereço padrão</Text>
            </Pressable>

            {!!erro && <Text style={s.erro}>{erro}</Text>}
          </ScrollView>

          <View style={s.modalRodape}>
            <Pressable
              onPress={onFechar}
              style={({ pressed }) => [s.botaoCancelar, pressed && s.pressionado]}
            >
              <Text style={s.textoCancelar}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={salvar}
              style={({ pressed }) => [s.botaoSalvar, pressed && s.pressionado]}
            >
              <Text style={s.textoSalvar}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EstadoVazio({ onAdicionar }) {
  return (
    <View style={s.vazio}>
      <View style={s.vazioIcone}>
        <Ionicons name="location-outline" size={34} color={DOURADO} />
      </View>
      <Text style={s.vazioTitulo}>Nenhum endereço cadastrado</Text>
      <Text style={s.vazioTexto}>
        Adicione um endereço para usar nos seus pedidos.
      </Text>
      <Pressable onPress={onAdicionar} style={s.botaoAdicionar}>
        <Ionicons name="add-outline" size={20} color={DOURADO} />
        <Text style={s.textoAdicionar}>Adicionar endereço</Text>
      </Pressable>
    </View>
  );
}

export default function Meusenderecos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { tipo } = usarConta();
  const rotaPerfil =
    tipo === 'profissional' ? '/PerfilProfissional' : '/PerfilUsuario';

  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);

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
  }, [menuAberto, deslize, fade]);

  useEffect(() => {
    if (!mobile) setMenuAberto(false);
  }, [mobile]);

  const [enderecos, setEnderecos] = useState(ENDERECOS_INICIAIS);
  const [formVisivel, setFormVisivel] = useState(false);
  const [editando, setEditando] = useState(null);

  const abrirNovo = () => {
    setEditando({ ...FORM_VAZIO, padrao: enderecos.length === 0 });
    setFormVisivel(true);
  };

  const abrirEdicao = (endereco) => {
    setEditando(endereco);
    setFormVisivel(true);
  };

  const salvar = (dados) => {
    setEnderecos((lista) => {
      const existe = lista.some((e) => e.id === dados.id);

      const novo = existe
        ? lista.map((e) => (e.id === dados.id ? dados : e))
        : [...lista, { ...dados, id: String(Date.now()) }];

      const idPadrao = dados.padrao
        ? existe
          ? dados.id
          : novo[novo.length - 1].id
        : novo.find((e) => e.padrao)?.id ?? novo[0]?.id;

      return novo.map((e) => ({
        ...e,
        padrao: e.id === idPadrao,
      }));
    });

    setFormVisivel(false);
  };

  const tornarPadrao = (id) => {
    setEnderecos((lista) =>
      lista.map((e) => ({ ...e, padrao: e.id === id }))
    );
  };

  const excluir = (endereco) =>
    Alert.alert('Excluir endereço', `Deseja excluir "${endereco.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          setEnderecos((lista) => {
            const restante = lista.filter((e) => e.id !== endereco.id);

            if (endereco.padrao && restante.length > 0) {
              restante[0] = { ...restante[0], padrao: true };
            }

            return restante;
          }),
      },
    ]);

  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const menuConta = (
    <ContaMenu aoSelecionar={() => setMenuAberto(false)} />
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
          rotaPerfil={rotaPerfil}
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
            <View style={[s.cabecalho, mobile && s.cabecalhoMobile]}>
              <View style={s.titulos}>
                <Text style={[s.titulo, mobile && s.tituloMobile]}>
                  Meus Endereços
                </Text>
                <Text style={[s.subtitulo, mobile && s.subtituloMobile]}>
                  Gerencie os endereços utilizados nos seus pedidos.
                </Text>
              </View>

              {!mobile && enderecos.length > 0 && (
                <Pressable onPress={abrirNovo} style={s.botaoAdicionar}>
                  <Ionicons name="add-outline" size={18} color={DOURADO} />
                  <Text style={s.textoAdicionar}>Novo endereço</Text>
                </Pressable>
              )}
            </View>

            {enderecos.length === 0 ? (
              <EstadoVazio onAdicionar={abrirNovo} />
            ) : (
              <View style={[s.lista, !mobile && s.listaSite]}>
                {enderecos.map((endereco) => (
                  <CardEndereco
                    key={endereco.id}
                    endereco={endereco}
                    mobile={mobile}
                    onEditar={() => abrirEdicao(endereco)}
                    onExcluir={() => excluir(endereco)}
                    onPadrao={() => tornarPadrao(endereco.id)}
                  />
                ))}
              </View>
            )}

            {mobile && enderecos.length > 0 && (
              <Pressable
                onPress={abrirNovo}
                style={({ pressed }) => [
                  s.botaoAdicionar,
                  s.botaoAdicionarMobile,
                  pressed && s.pressionado,
                ]}
              >
                <Ionicons name="add-outline" size={20} color={DOURADO} />
                <Text style={s.textoAdicionar}>Adicionar novo endereço</Text>
              </Pressable>
            )}
          </View>
        </View>

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
          <Text style={s.termos}>
            Termos de Uso  |  Política de Privacidade
          </Text>
        </View>
      </ScrollView>

      {mobile && (
        <Drawer
          aberto={menuAberto}
          deslize={deslize}
          fade={fade}
          insets={insets}
          onFechar={() => setMenuAberto(false)}
          onNavegar={navegar}
        >
          {menuConta}
        </Drawer>
      )}

      <FormEndereco
        visivel={formVisivel}
        inicial={editando}
        onFechar={() => setFormVisivel(false)}
        onSalvar={salvar}
      />
    </ImageBackground>
  );
}

const s = StyleSheet.create({
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
  areaFechar: {
    flex: 1,
  },
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
  camadaDrawer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  principal: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    gap: 16,
  },
  principalMedio: {
    padding: 10,
  },
  principalMobile: {
    ...ALTURA_AUTO,
    padding: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderColor: DOURADO,
  },
  cabecalhoMobile: {
    ...ALTURA_AUTO,
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
  lista: {
    ...ALTURA_AUTO,
    gap: 14,
  },
  listaSite: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 240,
    gap: 12,
    padding: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
  },
  cardMobile: {
    ...ALTURA_AUTO,
    minWidth: 0,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderRadius: 14,
  },
  cardPadrao: {
    borderColor: '#6e572b',
    backgroundColor: '#1c1a14',
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconeCirculo: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 19,
  },
  cardTitulos: {
    flex: 1,
    gap: 4,
  },
  cardTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTituloMobile: {
    fontSize: 17,
  },
  selo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 10,
  },
  textoSelo: {
    color: DOURADO,
    fontSize: 11,
  },
  cardCorpo: {
    gap: 3,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#353535',
  },
  linhaPrincipal: {
    color: '#fff',
    fontSize: 13,
  },
  linhaPrincipalMobile: {
    fontSize: 15,
  },
  linhaSecundaria: {
    color: '#aaa',
    fontSize: 12,
  },
  linhaSecundariaMobile: {
    fontSize: 13,
  },
  cardAcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#353535',
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#6e572b',
    borderRadius: 8,
  },
  acaoExcluir: {
    borderColor: '#5a2f2b',
  },
  textoAcao: {
    color: DOURADO,
    fontSize: 12,
  },
  textoExcluir: {
    color: '#ff8a80',
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  botaoAdicionarMobile: {
    minHeight: 48,
    backgroundColor: '#1d1b16',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  textoAdicionar: {
    color: DOURADO,
    fontSize: 13,
    fontWeight: '600',
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    borderRadius: 14,
  },
  vazioIcone: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
    borderRadius: 32,
  },
  vazioTitulo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  vazioTexto: {
    marginBottom: 6,
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalCaixa: {
    maxHeight: '92%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#59431f',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCorpo: {
    gap: 14,
    padding: 16,
  },
  tipos: {
    flexDirection: 'row',
    gap: 8,
  },
  tipo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 42,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  tipoAtivo: {
    backgroundColor: '#29231a',
    borderColor: '#6e572b',
  },
  textoTipo: {
    color: '#aaa',
    fontSize: 13,
  },
  textoTipoAtivo: {
    color: DOURADO,
  },
  campo: {
    gap: 6,
  },
  campoPequeno: {
    flex: 1,
  },
  campoGrande: {
    flex: 2,
  },
  linhaCampos: {
    flexDirection: 'row',
    gap: 10,
  },
  rotuloCampo: {
    color: '#999',
    fontSize: 12,
  },
  input: {
    height: 46,
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    fontSize: 15,
  },
  linhaPadrao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  textoPadrao: {
    color: '#eee',
    fontSize: 14,
  },
  erro: {
    color: '#ff8a80',
    fontSize: 13,
  },
  modalRodape: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#292929',
  },
  botaoCancelar: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 10,
  },
  textoCancelar: {
    color: '#ccc',
    fontSize: 14,
  },
  botaoSalvar: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 10,
  },
  textoSalvar: {
    color: DOURADO,
    fontSize: 14,
    fontWeight: '600',
  },
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