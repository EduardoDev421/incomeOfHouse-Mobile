import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLegal } from '../components/LegalProvider';

const FUNDO = require('../../assets/images/BackgroundFundo.png');
const LOGO = require('../../assets/images/Logo.png');

/* =========================================================
   ROTAS
   O expo-router só abre rotas cujo ARQUIVO existe dentro da pasta "app".
   Rotas ainda não criadas ficam como null (o toque não faz nada).
========================================================= */

const ROTAS = {
  inicio: '/',
  login: '/login',
  plantas: '/planta',
  profissionais: '/profissionais',
  sobre: '/sobreNos',
  faleConosco: '/faleConosco',
};

const LINKS_TOPO = [
  { texto: 'Início', rota: ROTAS.inicio },
  { texto: 'Plantas', rota: ROTAS.plantas },
  { texto: 'Profissionais', rota: ROTAS.profissionais },
  { texto: 'Sobre', rota: ROTAS.sobre },
];

// Menu lateral
const MENU_LATERAL = [
  { icone: 'person-circle-outline', texto: 'Meu Perfil', rota: '/PerfilProfissional' },
  { icone: 'location-outline', texto: 'Meus Endereços', rota: '/MeusenderecosP' },
  { icone: 'apps-outline', texto: 'Meus Pedidos', rota: '/Projetos' },
  { icone: 'star-outline', texto: 'Meus Profissionais Favoritos', rota: '/Meusprofissionais' },
  { icone: 'bookmark-outline', texto: 'Meus Projetos Favoritos', rota: '/MeusProjetos' },
  { icone: 'calendar-outline', texto: 'Agendamentos', rota: '/AgendamentosP' },
  { icone: 'chatbox-outline', texto: 'Mensagem', rota: '/MensagensP' },
  { icone: 'settings-outline', texto: 'Configurações', rota: '/ConfigProfissionais', ativo: true },
  { icone: 'log-out-outline', texto: 'Sair', rota: '/login' },
];

/* =========================================================
   DADOS
========================================================= */

const DESTAQUES = [
  {
    categoria: 'Primeiros Passos',
    titulo: 'Conhecendo a Plataforma',
    texto: 'Veja como navegar pelo sistema e entender o layout principal.',
    duracao: '4:32',
    rota: null,
  },
  {
    categoria: 'Plantas',
    titulo: 'Como Buscar Plantas',
    texto: 'Aprenda a encontrar e filtrar plantas de acordo com suas necessidades.',
    duracao: '3:45',
    rota: null,
  },
  {
    categoria: 'Pedidos',
    titulo: 'Como Fazer um Pedido',
    texto: 'Passo a passo para solicitar um projeto ou serviço de um profissional.',
    duracao: '5:20',
    rota: null,
  },
  {
    categoria: 'Configurações',
    titulo: 'Configurando sua Conta',
    texto: 'Personalize suas preferências, dados pessoais e permissões de acesso.',
    duracao: '4:18',
    rota: null,
  },
];

const CATEGORIAS = [
  { titulo: 'Primeiros Passos', texto: 'Conheça o básico da plataforma.', qtd: '5 tutoriais', rota: null },
  { titulo: 'Plantas', texto: 'Busca, visualização e download.', qtd: '6 tutoriais', rota: null },
  { titulo: 'Pedidos', texto: 'Solicitações e acompanhamento.', qtd: '4 tutoriais', rota: null },
  { titulo: 'Profissionais', texto: 'Encontrar e gerenciar profissionais.', qtd: '4 tutoriais', rota: null },
  { titulo: 'Configurações', texto: 'Conta, permissões e preferências.', qtd: '5 tutoriais', rota: null },
  { titulo: 'Recursos Avançados', texto: 'Funcionalidades especiais.', qtd: '3 tutoriais', rota: null },
];

const DICAS = [
  'Mantenha seus dados sempre atualizados.',
  'Use a busca para encontrar plantas mais rapidamente.',
  'Salve seus projetos favoritos.',
  'Configure suas notificações.',
];

// minúsculas e sem acentos, para a busca
const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* =========================================================
   COMPONENTES (fora da tela para não serem recriados a cada tecla)
========================================================= */

