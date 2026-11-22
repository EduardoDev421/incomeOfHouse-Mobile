import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
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
  plantas: '/planta',
  profissionais: '/profissionais',
  sobre: '/sobreNos',
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
  { icone: 'bookmark-outline', texto: 'Projetos Salvos', rota: '/MeusProjetos' },
  { icone: 'calendar-outline', texto: 'Agendamentos', rota: '/AgendamentosP' },
  { icone: 'chatbox-outline', texto: 'Mensagem', rota: '/MensagensP' },
  { icone: 'settings-outline', texto: 'Configurações', rota: '/ConfigProfissionais', ativo: true },
  { icone: 'log-out-outline', texto: 'Sair', rota: '/login' },
];

/* =========================================================
   DADOS
   (o "id" não aparece na tela, só entra na busca; troque pelos
   dados reais do seu backend)
========================================================= */

const TRANSACOES = [
  { id: 'PG-1006', data: '15/04/2025', hora: '14:32', descricao: 'Projeto Residencial', detalhe: 'Plantas e projetos arquitetônicos', tipo: 'Projeto', metodo: 'Pix', valor: 'R$ 2.450,00', status: 'Pago' },
  { id: 'PG-1005', data: '10/04/2025', hora: '16:21', descricao: 'Planta Baixa - Sobrado', detalhe: 'Projeto arquitetônico', tipo: 'Planta', metodo: 'Cartão de Crédito', valor: 'R$ 1.280,00', status: 'Pago' },
  { id: 'PG-1004', data: '05/04/2025', hora: '11:45', descricao: 'Projeto Comercial', detalhe: 'Projeto arquitetônico e 3D', tipo: 'Projeto', metodo: 'Boleto Bancário', valor: 'R$ 3.750,00', status: 'Pago' },
  { id: 'PG-1003', data: '28/03/2025', hora: '09:12', descricao: 'Planta Baixa - Residencial', detalhe: 'Projeto arquitetônico', tipo: 'Planta', metodo: 'Pix', valor: 'R$ 980,00', status: 'Pago' },
  { id: 'PG-1002', data: '20/03/2025', hora: '15:33', descricao: 'Projeto Executivo', detalhe: 'Detalhamento técnico', tipo: 'Projeto', metodo: 'Cartão de Crédito', valor: 'R$ 4.200,00', status: 'Pago' },
  { id: 'PG-1001', data: '12/03/2025', hora: '10:27', descricao: 'Consultoria Técnica', detalhe: 'Acompanhamento de obra', tipo: 'Serviço', metodo: 'Pix', valor: 'R$ 850,00', status: 'Pendente' },
];

const TIPOS = ['Todos', 'Projeto', 'Planta', 'Serviço'];
const STATUS = ['Todos', 'Pago', 'Pendente'];
const POR_PAGINA = 6;

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

// minúsculas e sem acentos, para a busca
const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// "DD/MM/AAAA" -> Date (ou null se for inválida)
const paraData = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
};

// máscara "DD/MM/AAAA - DD/MM/AAAA"
const mascaraPeriodo = (t) => {
  const n = t.replace(/\D/g, '').slice(0, 16);
  const parte = (s) => {
    if (s.length <= 2) return s;
    if (s.length <= 4) return `${s.slice(0, 2)}/${s.slice(2)}`;
    return `${s.slice(0, 2)}/${s.slice(2, 4)}/${s.slice(4)}`;
  };
  const a = parte(n.slice(0, 8));
  return n.length > 8 ? `${a} - ${parte(n.slice(8))}` : a;
};

/* =========================================================
   COMPONENTES (fora da tela para não serem recriados a cada tecla)
========================================================= */

// <label><small>...</small><div class="campo">...</div></label>
function Filtro({ rotulo, estilo, children }) {
  return (
    <View style={[styles.filtro, estilo]}>
      <Text style={styles.filtroRotulo}>{rotulo}</Text>
      {children}
    </View>
  );
}

