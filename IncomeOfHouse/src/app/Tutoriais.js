import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

/* =========================================================
   ROTAS
   O expo-router só abre rotas cujo ARQUIVO existe dentro da pasta "app".
   Rotas ainda não criadas ficam como null (o toque não faz nada).
========================================================= */

const ROTAS = {
  inicio: '/',
  login: '/login',
  plantas: null,         // ex.: '/plantas'
  profissionais: null,   // ex.: '/profissionais'
  sobre: null,           // ex.: '/sobre'
  verTodos: null,        // lista completa de tutoriais
  faleConosco: null,     // contato / suporte
  termos: null,          // ex.: '/termos-de-uso'
  privacidade: null,     // ex.: '/politica-de-privacidade'
};

// Menu lateral (sem ícones)
const MENU_LATERAL = [
  { texto: 'Meu Perfil', rota: null },                    // PerfilProfissional
  { texto: 'Meus Endereços', rota: null },                // MeusEndereços
  { texto: 'Meus Pedidos', rota: null },                  // MeusPedidos
  { texto: 'Meus Profissionais Favoritos', rota: null },  // MeusProfissionais
  { texto: 'Projetos Salvos', rota: null },               // ProjetosSalvos
  { texto: 'Agendamentos', rota: null },                  // Agendamentos
  { texto: 'Mensagem', rota: null },                      // Mensagem
  { texto: 'Configurações', rota: null, ativo: true },    // ConfiguraçõesProfissionais
  { texto: 'Sair', rota: '/' },                           // index
];

/* =========================================================
   DADOS
========================================================= */

const DESTAQUES = [
  {
    categoria: 'Introdução',
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

function MenuLink({ texto, onPress, ativo }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuLink, ativo && styles.menuLinkAtivo]}>
      <Text style={[styles.menuTexto, ativo && styles.dourado]}>{texto}</Text>
    </Pressable>
  );
}

