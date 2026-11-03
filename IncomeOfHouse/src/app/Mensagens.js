import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LayoutConta } from '../components/TelaConta';

const DOURADO = '#d4a63a';
const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const FILTROS = [
  { chave: 'todas', rotulo: 'Todas' },
  { chave: 'naolidas', rotulo: 'Não lidas' },
  { chave: 'salvos', rotulo: 'Salvos' },
];

const pad = (n) => String(n).padStart(2, '0');

const horaAtual = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CONVERSAS_INICIAIS = [
  {
    id: '1',
    nome: 'João Silva',
    iniciais: 'JS',
    funcao: 'Profissional',
    online: true,
    salvo: true,
    naoLidas: 2,
    preview: 'Perfeito, obrigado!',
    hora: '14:30',
    mensagens: [
      { id: 'm1', tipo: 'recebida', texto: 'Olá! Tudo bem?', hora: '14:28' },
      { id: 'm2', tipo: 'recebida', texto: 'Gostaria de saber mais sobre o projeto da casa moderna.', hora: '14:29' },
      { id: 'm3', tipo: 'enviada', texto: 'Olá, tudo bem sim! Claro, posso te passar mais informações.', hora: '14:30' },
      { id: 'm4', tipo: 'recebida', texto: 'Perfeito, obrigado!', hora: '14:30' },
    ],
  },
  {
    id: '2',
    nome: 'Marcos Costa',
    iniciais: 'MC',
    funcao: 'Profissional',
    online: false,
    salvo: false,
    naoLidas: 1,
    preview: 'Podemos marcar uma reunião?',
    hora: 'Ontem',
    mensagens: [
      { id: 'm1', tipo: 'recebida', texto: 'Podemos marcar uma reunião?', hora: '18:12' },
    ],
  },
  {
    id: '3',
    nome: 'Ana Souza',
    iniciais: 'AS',
    funcao: 'Profissional',
    online: true,
    salvo: true,
    naoLidas: 0,
    preview: 'Enviei os detalhes do projeto.',
    hora: '17/05',
    mensagens: [
      { id: 'm1', tipo: 'recebida', texto: 'Enviei os detalhes do projeto.', hora: '10:05' },
    ],
  },
  {
    id: '4',
    nome: 'Ricardo Costa',
    iniciais: 'RC',
    funcao: 'Profissional',
    online: false,
    salvo: false,
    naoLidas: 0,
    preview: 'Obrigado pelo contato!',
    hora: '16/05',
    mensagens: [
      { id: 'm1', tipo: 'recebida', texto: 'Obrigado pelo contato!', hora: '16:40' },
    ],
  },
];

