import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Modal,
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
   As duas rotas abaixo assumem que os arquivos estão em src/app/:
     AlterarSenha.js e Tutoriais.js
========================================================= */

const ROTAS = {
  inicio: '/',
  plantas: null,         // ex.: '/plantas'
  profissionais: null,   // ex.: '/profissionais'
  sobre: null,           // ex.: '/sobre'
  termos: null,          // ex.: '/termos-de-uso'
  privacidade: null,     // ex.: '/politica-de-privacidade'
};

// Menu lateral (sem ícones)
const MENU_LATERAL = [
  { texto: 'Meu Perfil', rota: null },                    // perfilUsuario
  { texto: 'Meus Endereços', rota: null },                // MeusEndereços
  { texto: 'Meus Pedidos', rota: null },                  // MeusPedidos
  { texto: 'Meus Profissionais Favoritos', rota: null },  // MeusProfissionais
  { texto: 'Projetos Salvos', rota: null },               // ProjetosSalvos
  { texto: 'Agendamentos', rota: null },                  // Agendamentos
  { texto: 'Mensagem', rota: null },                      // Mensagem
  { texto: 'Configurações', rota: null, ativo: true },    // (esta página)
  { texto: 'Sair', rota: '/' },                           // index
];

/* =========================================================
   DADOS DAS SEÇÕES
========================================================= */

const SEGURANCA = [
  { titulo: 'Alterar Senha', texto: 'Atualize sua senha de acesso', rota: '/AlterarSenha' },
  { titulo: 'Autenticação em duas etapas', texto: 'Aumente a segurança da sua conta', rota: null },
  { titulo: 'Dispositivos conectados', texto: 'Gerencie dispositivos e sessões ativas', rota: null },
];

const NOTIFICACOES = [
  { chave: 'email', titulo: 'Notificações por E-mail', texto: 'Receber notificações por E-mail' },
  { chave: 'push', titulo: 'Notificações Push', texto: 'Receber notificações no navegador' },
  { chave: 'novidades', titulo: 'Novidades e Atualizações', texto: 'Receber novidades da plataforma' },
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
  { chave: 'tema', titulo: 'Tema da plataforma', texto: 'Escolha entre temas claro ou escuro', opcoes: TEMAS },
  { chave: 'idioma', titulo: 'Idioma', texto: 'Selecione o idioma da plataforma', opcoes: IDIOMAS },
  { chave: 'moeda', titulo: 'Moeda', texto: 'Escolha a moeda para visualização', opcoes: MOEDAS },
];

const PRIVACIDADE = [
  { titulo: 'Quem pode ver seu perfil', texto: 'Gerenciar a visibilidade do seu perfil', rota: null },
  { titulo: 'Dados e permissões', texto: 'Gerencie seus dados e permissões', rota: null },
  { titulo: 'Excluir conta', texto: 'Excluir sua conta permanentemente', rota: null, perigo: true },
];

const AJUDA = [
  { titulo: 'Perguntas frequentes', texto: 'Encontre respostas para dúvidas comuns', rota: null },
  { titulo: 'Fale conosco', texto: 'Entre em contato com nosso suporte', rota: null },
  { titulo: 'Tutoriais para profissionais', texto: 'Aprenda a usar a plataforma', rota: '/Tutoriais' },
];

/* =========================================================
   COMPONENTES (fora da tela para não serem recriados a cada render)
========================================================= */

function MenuLink({ texto, onPress, ativo }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuLink, ativo && styles.menuLinkAtivo]}>
      <Text style={[styles.menuTexto, ativo && styles.dourado]}>{texto}</Text>
    </Pressable>
  );
}

// Cartão de uma seção (.Segurança, .notificação, .Personalização...)
function Secao({ titulo, children }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

// Linha clicável com título, descrição e seta
function ItemLink({ item, borda, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.item, borda && styles.itemBorda]}>
      <View style={styles.itemTextos}>
        <Text style={[styles.itemTitulo, item.perigo && styles.perigo]}>{item.titulo}</Text>
        <Text style={styles.itemTexto}>{item.texto}</Text>
      </View>
      <Text style={[styles.seta, item.perigo && styles.perigo]}>{'>'}</Text>
    </Pressable>
  );
}

