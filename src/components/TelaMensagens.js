import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform,
  BackHandler, KeyboardAvoidingView, useWindowDimensions, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LayoutConta } from './TelaConta';
import { useConta } from './ContaProvider';
import {
  alternarContatoSalvo,
  enviarMensagem,
  garantirConversaComProfissional,
  listarConversas,
  marcarConversaComoLida,
  ocultarConversa,
} from '../services/chat';
import { getSupabaseClient } from '../services/supabase';

const DOURADO = '#d4a63a';
const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };
const FILTROS = [
  { chave: 'todas', rotulo: 'Todas' },
  { chave: 'naolidas', rotulo: 'Não lidas' },
  { chave: 'salvos', rotulo: 'Salvos' },
];

function Filtro({ ativo, rotulo, contador, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      s.filtro, ativo && s.filtroAtivo, pressed && s.pressionado,
    ]} accessibilityRole="button" accessibilityState={{ selected: ativo }}>
      <Text style={[s.textoFiltro, ativo && s.textoFiltroAtivo]}>{rotulo}</Text>
      {contador > 0 && <View style={[s.contador, ativo && s.contadorAtivo]}>
        <Text style={[s.contadorTxt, ativo && s.contadorTxtAtivo]}>{contador}</Text>
      </View>}
    </Pressable>
  );
}

function Avatar({ iniciais, online, grande }) {
  return <View style={[s.avatar, grande && s.avatarGrande]}>
    <Text style={s.avatarTxt}>{iniciais}</Text>
    {online && <View style={s.online} />}
  </View>;
}

function ItemConversa({ item, selecionada, ultima, onPress }) {
  const naoLida = item.naoLidas > 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      s.conversa, !ultima && s.conversaDivisor, selecionada && s.conversaSel,
      pressed && s.pressionado,
    ]} accessibilityRole="button">
      <Avatar iniciais={item.iniciais} online={item.online} />
      <View style={s.conversaCorpo}>
        <View style={s.conversaLinha}>
          <Text style={[s.conversaNome, naoLida && s.conversaNomeForte]} numberOfLines={1}>{item.nome}</Text>
          {item.salvo && <Ionicons name="star" size={12} color={DOURADO} />}
        </View>
        <Text style={[s.conversaPreview, naoLida && s.conversaPreviewForte]} numberOfLines={1}>{item.preview}</Text>
      </View>
      <View style={s.conversaLado}>
        <Text style={[s.conversaHora, naoLida && { color: DOURADO }]}>{item.hora}</Text>
        {naoLida ? <View style={s.badge}><Text style={s.badgeTxt}>{item.naoLidas}</Text></View> : <View style={s.badgeVazio} />}
      </View>
    </Pressable>
  );
}

function Balao({ msg }) {
  const enviada = msg.tipo === 'enviada';
  return (
    <View style={[s.balao, enviada ? s.balaoEnviado : s.balaoRecebido]}>
      <Text style={s.balaoTxt}>{msg.texto}</Text>
      <View style={s.balaoRodape}>\n        <Text style={[s.balaoHora, enviada && s.balaoHoraEnviada]}>{msg.hora}</Text>\n        {enviada && <Ionicons name={msg.visualizada ? 'checkmark-done' : 'checkmark'} size={14}\n          color={msg.visualizada ? '#67b7ff' : '#b59a58'} accessibilityLabel={msg.visualizada ? 'Mensagem visualizada' : 'Mensagem enviada'} />}\n      </View>
    </View>
  );
}

