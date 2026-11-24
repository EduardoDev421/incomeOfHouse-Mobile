import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { enviarContato } from '../services/envios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rodape } from '../components/Comuns';

const DOURADO = '#d4a63a';
const DOURADO_BOTAO = '#dbb73a';
const LIMITE = 1000;

const FUNDO = require('../../assets/images/BackgroundFundo.png');
const LOGO = require('../../assets/images/Logo.png');

/* ------------------------------------------------------------------ */
/* MENU LATERAL DA CONTA                                               */
/* As rotas abaixo precisam existir em src/app/ para funcionar         */
/* ------------------------------------------------------------------ */
const MENU_LATERAL = [
  { icone: 'person-circle-outline', texto: 'Meu Perfil', rota: '/PerfilProfissional' },
  { icone: 'location-outline', texto: 'Meus Endereços', rota: '/MeusenderecosP' },
  { icone: 'apps-outline', texto: 'Meus Pedidos', rota: '/Projetos' },
  { icone: 'star-outline', texto: 'Meus Profissionais Favoritos', rota: '/Meusprofissionais' },
  { icone: 'bookmark-outline', texto: 'Meus Projetos Favoritos', rota: '/MeusProjetos' },
  { icone: 'calendar-outline', texto: 'Agendamentos', rota: '/AgendamentosP' },
  { icone: 'chatbox-outline', texto: 'Mensagem', rota: '/MensagensP' },
  { icone: 'settings-outline', texto: 'Configurações', rota: '/ConfigProfissionais', ativo: true },
  { icone: 'log-out-outline', texto: 'Sair', rota: '/' },
];

const LINKS_TOPO = [
  { texto: 'Início', rota: '/' },
  { texto: 'Plantas', rota: '/planta' },
  { texto: 'Profissionais', rota: '/profissionais' },
  { texto: 'Sobre', rota: '/sobreNos' },
];

const CONTATOS = [
  {
    icone: 'mail-outline',
    titulo: 'E-mail',
    linhas: ['contato@incomeofhouses.com', 'Respondemos em até 24 horas.'],
  },
  {
    icone: 'call-outline',
    titulo: 'Telefone',
    linhas: ['(11) 98765-4321', 'Atendimento de segunda a sexta, das 9h às 18h.'],
  },
  {
    icone: 'location-outline',
    titulo: 'Endereço',
    linhas: ['Av. Paulista, 1000 - Bela Vista', 'São Paulo - SP, 01310-100'],
  },
  {
    icone: 'chatbox-outline',
    titulo: 'WhatsApp',
    linhas: ['(11) 98765-4321', 'Fale conosco diretamente.'],
  },
];

