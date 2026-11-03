import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LayoutConta } from '../components/TelaConta';
import { useDeclararConta } from '../components/ContaProvider';

/* ------------------------------------------------------------------ */
/* Constantes (mesmas cores das outras telas da conta)                 */
/* ------------------------------------------------------------------ */

const DOURADO = '#d4a63a';
const PERIGO = '#ff7777';

/* ------------------------------------------------------------------ */
/* Dados das seções                                                    */
/* O expo-router só abre rotas cujo ARQUIVO existe dentro de src/app.  */
/* Rotas ainda não criadas ficam como null (o toque não faz nada).     */
/* ------------------------------------------------------------------ */

const SEGURANCA = [
  { icone: 'key-outline', titulo: 'Alterar Senha', texto: 'Atualize sua senha de acesso', rota: '/AlterarSenha' },
  { icone: 'finger-print-outline', titulo: 'Autenticação em duas etapas', texto: 'Aumente a segurança da sua conta', rota: null },
  { icone: 'laptop-outline', titulo: 'Dispositivos conectados', texto: 'Gerencie dispositivos e sessões ativas', rota: null },
];

const NOTIFICACOES = [
  { chave: 'email', icone: 'mail-outline', titulo: 'Notificações por E-mail', texto: 'Receber notificações por E-mail' },
  { chave: 'push', icone: 'phone-portrait-outline', titulo: 'Notificações Push', texto: 'Receber notificações no aparelho' },
  { chave: 'novidades', icone: 'sparkles-outline', titulo: 'Novidades e Atualizações', texto: 'Receber novidades da plataforma' },
];

const TEMAS = [
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'claro', rotulo: 'Claro' },
];

const IDIOMAS = [
  { valor: 'pt-br', rotulo: 'Português (Brasil)' },
  { valor: 'en', rotulo: 'English' },
  { valor: 'es', rotulo: 'Español' },
  { valor: 'fr', rotulo: 'Français' },
  { valor: 'de', rotulo: 'Deutsch' },
  { valor: 'it', rotulo: 'Italiano' },
  { valor: 'ja', rotulo: '日本語' },
  { valor: 'zh', rotulo: '中文' },
];

const MOEDAS = [
  { valor: 'BRL', rotulo: 'BRL - R$' },
  { valor: 'USD', rotulo: 'USD - $' },
  { valor: 'EUR', rotulo: 'EUR - €' },
  { valor: 'GBP', rotulo: 'GBP - £' },
  { valor: 'JPY', rotulo: 'JPY - ¥' },
  { valor: 'CAD', rotulo: 'CAD - C$' },
  { valor: 'AUD', rotulo: 'AUD - A$' },
];

const PERSONALIZACAO = [
  { chave: 'tema', icone: 'color-palette-outline', titulo: 'Tema da plataforma', texto: 'Escolha entre temas claro ou escuro', opcoes: TEMAS },
  { chave: 'idioma', icone: 'language-outline', titulo: 'Idioma', texto: 'Selecione o idioma da plataforma', opcoes: IDIOMAS },
  { chave: 'moeda', icone: 'cash-outline', titulo: 'Moeda', texto: 'Escolha a moeda para visualização', opcoes: MOEDAS },
];

const PRIVACIDADE = [
  { icone: 'eye-outline', titulo: 'Quem pode ver seu perfil', texto: 'Gerenciar a visibilidade do seu perfil', rota: null },
  { icone: 'shield-half-outline', titulo: 'Dados e permissões', texto: 'Gerencie seus dados e permissões', rota: null },
  { icone: 'trash-outline', titulo: 'Excluir conta', texto: 'Excluir sua conta permanentemente', rota: null, perigo: true },
];

const AJUDA = [
  { icone: 'help-circle-outline', titulo: 'Perguntas frequentes', texto: 'Encontre respostas para dúvidas comuns', rota: null },
  { icone: 'headset-outline', titulo: 'Fale conosco', texto: 'Entre em contato com nosso suporte', rota: null },
  { icone: 'school-outline', titulo: 'Tutoriais', texto: 'Aprenda a usar a plataforma', rota: '/Tutoriais' },
];

/* ------------------------------------------------------------------ */
/* Subcomponentes (fora da tela para não serem recriados a cada render) */
/* ------------------------------------------------------------------ */

