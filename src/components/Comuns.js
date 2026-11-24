import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLegal } from './LegalProvider';
import { useConta } from './ContaProvider';

// Este arquivo está em src/components/.
// '../../assets' = pasta assets na RAIZ do projeto (igual às telas em src/app).
// Se a sua pasta assets estiver dentro de src, troque por '../assets'.
const LOGO = require('../../assets/images/Logo.png');

export const DOURADO = '#c9a45c';
export const LARGO = 900;

const MENU = [
  { rotulo: 'Início', rota: '/' },
  { rotulo: 'Plantas', rota: '/planta' },
  { rotulo: 'Profissionais', rota: '/profissionais' },
  { rotulo: 'Sobre Nós', rota: '/sobreNos' },
];

/* ------------------------------------------------------------------ */
/* CABEÇALHO (logo + perfil + menu hambúrguer no celular)              */
/* ------------------------------------------------------------------ */
function ItemMenu({ rotulo, ativo, largo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
      style={({ pressed }) => [
        largo ? estilos.item : estilos.itemMobile,
        ativo && estilos.itemAtivo,
        pressed && estilos.pressionado,
      ]}
    >
      <Text style={[estilos.textoItem, ativo && estilos.textoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

export function Cabecalho({ translucido = false }) {
  const router = useRouter();
  const rotaAtual = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, tipo, carregado } = useConta();
  const largo = width >= LARGO;
  const [aberto, setAberto] = useState(false);

  const ir = (rota) => {
    setAberto(false);
    router.push(rota);
  };

  const abrirConta = () => {
    if (!carregado) return;
    if (!user) {
      router.push('/login');
      return;
    }

    router.push(tipo === 'profissional' ? '/PerfilProfissional' : '/PerfilUsuario');
  };

  const itens = MENU.map((m) => (
    <ItemMenu
      key={m.rota}
      rotulo={m.rotulo}
      ativo={rotaAtual === m.rota}
      largo={largo}
      onPress={() => ir(m.rota)}
    />
  ));

  return (
    <View
      style={[
        estilos.topo,
        translucido && estilos.topoTranslucido,
        { paddingTop: insets.top },
      ]}
    >
      <View style={[estilos.barra, largo && estilos.barraLarga]}>
        <Pressable
          onPress={() => ir('/')}
          accessibilityRole="button"
          accessibilityLabel="Ir para o início"
        >
          <Image source={LOGO} style={estilos.logo} resizeMode="contain" />
        </Pressable>

        {largo && <View style={estilos.menuLargo}>{itens}</View>}

        <View style={estilos.acoesTopo}>
          <Pressable
            onPress={abrirConta}
            accessibilityRole="button"
            accessibilityLabel={user ? 'Abrir meu perfil' : 'Entrar na conta'}
            hitSlop={8}
            style={({ pressed }) => pressed && estilos.pressionado}
          >
            <Ionicons name="person-circle-outline" size={largo ? 42 : 36} color={DOURADO} />
          </Pressable>

          {!largo && (
            <Pressable
              onPress={() => setAberto((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={aberto ? 'Fechar menu' : 'Abrir menu'}
              hitSlop={8}
              style={estilos.botaoMenu}
            >
              <Ionicons name={aberto ? 'close' : 'menu'} size={28} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      {!largo && aberto && <View style={estilos.menuMobile}>{itens}</View>}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SELETOR (substitui o <select>; abre como folha na parte de baixo)   */
/* ------------------------------------------------------------------ */
export function Seletor({ rotulo, icone, valor, opcoes, aoMudar }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((o) => !o.grupo && o.valor === valor);

  return (
    <View style={[estilos.campo, width >= LARGO && estilos.campoLargo]}>
      <View style={estilos.rotuloLinha}>
        <Ionicons name={icone} size={16} color={DOURADO} />
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </View>

      <Pressable
        style={estilos.seletor}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${atual ? atual.label : ''}`}
      >
        <Text style={estilos.seletorTexto} numberOfLines={1}>
          {atual ? atual.label : ''}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#b5b5b5" />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={estilos.modalFundo} onPress={() => setAberto(false)}>
          <Pressable
            style={[estilos.folha, { paddingBottom: 16 + insets.bottom }]}
            onPress={() => {}}
          >
            <View style={estilos.folhaTopo}>
              <Text style={estilos.folhaTitulo}>{rotulo}</Text>
              <Pressable
                onPress={() => setAberto(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={24} color="#b5b5b5" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {opcoes.map((o, i) =>
                o.grupo ? (
                  <Text key={`g${i}`} style={estilos.grupo}>
                    {o.grupo}
                  </Text>
                ) : (
                  <Pressable
                    key={`o${i}`}
                    style={[estilos.opcao, o.valor === valor && estilos.opcaoAtiva]}
                    onPress={() => {
                      aoMudar(o.valor);
                      setAberto(false);
                    }}
                  >
                    <Text
                      style={[estilos.opcaoTexto, o.valor === valor && estilos.opcaoTextoAtivo]}
                    >
                      {o.label}
                    </Text>
                    {o.valor === valor && <Ionicons name="checkmark" size={18} color={DOURADO} />}
                  </Pressable>
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PAINEL DE FILTROS (recolhível no celular, aberto no desktop)        */
/* ------------------------------------------------------------------ */
export function PainelFiltros({ ativos, aoPesquisar, aoLimpar, children }) {
  const { width } = useWindowDimensions();
  const largo = width >= LARGO;
  const [aberto, setAberto] = useState(false);

  return (
    <View style={estilos.painel}>
      {!largo && (
        <Pressable
          style={estilos.painelCab}
          onPress={() => setAberto((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: aberto }}
        >
          <Ionicons name="options-outline" size={20} color={DOURADO} />
          <Text style={estilos.painelTitulo}>Filtros</Text>
          {ativos > 0 && (
            <View style={estilos.selo}>
              <Text style={estilos.seloTexto}>{ativos}</Text>
            </View>
          )}
          <Ionicons
            name={aberto ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#b5b5b5"
            style={estilos.setaPainel}
          />
        </Pressable>
      )}

      {(largo || aberto) && (
        <View style={largo ? estilos.painelCorpoLargo : estilos.painelCorpo}>
          <View style={[estilos.grade, largo && estilos.gradeLarga]}>{children}</View>

          <View style={estilos.acoesFiltro}>
            {ativos > 0 && (
              <Pressable style={estilos.btnLimpar} onPress={aoLimpar} accessibilityRole="button">
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={estilos.btnLimparTexto}>Limpar</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [estilos.btnPesquisar, pressed && estilos.pressionado]}
              onPress={() => {
                setAberto(false);
                aoPesquisar();
              }}
              accessibilityRole="button"
            >
              <Ionicons name="search" size={18} color="#1a1a1a" />
              <Text style={estilos.btnPesquisarTexto}>Pesquisar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ESTADO VAZIO                                                        */
/* ------------------------------------------------------------------ */
export function Vazio({ texto, aoLimpar }) {
  return (
    <View style={estilos.vazio}>
      <Ionicons name="search-outline" size={34} color="#555" />
      <Text style={estilos.vazioTexto}>{texto}</Text>
      <Pressable style={estilos.btnLimpar} onPress={aoLimpar} accessibilityRole="button">
        <Text style={estilos.btnLimparTexto}>Limpar filtros</Text>
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PAGINAÇÃO (mostra só as páginas próximas, com reticências)          */
/* ------------------------------------------------------------------ */
function janela(atual, total) {
  const nums = [...new Set([1, total, atual - 1, atual, atual + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const saida = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) saida.push(`...${n}`);
    saida.push(n);
  });
  return saida;
}

export function Paginacao({ pagina, total, aoMudar }) {
  if (total <= 1) return null;

  return (
    <View style={estilos.paginacao}>
      <Pressable
        style={[estilos.pagBotao, pagina === 1 && estilos.pagDesativado]}
        disabled={pagina === 1}
        onPress={() => aoMudar(pagina - 1)}
        accessibilityRole="button"
        accessibilityLabel="Página anterior"
      >
        <Ionicons name="chevron-back" size={18} color="#fff" />
      </Pressable>

      {janela(pagina, total).map((n) =>
        typeof n === 'string' ? (
          <Text key={n} style={estilos.reticencias}>
            …
          </Text>
        ) : (
          <Pressable
            key={n}
            style={[estilos.pagBotao, n === pagina && estilos.pagAtivo]}
            onPress={() => aoMudar(n)}
            accessibilityRole="button"
            accessibilityLabel={`Página ${n}`}
          >
            <Text style={[estilos.pagTexto, n === pagina && estilos.pagTextoAtivo]}>{n}</Text>
          </Pressable>
        )
      )}

      <Pressable
        style={[estilos.pagBotao, pagina === total && estilos.pagDesativado]}
        disabled={pagina === total}
        onPress={() => aoMudar(pagina + 1)}
        accessibilityRole="button"
        accessibilityLabel="Próxima página"
      >
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* RODAPÉ (Termos e Privacidade abrem o pop-up global)                 */
/* ------------------------------------------------------------------ */
export function Rodape() {
  const { abrirLegal } = useLegal();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const largo = width >= LARGO;

  return (
    <View
      style={[
        estilos.rodape,
        largo && estilos.rodapeLargo,
        { paddingBottom: 20 + insets.bottom },
      ]}
    >
      <Text style={estilos.textoRodape}>
        © 2026 IncomeOfHouse. Todos os direitos reservados.
      </Text>
      <View style={estilos.linksRodape}>
        <Pressable
          onPress={() => abrirLegal('termos')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={estilos.linkRodape}>Termos de Uso</Text>
        </Pressable>
        <Text style={estilos.separador}>|</Text>
        <Pressable
          onPress={() => abrirLegal('privacidade')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={estilos.linkRodape}>Política de Privacidade</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  // Cabeçalho
  topo: {
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    zIndex: 10,
  },
  topoTranslucido: { backgroundColor: 'rgba(10, 10, 10, 0.8)' },
  barra: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  barraLarga: { height: 78, paddingHorizontal: 140 },
  logo: { width: 90, height: 48 },
  acoesTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  botaoMenu: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  menuLargo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuMobile: { paddingHorizontal: 20, paddingBottom: 16, gap: 6 },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemMobile: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemAtivo: { borderColor: '#6b5a36', backgroundColor: '#1c1a14' },
  textoItem: { color: '#ffffff', fontSize: 15 },
  textoAtivo: { color: DOURADO },

  // Seletor
  campo: {},
  campoLargo: { flexBasis: 200, flexGrow: 1 },
  rotuloLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  rotulo: { color: '#d0d0d0', fontSize: 13, fontWeight: 'bold' },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  seletorTexto: { color: '#fff', fontSize: 14, flex: 1, marginRight: 8 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  folha: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    alignSelf: 'center',
    backgroundColor: '#141414',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  folhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  folhaTitulo: { color: DOURADO, fontSize: 17, fontWeight: 'bold' },
  grupo: { color: '#8a8a8a', fontSize: 13, fontWeight: 'bold', marginTop: 14, marginBottom: 4 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  opcaoAtiva: { backgroundColor: '#1c1a14' },
  opcaoTexto: { color: '#fff', fontSize: 15 },
  opcaoTextoAtivo: { color: DOURADO, fontWeight: 'bold' },

  // Painel de filtros
  painel: {
    backgroundColor: 'rgba(18, 18, 18, 0.96)',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    overflow: 'hidden',
  },
  painelCab: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  painelTitulo: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  setaPainel: { marginLeft: 'auto' },
  selo: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DOURADO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  seloTexto: { color: '#1a1a1a', fontSize: 12, fontWeight: 'bold' },
  painelCorpo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  painelCorpoLargo: { padding: 24 },
  grade: { gap: 14 },
  gradeLarga: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  acoesFiltro: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btnPesquisar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DOURADO,
    borderRadius: 8,
    height: 46,
  },
  btnPesquisarTexto: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 14 },
  btnLimpar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 16,
  },
  btnLimparTexto: { color: '#fff', fontSize: 14 },

  // Estado vazio
  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  vazioTexto: { color: '#c8c8c8', fontSize: 14, textAlign: 'center' },

  // Paginação
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
  },
  pagBotao: {
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pagAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  pagDesativado: { opacity: 0.35 },
  pagTexto: { color: '#fff', fontWeight: 'bold' },
  pagTextoAtivo: { color: '#1a1a1a' },
  reticencias: { color: '#8a8a8a', fontSize: 16 },

  // Rodapé
  rodape: {
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: DOURADO,
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  rodapeLargo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 140,
  },
  textoRodape: { color: '#888888', fontSize: 13, textAlign: 'center' },
  linksRodape: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkRodape: { color: DOURADO, fontSize: 13 },
  separador: { color: '#555555' },
});