function Filtro({ ativo, rotulo, contador, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.filtro,
        ativo && s.filtroAtivo,
        pressed && s.pressionado,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
    >
      <Text style={[s.textoFiltro, ativo && s.textoFiltroAtivo]}>
        {rotulo}
      </Text>

      {contador > 0 && (
        <View style={[s.contador, ativo && s.contadorAtivo]}>
          <Text style={[s.contadorTxt, ativo && s.contadorTxtAtivo]}>
            {contador}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function Avatar({ iniciais, online, grande }) {
  return (
    <View style={[s.avatar, grande && s.avatarGrande]}>
      <Text style={s.avatarTxt}>{iniciais}</Text>
      {online && <View style={s.online} />}
    </View>
  );
}

function ItemConversa({ item, selecionada, ultima, onPress }) {
  const naoLida = item.naoLidas > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.conversa,
        !ultima && s.conversaDivisor,
        selecionada && s.conversaSel,
        pressed && s.pressionado,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Conversa com ${item.nome}${naoLida ? `, ${item.naoLidas} não lidas` : ''}`}
    >
      <Avatar iniciais={item.iniciais} online={item.online} />

      <View style={s.conversaCorpo}>
        <View style={s.conversaLinha}>
          <Text
            style={[s.conversaNome, naoLida && s.conversaNomeForte]}
            numberOfLines={1}
          >
            {item.nome}
          </Text>

          {item.salvo && (
            <Ionicons name="star" size={12} color={DOURADO} />
          )}
        </View>

        <Text
          style={[
            s.conversaPreview,
            naoLida && s.conversaPreviewForte,
          ]}
          numberOfLines={1}
        >
          {item.preview}
        </Text>
      </View>

      <View style={s.conversaLado}>
        <Text style={[s.conversaHora, naoLida && { color: DOURADO }]}>
          {item.hora}
        </Text>

        {naoLida ? (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{item.naoLidas}</Text>
          </View>
        ) : (
          <View style={s.badgeVazio} />
        )}
      </View>
    </Pressable>
  );
}

function Balao({ msg }) {
  const enviada = msg.tipo === 'enviada';

  return (
    <View style={[s.balao, enviada ? s.balaoEnviado : s.balaoRecebido]}>
      <Text style={s.balaoTxt}>{msg.texto}</Text>
      <Text style={[s.balaoHora, enviada && s.balaoHoraEnviada]}>
        {msg.hora}
      </Text>
    </View>
  );
}

export default function Mensagens() {
  const { width, height } = useWindowDimensions();

  const [conversas, setConversas] = useState(CONVERSAS_INICIAIS);
  const [conversaId, setConversaId] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [texto, setTexto] = useState('');

  const scrollRef = useRef(null);

  const conversaAtual = useMemo(
    () => conversas.find((c) => c.id === conversaId) || null,
    [conversas, conversaId]
  );

  const totalNaoLidas = useMemo(
    () => conversas.filter((c) => c.naoLidas > 0).length,
    [conversas]
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return conversas.filter((c) => {
      if (filtro === 'naolidas' && c.naoLidas === 0) return false;
      if (filtro === 'salvos' && !c.salvo) return false;
      if (!termo) return true;

      return (
        c.nome.toLowerCase().includes(termo) ||
        c.preview.toLowerCase().includes(termo)
      );
    });
  }, [conversas, busca, filtro]);

  const textoVazio =
    filtro === 'naolidas'
      ? 'Nenhuma mensagem não lida.'
      : filtro === 'salvos'
        ? 'Nenhum contato salvo.'
        : 'Nenhuma conversa encontrada.';

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (conversaId) {
          setConversaId(null);
          return true;
        }

        return false;
      }
    );

    return () => sub.remove();
  }, [conversaId]);

  const abrirConversa = (id) => {
    setConversaId(id);
    setTexto('');

    setConversas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, naoLidas: 0 } : c
      )
    );
  };

  const alternarSalvo = () => {
    if (!conversaAtual) return;

    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversaAtual.id
          ? { ...c, salvo: !c.salvo }
          : c
      )
    );
  };

  const enviar = () => {
    const conteudo = texto.trim();

    if (!conteudo || !conversaAtual) return;

    const hora = horaAtual();

    const nova = {
      id: `m${Date.now()}`,
      tipo: 'enviada',
      texto: conteudo,
      hora,
    };

    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversaAtual.id
          ? {
              ...c,
              mensagens: [...c.mensagens, nova],
              preview: conteudo,
              hora,
            }
          : c
      )
    );

    setTexto('');
  };

  const podeEnviar = !!texto.trim();

  return (
    <LayoutConta
      ativo="mensagem"
      titulo="Mensagens"
      subtitulo="Converse diretamente com profissionais e clientes."
    >
      {({ mobile, medio }) => {
        const dividido = !mobile && !medio && width >= 1000;
        const mostrarLista = dividido || !conversaAtual;
        const mostrarChat = dividido || !!conversaAtual;

        const alturaArea = Math.max(
          480,
          Math.round(height * (mobile ? 0.72 : 0.7))
        );

        const lista = (
          <View style={[s.painel, dividido && s.painelLista, { minHeight: 0 }]}>
            <View style={s.buscaWrap}>
              <Ionicons
                name="search"
                size={18}
                color={DOURADO}
                style={s.buscaIcone}
              />

              <TextInput
                style={s.inputBusca}
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar por nome ou mensagem..."
                placeholderTextColor="#777b83"
                selectionColor={DOURADO}
                returnKeyType="search"
                accessibilityLabel="Buscar mensagem"
              />

              {!!busca && (
                <Pressable
                  onPress={() => setBusca('')}
                  hitSlop={10}
                  style={s.buscaLimpar}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color="#8f9497"
                  />
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filtros}
              style={ALTURA_AUTO}
            >
              {FILTROS.map((f) => (
                <Filtro
                  key={f.chave}
                  ativo={filtro === f.chave}
                  rotulo={f.rotulo}
                  contador={
                    f.chave === 'naolidas' ? totalNaoLidas : 0
                  }
                  onPress={() => setFiltro(f.chave)}
                />
              ))}
            </ScrollView>

            <ScrollView
              style={s.flex}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {filtradas.length === 0 ? (
                <Text style={s.vazio}>{textoVazio}</Text>
              ) : (
                filtradas.map((c, i) => (
                  <ItemConversa
                    key={c.id}
                    item={c}
                    selecionada={dividido && c.id === conversaId}
                    ultima={i === filtradas.length - 1}
                    onPress={() => abrirConversa(c.id)}
                  />
                ))
              )}
            </ScrollView>
          </View>
        );

        const chat = conversaAtual ? (
          <View style={[s.painel, dividido && s.painelChat]}>
            <View style={s.chatTopo}>
              {!dividido && (
                <Pressable
                  onPress={() => setConversaId(null)}
                  style={({ pressed }) => [
                    s.btnNav,
                    pressed && s.pressionado,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar para as conversas"
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={DOURADO}
                  />
                </Pressable>
              )}

              <Avatar
                iniciais={conversaAtual.iniciais}
                online={conversaAtual.online}
                grande
              />

              <View style={s.chatInfo}>
                <Text style={s.chatNome} numberOfLines={1}>
                  {conversaAtual.nome}
                </Text>

                <Text
                  style={[
                    s.chatStatus,
                    conversaAtual.online && { color: '#54db83' },
                  ]}
                  numberOfLines={1}
                >
                  {conversaAtual.online
                    ? 'Online'
                    : conversaAtual.funcao}
                </Text>
              </View>

              <Pressable
                onPress={alternarSalvo}
                style={({ pressed }) => [
                  s.btnSalvar,
                  conversaAtual.salvo && s.btnSalvarAtivo,
                  pressed && s.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityState={{
                  selected: conversaAtual.salvo,
                }}
                accessibilityLabel={
                  conversaAtual.salvo
                    ? 'Remover dos salvos'
                    : 'Salvar contato'
                }
              >
                <Ionicons
                  name={
                    conversaAtual.salvo
                      ? 'star'
                      : 'star-outline'
                  }
                  size={16}
                  color={
                    conversaAtual.salvo ? DOURADO : '#d3d4d8'
                  }
                />

                {!mobile && (
                  <Text
                    style={[
                      s.btnSalvarTxt,
                      conversaAtual.salvo && { color: DOURADO },
                    ]}
                  >
                    {conversaAtual.salvo
                      ? 'Salvo'
                      : 'Salvar contato'}
                  </Text>
                )}
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              style={s.flex}
              contentContainerStyle={s.chatConteudo}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <View style={s.separador}>
                <Text style={s.separadorTxt}>Hoje</Text>
              </View>

              {conversaAtual.mensagens.map((m) => (
                <Balao key={m.id} msg={m} />
              ))}
            </ScrollView>

            <View style={s.campo}>
              <TextInput
                style={s.campoInput}
                value={texto}
                onChangeText={setTexto}
                placeholder="Digite sua mensagem..."
                placeholderTextColor="#777b83"
                selectionColor={DOURADO}
                multiline
                maxLength={1000}
                accessibilityLabel="Digite sua mensagem"
              />

              <Pressable
                onPress={enviar}
                disabled={!podeEnviar}
                style={({ pressed }) => [
                  s.btnEnviar,
                  !podeEnviar && s.btnEnviarOff,
                  pressed && s.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !podeEnviar }}
                accessibilityLabel="Enviar mensagem"
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={podeEnviar ? '#111' : '#777'}
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={[
              s.painel,
              s.painelChat,
              s.chatVazio,
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={44}
              color="#59431f"
            />

            <Text style={s.chatVazioTxt}>
              Selecione uma conversa para começar a conversar.
            </Text>
          </View>
        );

        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={ALTURA_AUTO}
          >
            <View
              style={[
                s.card,
                mobile && s.cardMobile,
                { height: alturaArea },
              ]}
            >
              <View style={[s.area, dividido && s.areaLinha]}>
                {mostrarLista && lista}
                {mostrarChat && chat}
              </View>
            </View>
          </KeyboardAvoidingView>
        );
      }}
    </LayoutConta>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  pressionado: { opacity: 0.75 },

  card: {
    padding: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardMobile: {
    padding: 12,
    borderRadius: 14,
  },

  area: { flex: 1 },
  areaLinha: {
    flexDirection: 'row',
    gap: 14,
  },
  painel: { flex: 1 },
  painelLista: {
    flex: 0,
    flexBasis: 360,
    flexGrow: 0,
    flexShrink: 0,
  },
  painelChat: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#101011',
    borderWidth: 1,
    borderColor: '#252729',
    borderRadius: 10,
    overflow: 'hidden',
  },

  buscaWrap: { justifyContent: 'center' },
  buscaIcone: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  inputBusca: {
    height: 46,
    paddingLeft: 38,
    paddingRight: 38,
    color: '#eee',
    fontSize: 15,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  buscaLimpar: {
    position: 'absolute',
    right: 12,
  },

  filtros: {
    gap: 8,
    paddingVertical: 12,
  },
  filtro: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  filtroAtivo: {
    backgroundColor: '#29231a',
    borderColor: DOURADO,
  },
  textoFiltro: {
    color: '#d3d4d8',
    fontSize: 12.5,
  },
  textoFiltroAtivo: {
    color: DOURADO,
    fontWeight: '600',
  },
  contador: {
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor: DOURADO,
    borderRadius: 9,
  },
  contadorAtivo: { backgroundColor: '#111' },
  contadorTxt: {
    color: '#111',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contadorTxtAtivo: { color: DOURADO },

  vazio: {
    paddingVertical: 32,
    color: '#a5a5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  conversa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  conversaDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: '#252729',
    borderRadius: 0,
  },
  conversaSel: {
    backgroundColor: '#29231a',
    borderRadius: 8,
  },
  conversaCorpo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  conversaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conversaNome: {
    flexShrink: 1,
    color: '#e7e7e7',
    fontSize: 14,
    fontWeight: '600',
  },
  conversaNomeForte: {
    color: '#fff',
    fontWeight: 'bold',
  },
  conversaPreview: {
    color: '#8f9497',
    fontSize: 12,
  },
  conversaPreviewForte: {
    color: '#d5d6da',
    fontWeight: '600',
  },
  conversaLado: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  conversaHora: {
    color: '#777',
    fontSize: 11,
  },
  badge: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: DOURADO,
    borderRadius: 10,
  },
  badgeVazio: { height: 20 },
  badgeTxt: {
    color: '#111',
    fontSize: 11,
    fontWeight: 'bold',
  },

  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#8a701e',
    borderRadius: 22,
  },
  avatarGrande: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarTxt: {
    color: DOURADO,
    fontSize: 13,
    fontWeight: 'bold',
  },
  online: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    backgroundColor: '#54db83',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 6,
  },

  chatTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  btnNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#343940',
    borderRadius: 18,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  chatNome: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  chatStatus: {
    color: '#8f9497',
    fontSize: 11,
  },
  btnSalvar: {
    minHeight: 36,
    minWidth: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 18,
  },
  btnSalvarAtivo: {
    backgroundColor: '#29231a',
    borderColor: '#59431f',
  },
  btnSalvarTxt: {
    color: '#d3d4d8',
    fontSize: 12,
  },

  chatConteudo: {
    padding: 14,
    gap: 8,
  },
  separador: {
    alignItems: 'center',
    marginBottom: 6,
  },
  separadorTxt: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    color: '#8f9497',
    fontSize: 10,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 20,
    overflow: 'hidden',
  },

  balao: {
    maxWidth: '82%',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  balaoRecebido: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderTopLeftRadius: 2,
  },
  balaoEnviado: {
    alignSelf: 'flex-end',
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderTopRightRadius: 2,
  },
  balaoTxt: {
    color: '#eee',
    fontSize: 14,
    lineHeight: 20,
  },
  balaoHora: {
    marginTop: 4,
    alignSelf: 'flex-end',
    color: '#888',
    fontSize: 10,
  },
  balaoHoraEnviada: { color: '#b59a58' },

  chatVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  chatVazioTxt: {
    color: '#8f9497',
    fontSize: 13,
    textAlign: 'center',
  },

  campo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  campoInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    color: '#eee',
    fontSize: 15,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  btnEnviar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  btnEnviarOff: {
    backgroundColor: '#2b2b2e',
  },
});