// Substitui o <select>: abre uma lista em modal
function Selecao({ rotulo, opcoes, valor, onChange }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.campo, aberto && styles.campoFoco]}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${valor}`}
      >
        <Text style={styles.campoTexto} numberOfLines={1}>
          {valor}
        </Text>
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.modalFundo} onPress={() => setAberto(false)}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>{rotulo}</Text>
            <ScrollView>
              {opcoes.map((op) => (
                <Pressable
                  key={op}
                  style={[styles.opcao, op === valor && styles.opcaoAtiva]}
                  onPress={() => {
                    onChange(op);
                    setAberto(false);
                  }}
                >
                  <Text style={[styles.opcaoTexto, op === valor && styles.dourado]}>{op}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function Status({ status }) {
  const pago = status === 'Pago';
  return (
    <View style={[styles.status, pago ? styles.statusPago : styles.statusPendente]}>
      <Text style={[styles.statusTexto, pago ? styles.statusPagoTexto : styles.statusPendenteTexto]}>
        {status}
      </Text>
    </View>
  );
}

function BotaoComprovante({ onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.comprovante, pressed && styles.pressionado]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.comprovanteTexto}>Ver comprovante</Text>
    </Pressable>
  );
}

// Linha da tabela (telas largas)
function LinhaTabela({ t, onComprovante }) {
  return (
    <View style={styles.linhaTabela}>
      <View style={styles.colData}>
        <Text style={styles.celula}>{t.data}</Text>
        <Text style={styles.celulaPequena}>{t.hora}</Text>
      </View>
      <View style={styles.colDescricao}>
        <Text style={styles.celula}>{t.descricao}</Text>
        <Text style={styles.celulaPequena}>{t.detalhe}</Text>
      </View>
      <Text style={[styles.celula, styles.colTipo]}>{t.tipo}</Text>
      <Text style={[styles.celula, styles.colMetodo]}>{t.metodo}</Text>
      <Text style={[styles.celula, styles.colValor]}>{t.valor}</Text>
      <View style={styles.colStatus}>
        <Status status={t.status} />
      </View>
      <View style={styles.colComprovante}>
        <BotaoComprovante onPress={onComprovante} />
      </View>
      <Text style={[styles.seta, styles.colSeta]}>{'>'}</Text>
    </View>
  );
}

// Cartão da transação (telas estreitas)
function CartaoTransacao({ t, onComprovante }) {
  return (
    <View style={styles.cartao}>
      <View style={styles.cartaoTopo}>
        <View style={styles.cartaoTitulo}>
          <Text style={styles.celula}>{t.descricao}</Text>
          <Text style={styles.celulaPequena}>{t.detalhe}</Text>
        </View>
        <Status status={t.status} />
      </View>
      <Text style={styles.cartaoInfo}>
        {t.data} às {t.hora} · {t.tipo} · {t.metodo}
      </Text>
      <View style={styles.cartaoRodape}>
        <Text style={styles.cartaoValor}>{t.valor}</Text>
        <BotaoComprovante onPress={onComprovante} />
      </View>
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function HistoricoPagamentos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { abrirLegal } = useLegal();
  const { width } = useWindowDimensions();

  // Mesmos pontos de corte do CSS da versão web
  const lateral = width > 850;          // menu lateral fixo + menu do topo
  const lateralEstreita = width <= 1100;
  const tabela = width >= 1200;         // tabela completa (senão, cartões)
  const compacto = width <= 550;
  const colunasMenu = width <= 600 ? 2 : 3;

  // Só navega se a rota estiver definida (evita "This screen doesn't exist")
  const ir = (rota) => {
    if (rota) router.push(rota);
  };

  const [periodo, setPeriodo] = useState('01/04/2024 - 30/04/2025');
  const [tipo, setTipo] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [foco, setFoco] = useState(null); // 'periodo' | 'busca' | null

  // ---------- filtros ----------
  const [inicio, fim] = periodo.split(' - ').map((p) => (p ? paraData(p) : null));
  const termo = normalizar(busca.trim());

  const filtradas = TRANSACOES.filter((t) => {
    if (tipo !== 'Todos' && t.tipo !== tipo) return false;
    if (status !== 'Todos' && t.status !== status) return false;
    if (termo && !normalizar(`${t.descricao} ${t.detalhe} ${t.id} ${t.metodo}`).includes(termo)) {
      return false;
    }
    if (inicio && fim) {
      const d = paraData(t.data);
      if (d < inicio || d > fim) return false;
    }
    return true;
  });

  // ---------- paginação ----------
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const exportar = () => {
    // TODO: exportar `filtradas` (CSV/PDF) aqui
  };
  const verComprovante = (t) => {
    // TODO: abrir o comprovante da transação `t` aqui
  };

  // No layout largo cada filtro divide a linha (flex); no estreito eles quebram de linha
  const larguraFiltro = (flex) =>
    tabela
      ? { flex, minWidth: 0 }
      : compacto
      ? { flexBasis: '100%' }
      : { flexGrow: 1, flexBasis: 150, minWidth: 140 };

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
          <View style={[styles.menuTopo, { top: insets.top }]}>
            {LINKS_TOPO.map((l) => (
              <Pressable key={l.texto} onPress={() => ir(l.rota)} accessibilityRole="link">
                <Text style={styles.linkTopo}>{l.texto}</Text>
              </Pressable>
            ))}
          </View>
        )}
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
                      <Ionicons
                        name={item.icone}
                        size={17}
                        color={item.ativo ? DOURADO : '#eeeeee'}
                      />
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
            <Text style={styles.titulo}>Histórico de Pagamentos</Text>
            <Text style={styles.subtitulo}>
              Acompanhe todos os seus pagamentos, faturas e transações realizadas na plataforma.
            </Text>

            {/* ---------- .filtros ---------- */}
            <View style={[styles.filtros, tabela && styles.filtrosLinha]}>
              <Filtro rotulo="Período" estilo={larguraFiltro(1.2)}>
                <View style={[styles.campo, foco === 'periodo' && styles.campoFoco]}>
                  <Ionicons name="calendar-outline" size={16} color={DOURADO} />
                  <TextInput
                    style={[styles.campoInput, Platform.OS === 'web' && styles.semOutline]}
                    value={periodo}
                    onChangeText={(v) => {
                      setPeriodo(mascaraPeriodo(v));
                      setPagina(1);
                    }}
                    placeholder="DD/MM/AAAA - DD/MM/AAAA"
                    placeholderTextColor="#666666"
                    selectionColor={DOURADO}
                    keyboardType="numeric"
                    onFocus={() => setFoco('periodo')}
                    onBlur={() => setFoco(null)}
                    accessibilityLabel="Período"
                  />
                </View>
              </Filtro>

              <Filtro rotulo="Tipo de pagamento" estilo={larguraFiltro(1)}>
                <Selecao
                  rotulo="Tipo de pagamento"
                  opcoes={TIPOS}
                  valor={tipo}
                  onChange={(v) => {
                    setTipo(v);
                    setPagina(1);
                  }}
                />
              </Filtro>

              <Filtro rotulo="Status" estilo={larguraFiltro(1)}>
                <Selecao
                  rotulo="Status"
                  opcoes={STATUS}
                  valor={status}
                  onChange={(v) => {
                    setStatus(v);
                    setPagina(1);
                  }}
                />
              </Filtro>

              <Filtro
                rotulo="Pesquisar"
                estilo={tabela ? larguraFiltro(1.4) : { flexBasis: '100%' }}
              >
                <View style={[styles.campo, foco === 'busca' && styles.campoFoco]}>
                  <Ionicons name="search-outline" size={15} color={DOURADO} />
                  <TextInput
                    style={[styles.campoInput, Platform.OS === 'web' && styles.semOutline]}
                    value={busca}
                    onChangeText={(v) => {
                      setBusca(v);
                      setPagina(1);
                    }}
                    placeholder="Buscar por descrição, ID ou método..."
                    placeholderTextColor="#666666"
                    selectionColor={DOURADO}
                    onFocus={() => setFoco('busca')}
                    onBlur={() => setFoco(null)}
                    accessibilityLabel="Pesquisar"
                  />
                </View>
              </Filtro>

              <Pressable
                style={({ pressed }) => [
                  styles.exportar,
                  compacto && styles.exportarCheio,
                  pressed && styles.exportarApertado,
                ]}
                onPress={exportar}
                accessibilityRole="button"
              >
                <Text style={styles.exportarTexto}>Exportar</Text>
              </Pressable>
            </View>

            {/* ---------- .transacoes ---------- */}
            <View style={styles.transacoes}>
              <View style={styles.tituloTransacoes}>
                <View style={styles.iconeMoeda}>
                  <Text style={styles.iconeMoedaTexto}>$</Text>
                </View>
                <Text style={styles.transacoesTitulo}>Transações</Text>
              </View>

              {visiveis.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma transação encontrada.</Text>
              ) : tabela ? (
                <View>
                  {/* cabeçalho da tabela */}
                  <View style={[styles.linhaTabela, styles.cabecalho]}>
                    <Text style={[styles.cabecalhoTexto, styles.colData]}>Data</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colDescricao]}>Descrição</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colTipo]}>Tipo</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colMetodo]}>Método</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colValor]}>Valor</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colStatus]}>Status</Text>
                    <Text style={[styles.cabecalhoTexto, styles.colComprovante]}>Comprovante</Text>
                    <View style={styles.colSeta} />
                  </View>
                  {visiveis.map((t) => (
                    <LinhaTabela key={t.id} t={t} onComprovante={() => verComprovante(t)} />
                  ))}
                </View>
              ) : (
                <View style={styles.cartoes}>
                  {visiveis.map((t) => (
                    <CartaoTransacao key={t.id} t={t} onComprovante={() => verComprovante(t)} />
                  ))}
                </View>
              )}

              {/* ---------- .tabela-footer ---------- */}
              <View style={styles.tabelaFooter}>
                <Text style={styles.tabelaFooterTexto}>
                  Mostrando {visiveis.length} de {filtradas.length} resultados
                </Text>
                <View style={styles.paginas}>
                  <Pressable
                    style={styles.paginaBotao}
                    disabled={paginaAtual === 1}
                    onPress={() => setPagina(paginaAtual - 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Página anterior"
                  >
                    <Text style={[styles.paginaTexto, paginaAtual === 1 && styles.paginaDesativado]}>
                      ‹
                    </Text>
                  </Pressable>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <Pressable
                      key={n}
                      style={[styles.paginaBotao, n === paginaAtual && styles.paginaAtual]}
                      onPress={() => setPagina(n)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.paginaTexto, n === paginaAtual && styles.paginaAtualTexto]}>
                        {n}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.paginaBotao}
                    disabled={paginaAtual === totalPaginas}
                    onPress={() => setPagina(paginaAtual + 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Próxima página"
                  >
                    <Text
                      style={[
                        styles.paginaTexto,
                        paginaAtual === totalPaginas && styles.paginaDesativado,
                      ]}
                    >
                      ›
                    </Text>
                  </Pressable>
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
   ESTILOS (valores do HistóricoPagamentos.css da versão web)
========================================================= */

const DOURADO = '#d4a63a';
const DOURADO_CLARO = '#f0ca4c';
const DOURADO_BORDA = '#8a701e';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#080a0b' },
  pressionado: { opacity: 0.8 },
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

  /* .filtros */
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  filtrosLinha: { flexWrap: 'nowrap' },
  filtro: { minWidth: 0 },
  filtroRotulo: { marginBottom: 6, color: '#8f9497', fontSize: 11 },

  /* .campo */
  campo: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 6,
  },
  campoFoco: { borderColor: DOURADO },
  campoInput: { flex: 1, minWidth: 0, height: '100%', color: '#dddddd', fontSize: 13, padding: 0 },
  campoTexto: { flex: 1, color: '#dddddd', fontSize: 13 },

  /* .exportar */
  exportar: {
    height: 38,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DOURADO_BORDA,
    borderRadius: 6,
  },
  exportarCheio: { width: '100%' },
  exportarApertado: { backgroundColor: DOURADO },
  exportarTexto: { color: DOURADO_CLARO, fontSize: 12 },

  /* Modal do select */
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCaixa: {
    maxHeight: '70%',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    paddingVertical: 8,
  },
  modalTitulo: { color: DOURADO, fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 10 },
  opcao: { paddingVertical: 12, paddingHorizontal: 16 },
  opcaoAtiva: { backgroundColor: '#29231a' },
  opcaoTexto: { color: '#e5e5e5', fontSize: 14 },

  /* .transacoes */
  transacoes: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tituloTransacoes: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  iconeMoeda: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DOURADO,
    borderRadius: 10,
  },
  iconeMoedaTexto: { color: DOURADO, fontSize: 11, fontWeight: 'bold' },
  transacoesTitulo: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  vazio: { color: '#8f9497', fontSize: 13, padding: 20 },

  /* .tabela (telas largas) */
  linhaTabela: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  cabecalho: { minHeight: 40 },
  cabecalhoTexto: {
    color: '#a8abad',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  celula: { color: '#cccccc', fontSize: 12 },
  celulaPequena: { color: '#656a6f', fontSize: 11, marginTop: 4 },
  colData: { flex: 0.8, minWidth: 0 },
  colDescricao: { flex: 1.5, minWidth: 0 },
  colTipo: { flex: 1, minWidth: 0 },
  colMetodo: { flex: 1.3, minWidth: 0 },
  colValor: { flex: 0.9, minWidth: 0 },
  colStatus: { flex: 0.8, minWidth: 0, alignItems: 'flex-start' },
  colComprovante: { flex: 1.1, minWidth: 0, alignItems: 'flex-start' },
  colSeta: { width: 24, textAlign: 'right' },
  seta: { color: '#92979a', fontSize: 18 },

  /* .status */
  status: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  statusPago: { backgroundColor: '#07583b' },
  statusPendente: { backgroundColor: '#60470b' },
  statusTexto: { fontSize: 11 },
  statusPagoTexto: { color: '#8bd7b3' },
  statusPendenteTexto: { color: '#e2b936' },

  /* .comprovante */
  comprovante: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DOURADO_BORDA,
    borderRadius: 5,
  },
  comprovanteTexto: { color: DOURADO_CLARO, fontSize: 11 },

  /* cartões (telas estreitas) */
  cartoes: { gap: 10, padding: 12 },
  cartao: {
    padding: 14,
    backgroundColor: '#1a1a1c',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  cartaoTopo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cartaoTitulo: { flex: 1, minWidth: 0 },
  cartaoInfo: { color: '#8f9497', fontSize: 12, marginTop: 10 },
  cartaoRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cartaoValor: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },

  /* .tabela-footer */
  tabelaFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabelaFooterTexto: { color: '#8f9497', fontSize: 12 },
  paginas: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paginaBotao: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 5,
  },
  paginaAtual: { borderColor: DOURADO },
  paginaTexto: { color: '#888888', fontSize: 14 },
  paginaAtualTexto: { color: DOURADO },
  paginaDesativado: { color: '#4a4a4a' },

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