export default function TelaMensagens({ tipo: tipoConta }) {
  const { width, height } = useWindowDimensions();
  const { user, perfil, tipo } = useConta();
  const idInstancia = useId().replace(/:/g, '');
  const params = useLocalSearchParams();
  const tipoAtivo = tipo || tipoConta;
  const [conversas, setConversas] = useState([]);
  const [conversaId, setConversaId] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const scrollRef = useRef(null);
  const canalRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!user?.id || !tipoAtivo) return;
    try {
      const dados = await listarConversas(tipoAtivo);
      setConversas(dados);
      setErro('');
      return dados;
    } catch (falha) {
      setErro(falha?.message || 'Não foi possível carregar as conversas.');
      throw falha;
    } finally {
      setCarregando(false);
    }
  }, [user?.id, tipoAtivo]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    if (!user?.id || !tipoAtivo) {
      setConversas([]);
      setCarregando(false);
      return undefined;
    }

    const iniciar = async () => {
      try {
        let conversaInicial = null;
        if (tipoAtivo === 'usuario' && params.com) {
          conversaInicial = await garantirConversaComProfissional({
            usuarioId: user.id,
            usuarioNome: perfil?.full_name || user.user_metadata?.full_name || user.email,
            profissionalId: String(Array.isArray(params.com) ? params.com[0] : params.com),
            profissionalNome: Array.isArray(params.nome) ? params.nome[0] : params.nome,
          });
        }
        const dados = await listarConversas(tipoAtivo);
        if (!ativo) return;
        setConversas(dados);
        if (params.conversa) setConversaId(String(Array.isArray(params.conversa) ? params.conversa[0] : params.conversa));
        else if (conversaInicial) setConversaId(conversaInicial);
        setErro('');
      } catch (falha) {
        if (ativo) setErro(falha?.message || 'Não foi possível iniciar o chat.');
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    iniciar();

    return () => {
      ativo = false;
    };
  }, [user?.id, tipoAtivo, params.com, params.nome, params.conversa, carregar]);

  // Cada montagem recebe um tópico exclusivo. Isso evita reutilizar um canal
  // ainda inscrito durante navegação rápida ou remontagens do React.
  useEffect(() => {
    if (!user?.id || !tipoAtivo) return undefined;

    let ativo = true;
    const supabase = getSupabaseClient();
    const canal = supabase
      .channel(`mobile-chat-${user.id}-${idInstancia}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, () => {
        if (ativo) carregar().catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, () => {
        if (ativo) carregar().catch(() => {});
      });

    canalRef.current = canal;
    canal.subscribe();

    return () => {
      ativo = false;
      if (canalRef.current === canal) canalRef.current = null;
      // removeChannel encerra a inscrição; o tópico exclusivo impede colisão
      // caso uma nova tela seja montada antes da remoção terminar.
      supabase.removeChannel(canal).catch(() => {});
    };
  }, [user?.id, tipoAtivo, carregar, idInstancia]);

  const conversaAtual = useMemo(
    () => conversas.find((c) => c.id === conversaId) || null,
    [conversas, conversaId]
  );
  const totalNaoLidas = useMemo(
    () => conversas.filter((c) => c.naoLidas > 0).length,
    [conversas]
  );
  const filtradas = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();
    return conversas.filter((c) => {
      if (filtro === 'naolidas' && c.naoLidas === 0) return false;
      if (filtro === 'salvos' && !c.salvo) return false;
      return !termoBusca || c.nome.toLowerCase().includes(termoBusca) || c.preview.toLowerCase().includes(termoBusca);
    });
  }, [conversas, busca, filtro]);

  const textoVazio = filtro === 'naolidas' ? 'Nenhuma mensagem não lida.'
    : filtro === 'salvos' ? 'Nenhum contato salvo.' : 'Você ainda não tem conversas.';

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (conversaId) { setConversaId(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [conversaId]);

  const abrirConversa = async (id) => {
    setConversaId(id);
    setTexto('');
    const conversa = conversas.find((c) => c.id === id);
    if (conversa) {
      try {
        await marcarConversaComoLida(id, tipoAtivo, conversa.mensagens);
        await carregar();
      } catch (falha) {
        setErro(falha?.message || 'Não foi possível atualizar a leitura.');
      }
    }
  };

  const alternarSalvo = async () => {
    if (!conversaAtual) return;
    const novo = !conversaAtual.salvo;
    setConversas((atuais) => atuais.map((c) => c.id === conversaAtual.id ? { ...c, salvo: novo } : c));
    try {
      await alternarContatoSalvo(conversaAtual.id, tipoAtivo, novo);
    } catch (falha) {
      setConversas((atuais) => atuais.map((c) => c.id === conversaAtual.id ? { ...c, salvo: !novo } : c));
      setErro(falha?.message || 'Não foi possível salvar o contato.');
    }
  };

  const apagarContato = () => {
    if (!conversaAtual) return;
    const id = conversaAtual.id;
    Alert.alert(
      'Apagar contato?',
      'A conversa será removida da sua lista. As mensagens da outra pessoa serão preservadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ocultarConversa(id, tipoAtivo);
              setConversas((atuais) => atuais.filter((c) => c.id !== id));
              setConversaId(null);
              setErro('');
            } catch (falha) {
              setErro(falha?.message || 'Não foi possível apagar o contato.');
            }
          },
        },
      ]
    );
  };

  const enviar = async () => {
    const conteudo = texto.trim();
    if (!conteudo || !conversaAtual || enviando || !user?.id) return;
    setEnviando(true);
    setTexto('');
    try {
      await enviarMensagem({
        conversaId: conversaAtual.id,
        remetenteId: user.id,
        tipo: tipoAtivo,
        texto: conteudo,
      });
      await carregar();
    } catch (falha) {
      setTexto(conteudo);
      setErro(falha?.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  const podeEnviar = !!texto.trim() && !enviando;

  return (
    <LayoutConta tipo={tipoConta} ativo="mensagem" titulo="Mensagens"
      subtitulo="Converse diretamente com profissionais e clientes.">
      {({ mobile, medio }) => {
        const dividido = !mobile && !medio && width >= 1000;
        const mostrarLista = dividido || !conversaAtual;
        const mostrarChat = dividido || !!conversaAtual;
        const alturaArea = Math.max(480, Math.round(height * (mobile ? 0.72 : 0.7)));

        const lista = (
          <View style={[s.painel, dividido && s.painelLista, { minHeight: 0 }]}>
            <View style={s.buscaWrap}>
              <Ionicons name="search" size={18} color={DOURADO} style={s.buscaIcone} />
              <TextInput style={s.inputBusca} value={busca} onChangeText={setBusca}
                placeholder="Buscar por nome ou mensagem..." placeholderTextColor="#777b83"
                selectionColor={DOURADO} returnKeyType="search" accessibilityLabel="Buscar mensagem" />
              {!!busca && <Pressable onPress={() => setBusca('')} hitSlop={10} style={s.buscaLimpar}>
                <Ionicons name="close-circle" size={18} color="#8f9497" />
              </Pressable>}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filtros} style={ALTURA_AUTO}>
              {FILTROS.map((f) => <Filtro key={f.chave} ativo={filtro === f.chave}
                rotulo={f.rotulo} contador={f.chave === 'naolidas' ? totalNaoLidas : 0}
                onPress={() => setFiltro(f.chave)} />)}
            </ScrollView>
            <ScrollView style={s.flex} showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {carregando ? <ActivityIndicator color={DOURADO} style={{ marginTop: 28 }} />
                : filtradas.length === 0 ? <Text style={s.vazio}>{textoVazio}</Text>
                  : filtradas.map((c, i) => <ItemConversa key={c.id} item={c}
                    selecionada={dividido && c.id === conversaId} ultima={i === filtradas.length - 1}
                    onPress={() => abrirConversa(c.id)} />)}
            </ScrollView>
          </View>
        );

        const chat = conversaAtual ? (
          <View style={[s.painel, dividido && s.painelChat]}>
            <View style={s.chatTopo}>
              {!dividido && <Pressable onPress={() => setConversaId(null)} style={({ pressed }) => [s.btnNav, pressed && s.pressionado]}>
                <Ionicons name="chevron-back" size={18} color={DOURADO} />
              </Pressable>}
              <Avatar iniciais={conversaAtual.iniciais} online={conversaAtual.online} grande />
              <View style={s.chatInfo}>
                <Text style={s.chatNome} numberOfLines={1}>{conversaAtual.nome}</Text>
                <Text style={s.chatStatus} numberOfLines={1}>{conversaAtual.funcao}</Text>
              </View>
              <Pressable onPress={alternarSalvo} style={({ pressed }) => [
                s.btnSalvar, conversaAtual.salvo && s.btnSalvarAtivo, pressed && s.pressionado,
              ]} accessibilityRole="button">
                <Ionicons name={conversaAtual.salvo ? 'star' : 'star-outline'} size={16}
                  color={conversaAtual.salvo ? DOURADO : '#d3d4d8'} />
                {!mobile && <Text style={[s.btnSalvarTxt, conversaAtual.salvo && { color: DOURADO }]}>
                  {conversaAtual.salvo ? 'Salvo' : 'Salvar contato'}
                </Text>}
              </Pressable>
              <Pressable onPress={apagarContato} style={({ pressed }) => [
                s.btnApagar, pressed && s.pressionado,
              ]} accessibilityRole="button" accessibilityLabel="Apagar contato">
                <Ionicons name="trash-outline" size={17} color="#ff8585" />
              </Pressable>
            </View>
            <ScrollView ref={scrollRef} style={s.flex} contentContainerStyle={s.chatConteudo}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <View style={s.separador}><Text style={s.separadorTxt}>Mensagens</Text></View>
              {conversaAtual.mensagens.map((m) => <Balao key={m.id} msg={m} />)}
            </ScrollView>
            <View style={s.campo}>
              <TextInput style={s.campoInput} value={texto} onChangeText={setTexto}
                placeholder="Digite sua mensagem..." placeholderTextColor="#777b83"
                selectionColor={DOURADO} multiline maxLength={1000}
                accessibilityLabel="Digite sua mensagem" />
              <Pressable onPress={enviar} disabled={!podeEnviar} style={({ pressed }) => [
                s.btnEnviar, !podeEnviar && s.btnEnviarOff, pressed && s.pressionado,
              ]} accessibilityRole="button">
                <Ionicons name="send" size={18} color={podeEnviar ? '#111' : '#777'} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[s.painel, s.painelChat, s.chatVazio]}>
            <Ionicons name="chatbubble-ellipses-outline" size={44} color="#59431f" />
            <Text style={s.chatVazioTxt}>Selecione uma conversa para começar a conversar.</Text>
          </View>
        );

        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ALTURA_AUTO}>
            {!!erro && <Text style={s.erro}>{erro}</Text>}
            <View style={[s.card, mobile && s.cardMobile, { height: alturaArea }]}>
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
  erro: { color: '#ff8f8f', fontSize: 12, marginBottom: 10 },
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
  balaoHoraEnviada: { color: '#b59a58' },\n  balaoRodape: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'flex-end',\n    gap: 4,\n    marginTop: 4,\n  },

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