import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LayoutConta } from './TelaConta';

/* ------------------------------------------------------------------ */
/* Constantes (mesmas cores das outras telas da conta)                 */
/* ------------------------------------------------------------------ */

const DOURADO = '#d4a63a';
const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const TIPOS = {
  visita: { rotulo: 'Visita ao imóvel', plural: 'Visitas', cor: '#d4a63a' },
  reuniao: { rotulo: 'Reunião', plural: 'Reuniões', cor: '#6aa7e8' },
  entrega: { rotulo: 'Entrega de projeto', plural: 'Entregas', cor: '#54db83' },
  consultoria: { rotulo: 'Consultoria', plural: 'Consultorias', cor: '#b89aea' },
};

const STATUS = {
  confirmado: { texto: 'Confirmado', cor: '#54db83' },
  pendente: { texto: 'Pendente', cor: '#f0ca61' },
};

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_SEMANA_LONGO = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

const HORA_INICIO = 8 * 60; // 08:00
const HORA_FIM = 20 * 60; // 20:00
const PASSO = 30; // minutos
const DUR_MIN = 30;
const DUR_MAX = 240;

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

const pad = (n) => String(n).padStart(2, '0');
const chaveData = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lerChave = (k) => {
  const [a, m, d] = k.split('-').map(Number);
  return new Date(a, m - 1, d);
};
const fmtHora = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
const fmtDuracao = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h${pad(m)}`;
  if (h) return `${h}h`;
  return `${m} min`;
};
const temConflito = (lista, inicio, fim) =>
  lista.some((a) => inicio < a.inicio + a.duracao && fim > a.inicio);

/* ------------------------------------------------------------------ */
/* Dados de exemplo (troque pela sua API / AsyncStorage)               */
/* ------------------------------------------------------------------ */

function dadosIniciais() {
  const hoje = new Date();
  const dia = (offset) =>
    chaveData(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + offset));
  return [
    { id: '1', data: dia(1), inicio: 9 * 60, duracao: 60, titulo: 'Visita ao terreno', tipo: 'visita', prof: 'Carlos Mendes', status: 'confirmado' },
    { id: '2', data: dia(1), inicio: 14 * 60, duracao: 30, titulo: 'Alinhamento da planta', tipo: 'reuniao', prof: 'Ana Souza', status: 'pendente' },
    { id: '3', data: dia(4), inicio: 10 * 60, duracao: 90, titulo: 'Entrega do projeto', tipo: 'entrega', prof: 'Studio Lima', status: 'confirmado' },
    { id: '4', data: dia(6), inicio: 15 * 60, duracao: 60, titulo: 'Consultoria financeira', tipo: 'consultoria', prof: 'Marina Costa', status: 'pendente' },
  ];
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function Filtro({ ativo, rotulo, cor, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.filtro, ativo && s.filtroAtivo, pressed && s.pressionado]}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
    >
      {!!cor && <View style={[s.pontoFiltro, { backgroundColor: cor }]} />}
      <Text style={[s.textoFiltro, ativo && s.textoFiltroAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

function CelulaDia({ data, selecionado, hoje, passado, itens, mobile, onPress }) {
  const tiposDoDia = [...new Set(itens.map((a) => a.tipo))].slice(0, 3);

  return (
    <View style={s.celula}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          s.celulaInterna,
          mobile ? s.celulaInternaMobile : s.celulaInternaSite,
          hoje && !selecionado && s.celulaHoje,
          selecionado && s.celulaSel,
          pressed && s.pressionado,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: selecionado }}
        accessibilityLabel={`Dia ${data.getDate()}, ${itens.length} ${
          itens.length === 1 ? 'compromisso' : 'compromissos'
        }`}
      >
        <View style={[s.numCirculo, selecionado && s.numCirculoSel]}>
          <Text
            style={[
              s.diaNum,
              passado && s.diaNumPassado,
              hoje && !selecionado && s.diaNumHoje,
              selecionado && s.diaNumSel,
            ]}
          >
            {data.getDate()}
          </Text>
        </View>

        {mobile ? (
          <View style={s.pontos}>
            {tiposDoDia.map((t) => (
              <View key={t} style={[s.ponto, { backgroundColor: TIPOS[t].cor }]} />
            ))}
          </View>
        ) : (
          <View style={s.eventos}>
            {itens.slice(0, 2).map((a) => (
              <View key={a.id} style={s.evento}>
                <View style={[s.ponto, { backgroundColor: TIPOS[a.tipo].cor }]} />
                <Text style={s.textoEvento} numberOfLines={1}>
                  {a.titulo}
                </Text>
              </View>
            ))}
            {itens.length > 2 && <Text style={s.mais}>+{itens.length - 2} mais</Text>}
          </View>
        )}
      </Pressable>
    </View>
  );
}

function ItemCompromisso({ item, confirmando, onPedirRemocao, onCancelar, onRemover }) {
  const tipo = TIPOS[item.tipo];
  const status = STATUS[item.status];

  return (
    <View style={[s.item, { borderLeftColor: tipo.cor }]}>
      <View style={s.itemCorpo}>
        <Text style={s.itemHora}>
          {fmtHora(item.inicio)} – {fmtHora(item.inicio + item.duracao)}
        </Text>
        <Text style={s.itemTitulo}>{item.titulo}</Text>
        <Text style={s.itemMeta}>
          {tipo.rotulo}
          {item.prof ? ` · ${item.prof}` : ''}
        </Text>

        <View style={[s.status, { borderColor: status.cor }]}>
          <View style={[s.pontoStatus, { backgroundColor: status.cor }]} />
          <Text style={[s.textoStatus, { color: status.cor }]}>{status.texto}</Text>
        </View>

        {confirmando && (
          <View style={s.confirmacao}>
            <Pressable
              onPress={onCancelar}
              style={({ pressed }) => [s.btnSecundarioPequeno, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoSecundario}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onRemover}
              style={({ pressed }) => [s.btnPerigo, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoPerigo}>Remover</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!confirmando && (
        <Pressable
          onPress={onPedirRemocao}
          hitSlop={8}
          style={({ pressed }) => [s.btnLixeira, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.titulo}`}
        >
          <Ionicons name="trash-outline" size={17} color="#ff7777" />
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

