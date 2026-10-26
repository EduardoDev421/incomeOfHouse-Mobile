import React, { useState } from 'react';
import {
  View,
  Text,
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

/* =========================================================
   ROTAS
   O expo-router só abre rotas cujo ARQUIVO existe dentro da pasta "app".
   Rotas ainda não criadas ficam como null (o toque não faz nada).
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

function MenuLink({ texto, onPress, ativo }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuLink, ativo && styles.menuLinkAtivo]}>
      <Text style={[styles.menuTexto, ativo && styles.dourado]}>{texto}</Text>
    </Pressable>
  );
}

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
      <Pressable style={[styles.campo, aberto && styles.campoFoco]} onPress={() => setAberto(true)}>
        <Text style={styles.campoTexto} numberOfLines={1}>
          {valor}
        </Text>
        <Text style={styles.campoSeta}>▾</Text>
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
    <Pressable style={styles.comprovante} onPress={onPress}>
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
  const { width, height } = useWindowDimensions();
  const menuCentralizado = width >= 900; // menu no centro do header
  const lateral = width >= 900;          // menu lateral ao lado do conteúdo
  const tabela = width >= 1200;          // tabela completa (senão, cartões)

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
                  <Text style={[styles.itemTexto, item.ativo && styles.dourado]} numberOfLines={2}>
                    {item.texto}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ---------- .conteudo ---------- */}
            <View style={styles.conteudo}>
              <Text style={styles.titulo}>Histórico de Pagamentos</Text>
              <Text style={styles.subtitulo}>
                Acompanhe todos os seus pagamentos, faturas e transações realizadas na plataforma.
              </Text>

              {/* ---------- .filtros ---------- */}
              <View style={styles.filtros}>
                <Filtro rotulo="Período">
                  <TextInput
                    style={[
                      styles.campo,
                      styles.campoInput,
                      foco === 'periodo' && styles.campoFoco,
                      Platform.OS === 'web' && styles.semOutline,
                    ]}
                    value={periodo}
                    onChangeText={(v) => {
                      setPeriodo(mascaraPeriodo(v));
                      setPagina(1);
                    }}
                    placeholder="DD/MM/AAAA - DD/MM/AAAA"
                    placeholderTextColor="#737373"
                    keyboardType="numeric"
                    onFocus={() => setFoco('periodo')}
                    onBlur={() => setFoco(null)}
                  />
                </Filtro>

                <Filtro rotulo="Tipo de pagamento">
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

                <Filtro rotulo="Status">
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

                <Filtro rotulo="Pesquisar" estilo={styles.filtroBusca}>
                  <TextInput
                    style={[
                      styles.campo,
                      styles.campoInput,
                      foco === 'busca' && styles.campoFoco,
                      Platform.OS === 'web' && styles.semOutline,
                    ]}
                    value={busca}
                    onChangeText={(v) => {
                      setBusca(v);
                      setPagina(1);
                    }}
                    placeholder="Buscar por descrição, ID ou método..."
                    placeholderTextColor="#737373"
                    onFocus={() => setFoco('busca')}
                    onBlur={() => setFoco(null)}
                  />
                </Filtro>

                <Pressable style={styles.exportar} onPress={exportar}>
                  <Text style={styles.exportarTexto}>Exportar</Text>
                </Pressable>
              </View>

              {/* ---------- .transacoes ---------- */}
              <View style={styles.transacoes}>
                <Text style={styles.transacoesTitulo}>Transações</Text>

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
   (o HistóricoPagamentos.css não foi enviado: os valores abaixo
   seguem o padrão visual das outras telas; ajuste conforme o seu CSS)
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

  /* .filtros */
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 16,
    padding: 18,
    marginBottom: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  filtro: { flexGrow: 1, flexShrink: 1, flexBasis: 170, minWidth: 150 },
  filtroBusca: { flexGrow: 2, flexBasis: 260, minWidth: 220 },
  filtroRotulo: { color: '#a3a3a3', fontSize: 12, marginBottom: 5 },

  /* .campo */
  campo: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
  },
  campoInput: { color: '#e5e5e5', fontSize: 13 },
  campoFoco: { borderColor: OURO_BORDA },
  campoTexto: { flex: 1, color: '#e5e5e5', fontSize: 13 },
  campoSeta: { color: '#737373', fontSize: 12, marginLeft: 8 },

  /* .exportar */
  exportar: {
    height: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OURO,
    borderRadius: 8,
  },
  exportarTexto: { color: '#111111', fontSize: 14, fontWeight: '700' },

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

  /* .transacoes */
  transacoes: {
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: OURO_BORDA,
    borderRadius: 20,
  },
  transacoesTitulo: { color: '#f5f5f5', fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  vazio: { color: '#a3a3a3', fontSize: 14, paddingVertical: 20 },

  /* .tabela (telas largas) */
  linhaTabela: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  cabecalho: { borderTopWidth: 0, borderBottomWidth: 1, borderBottomColor: '#363636', paddingVertical: 10 },
  cabecalhoTexto: { color: '#a3a3a3', fontSize: 12, fontWeight: '600' },
  celula: { color: '#e5e5e5', fontSize: 13 },
  celulaPequena: { color: '#737373', fontSize: 11, marginTop: 2 },
  colData: { flex: 1.1 },
  colDescricao: { flex: 2.2 },
  colTipo: { flex: 0.8 },
  colMetodo: { flex: 1.3 },
  colValor: { flex: 1.1, fontWeight: '600' },
  colStatus: { flex: 0.9, alignItems: 'flex-start' },
  colComprovante: { flex: 1.5, alignItems: 'flex-start' },
  colSeta: { flex: 0.3, textAlign: 'right' },
  seta: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .status */
  status: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1 },
  statusPago: { backgroundColor: 'rgba(76,175,80,0.12)', borderColor: 'rgba(76,175,80,0.4)' },
  statusPendente: { backgroundColor: 'rgba(224,162,58,0.12)', borderColor: 'rgba(224,162,58,0.4)' },
  statusTexto: { fontSize: 12, fontWeight: '700' },
  statusPagoTexto: { color: '#4caf50' },
  statusPendenteTexto: { color: '#e0a23a' },

  /* .comprovante */
  comprovante: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
  },
  comprovanteTexto: { color: OURO, fontSize: 12, fontWeight: '600' },

  /* cartões (telas estreitas) */
  cartoes: { gap: 12 },
  cartao: {
    padding: 14,
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  cartaoTopo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cartaoTitulo: { flex: 1 },
  cartaoInfo: { color: '#a3a3a3', fontSize: 12, marginTop: 10 },
  cartaoRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cartaoValor: { color: OURO, fontSize: 16, fontWeight: 'bold' },

  /* .tabela-footer */
  tabelaFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  tabelaFooterTexto: { color: '#a3a3a3', fontSize: 13 },
  paginas: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paginaBotao: {
    minWidth: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#363636',
    backgroundColor: '#0d0d0d',
  },
  paginaAtual: { borderColor: OURO, backgroundColor: OURO },
  paginaTexto: { color: '#e5e5e5', fontSize: 14 },
  paginaAtualTexto: { color: '#111111', fontWeight: '700' },
  paginaDesativado: { color: '#4a4a4a' },

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