function Cartao({ icone, titulo, children, coluna }) {
  return (
    <View style={[s.card, coluna && s.cardColuna]}>
      <View style={s.cardTopo}>
        <Ionicons name={icone} size={18} color={DOURADO} />
        <Text style={s.cardTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function Linha({ icone, titulo, texto, perigo, onPress, separador, children }) {
  const conteudo = (
    <>
      <View style={[s.icone, perigo && s.iconePerigo]}>
        <Ionicons name={icone} size={18} color={perigo ? PERIGO : DOURADO} />
      </View>

      <View style={s.textos}>
        <Text style={[s.titulo, perigo && s.tituloPerigo]}>{titulo}</Text>
        <Text style={s.texto}>{texto}</Text>
      </View>

      {children}
    </>
  );

  const estilo = [s.linha, separador]; // separador = estilo da borda (topo ou esquerda)

  if (!onPress) return <View style={estilo}>{conteudo}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilo, pressed && s.pressionado]}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      {conteudo}
    </Pressable>
  );
}

function Seta({ perigo }) {
  return <Ionicons name="chevron-forward" size={18} color={perigo ? PERIGO : '#6b6f75'} />;
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

export default function ConfiguracoesUsuario() {
  useDeclararConta('usuario');
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [notificacoes, setNotificacoes] = useState({ email: true, push: true, novidades: true });
  const [preferencias, setPreferencias] = useState({ tema: 'escuro', idioma: 'pt-br', moeda: 'BRL' });
  const [seletorAberto, setSeletorAberto] = useState(null); // chave de PERSONALIZACAO ou null

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const alternar = (chave, valor) => {
    setNotificacoes((n) => ({ ...n, [chave]: valor }));
    // TODO: salvar a preferência no seu backend aqui
  };

  const escolher = (chave, valor) => {
    setPreferencias((p) => ({ ...p, [chave]: valor }));
    setSeletorAberto(null);
    // TODO: salvar a preferência (e aplicar tema/idioma/moeda) aqui
  };

  const itemSeletor = PERSONALIZACAO.find((p) => p.chave === seletorAberto) || null;

  // Lista de links de uma seção (borda no topo a partir do 2º item)
  const links = (lista) =>
    lista.map((item, i) => (
      <Linha
        key={item.titulo}
        icone={item.icone}
        titulo={item.titulo}
        texto={item.texto}
        perigo={item.perigo}
        separador={i > 0 && s.separadorTopo}
        onPress={() => ir(item.rota)}
      >
        <Seta perigo={item.perigo} />
      </Linha>
    ));

  /* ---------- render ---------- */

  return (
    <LayoutConta
      ativo="configuracoes"
      titulo="Configurações"
      subtitulo="Gerencie as configurações da sua conta e preferências."
    >
      {({ mobile, medio }) => {
        const duasColunas = !mobile && !medio && width >= 1000;

        const seguranca = (
          <Cartao key="seguranca" icone="shield-checkmark-outline" titulo="Segurança da Conta" coluna={duasColunas}>
            {links(SEGURANCA)}
          </Cartao>
        );

        const notificacao = (
          <Cartao key="notificacoes" icone="notifications-outline" titulo="Notificações" coluna={duasColunas}>
            {NOTIFICACOES.map((n, i) => (
              <Linha
                key={n.chave}
                icone={n.icone}
                titulo={n.titulo}
                texto={n.texto}
                separador={i > 0 && s.separadorTopo}
              >
                <Switch
                  value={notificacoes[n.chave]}
                  onValueChange={(v) => alternar(n.chave, v)}
                  trackColor={{ false: '#2b2b2e', true: 'rgba(212,166,58,0.55)' }}
                  thumbColor={notificacoes[n.chave] ? DOURADO : '#9a9a9a'}
                  accessibilityLabel={n.titulo}
                />
              </Linha>
            ))}
          </Cartao>
        );

        const personalizacao = (
          <Cartao key="personalizacao" icone="options-outline" titulo="Personalização" coluna={duasColunas}>
            {PERSONALIZACAO.map((p, i) => {
              const atual = p.opcoes.find((o) => o.valor === preferencias[p.chave]);
              return (
                <Linha
                  key={p.chave}
                  icone={p.icone}
                  titulo={p.titulo}
                  texto={p.texto}
                  separador={i > 0 && s.separadorTopo}
                >
                  <Pressable
                    onPress={() => setSeletorAberto(p.chave)}
                    style={({ pressed }) => [s.seletor, pressed && s.pressionado]}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.titulo}: ${atual ? atual.rotulo : ''}`}
                  >
                    <Text style={s.seletorTxt} numberOfLines={1}>
                      {atual ? atual.rotulo : ''}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#8f9497" />
                  </Pressable>
                </Linha>
              );
            })}
          </Cartao>
        );

        const privacidade = (
          <Cartao key="privacidade" icone="lock-closed-outline" titulo="Privacidade" coluna={duasColunas}>
            {links(PRIVACIDADE)}
          </Cartao>
        );

        const ajuda = (
          <Cartao key="ajuda" icone="help-buoy-outline" titulo="Central de Ajuda">
            <View style={duasColunas && s.ajudaLinha}>
              {AJUDA.map((item, i) => (
                <View key={item.titulo} style={duasColunas && s.ajudaItem}>
                  <Linha
                    icone={item.icone}
                    titulo={item.titulo}
                    texto={item.texto}
                    separador={i > 0 && (duasColunas ? s.separadorEsquerda : s.separadorTopo)}
                    onPress={() => ir(item.rota)}
                  >
                    <Seta />
                  </Linha>
                </View>
              ))}
            </View>
          </Cartao>
        );

        return (
          <View style={s.pagina}>
            {duasColunas ? (
              <>
                <View style={s.linhaCards}>
                  {seguranca}
                  {notificacao}
                </View>
                <View style={s.linhaCards}>
                  {personalizacao}
                  {privacidade}
                </View>
              </>
            ) : (
              <>
                {seguranca}
                {notificacao}
                {personalizacao}
                {privacidade}
              </>
            )}
            {ajuda}

            {/* Lista de opções (substitui o <select>) */}
            <Modal
              visible={!!itemSeletor}
              transparent
              animationType="fade"
              onRequestClose={() => setSeletorAberto(null)}
            >
              <Pressable style={s.modalFundo} onPress={() => setSeletorAberto(null)}>
                <Pressable style={s.modalCaixa} onPress={() => {}}>
                  {!!itemSeletor && (
                    <>
                      <View style={s.modalTopo}>
                        <Text style={s.modalTitulo}>{itemSeletor.titulo}</Text>
                        <Pressable
                          onPress={() => setSeletorAberto(null)}
                          hitSlop={10}
                          accessibilityRole="button"
                          accessibilityLabel="Fechar"
                        >
                          <Ionicons name="close" size={22} color="#a5a5a5" />
                        </Pressable>
                      </View>

                      <ScrollView showsVerticalScrollIndicator={false}>
                        {itemSeletor.opcoes.map((op) => {
                          const ativo = op.valor === preferencias[itemSeletor.chave];
                          return (
                            <Pressable
                              key={op.valor}
                              onPress={() => escolher(itemSeletor.chave, op.valor)}
                              style={({ pressed }) => [
                                s.opcao,
                                ativo && s.opcaoAtiva,
                                pressed && s.pressionado,
                              ]}
                              accessibilityRole="button"
                              accessibilityState={{ selected: ativo }}
                            >
                              <Text style={[s.opcaoTxt, ativo && s.opcaoTxtAtiva]}>{op.rotulo}</Text>
                              {ativo && <Ionicons name="checkmark" size={18} color={DOURADO} />}
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        );
      }}
    </LayoutConta>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  pagina: { gap: 16 },
  linhaCards: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },

  /* card */
  card: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardColuna: { flex: 1, minWidth: 0 },
  cardTopo: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  cardTitulo: { color: '#fff', fontSize: 15, fontWeight: '600' },

  /* linha */
  linha: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  separadorTopo: { borderTopWidth: 1, borderTopColor: '#252729' },
  separadorEsquerda: { borderLeftWidth: 1, borderLeftColor: '#252729' },

  icone: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#252729',
    borderRadius: 10,
  },
  iconePerigo: { backgroundColor: '#2a1717', borderColor: '#6b2b2b' },

  textos: { flex: 1, minWidth: 0, gap: 3 },
  titulo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tituloPerigo: { color: '#ff9a9a' },
  texto: { color: '#a5a5a5', fontSize: 12, lineHeight: 17 },

  /* ajuda (3 colunas no site) */
  ajudaLinha: { flexDirection: 'row' },
  ajudaItem: { flex: 1, minWidth: 0 },

  /* seletor */
  seletor: {
    minWidth: 112,
    maxWidth: 150,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 8,
  },
  seletorTxt: { flexShrink: 1, color: '#d3d4d8', fontSize: 12.5, fontWeight: '600' },

  /* modal de opções */
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalCaixa: {
    maxHeight: '70%',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingVertical: 8,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  modalTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  modalTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  opcao: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  opcaoAtiva: { backgroundColor: '#29231a' },
  opcaoTxt: { color: '#d3d4d8', fontSize: 14 },
  opcaoTxtAtiva: { color: DOURADO, fontWeight: '600' },
});