export default function TelaAgendamentos({ tipo: tipoConta }) {
  const { width } = useWindowDimensions();

  const hoje = useMemo(() => new Date(), []);
  const chaveHoje = chaveData(hoje);

  const [mesRef, setMesRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [selecionado, setSelecionado] = useState(chaveHoje);
  const [filtro, setFiltro] = useState('todos');
  const [agendamentos, setAgendamentos] = useState(dadosIniciais);
  const [pendente, setPendente] = useState(null);

  const [duracao, setDuracao] = useState(30);
  const [slot, setSlot] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('visita');
  const [tipoAberto, setTipoAberto] = useState(false);
  const [prof, setProf] = useState('');
  const [msg, setMsg] = useState({ texto: '', ok: true });

  /* ---------- derivados ---------- */

  const visiveis = useMemo(
    () => agendamentos.filter((a) => filtro === 'todos' || a.tipo === filtro),
    [agendamentos, filtro]
  );

  const porDia = useMemo(() => {
    const mapa = {};
    visiveis.forEach((a) => {
      (mapa[a.data] = mapa[a.data] || []).push(a);
    });
    Object.values(mapa).forEach((l) => l.sort((x, y) => x.inicio - y.inicio));
    return mapa;
  }, [visiveis]);

  const celulas = useMemo(() => {
    const ano = mesRef.getFullYear();
    const mes = mesRef.getMonth();
    const primeiro = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();
    const lista = [];
    for (let i = 0; i < primeiro; i++) lista.push(null);
    for (let d = 1; d <= total; d++) lista.push(new Date(ano, mes, d));
    while (lista.length % 7 !== 0) lista.push(null);
    return lista;
  }, [mesRef]);

  const stats = useMemo(() => {
    const prefixo = `${mesRef.getFullYear()}-${pad(mesRef.getMonth() + 1)}`;
    const doMes = agendamentos.filter((a) => a.data.startsWith(prefixo));
    return {
      total: doMes.length,
      confirmados: doMes.filter((a) => a.status === 'confirmado').length,
      pendentes: doMes.filter((a) => a.status === 'pendente').length,
    };
  }, [agendamentos, mesRef]);

  const dataSel = lerChave(selecionado);
  const diaPassado = selecionado < chaveHoje;
  const compromissosDia = porDia[selecionado] || [];
  const todosDoDia = useMemo(
    () => agendamentos.filter((a) => a.data === selecionado),
    [agendamentos, selecionado]
  );

  const slots = useMemo(() => {
    const agora = new Date();
    const minAgora = agora.getHours() * 60 + agora.getMinutes();
    const lista = [];
    for (let m = HORA_INICIO; m < HORA_FIM; m += PASSO) {
      const fim = m + duracao;
      let livre = fim <= HORA_FIM && !diaPassado;
      if (livre && selecionado === chaveHoje && m <= minAgora) livre = false;
      if (livre) livre = !temConflito(todosDoDia, m, fim);
      lista.push({ inicio: m, livre });
    }
    return lista;
  }, [duracao, diaPassado, selecionado, chaveHoje, todosDoDia]);

  const livres = slots.filter((x) => x.livre).length;

  /* ---------- ações ---------- */

  const limparMsg = () => setMsg({ texto: '', ok: true });

  const mudarMes = (delta) =>
    setMesRef(new Date(mesRef.getFullYear(), mesRef.getMonth() + delta, 1));

  const escolherDia = (chave) => {
    setSelecionado(chave);
    setSlot(null);
    setPendente(null);
    limparMsg();
  };

  const irParaHoje = () => {
    setMesRef(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    escolherDia(chaveHoje);
  };

  const mudarDuracao = (delta) => {
    const nova = Math.min(DUR_MAX, Math.max(DUR_MIN, duracao + delta));
    setDuracao(nova);
    if (slot !== null) {
      const fim = slot + nova;
      if (fim > HORA_FIM || temConflito(todosDoDia, slot, fim)) setSlot(null);
    }
    limparMsg();
  };

  const agendar = () => {
    if (slot === null) {
      setMsg({ texto: 'Escolha um horário.', ok: false });
      return;
    }
    if (!titulo.trim()) {
      setMsg({ texto: 'Informe um título para o agendamento.', ok: false });
      return;
    }
    const novo = {
      id: String(Date.now()),
      data: selecionado,
      inicio: slot,
      duracao,
      titulo: titulo.trim(),
      tipo,
      prof: prof.trim(),
      status: 'pendente',
    };
    setAgendamentos((l) => [...l, novo]);
    setTitulo('');
    setProf('');
    setSlot(null);
    setMsg({ texto: `Agendado para ${fmtHora(novo.inicio)}.`, ok: true });
  };

  const remover = (id) => {
    setAgendamentos((l) => l.filter((a) => a.id !== id));
    setPendente(null);
  };

  /* ---------- textos ---------- */

  const infoAgendar = diaPassado
    ? 'Este dia já passou. Escolha uma data a partir de hoje.'
    : slot !== null
    ? `${fmtHora(slot)} – ${fmtHora(slot + duracao)} (${fmtDuracao(duracao)})`
    : livres === 0
    ? 'Nenhum horário livre neste dia.'
    : `${livres} ${livres === 1 ? 'horário livre' : 'horários livres'} neste dia. Escolha um.`;

  const podeAgendar = slot !== null && !diaPassado;

  /* ---------- render ---------- */

  return (
    <LayoutConta
      tipo={tipoConta}
      ativo="agendamentos"
      titulo="Agendamentos"
      subtitulo="Escolha o dia no calendário e marque visitas, reuniões e entregas."
    >
      {({ mobile, medio }) => {
        const duasColunas = !mobile && !medio && width >= 1150;

        const calendario = (
          <View style={[s.card, duasColunas && s.colunaCalendario, mobile && s.cardMobile]}>
            <View style={s.calTopo}>
              <View style={s.calNav}>
                <Pressable
                  onPress={() => mudarMes(-1)}
                  style={({ pressed }) => [s.btnNav, pressed && s.pressionado]}
                  accessibilityRole="button"
                  accessibilityLabel="Mês anterior"
                >
                  <Ionicons name="chevron-back" size={18} color={DOURADO} />
                </Pressable>
                <Text style={[s.tituloMes, mobile && s.tituloMesMobile]} numberOfLines={1}>
                  {MESES[mesRef.getMonth()]} de {mesRef.getFullYear()}
                </Text>
                <Pressable
                  onPress={() => mudarMes(1)}
                  style={({ pressed }) => [s.btnNav, pressed && s.pressionado]}
                  accessibilityRole="button"
                  accessibilityLabel="Próximo mês"
                >
                  <Ionicons name="chevron-forward" size={18} color={DOURADO} />
                </Pressable>
              </View>

              <Pressable
                onPress={irParaHoje}
                style={({ pressed }) => [s.btnHoje, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoHoje}>Hoje</Text>
              </Pressable>
            </View>

            <Text style={s.resumo}>
              <Text style={s.resumoNum}>{stats.total}</Text> neste mês ·{' '}
              <Text style={s.resumoNum}>{stats.confirmados}</Text> confirmados ·{' '}
              <Text style={s.resumoNum}>{stats.pendentes}</Text> pendentes
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filtros}
              style={ALTURA_AUTO}
            >
              <Filtro ativo={filtro === 'todos'} rotulo="Todos" onPress={() => setFiltro('todos')} />
              {Object.entries(TIPOS).map(([chave, t]) => (
                <Filtro
                  key={chave}
                  ativo={filtro === chave}
                  rotulo={t.plural}
                  cor={t.cor}
                  onPress={() => setFiltro(chave)}
                />
              ))}
            </ScrollView>

            <View style={s.semana}>
              {DIAS_SEMANA.map((d) => (
                <Text key={d} style={s.semanaTxt}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={s.grade}>
              {celulas.map((d, i) => {
                if (!d) return <View key={`v${i}`} style={s.celula} />;
                const chave = chaveData(d);
                return (
                  <CelulaDia
                    key={chave}
                    data={d}
                    mobile={mobile}
                    selecionado={chave === selecionado}
                    hoje={chave === chaveHoje}
                    passado={chave < chaveHoje}
                    itens={porDia[chave] || []}
                    onPress={() => escolherDia(chave)}
                  />
                );
              })}
            </View>
          </View>
        );

        const lateral = (
          <View style={[s.card, duasColunas && s.colunaLateral, mobile && s.cardMobile]}>
            <View style={s.diaSel}>
              <Text style={s.diaSelNum}>{dataSel.getDate()}</Text>
              <View>
                <Text style={s.diaSelSemana}>{DIAS_SEMANA_LONGO[dataSel.getDay()]}</Text>
                <Text style={s.diaSelMes}>
                  {MESES[dataSel.getMonth()]} de {dataSel.getFullYear()}
                </Text>
              </View>
            </View>

            <Text style={s.h3}>Compromissos do dia</Text>
            {compromissosDia.length === 0 ? (
              <Text style={s.vazio}>
                {filtro === 'todos'
                  ? 'Nenhum compromisso neste dia.'
                  : 'Nenhum compromisso deste tipo neste dia.'}
              </Text>
            ) : (
              <View style={s.listaDia}>
                {compromissosDia.map((a) => (
                  <ItemCompromisso
                    key={a.id}
                    item={a}
                    confirmando={pendente === a.id}
                    onPedirRemocao={() => setPendente(a.id)}
                    onCancelar={() => setPendente(null)}
                    onRemover={() => remover(a.id)}
                  />
                ))}
              </View>
            )}

            <View style={s.novo}>
              <View style={s.novoTopo}>
                <Text style={s.h3Sem}>Novo agendamento</Text>
                <View style={s.duracao}>
                  <Pressable
                    onPress={() => mudarDuracao(-PASSO)}
                    style={({ pressed }) => [s.btnDur, pressed && s.pressionado]}
                    accessibilityRole="button"
                    accessibilityLabel="Diminuir duração"
                  >
                    <Ionicons name="remove" size={16} color="#fff" />
                  </Pressable>
                  <Text style={s.durValor}>{fmtDuracao(duracao)}</Text>
                  <Pressable
                    onPress={() => mudarDuracao(PASSO)}
                    style={({ pressed }) => [s.btnDur, pressed && s.pressionado]}
                    accessibilityRole="button"
                    accessibilityLabel="Aumentar duração"
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>

              <Text style={s.info} accessibilityLiveRegion="polite">
                {infoAgendar}
              </Text>

              <View style={s.slots}>
                {slots.map((sl) => {
                  const ativo = slot === sl.inicio;
                  return (
                    <View key={sl.inicio} style={s.slotBox}>
                      <Pressable
                        disabled={!sl.livre}
                        onPress={() => {
                          setSlot(sl.inicio);
                          limparMsg();
                        }}
                        style={({ pressed }) => [
                          s.slot,
                          !sl.livre && s.slotOcupado,
                          ativo && s.slotAtivo,
                          pressed && s.pressionado,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: ativo, disabled: !sl.livre }}
                        accessibilityLabel={`${fmtHora(sl.inicio)}${sl.livre ? '' : ', indisponível'}`}
                      >
                        <Text
                          style={[
                            s.slotTxt,
                            !sl.livre && s.slotTxtOcupado,
                            ativo && s.slotTxtAtivo,
                          ]}
                        >
                          {fmtHora(sl.inicio)}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <Text style={s.label}>Título</Text>
              <TextInput
                style={s.input}
                value={titulo}
                onChangeText={(t) => {
                  setTitulo(t);
                  limparMsg();
                }}
                maxLength={60}
                placeholder="Ex.: Visita ao terreno"
                placeholderTextColor="#777b83"
                selectionColor={DOURADO}
                accessibilityLabel="Título do agendamento"
              />

              <View style={s.camposExtras}>
                <View style={s.campoTipo}>
                  <Text style={s.label}>Tipo</Text>
                  <View style={s.tipoDropdown}>
                    <Pressable
                      onPress={() => setTipoAberto((aberto) => !aberto)}
                      style={({ pressed }) => [s.tipoSelecionado, pressed && s.pressionado]}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: tipoAberto }}
                      accessibilityLabel="Selecionar tipo de visita"
                    >
                      <Text style={s.tipoSelecionadoTxt} numberOfLines={1}>
                        {TIPOS[tipo].rotulo}
                      </Text>
                      <Ionicons
                        name={tipoAberto ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#fff"
                      />
                    </Pressable>

                    {tipoAberto && (
                      <View style={s.tipoLista}>
                        {Object.entries(TIPOS).map(([chave, item]) => (
                          <Pressable
                            key={chave}
                            onPress={() => {
                              setTipo(chave);
                              setTipoAberto(false);
                            }}
                            style={({ pressed }) => [
                              s.tipoOpcao,
                              tipo === chave && s.tipoOpcaoAtiva,
                              pressed && s.pressionado,
                            ]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: tipo === chave }}
                          >
                            <Text style={[s.tipoOpcaoTxt, tipo === chave && s.tipoOpcaoTxtAtiva]}>
                              {item.rotulo}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={s.campoProfissional}>
                  <Text style={s.label}>Profissional</Text>
                  <TextInput
                    style={s.inputProfissional}
                    value={prof}
                    onChangeText={setProf}
                    maxLength={40}
                    placeholder="Nome"
                    placeholderTextColor="#777b83"
                    selectionColor={DOURADO}
                    accessibilityLabel="Nome do profissional"
                  />
                </View>
              </View>

              {!!msg.texto && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[s.msg, { color: msg.ok ? '#54db83' : '#ff7777' }]}
                >
                  {msg.texto}
                </Text>
              )}

              <Pressable
                onPress={agendar}
                disabled={!podeAgendar}
                style={({ pressed }) => [
                  s.btnAgendar,
                  !podeAgendar && s.btnAgendarOff,
                  pressed && s.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !podeAgendar }}
              >
                <Text style={[s.btnAgendarTxt, !podeAgendar && s.btnAgendarTxtOff]}>Agendar</Text>
              </Pressable>
            </View>
          </View>
        );

        return (
          <View style={[s.agendador, duasColunas && s.agendadorLinha]}>
            {calendario}
            {lateral}
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

  agendador: { gap: 16 },
  agendadorLinha: { flexDirection: 'row', alignItems: 'flex-start' },
  colunaCalendario: { flex: 1, minWidth: 0 },
  colunaLateral: { width: 360 },

  card: {
    padding: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 12,
  },
  cardMobile: { ...ALTURA_AUTO, padding: 14, borderRadius: 14 },

  /* calendário */
  calTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  btnNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#343940',
    borderRadius: 18,
  },
  tituloMes: { flexShrink: 1, color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  tituloMesMobile: { fontSize: 16 },
  btnHoje: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoHoje: { color: DOURADO, fontSize: 13, fontWeight: '600' },

  resumo: { marginTop: 12, color: '#a5a5a5', fontSize: 13 },
  resumoNum: { color: DOURADO, fontWeight: 'bold' },

  filtros: { gap: 8, paddingVertical: 14 },
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
  filtroAtivo: { backgroundColor: '#29231a', borderColor: DOURADO },
  pontoFiltro: { width: 8, height: 8, borderRadius: 4 },
  textoFiltro: { color: '#d3d4d8', fontSize: 12.5 },
  textoFiltroAtivo: { color: DOURADO, fontWeight: '600' },

  semana: { flexDirection: 'row', marginBottom: 4 },
  semanaTxt: { flex: 1, paddingVertical: 8, color: '#a5a5a5', fontSize: 12, textAlign: 'center' },

  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: `${100 / 7}%`, padding: 2 },
  celulaInterna: {
    alignItems: 'center',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#252729',
    borderRadius: 8,
  },
  celulaInternaMobile: { aspectRatio: 0.9, paddingTop: 5 },
  celulaInternaSite: { minHeight: 92, alignItems: 'flex-start', padding: 8, gap: 4 },
  celulaHoje: { borderColor: DOURADO },
  celulaSel: { backgroundColor: '#29231a', borderColor: DOURADO },

  numCirculo: {
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  numCirculoSel: { backgroundColor: DOURADO },
  diaNum: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  diaNumPassado: { color: '#6b6b6b', fontWeight: '500' },
  diaNumHoje: { color: DOURADO },
  diaNumSel: { color: '#111' },

  pontos: { flexDirection: 'row', gap: 3, marginTop: 6 },
  ponto: { width: 6, height: 6, borderRadius: 3 },
  eventos: { alignSelf: 'stretch', gap: 3 },
  evento: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textoEvento: { flex: 1, color: '#d5d6da', fontSize: 11 },
  mais: { color: '#a5a5a5', fontSize: 11 },

  /* dia selecionado */
  diaSel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DOURADO,
  },
  diaSelNum: { color: DOURADO, fontSize: 44, fontWeight: 'bold' },
  diaSelSemana: { color: '#fff', fontSize: 17, fontWeight: '600' },
  diaSelMes: { marginTop: 2, color: '#a5a5a5', fontSize: 13 },

  h3: { marginTop: 16, marginBottom: 10, color: '#fff', fontSize: 15, fontWeight: '600' },
  h3Sem: { color: '#fff', fontSize: 15, fontWeight: '600' },
  vazio: { color: '#a5a5a5', fontSize: 13 },

  listaDia: { gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#252729',
    borderLeftWidth: 3,
    borderRadius: 8,
  },
  itemCorpo: { flex: 1, minWidth: 0, gap: 3 },
  itemHora: { color: DOURADO, fontSize: 12, fontWeight: 'bold' },
  itemTitulo: { color: '#fff', fontSize: 15, fontWeight: '600' },
  itemMeta: { color: '#a5a5a5', fontSize: 12 },
  btnLixeira: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  pontoStatus: { width: 6, height: 6, borderRadius: 3 },
  textoStatus: { fontSize: 11 },

  confirmacao: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnSecundarioPequeno: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
  },
  textoSecundario: { color: '#fff', fontSize: 13 },
  btnPerigo: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#3a1d1d',
    borderWidth: 1,
    borderColor: '#ff7777',
    borderRadius: 8,
  },
  textoPerigo: { color: '#ff9a9a', fontSize: 13, fontWeight: '600' },

  /* novo agendamento */
  novo: { marginTop: 20, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#292929' },
  novoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
    marginBottom: 8,
  },
  duracao: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnDur: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#343940',
    borderRadius: 8,
  },
  durValor: { minWidth: 52, color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  info: { marginBottom: 10, color: '#a5a5a5', fontSize: 13 },

  slots: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, marginBottom: 4 },
  slotBox: { width: '25%', padding: 3 },
  slot: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 8,
  },
  slotOcupado: { borderColor: '#252729', backgroundColor: '#101010' },
  slotAtivo: { backgroundColor: DOURADO, borderColor: DOURADO },
  slotTxt: { color: '#d3d4d8', fontSize: 12.5, fontWeight: '600' },
  slotTxtOcupado: { color: '#555', fontWeight: '400', textDecorationLine: 'line-through' },
  slotTxtAtivo: { color: '#111' },

  label: { marginTop: 14, marginBottom: 6, color: '#a5a5a5', fontSize: 13 },
  input: {
    height: 42,
    paddingHorizontal: 12,
    color: '#eee',
    fontSize: 16,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  /* campos Tipo + Profissional */
  camposExtras: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 0,
    position: 'relative',
    zIndex: 50, // fica acima do botão "Agendar" e da mensagem
  },
  campoTipo: { flex: 1, zIndex: 20 },
  campoProfissional: { flex: 1 },
  tipoDropdown: { position: 'relative', zIndex: 30 },
  tipoSelecionado: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 10,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  tipoSelecionadoTxt: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '700' },
  tipoLista: {
    position: 'absolute',
    top: 46, // pequeno espaço entre o campo e a lista, como na referência
    left: 0,
    right: 0,
    minWidth: 150, // evita quebrar "Entrega de projeto"
    zIndex: 100,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 4,
    paddingVertical: 2,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  tipoOpcao: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  tipoOpcaoAtiva: { backgroundColor: '#99c8ff' },
  tipoOpcaoTxt: { color: '#fff', fontSize: 14 },
  tipoOpcaoTxtAtiva: { color: '#000', fontWeight: '600' },
  inputProfissional: {
    height: 42,
    paddingHorizontal: 12,
    color: '#eee',
    fontSize: 16,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  msg: { marginTop: 14, fontSize: 13, fontWeight: '600' },
  btnAgendar: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  btnAgendarOff: { backgroundColor: '#2b2b2e' },
  btnAgendarTxt: { color: '#111', fontSize: 15, fontWeight: 'bold' },
  btnAgendarTxtOff: { color: '#777' },
});