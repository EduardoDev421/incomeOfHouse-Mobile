import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LayoutConta } from '../components/TelaConta';
import { useDeclararConta } from '../components/ContaProvider';

const DOURADO = '#d4a63a';

const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const STATUS = {
  andamento: { texto: 'Em andamento', cor: '#f0ca61' },
  concluido: { texto: 'Concluído', cor: '#54db83' },
  cancelado: { texto: 'Cancelado', cor: '#c3c6d4' },
};

const CHIPS = [
  { chave: 'todos', texto: 'Todos' },
  { chave: 'andamento', texto: 'Em andamento' },
  { chave: 'concluido', texto: 'Concluídos' },
  { chave: 'cancelado', texto: 'Cancelados' },
];

const ORDENS = [
  { chave: 'recentes', texto: 'Mais recentes' },
  { chave: 'antigos', texto: 'Mais antigos' },
  { chave: 'valor', texto: 'Maior valor' },
];

const PEDIDOS = [
  { id: '1', titulo: 'Projeto Arquitetônico Residencial', profissional: 'Carlos Silva', funcao: 'Arquiteto', valor: 2800, data: '2025-06-12', status: 'andamento' },
  { id: '2', titulo: 'Reforma e Ampliação', profissional: 'Juliana Martins', funcao: 'Engenheira Civil', valor: 15600, data: '2025-05-28', status: 'concluido' },
  { id: '3', titulo: 'Consultoria de Viabilidade', profissional: 'Rafael Costa', funcao: '', valor: 950, data: '2025-05-15', status: 'cancelado' },
  { id: '4', titulo: 'Planta Baixa - Sobrado', profissional: 'Fernanda Lima', funcao: 'Arquiteta', valor: 1750, data: '2025-05-03', status: 'concluido' },
  { id: '5', titulo: 'Projeto de Interiores', profissional: 'Lucas Pereira', funcao: '', valor: 3400, data: '2025-04-20', status: 'andamento' },
];

const formatarValor = (n) => {
  const [inteiro, decimal] = n.toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
};

const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const ordenar = (lista, ordem) => {
  const copia = [...lista];
  if (ordem === 'antigos') return copia.sort((a, b) => a.data.localeCompare(b.data));
  if (ordem === 'valor') return copia.sort((a, b) => b.valor - a.valor);
  return copia.sort((a, b) => b.data.localeCompare(a.data));
};