// Linha com interruptor (.toggle)
function ItemSwitch({ item, borda, valor, onChange }) {
  return (
    <View style={[styles.item, borda && styles.itemBorda]}>
      <View style={styles.itemTextos}>
        <Text style={styles.itemTitulo}>{item.titulo}</Text>
        <Text style={styles.itemTexto}>{item.texto}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: '#363636', true: 'rgba(212,175,106,0.5)' }}
        thumbColor={valor ? OURO : '#9a9a9a'}
      />
    </View>
  );
}

// Linha com lista de opções (.seletor): substitui o <select> por um modal
function ItemSelecao({ item, borda, valor, onChange }) {
  const [aberto, setAberto] = useState(false);
  const atual = item.opcoes.find((o) => o.valor === valor);

  return (
    <View style={[styles.item, borda && styles.itemBorda]}>
      <View style={styles.itemTextos}>
        <Text style={styles.itemTitulo}>{item.titulo}</Text>
        <Text style={styles.itemTexto}>{item.texto}</Text>
      </View>

      <Pressable style={[styles.seletor, aberto && styles.seletorFoco]} onPress={() => setAberto(true)}>
        <Text style={styles.seletorTexto} numberOfLines={1}>
          {atual ? atual.rotulo : ''}
        </Text>
        <Text style={styles.seletorSeta}>▾</Text>
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.modalFundo} onPress={() => setAberto(false)}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>{item.titulo}</Text>
            <ScrollView>
              {item.opcoes.map((op) => (
                <Pressable
                  key={op.valor}
                  style={[styles.opcao, op.valor === valor && styles.opcaoAtiva]}
                  onPress={() => {
                    onChange(op.valor);
                    setAberto(false);
                  }}
                >
                  <Text style={[styles.opcaoTexto, op.valor === valor && styles.dourado]}>
                    {op.rotulo}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function ConfiguracoesUsuario() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const menuCentralizado = width >= 900; // menu no centro do header
  const lateral = width >= 900;          // menu lateral ao lado do conteúdo

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [notificacoes, setNotificacoes] = useState({ email: true, push: true, novidades: true });
  const [preferencias, setPreferencias] = useState({ tema: 'escuro', idioma: 'pt-br', moeda: 'BRL' });

  const alternar = (chave) => (valor) => {
    setNotificacoes((n) => ({ ...n, [chave]: valor }));
    // TODO: salvar a preferência no seu backend aqui
  };

  const escolher = (chave) => (valor) => {
    setPreferencias((p) => ({ ...p, [chave]: valor }));
    // TODO: salvar a preferência (e aplicar tema/idioma/moeda) aqui
  };

  // Lista de links de uma seção
  const links = (lista) =>
    lista.map((item, i) => (
      <ItemLink key={item.titulo} item={item} borda={i > 0} onPress={() => ir(item.rota)} />
    ));

  const menu = (
    <>
      <MenuLink texto="Início" onPress={() => ir(ROTAS.inicio)} />
      <MenuLink texto="Plantas" onPress={() => ir(ROTAS.plantas)} />
      <MenuLink texto="Profissionais" onPress={() => ir(ROTAS.profissionais)} />
      <MenuLink texto="Sobre Nós" onPress={() => ir(ROTAS.sobre)} ativo />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudoScroll}>
        {/* ---------- .BackGround ---------- */}
        <View style={[styles.background, { minHeight: height }]}>
          {/* ---------- .topo ---------- */}
          <View style={styles.topo}>
            <Pressable onPress={() => ir(ROTAS.inicio)}>
              <Text style={styles.logoTexto}>Income of Houses</Text>
            </Pressable>

            {menuCentralizado ? (
              <View style={styles.menuCentro} pointerEvents="box-none">
                <View style={styles.menu}>{menu}</View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.menuScroll}
                contentContainerStyle={[styles.menu, styles.menuScrollConteudo]}
              >
                {menu}
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
                  <Text style={[styles.itemLateralTexto, item.ativo && styles.dourado]} numberOfLines={2}>
                    {item.texto}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ---------- .conteudo ---------- */}
            <View style={styles.conteudo}>
              <Text style={styles.titulo}>Configurações</Text>
              <Text style={styles.subtitulo}>Gerencie as configurações da sua conta e preferências.</Text>

              {/* ---------- .Config ---------- */}
              <View style={styles.config}>
                <View style={styles.linha}>
                  <Secao titulo="Segurança da Conta">{links(SEGURANCA)}</Secao>

                  <Secao titulo="Notificações">
                    {NOTIFICACOES.map((n, i) => (
                      <ItemSwitch
                        key={n.chave}
                        item={n}
                        borda={i > 0}
                        valor={notificacoes[n.chave]}
                        onChange={alternar(n.chave)}
                      />
                    ))}
                  </Secao>
                </View>

                <View style={styles.linha}>
                  <Secao titulo="Personalização">
                    {PERSONALIZACAO.map((p, i) => (
                      <ItemSelecao
                        key={p.chave}
                        item={p}
                        borda={i > 0}
                        valor={preferencias[p.chave]}
                        onChange={escolher(p.chave)}
                      />
                    ))}
                  </Secao>

                  <Secao titulo="Privacidade">{links(PRIVACIDADE)}</Secao>
                </View>

                {/* .CentralAjuda */}
                <View style={styles.linha}>
                  <Secao titulo="Central de Ajuda">{links(AJUDA)}</Secao>
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
   (o ConfiguraçõesUsuario.css não foi enviado: os valores abaixo
   seguem o padrão visual das outras telas; ajuste conforme o seu CSS)
========================================================= */

const OURO = '#d4af6a';
const OURO_BORDA = '#cda432';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  conteudoScroll: { flexGrow: 1 },
  dourado: { color: OURO },
  perigo: { color: '#e0594a' },

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
  itemLateralTexto: { color: '#e5e5e5', fontSize: 14, fontWeight: '500' },

  /* .conteudo */
  conteudo: { flex: 1, width: '100%', minWidth: 0 },
  titulo: { color: '#f5f5f5', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitulo: { color: '#a3a3a3', fontSize: 16, marginBottom: 24 },

  /* .Config (linhas de seções lado a lado) */
  config: { gap: 24 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24 },

  /* seção (cartão) */
  secao: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 320,
    minWidth: 280,
    padding: 22,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.35)',
    borderRadius: 16,
  },
  secaoTitulo: { color: '#f5f5f5', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },

  /* item de seção */
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  itemBorda: { borderTopWidth: 1, borderTopColor: '#222' },
  itemTextos: { flex: 1 },
  itemTitulo: { color: '#f5f5f5', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  itemTexto: { color: '#a3a3a3', fontSize: 13, lineHeight: 18 },
  seta: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .seletor */
  seletor: {
    minWidth: 130,
    maxWidth: 170,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
  },
  seletorFoco: { borderColor: OURO_BORDA },
  seletorTexto: { flex: 1, color: '#e5e5e5', fontSize: 13 },
  seletorSeta: { color: '#737373', fontSize: 12, marginLeft: 8 },

  /* Modal do select */
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCaixa: {
    maxHeight: '70%',
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: OURO_BORDA,
    borderRadius: 12,
    paddingVertical: 8,
  },
  modalTitulo: { color: '#f5f5f5', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 10 },
  opcao: { paddingVertical: 12, paddingHorizontal: 16 },
  opcaoAtiva: { backgroundColor: 'rgba(212,175,106,0.08)' },
  opcaoTexto: { color: '#e5e5e5', fontSize: 14 },

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