const OPCOES_ASSUNTO = [
  { label: 'Selecione um assunto', valor: '' },
  { label: 'Dúvida', valor: 'duvida' },
  { label: 'Orçamento', valor: 'orcamento' },
  { label: 'Parceria', valor: 'parceria' },
  { label: 'Suporte', valor: 'suporte' },
  { label: 'Elogio', valor: 'elogio' },
  { label: 'Reclamação', valor: 'reclamacao' },
  { label: 'Outro', valor: 'outro' },
];

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/* ------------------------------------------------------------------ */
/* COMPONENTE: CAMPO DE TEXTO (com borda dourada ao focar)             */
/* ------------------------------------------------------------------ */
function Campo({ rotulo, estiloInput, ...props }) {
  const [foco, setFoco] = useState(false);

  return (
    <View style={s.grupo}>
      <Text style={s.rotulo}>
        {rotulo} <Text style={s.obrigatorio}>*</Text>
      </Text>
      <TextInput
        style={[s.input, estiloInput, foco && s.inputFoco]}
        placeholderTextColor="#666666"
        selectionColor={DOURADO}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        accessibilityLabel={rotulo}
        {...props}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* COMPONENTE: SELETOR (substitui o <select> do HTML)                  */
/* ------------------------------------------------------------------ */
function Seletor({ valor, opcoes, aoMudar }) {
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((o) => o.valor === valor) || opcoes[0];

  return (
    <View style={s.grupo}>
      <Text style={s.rotulo}>
        Assunto <Text style={s.obrigatorio}>*</Text>
      </Text>

      <Pressable
        style={[s.input, s.seletor, aberto && s.inputFoco]}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`Assunto: ${atual.label}`}
      >
        <Text style={s.seletorTexto} numberOfLines={1}>
          {atual.label}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#a99564" />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={s.modalFundo} onPress={() => setAberto(false)}>
          <Pressable style={s.modalCaixa} onPress={() => {}}>
            <Text style={s.modalTitulo}>Assunto</Text>
            <ScrollView>
              {opcoes.map((o, i) => (
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
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function FaleConosco() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Mesmos pontos de corte do CSS da versão web
  const lateralFixa = width > 850;
  const lateralEstreita = width <= 1100;
  const duasColunas = width > 1200;
  const colunasMenu = width <= 600 ? 2 : 3;
  const compacto = width <= 550;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const navegar = (rota) => router.push(rota);

  const enviar = async () => {
    setSucesso(false);

    if (!nome.trim()) return setErro('Informe seu nome completo.');
    if (!emailValido(email)) return setErro('Informe um e-mail válido.');
    if (!assunto) return setErro('Selecione um assunto.');
    if (!mensagem.trim()) return setErro('Digite sua mensagem.');
    if (!aceitou) return setErro('Aceite a Política de Privacidade para continuar.');

    setErro('');

    const contato = {
      nome: nome.trim(),
      email: email.trim(),
      assunto,
      mensagem: mensagem.trim(),
    };

    try {
      const resultado = await enviarContato(contato);
      if (!resultado?.enviado) throw new Error('A mensagem não foi salva.');
    } catch (e) {
      console.error('Erro ao enviar contato:', e);
      return setErro(e?.message || 'Não foi possível enviar sua mensagem. Tente novamente.');
    }
    setSucesso(true);
    setNome('');
    setEmail('');
    setAssunto('');
    setMensagem('');
    setAceitou(false);
  };

  return (
    <View style={s.raiz}>
      <StatusBar barStyle="light-content" />

      {/* Fundo da página inteira */}
      <Image source={FUNDO} style={s.fundoImagem} resizeMode="cover" />
      <View style={s.fundoOverlay} pointerEvents="none" />

      {/* Cabeçalho (fixo no topo) */}
      <View style={[s.topo, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <Pressable
          onPress={() => navegar('/')}
          accessibilityRole="button"
          accessibilityLabel="Ir para o início"
        >
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
        </Pressable>

        {/* Como na web, o menu do topo some em telas estreitas */}
        {lateralFixa && (
          <View style={[s.menuTopo, { top: insets.top }]}>
            {LINKS_TOPO.map((l) => (
              <Pressable key={l.texto} onPress={() => navegar(l.rota)} accessibilityRole="link">
                <Text style={s.linkTopo}>{l.texto}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.conteudoScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.corpo, lateralFixa && s.corpoLinha]}>
          {/* Menu lateral */}
          <View
            style={[
              s.lateral,
              lateralFixa
                ? [s.lateralFixa, lateralEstreita && s.lateralEstreita]
                : s.lateralTopo,
            ]}
          >
            <View style={lateralFixa ? s.listaColuna : s.listaGrade}>
              {MENU_LATERAL.map((m, i) => {
                const ultimo = i === MENU_LATERAL.length - 1;

                return (
                  <View
                    key={m.texto}
                    style={
                      lateralFixa
                        ? ultimo && s.itemSair
                        : { width: `${100 / colunasMenu}%`, padding: 2.5 }
                    }
                  >
                    <Pressable
                      style={[
                        s.lateralItem,
                        !lateralFixa && s.lateralItemCentro,
                        m.ativo && s.lateralItemAtivo,
                      ]}
                      onPress={() => navegar(m.rota)}
                      accessibilityRole="link"
                      accessibilityState={{ selected: !!m.ativo }}
                    >
                      <Ionicons
                        name={m.icone}
                        size={17}
                        color={m.ativo ? DOURADO : '#eeeeee'}
                      />
                      <Text
                        style={[
                          s.lateralTexto,
                          !lateralFixa && s.lateralTextoCentro,
                          m.ativo && s.lateralTextoAtivo,
                        ]}
                      >
                        {m.texto}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Conteúdo */}
          <View style={[s.conteudo, lateralFixa ? s.conteudoLinha : s.conteudoColuna, !lateralFixa && s.conteudoEstreito]}>
            <Text style={s.titulo}>Fale Conosco</Text>
            <Text style={s.subtitulo}>
              Estamos aqui para te ajudar. Envie sua mensagem e retornaremos o mais breve
              possível.
            </Text>

            <View style={[s.grade, duasColunas && s.gradeLinha]}>
              {/* Informações de contato */}
              <View style={[s.card, compacto && s.cardCompacto, duasColunas && s.cardInfo]}>
                <Text style={s.eyebrow}>ENTRE EM CONTATO</Text>
                <Text style={s.cardTitulo}>Estamos prontos para te atender.</Text>
                <Text style={s.intro}>
                  Tire suas dúvidas, compartilhe sugestões ou fale sobre parcerias. Será um
                  prazer conversar com você.
                </Text>

                <View style={s.infoLista}>
                  {CONTATOS.map((c) => (
                    <View key={c.titulo} style={s.infoLinha}>
                      <View style={s.infoIcone}>
                        <Ionicons name={c.icone} size={20} color={DOURADO} />
                      </View>
                      <View style={s.infoTextos}>
                        <Text style={s.infoTitulo}>{c.titulo}</Text>
                        {c.linhas.map((l) => (
                          <Text key={l} style={s.infoTexto}>
                            {l}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Formulário */}
              <View style={[s.card, compacto && s.cardCompacto, duasColunas && s.cardForm]}>
                <View style={s.formTopo}>
                  <View style={s.infoIcone}>
                    <Ionicons name="headset-outline" size={20} color={DOURADO} />
                  </View>
                  <View style={s.infoTextos}>
                    <Text style={s.formTitulo}>Envie sua mensagem</Text>
                    <Text style={s.formTexto}>
                      Preencha os campos abaixo e entraremos em contato o mais breve possível.
                    </Text>
                  </View>
                </View>

                <Campo
                  rotulo="Nome completo"
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  value={nome}
                  onChangeText={setNome}
                />

                <Campo
                  rotulo="E-mail"
                  placeholder="Digite seu e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />

                <Seletor valor={assunto} opcoes={OPCOES_ASSUNTO} aoMudar={setAssunto} />

                <View style={s.grupo}>
                  <Text style={s.rotulo}>
                    Mensagem <Text style={s.obrigatorio}>*</Text>
                  </Text>
                  <MensagemInput valor={mensagem} aoMudar={setMensagem} />
                  <Text style={s.contador}>
                    {mensagem.length}/{LIMITE}
                  </Text>
                </View>

                <Pressable
                  style={s.privacidade}
                  onPress={() => setAceitou((a) => !a)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: aceitou }}
                >
                  <View style={[s.caixa, aceitou && s.caixaMarcada]}>
                    {aceitou && <Ionicons name="checkmark" size={12} color="#111111" />}
                  </View>
                  <Text style={s.privacidadeTexto}>
                    Li e aceito a <Text style={s.privacidadeLink}>Política de Privacidade</Text>
                  </Text>
                </Pressable>

                {erro !== '' && <Text style={s.erro}>{erro}</Text>}
                {sucesso && (
                  <Text style={s.sucesso}>
                    Mensagem enviada! Retornaremos o mais breve possível.
                  </Text>
                )}

                <Pressable
                  style={({ pressed }) => [s.btnEnviar, pressed && s.pressionado]}
                  onPress={enviar}
                  accessibilityRole="button"
                >
                  <Text style={s.btnEnviarTexto}>Enviar mensagem</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <Rodape />
      </ScrollView>
    </View>
  );
}

/* Campo de mensagem (multilinha) com foco dourado */
function MensagemInput({ valor, aoMudar }) {
  const [foco, setFoco] = useState(false);

  return (
    <TextInput
      style={[s.input, s.textarea, foco && s.inputFoco]}
      placeholder="Digite sua mensagem aqui..."
      placeholderTextColor="#666666"
      selectionColor={DOURADO}
      multiline
      maxLength={LIMITE}
      value={valor}
      onChangeText={aoMudar}
      onFocus={() => setFoco(true)}
      onBlur={() => setFoco(false)}
      accessibilityLabel="Mensagem"
    />
  );
}

/* ------------------------------------------------------------------ */
/* ESTILOS (valores do FaleConosco.css da versão web)                  */
/* ------------------------------------------------------------------ */
const s = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#080a0b' },
  pressionado: { opacity: 0.8 },

  fundoImagem: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  fundoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 7, 8, 0.86)' },

  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudoScroll: { flexGrow: 1 },

  // ----- Cabeçalho -----
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    backgroundColor: 'rgba(8, 8, 8, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 166, 58, 0.25)',
  },
  logo: { width: 64, height: 46 },
  menuTopo: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  linkTopo: { color: '#eeeeee', fontSize: 14, fontWeight: '500' },

  // ----- Estrutura -----
  corpo: { flexGrow: 1 },
  corpoLinha: { flexDirection: 'row' },

  // ----- Menu lateral -----
  lateral: { backgroundColor: '#0d0d0e' },
  lateralFixa: {
    width: 250,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#252729',
  },
  lateralEstreita: { width: 220 },
  lateralTopo: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252729',
  },
  listaColuna: { gap: 5 },
  listaGrade: { flexDirection: 'row', flexWrap: 'wrap' },
  itemSair: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  lateralItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  lateralItemCentro: { justifyContent: 'center' },
  lateralItemAtivo: { backgroundColor: '#29231a', borderColor: '#59431f' },
  lateralTexto: { color: '#eeeeee', fontSize: 12, flexShrink: 1 },
  lateralTextoCentro: { textAlign: 'center', fontSize: 13 },
  lateralTextoAtivo: { color: DOURADO },

  // ----- Conteúdo -----
  conteudo: {
    minWidth: 0,
    paddingTop: 26,
    paddingHorizontal: 32,
    paddingBottom: 32,
    backgroundColor: 'rgba(17, 17, 17, 0.88)',
  },
  conteudoLinha: { flex: 1 },
  conteudoColuna: { flexGrow: 1, flexShrink: 0, flexBasis: 'auto' },
  conteudoEstreito: { paddingTop: 20, paddingHorizontal: 16 },

  titulo: { color: '#ffffff', fontSize: 24, fontWeight: '600', marginBottom: 6 },
  subtitulo: {
    color: '#a8abad',
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DOURADO,
  },

  // ----- Grade dos dois cards -----
  grade: { gap: 16, marginTop: 20 },
  gradeLinha: { flexDirection: 'row', alignItems: 'stretch' },
  card: {
    minWidth: 0,
    paddingVertical: 26,
    paddingHorizontal: 28,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  cardCompacto: { paddingVertical: 20, paddingHorizontal: 16 },
  cardInfo: { flex: 0.85 },
  cardForm: { flex: 1.15 },

  // ----- Informações de contato -----
  eyebrow: {
    marginBottom: 10,
    color: DOURADO,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2.5,
  },
  cardTitulo: { maxWidth: 400, color: '#ffffff', fontSize: 22, fontWeight: 'bold', lineHeight: 28 },
  intro: { maxWidth: 470, marginTop: 12, color: '#8f9497', fontSize: 13, lineHeight: 21 },
  infoLista: { gap: 20, marginTop: 26 },
  infoLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  infoIcone: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 21,
  },
  infoTextos: { flex: 1, minWidth: 0 },
  infoTitulo: { marginBottom: 4, color: '#e7e7e7', fontSize: 13, fontWeight: '600' },
  infoTexto: { color: '#8f9497', fontSize: 12, lineHeight: 19 },

  // ----- Formulário -----
  formTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  formTitulo: { marginBottom: 4, color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  formTexto: { color: '#8f9497', fontSize: 12, lineHeight: 18 },

  grupo: { marginBottom: 16 },
  rotulo: { marginBottom: 6, color: '#a8abad', fontSize: 12, fontWeight: '600' },
  obrigatorio: { color: DOURADO },
  input: {
    height: 40,
    paddingHorizontal: 12,
    color: '#dddddd',
    fontSize: 13,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 6,
  },
  inputFoco: { borderColor: DOURADO },
  textarea: {
    height: 120,
    paddingTop: 11,
    paddingBottom: 11,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  contador: { marginTop: 5, color: '#666666', fontSize: 11, textAlign: 'right' },

  seletor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seletorTexto: { flex: 1, marginRight: 8, color: '#dddddd', fontSize: 13 },

  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#292929',
    borderRadius: 8,
  },
  modalTitulo: { marginBottom: 10, color: DOURADO, fontSize: 16, fontWeight: 'bold' },
  opcao: { paddingVertical: 11, paddingHorizontal: 10, borderRadius: 6 },
  opcaoAtiva: { backgroundColor: '#29231a' },
  opcaoTexto: { color: '#ffffff', fontSize: 14 },
  opcaoTextoAtivo: { color: DOURADO, fontWeight: 'bold' },

  privacidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 4,
    marginBottom: 18,
  },
  caixa: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 3,
  },
  caixaMarcada: { backgroundColor: '#c89e26', borderColor: '#c89e26' },
  privacidadeTexto: { flexShrink: 1, color: '#8f9497', fontSize: 12 },
  privacidadeLink: { color: DOURADO, fontWeight: '600', textDecorationLine: 'underline' },

  erro: { marginBottom: 14, color: '#e57373', fontSize: 13 },
  sucesso: { marginBottom: 14, color: '#8fd19e', fontSize: 13, fontWeight: 'bold' },

  btnEnviar: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DOURADO_BOTAO,
    borderRadius: 6,
  },
  btnEnviarTexto: { color: '#111111', fontSize: 13, fontWeight: 'bold' },
});