// .TituloDestaques (ícone + título + link opcional)
function TituloSecao({ icone, texto, acao, onAcao }) {
  return (
    <View style={styles.tituloSecao}>
      <Ionicons name={icone} size={20} color={DOURADO} />
      <Text style={styles.tituloSecaoTexto}>{texto}</Text>
      {acao ? (
        <Pressable onPress={onAcao} hitSlop={8} accessibilityRole="link">
          <Text style={styles.tituloSecaoLink}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// .tutorial-card
function TutorialCard({ tutorial, onAssistir }) {
  return (
    <View style={styles.tutorialCard}>
      <View style={styles.thumb}>
        <View style={styles.play}>
          <Ionicons name="play" size={14} color={DOURADO_CLARO} style={styles.playIcone} />
        </View>
      </View>

      <View style={styles.tutorialInfo}>
        <Text style={styles.categoria}>{tutorial.categoria}</Text>
        <Text style={styles.cardTitulo}>{tutorial.titulo}</Text>
        <Text style={styles.cardTexto}>{tutorial.texto}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.duracao}>◷ {tutorial.duracao}</Text>
          <Pressable
            style={({ pressed }) => [styles.botaoContorno, pressed && styles.botaoApertado]}
            onPress={onAssistir}
            accessibilityRole="button"
            accessibilityLabel={`Assistir ${tutorial.titulo}`}
          >
            <Text style={styles.botaoContornoTexto}>Assistir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function Tutoriais() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { abrirLegal } = useLegal();
  const { width } = useWindowDimensions();

  // Mesmos pontos de corte do CSS da versão web
  const lateral = width > 850;           // menu lateral fixo + menu do topo
  const lateralEstreita = width <= 1100;
  const colunasMenu = width <= 600 ? 2 : 3;
  const colunasCards = width > 1200 ? 4 : width > 600 ? 2 : 1;
  const duasColunas = width >= 1000;     // Categorias e Ajuda lado a lado
  const mostrarDica = width > 900;       // dica dentro da barra de busca

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [busca, setBusca] = useState('');

  const termo = normalizar(busca.trim());
  const destaques = DESTAQUES.filter((t) =>
    normalizar(`${t.titulo} ${t.categoria} ${t.texto}`).includes(termo)
  );
  const categorias = CATEGORIAS.filter((c) =>
    normalizar(`${c.titulo} ${c.texto}`).includes(termo)
  );

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fundo da página inteira */}
      <Image source={FUNDO} style={styles.fundoImagem} resizeMode="cover" />
      <View style={styles.fundoOverlay} pointerEvents="none" />

      {/* ---------- .topo (fixo) ---------- */}
      <View style={[styles.topo, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <Pressable
          onPress={() => ir(ROTAS.inicio)}
          accessibilityRole="button"
          accessibilityLabel="Ir para o início"
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Pressable>

        {/* Como na web, o menu do topo some em telas estreitas */}
        {lateral && (
          <View style={[styles.menuTopo, { top: insets.top }]} pointerEvents="box-none">
            {LINKS_TOPO.map((l) => (
              <Pressable key={l.texto} onPress={() => ir(l.rota)} accessibilityRole="link">
                <Text style={styles.linkTopo}>{l.texto}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* .iconelogin */}
        <Pressable
          onPress={() => ir(ROTAS.login)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Perfil"
        >
          <Ionicons name="person-circle-outline" size={30} color={DOURADO} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudoScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.corpo, lateral && styles.corpoLinha]}>
          {/* ---------- .menu-lateral ---------- */}
          <View
            style={[
              styles.menuLateral,
              lateral
                ? [styles.menuLateralFixo, lateralEstreita && styles.menuLateralEstreito]
                : styles.menuLateralTopo,
            ]}
          >
            <View style={lateral ? styles.listaColuna : styles.listaGrade}>
              {MENU_LATERAL.map((item, i) => {
                const ultimo = i === MENU_LATERAL.length - 1;

                return (
                  <View
                    key={item.texto}
                    style={
                      lateral
                        ? ultimo && styles.itemSair
                        : { width: `${100 / colunasMenu}%`, padding: 2.5 }
                    }
                  >
                    <Pressable
                      onPress={() => ir(item.rota)}
                      style={[
                        styles.itemLateral,
                        !lateral && styles.itemLateralCentro,
                        item.ativo && styles.itemLateralAtivo,
                      ]}
                      accessibilityRole="link"
                      accessibilityState={{ selected: !!item.ativo }}
                    >
                      {/* Ícones sempre dourados, como na versão web */}
                      <Ionicons name={item.icone} size={17} color={DOURADO} />
                      <Text
                        style={[
                          styles.itemTexto,
                          !lateral && styles.itemTextoCentro,
                          item.ativo && styles.dourado,
                        ]}
                      >
                        {item.texto}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ---------- .conteudo ---------- */}
          <View
            style={[
              styles.conteudo,
              lateral ? styles.conteudoLinha : styles.conteudoColuna,
              !lateral && styles.conteudoEstreito,
            ]}
          >
            <Text style={styles.titulo}>Tutoriais</Text>
            <Text style={styles.subtitulo}>
              Aprenda a usar todas as funcionalidades da plataforma de forma simples e rápida.
            </Text>

            {/* ---------- .pesquisa-topo ---------- */}
            <View style={styles.pesquisa}>
              <Ionicons name="help-circle-outline" size={17} color={DOURADO} />
              <TextInput
                style={[styles.pesquisaInput, Platform.OS === 'web' && styles.semOutline]}
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar tutoriais..."
                placeholderTextColor="#777777"
                selectionColor={DOURADO}
                accessibilityLabel="Buscar tutoriais"
              />
              {mostrarDica && (
                <Text style={styles.pesquisaDica} numberOfLines={1}>
                  Ex: como criar um projeto, adicionar endereço...
                </Text>
              )}
            </View>

            {/* ---------- .Config ---------- */}
            <View style={styles.config}>
              {/* ---------- .Destaques ---------- */}
              <View style={styles.bloco}>
                <TituloSecao
                  icone="star-outline"
                  texto="Tutoriais em Destaque"
                  acao="Ver todos →"
                  onAcao={() => setBusca('')}
                />

                {destaques.length > 0 ? (
                  <View style={styles.cardsGrade}>
                    <View style={styles.cardsLinha}>
                      {destaques.map((t) => (
                        <View
                          key={t.titulo}
                          style={[styles.cardCelula, { width: `${100 / colunasCards}%` }]}
                        >
                          <TutorialCard tutorial={t} onAssistir={() => ir(t.rota)} />
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.vazio}>Nenhum tutorial encontrado.</Text>
                )}
              </View>

              <View style={[styles.linhaBlocos, duasColunas && styles.linhaBlocosLinha]}>
                {/* ---------- .Categorias ---------- */}
                <View style={[styles.bloco, duasColunas && styles.blocoMetade]}>
                  <TituloSecao icone="help-circle-outline" texto="Tutoriais por Categoria" />

                  {categorias.length > 0 ? (
                    categorias.map((c, i) => (
                      <Pressable
                        key={c.titulo}
                        style={({ pressed }) => [
                          styles.categoriaItem,
                          i < categorias.length - 1 && styles.categoriaItemBorda,
                          pressed && styles.categoriaApertada,
                        ]}
                        onPress={() => ir(c.rota)}
                        accessibilityRole="button"
                      >
                        <View style={styles.categoriaTexto}>
                          <Text style={styles.categoriaTitulo}>{c.titulo}</Text>
                          <Text style={styles.categoriaDescricao}>{c.texto}</Text>
                        </View>
                        <Text style={styles.categoriaQtd}>{c.qtd}</Text>
                        <Text style={styles.seta}>{'>'}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.vazio}>Nenhuma categoria encontrada.</Text>
                  )}
                </View>

                {/* ---------- .Ajuda ---------- */}
                <View style={[styles.bloco, duasColunas && styles.blocoMetade]}>
                  <TituloSecao icone="headset-outline" texto="Precisa de ajuda?" />

                  <View style={styles.ajudaCorpo}>
                    <Text style={styles.ajudaTexto}>
                      Se não encontrar o que procura, nosso suporte está pronto para ajudar.
                    </Text>
                    <Pressable
                      style={({ pressed }) => [styles.botaoAjuda, pressed && styles.botaoApertado]}
                      onPress={() => ir(ROTAS.faleConosco)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.botaoContornoTexto}>Fale Conosco</Text>
                    </Pressable>
                  </View>

                  <TituloSecao icone="document-text-outline" texto="Dicas Rápidas" />

                  <View style={styles.dicas}>
                    {DICAS.map((d) => (
                      <View key={d} style={styles.dica}>
                        <Text style={styles.dicaPonto}>✓</Text>
                        <Text style={styles.dicaTexto}>{d}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- .rodape (mantido como estava) ---------- */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.rodapeLinks}>
            <Pressable onPress={() => abrirLegal('termos')}>
              <Text style={styles.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>|</Text>
            <Pressable onPress={() => abrirLegal('privacidade')}>
              <Text style={styles.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   ESTILOS (valores do Tutoriais.css da versão web)
========================================================= */

const DOURADO = '#d4a63a';
const DOURADO_CLARO = '#f0ca4c';
const DOURADO_BORDA = '#8a701e';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#080a0b' },
  dourado: { color: DOURADO },
  semOutline: { outlineStyle: 'none' },

  fundoImagem: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  fundoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 7, 8, 0.86)' },

  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudoScroll: { flexGrow: 1 },

  /* .topo */
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

  /* estrutura */
  corpo: { flexGrow: 1 },
  corpoLinha: { flexDirection: 'row' },

  /* .menu-lateral */
  menuLateral: { backgroundColor: '#0d0d0e' },
  menuLateralFixo: {
    width: 250,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#252729',
  },
  menuLateralEstreito: { width: 220 },
  menuLateralTopo: {
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
  itemLateral: {
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
  itemLateralCentro: { justifyContent: 'center' },
  itemLateralAtivo: { backgroundColor: '#29231a', borderColor: '#59431f' },
  itemTexto: { color: '#eeeeee', fontSize: 12, flexShrink: 1 },
  itemTextoCentro: { textAlign: 'center', fontSize: 13 },

  /* .conteudo */
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

  /* .pesquisa-topo */
  pesquisa: {
    height: 42,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  pesquisaInput: { flex: 1, minWidth: 0, height: '100%', padding: 0, color: '#dddddd', fontSize: 13 },
  pesquisaDica: { flexShrink: 1, color: '#555555', fontSize: 11 },

  /* .Config */
  config: { gap: 16, marginTop: 20 },
  linhaBlocos: { gap: 16 },
  linhaBlocosLinha: { flexDirection: 'row', alignItems: 'stretch' },
  blocoMetade: { flex: 1, minWidth: 0 },

  /* .Destaques / .Categorias / .Ajuda */
  bloco: {
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  tituloSecao: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  tituloSecaoTexto: { flex: 1, color: '#ffffff', fontSize: 14, fontWeight: '600' },
  tituloSecaoLink: { color: DOURADO_CLARO, fontSize: 12 },
  vazio: { color: '#8f9497', fontSize: 13, padding: 20 },

  /* .cards / .tutorial-card */
  cardsGrade: { padding: 16 },
  cardsLinha: { flexDirection: 'row', flexWrap: 'wrap', margin: -7 },
  cardCelula: { padding: 7 },
  tutorialCard: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  thumb: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0c0d',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  play: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 10, 11, 0.85)',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 20,
  },
  playIcone: { marginLeft: 2 },
  tutorialInfo: { flex: 1, paddingTop: 12, paddingHorizontal: 14, paddingBottom: 14 },
  categoria: { color: DOURADO, fontSize: 11 },
  cardTitulo: { marginVertical: 5, color: '#e7e7e7', fontSize: 13, fontWeight: 'bold' },
  cardTexto: { minHeight: 44, color: '#8f9497', fontSize: 11, lineHeight: 16 },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duracao: { color: '#8f9497', fontSize: 11 },
  botaoContorno: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DOURADO_BORDA,
    borderRadius: 5,
  },
  botaoApertado: { backgroundColor: 'rgba(212, 166, 58, 0.18)' },
  botaoContornoTexto: { color: DOURADO_CLARO, fontSize: 11 },

  /* .categoria-item */
  categoriaItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoriaItemBorda: { borderBottomWidth: 1, borderBottomColor: '#242424' },
  categoriaApertada: { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  categoriaTexto: { flex: 1, minWidth: 0 },
  categoriaTitulo: { marginBottom: 4, color: '#e7e7e7', fontSize: 13, fontWeight: 'bold' },
  categoriaDescricao: { color: '#8f9497', fontSize: 11 },
  categoriaQtd: { color: '#666666', fontSize: 11 },
  seta: { marginLeft: 6, color: '#92979a', fontSize: 18 },

  /* .Ajuda */
  ajudaCorpo: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  ajudaTexto: { marginBottom: 12, color: '#8f9497', fontSize: 12, lineHeight: 17 },
  botaoAjuda: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DOURADO_BORDA,
    borderRadius: 5,
  },

  /* .dicas */
  dicas: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 6 },
  dica: { flexDirection: 'row', paddingBottom: 10 },
  dicaPonto: { width: 20, color: DOURADO, fontSize: 12 },
  dicaTexto: { flex: 1, color: '#8f9497', fontSize: 12, lineHeight: 17 },

  /* .rodape (igual ao que já estava) */
  rodape: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingVertical: 22,
    paddingHorizontal: '6%',
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#d4a63a',
  },
  rodapeTexto: { color: '#888888', fontSize: 13 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rodapeLink: { color: '#d4af6a', fontSize: 13 },
  rodapeSep: { color: '#555555', fontSize: 13 },
});