// .TituloDestaques
function TituloSecao({ texto, acao, onAcao }) {
  return (
    <View style={styles.tituloSecao}>
      <Text style={styles.tituloSecaoTexto}>{texto}</Text>
      {acao ? (
        <Pressable onPress={onAcao}>
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
        <Text style={styles.play}>▶</Text>
      </View>
      <View style={styles.tutorialInfo}>
        <Text style={styles.categoriaTag}>{tutorial.categoria}</Text>
        <Text style={styles.cardTitulo}>{tutorial.titulo}</Text>
        <Text style={styles.cardTexto}>{tutorial.texto}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.duracao}>◷ {tutorial.duracao}</Text>
          <Pressable style={styles.botaoAssistir} onPress={onAssistir}>
            <Text style={styles.botaoAssistirTexto}>Assistir</Text>
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
  const { width, height } = useWindowDimensions();
  const menuCentralizado = width >= 900; // menu no centro do header
  const lateral = width >= 900;          // menu lateral ao lado do conteúdo

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [busca, setBusca] = useState('');
  const [focoBusca, setFocoBusca] = useState(false);

  const termo = normalizar(busca.trim());
  const destaques = DESTAQUES.filter((t) =>
    normalizar(`${t.titulo} ${t.categoria} ${t.texto}`).includes(termo)
  );
  const categorias = CATEGORIAS.filter((c) =>
    normalizar(`${c.titulo} ${c.texto}`).includes(termo)
  );

  const menu = (
    <>
      <MenuLink texto="Início" onPress={() => ir(ROTAS.inicio)} />
      <MenuLink texto="Plantas" onPress={() => ir(ROTAS.plantas)} />
      <MenuLink texto="Profissionais" onPress={() => ir(ROTAS.profissionais)} />
      <MenuLink texto="Sobre" onPress={() => ir(ROTAS.sobre)} />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudoScroll} keyboardShouldPersistTaps="handled">
        {/* ---------- .BackGround ---------- */}
        <View style={[styles.background, { minHeight: height }]}>
          {/* ---------- .topo ---------- */}
          <View style={styles.topo}>
            <Pressable onPress={() => ir(ROTAS.inicio)}>
              <Text style={styles.logoTexto}>Income of Houses</Text>
            </Pressable>

            {menuCentralizado ? (
              <>
                <View style={styles.menuCentro} pointerEvents="box-none">
                  <View style={styles.menu}>{menu}</View>
                </View>
                {/* .iconelogin (sem ícone: link de texto) */}
                <Pressable style={styles.entrar} onPress={() => ir(ROTAS.login)}>
                  <Text style={styles.entrarTexto}>Entrar</Text>
                </Pressable>
              </>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.menuScroll}
                contentContainerStyle={[styles.menu, styles.menuScrollConteudo]}
              >
                {menu}
                <MenuLink texto="Entrar" onPress={() => ir(ROTAS.login)} />
              </ScrollView>
            )}
          </View>

          {/* ---------- .container ---------- */}
          <View style={[styles.container, lateral && styles.containerLateral]}>
            {/* ---------- .menu-lateral ---------- */}
            <View style={[styles.menuLateral, lateral && styles.menuLateralLado]}>
              {MENU_LATERAL.map((item) => (
                <Pressable
                  key={item.texto}
                  onPress={() => ir(item.rota)}
                  style={[styles.itemLateral, item.ativo && styles.itemLateralAtivo]}
                >
                  <Text style={[styles.itemTexto, item.ativo && styles.dourado]} numberOfLines={2}>
                    {item.texto}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ---------- .conteudo ---------- */}
            <View style={styles.conteudo}>
              <Text style={styles.titulo}>Tutoriais</Text>
              <Text style={styles.subtitulo}>
                Aprenda a usar todas as funcionalidades da plataforma de forma simples e rápida.
              </Text>

              {/* ---------- .pesquisa-topo ---------- */}
              <View style={styles.pesquisa}>
                <TextInput
                  style={[
                    styles.pesquisaInput,
                    focoBusca && styles.pesquisaInputFoco,
                    Platform.OS === 'web' && styles.semOutline,
                  ]}
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="Buscar tutoriais..."
                  placeholderTextColor="#737373"
                  onFocus={() => setFocoBusca(true)}
                  onBlur={() => setFocoBusca(false)}
                />
                <Text style={styles.pesquisaDica}>
                  Ex: como criar um projeto, adicionar endereço...
                </Text>
              </View>

              {/* ---------- .Config ---------- */}
              <View style={styles.config}>
                {/* ---------- .Destaques ---------- */}
                <View style={styles.bloco}>
                  <TituloSecao
                    texto="Tutoriais em Destaque"
                    acao="Ver todos →"
                    onAcao={() => ir(ROTAS.verTodos)}
                  />
                  {destaques.length > 0 ? (
                    <View style={styles.cards}>
                      {destaques.map((t) => (
                        <TutorialCard key={t.titulo} tutorial={t} onAssistir={() => ir(t.rota)} />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.vazio}>Nenhum tutorial encontrado.</Text>
                  )}
                </View>

                <View style={styles.linhaBlocos}>
                  {/* ---------- .Categorias ---------- */}
                  <View style={[styles.bloco, styles.blocoCategorias]}>
                    <TituloSecao texto="Tutoriais por Categoria" />
                    {categorias.length > 0 ? (
                      categorias.map((c, i) => (
                        <Pressable
                          key={c.titulo}
                          style={[styles.categoriaItem, i > 0 && styles.categoriaItemBorda]}
                          onPress={() => ir(c.rota)}
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
                  <View style={[styles.bloco, styles.blocoAjuda]}>
                    <TituloSecao texto="Precisa de ajuda?" />
                    <Text style={styles.ajudaTexto}>
                      Se não encontrar o que procura, nosso suporte está pronto para ajudar.
                    </Text>
                    <Pressable style={styles.botao} onPress={() => ir(ROTAS.faleConosco)}>
                      <Text style={styles.botaoTexto}>Fale Conosco</Text>
                    </Pressable>

                    <View style={styles.espaco} />

                    <TituloSecao texto="Dicas Rápidas" />
                    {DICAS.map((d) => (
                      <View key={d} style={styles.dica}>
                        <Text style={styles.dicaPonto}>•</Text>
                        <Text style={styles.dicaTexto}>{d}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- .rodape ---------- */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.rodapeLinks}>
            <Pressable onPress={() => ir(ROTAS.termos)}>
              <Text style={styles.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>|</Text>
            <Pressable onPress={() => ir(ROTAS.privacidade)}>
              <Text style={styles.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   ESTILOS
   (o Tutoriais.css não foi enviado: os valores abaixo seguem o
   padrão visual das outras telas; ajuste conforme o seu CSS)
========================================================= */

const OURO = '#d4af6a';
const OURO_BORDA = '#cda432';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  conteudoScroll: { flexGrow: 1 },
  dourado: { color: OURO },
  semOutline: { outlineStyle: 'none' },

  /* .topo */
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    backgroundColor: 'rgba(10,10,10,0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  logoTexto: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .menu */
  menuCentro: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuScroll: { flex: 1 },
  menuScrollConteudo: { flexGrow: 1, justifyContent: 'flex-end' },
  menuLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuLinkAtivo: {
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  menuTexto: { color: '#ffffff', fontSize: 14, fontWeight: '500' },

  /* .iconelogin */
  entrar: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  entrarTexto: { color: OURO, fontSize: 14, fontWeight: '600' },

  /* .BackGround */
  background: { backgroundColor: '#0f0f0f' },

  /* .container */
  container: {
    gap: 30,
    paddingTop: 110,
    paddingBottom: 60,
    paddingHorizontal: '6%',
  },
  containerLateral: { flexDirection: 'row', alignItems: 'flex-start' },

  /* .menu-lateral */
  menuLateral: {
    padding: 12,
    gap: 4,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
  },
  menuLateralLado: { width: 290 },
  itemLateral: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemLateralAtivo: {
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  itemTexto: { color: '#e5e5e5', fontSize: 14, fontWeight: '500' },

  /* .conteudo */
  conteudo: { flex: 1, width: '100%', minWidth: 0 },
  titulo: { color: '#f5f5f5', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitulo: { color: '#a3a3a3', fontSize: 16, marginBottom: 24 },

  /* .pesquisa-topo */
  pesquisa: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  pesquisaInput: {
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
    color: '#e5e5e5',
    fontSize: 14,
  },
  pesquisaInputFoco: { borderColor: OURO_BORDA },
  pesquisaDica: { color: '#737373', fontSize: 12, marginTop: 8 },

  /* .Config */
  config: { gap: 24 },
  bloco: {
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.35)',
    borderRadius: 16,
  },
  linhaBlocos: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24 },
  blocoCategorias: { flexGrow: 2, flexShrink: 1, flexBasis: 340, minWidth: 280 },
  blocoAjuda: { flexGrow: 1, flexShrink: 1, flexBasis: 260, minWidth: 240 },

  /* .TituloDestaques */
  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  tituloSecaoTexto: { flexShrink: 1, color: '#f5f5f5', fontSize: 20, fontWeight: 'bold' },
  tituloSecaoLink: { color: OURO, fontSize: 14, fontWeight: '600' },
  vazio: { color: '#a3a3a3', fontSize: 14 },

  /* .cards / .tutorial-card */
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  tutorialCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
    minWidth: 200,
    maxWidth: 340,
    overflow: 'hidden',
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  thumb: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
  },
  play: { color: OURO, fontSize: 28 },
  tutorialInfo: { padding: 14 },
  categoriaTag: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212,175,106,0.12)',
    color: OURO,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitulo: { color: '#f5f5f5', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardTexto: { color: '#a3a3a3', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  duracao: { color: '#a3a3a3', fontSize: 12 },
  botaoAssistir: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  botaoAssistirTexto: { color: OURO, fontSize: 12, fontWeight: '700' },

  /* .categoria-item */
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  categoriaItemBorda: { borderTopWidth: 1, borderTopColor: '#222' },
  categoriaTexto: { flex: 1 },
  categoriaTitulo: { color: '#f5f5f5', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  categoriaDescricao: { color: '#a3a3a3', fontSize: 13 },
  categoriaQtd: { color: '#737373', fontSize: 12 },
  seta: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .Ajuda */
  ajudaTexto: { color: '#e5e5e5', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  botao: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: OURO,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#111111', fontSize: 14, fontWeight: '700' },
  espaco: { height: 28 },

  /* .dicas */
  dica: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dicaPonto: { color: OURO, fontSize: 14 },
  dicaTexto: { flex: 1, color: '#e5e5e5', fontSize: 13, lineHeight: 20 },

  /* .rodape */
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
  rodapeLink: { color: OURO, fontSize: 13 },
  rodapeSep: { color: '#555555', fontSize: 13 },
});