function CardResumo({ rotulo, valor, mobile }) {
  return (
    <View
      style={[s.cardResumo, mobile && s.cardResumoMobile]}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <Text style={s.rotuloResumo}>{rotulo}</Text>
      <Text
        style={[s.valorResumo, mobile && s.valorResumoMobile]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {valor}
      </Text>
    </View>
  );
}

function CardPedido({ pedido, mobile, onDetalhes }) {
  const status = STATUS[pedido.status];

  return (
    <Pressable
      onPress={onDetalhes}
      style={({ pressed }) => [s.pedido, mobile && s.pedidoMobile, pressed && s.pressionado]}
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${pedido.titulo}, ${status.texto}. Ver detalhes`}
    >
      <View style={s.topoCard}>
        <View style={s.icone}>
          <Ionicons name="bag-handle-outline" size={22} color={DOURADO} />
        </View>

        <View style={s.dados}>
          <Text style={s.titulo} numberOfLines={2}>
            {pedido.titulo}
          </Text>
          <Text style={s.profissional} numberOfLines={1}>
            {pedido.profissional}
            {pedido.funcao ? ` · ${pedido.funcao}` : ''}
          </Text>
        </View>
      </View>

      <View style={[s.status, { borderColor: status.cor }]}>
        <View style={[s.pontoStatus, { backgroundColor: status.cor }]} />
        <Text style={[s.textoStatus, { color: status.cor }]}>{status.texto}</Text>
      </View>

      <View style={s.meta}>
        <View style={s.metaItem}>
          <Text style={s.metaRotulo}>Pedido em</Text>
          <Text style={s.metaValor}>{formatarData(pedido.data)}</Text>
        </View>
        <View style={s.metaItem}>
          <Text style={s.metaRotulo}>Valor</Text>
          <Text style={s.metaValor}>{formatarValor(pedido.valor)}</Text>
        </View>
      </View>

      <View style={s.botaoDetalhes}>
        <Text style={s.textoDetalhes}>Ver detalhes</Text>
        <Ionicons name="chevron-forward" size={14} color={DOURADO} />
      </View>
    </Pressable>
  );
}

export default function MeusPedidos() {
  const router = useRouter();
  useDeclararConta('usuario');

  const [status, setStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [indiceOrdem, setIndiceOrdem] = useState(0);
  const ordem = ORDENS[indiceOrdem];

  const resumo = useMemo(() => {
    const concluidos = PEDIDOS.filter((p) => p.status === 'concluido');
    return {
      total: PEDIDOS.length,
      andamento: PEDIDOS.filter((p) => p.status === 'andamento').length,
      concluidos: concluidos.length,
      cancelados: PEDIDOS.filter((p) => p.status === 'cancelado').length,
      valor: concluidos.reduce((soma, p) => soma + p.valor, 0),
    };
  }, []);

  const contagens = {
    todos: resumo.total,
    andamento: resumo.andamento,
    concluido: resumo.concluidos,
    cancelado: resumo.cancelados,
  };

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtrados = PEDIDOS.filter(
      (p) =>
        (status === 'todos' || p.status === status) &&
        (!termo ||
          normalizar(p.titulo).includes(termo) ||
          normalizar(p.profissional).includes(termo))
    );

    return ordenar(filtrados, ordem.chave);
  }, [status, busca, ordem]);

  const filtrosAtivos = status !== 'todos' || !!busca.trim();

  const limparFiltros = () => {
    setStatus('todos');
    setBusca('');
  };

  const abrirDetalhes = (pedido) =>
    router.push({
      pathname: '/Pedidodetalhe',
      params: {
        id: pedido.id,
        titulo: pedido.titulo,
        descricao: `${formatarValor(pedido.valor)} · Pedido em ${formatarData(pedido.data)}`,
        status: STATUS[pedido.status].texto,
        profissional: pedido.funcao
          ? `${pedido.profissional} · ${pedido.funcao}`
          : pedido.profissional,
      },
    });

  return (
    <LayoutConta
      ativo="pedidos"
      titulo="Meus Pedidos"
      subtitulo="Acompanhe o andamento e o histórico de todos os seus pedidos."
    >
      {({ mobile }) =>
        PEDIDOS.length === 0 ? (
          <View style={s.vazio}>
            <View style={s.vazioIcone}>
              <Ionicons name="bag-handle-outline" size={28} color={DOURADO} />
            </View>
            <Text style={s.tituloVazio}>Você ainda não fez nenhum pedido</Text>
            <Text style={s.textoVazio}>
              Encontre um profissional e solicite o seu primeiro projeto.
            </Text>
            <Pressable
              onPress={() => router.push('/profissionais')}
              style={({ pressed }) => [s.btnPrincipal, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoPrincipal}>Encontrar profissionais</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.resumo}>
              <CardResumo rotulo="Total de pedidos" valor={String(resumo.total)} mobile={mobile} />
              <CardResumo rotulo="Em andamento" valor={String(resumo.andamento)} mobile={mobile} />
              <CardResumo rotulo="Concluídos" valor={String(resumo.concluidos)} mobile={mobile} />
              <CardResumo rotulo="Valor dos concluídos" valor={formatarValor(resumo.valor)} mobile={mobile} />
            </View>

            <View style={s.chips}>
              {CHIPS.map((chip) => {
                const ativo = status === chip.chave;
                return (
                  <Pressable
                    key={chip.chave}
                    onPress={() => setStatus(chip.chave)}
                    style={({ pressed }) => [s.chip, ativo && s.chipAtivo, pressed && s.pressionado]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                  >
                    <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>
                      {chip.texto} ({contagens[chip.chave]})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[s.controles, mobile && s.controlesMobile]}>
              <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
                <Ionicons name="search-outline" size={16} color={DOURADO} />
                <TextInput
                  style={s.inputBusca}
                  placeholder="Buscar por pedido ou profissional"
                  placeholderTextColor="#777b83"
                  selectionColor={DOURADO}
                  value={busca}
                  onChangeText={setBusca}
                  returnKeyType="search"
                  autoCorrect={false}
                  accessibilityLabel="Buscar por pedido ou profissional"
                />
                {!!busca && (
                  <Pressable
                    onPress={() => setBusca('')}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Limpar busca"
                  >
                    <Ionicons name="close-circle" size={18} color="#777b83" />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() => setIndiceOrdem((i) => (i + 1) % ORDENS.length)}
                style={({ pressed }) => [s.botaoOrdem, pressed && s.pressionado]}
                accessibilityRole="button"
                accessibilityLabel={`Ordenação: ${ordem.texto}. Tocar para alternar`}
              >
                <Ionicons name="swap-vertical-outline" size={16} color={DOURADO} />
                <Text style={s.textoOrdem}>{ordem.texto}</Text>
              </Pressable>
            </View>

            <Text style={s.contagem} accessibilityLiveRegion="polite">
              {visiveis.length === 1 ? '1 pedido encontrado' : `${visiveis.length} pedidos encontrados`}
            </Text>

            {visiveis.length === 0 ? (
              <View style={s.vazio}>
                <Ionicons name="folder-open-outline" size={32} color={DOURADO} />
                <Text style={s.textoVazio}>Nenhum pedido encontrado.</Text>
                {filtrosAtivos && (
                  <Pressable
                    onPress={limparFiltros}
                    style={({ pressed }) => [s.btnSecundario, pressed && s.pressionado]}
                    accessibilityRole="button"
                  >
                    <Text style={s.textoSecundario}>Limpar filtros</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={[s.grade, mobile && s.gradeMobile]}>
                {visiveis.map((pedido) => (
                  <CardPedido
                    key={pedido.id}
                    pedido={pedido}
                    mobile={mobile}
                    onDetalhes={() => abrirDetalhes(pedido)}
                  />
                ))}
              </View>
            )}
          </>
        )
      }
    </LayoutConta>
  );
}

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardResumo: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 150,
    gap: 8,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardResumoMobile: { flexBasis: '47%', minWidth: 0, padding: 14 },
  rotuloResumo: { color: '#a5a5a5', fontSize: 12 },
  valorResumo: { color: DOURADO, fontSize: 22, fontWeight: 'bold' },
  valorResumoMobile: { fontSize: 18 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  chipAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  controles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlesMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },
  campoBusca: {
    width: 320,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  campoBuscaMobile: { width: '100%' },
  inputBusca: {
    flex: 1,
    height: '100%',
    color: '#eee',
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  botaoOrdem: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  textoOrdem: { color: '#eee', fontSize: 13 },

  contagem: { color: '#a5a5a5', fontSize: 13 },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gradeMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },

  pedido: {
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 280,
    gap: 12,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  pedidoMobile: { ...ALTURA_AUTO, minWidth: 0, borderRadius: 14 },

  topoCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 12,
  },
  dados: { flex: 1, minWidth: 0, gap: 3 },
  titulo: { color: '#fff', fontSize: 16, fontWeight: '600' },
  profissional: { color: '#a5a5a5', fontSize: 13 },

  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
    borderWidth: 1,
    borderRadius: 16,
  },
  pontoStatus: { width: 7, height: 7, borderRadius: 4 },
  textoStatus: { fontSize: 12 },

  meta: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  metaItem: { flex: 1, gap: 3 },
  metaRotulo: { color: '#a5a5a5', fontSize: 12 },
  metaValor: { color: '#fff', fontSize: 14 },

  botaoDetalhes: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoDetalhes: { color: DOURADO, fontSize: 14, fontWeight: '600' },

  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  vazioIcone: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderRadius: 30,
  },
  tituloVazio: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  textoVazio: { color: '#a5a5a5', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  btnPrincipal: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  textoPrincipal: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  btnSecundario: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
  },
  textoSecundario: { color: '#fff', fontSize: 14 },
});