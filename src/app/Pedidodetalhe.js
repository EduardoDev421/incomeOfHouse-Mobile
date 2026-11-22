import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LayoutConta } from '../components/TelaConta';

/* ================================================= */
/* CONSTANTES                                        */
/* ================================================= */

const DOURADO = '#d4a63a';
const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

// Cores dos status (iguais às do Meus Pedidos)
const STATUS = {
  andamento: { texto: 'Em andamento', cor: '#f0ca61', fundo: 'rgba(174, 137, 43, 0.22)' },
  concluido: { texto: 'Concluído', cor: '#54db83', fundo: 'rgba(30, 135, 68, 0.23)' },
  cancelado: { texto: 'Cancelado', cor: '#c3c6d4', fundo: 'rgba(115, 120, 139, 0.28)' },
};

const ETAPAS = [
  { titulo: 'Pedido solicitado', texto: 'Seu pedido foi recebido com sucesso.' },
  { titulo: 'Aprovado pelo profissional', texto: 'O profissional aceitou o projeto.' },
  { titulo: 'Em desenvolvimento', texto: 'O projeto está sendo elaborado.' },
  { titulo: 'Entrega do projeto', texto: 'Os arquivos finais serão disponibilizados.' },
];

/* ================================================= */
/* FUNÇÕES AUXILIARES                                */
/* ================================================= */

// Os parâmetros da rota podem chegar como texto ou lista
const param = (valor, padrao = '') => {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v || padrao;
};

const tipoDoStatus = (texto = '') => {
  const t = texto.toLowerCase();
  if (t.includes('conclu')) return 'concluido';
  if (t.includes('cancel')) return 'cancelado';
  return 'andamento';
};

const inicial = (nome) => (nome || '?').trim().charAt(0).toUpperCase() || '?';

/* ================================================= */
/* COMPONENTES                                       */
/* ================================================= */

function Cartao({ titulo, children }) {
  return (
    <View style={s.cartao}>
      <View style={s.cartaoTitulo}>
        <View style={s.cartaoBarra} />
        <Text style={s.cartaoTituloTexto}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function SeloStatus({ tipo }) {
  const st = STATUS[tipo];
  return (
    <View style={[s.status, { backgroundColor: st.fundo }]}>
      <View style={[s.statusPonto, { backgroundColor: st.cor }]} />
      <Text style={[s.statusTexto, { color: st.cor }]}>{st.texto}</Text>
    </View>
  );
}

function CartaoProjeto({ projeto, mobile }) {
  const fonte = projeto.imagem ? { uri: projeto.imagem } : null;
  const dados = [
    { rotulo: 'Área', valor: projeto.area },
    { rotulo: 'Quartos', valor: projeto.quartos },
    { rotulo: 'Banheiros', valor: projeto.banheiros },
    { rotulo: 'Garagens', valor: projeto.garagens },
  ];

  return (
    <Cartao titulo="Projeto">
      <View style={[s.projeto, mobile && s.projetoMobile]}>
        <View style={[s.projetoImg, mobile && s.projetoImgMobile]}>
          {fonte && <Image source={fonte} style={s.imagem} resizeMode="cover" />}
        </View>

        <View style={s.projetoInfo}>
          <Text style={s.projetoNome}>{projeto.nome}</Text>
          <Text style={s.projetoDesc}>{projeto.descricao}</Text>

          <View style={s.dados}>
            {dados.map((d) => (
              <View key={d.rotulo} style={s.dado}>
                <Text style={s.dadoRotulo}>{d.rotulo}</Text>
                <Text style={s.dadoValor}>{d.valor}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Cartao>
  );
}

function CartaoAndamento({ tipo, datas }) {
  const feitas = tipo === 'concluido' ? 4 : tipo === 'cancelado' ? 1 : 2;
  const atual = tipo === 'andamento' ? 2 : -1;

  return (
    <Cartao titulo="Andamento do Pedido">
      <View>
        {ETAPAS.map((etapa, i) => {
          const feita = i < feitas;
          const ehAtual = i === atual;
          const ultima = i === ETAPAS.length - 1;

          return (
            <View key={etapa.titulo} style={s.etapa}>
              <View style={s.etapaTrilho}>
                <View
                  style={[
                    s.marcador,
                    feita && s.marcadorFeito,
                    ehAtual && s.marcadorAtual,
                  ]}
                />
                {!ultima && <View style={s.etapaLinha} />}
              </View>

              <View style={[s.etapaTexto, !ultima && s.etapaTextoEspaco]}>
                <Text
                  style={[
                    s.etapaTitulo,
                    feita && s.etapaTituloFeito,
                    ehAtual && s.etapaTituloAtual,
                  ]}
                >
                  {etapa.titulo}
                </Text>
                <Text style={[s.etapaDesc, (feita || ehAtual) && s.etapaDescAtiva]}>
                  {etapa.texto}
                </Text>
                {!!datas[i] && <Text style={s.etapaData}>{datas[i]}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </Cartao>
  );
}

function CartaoProfissional({ profissional, mobile, onMensagem }) {
  return (
    <Cartao titulo="Profissional Responsável">
      <View style={[s.profissional, mobile && s.profissionalMobile]}>
        <View style={s.profissionalLinha}>
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>{inicial(profissional.nome)}</Text>
          </View>
          <View style={s.profissionalDados}>
            <Text style={s.profissionalNome}>{profissional.nome}</Text>
            <Text style={s.profissionalInfo}>{profissional.info}</Text>
          </View>
        </View>

        <Pressable
          onPress={onMensagem}
          style={({ pressed }) => [s.btn, s.btnSecundario, s.btnAuto, pressed && s.pressionado]}
          accessibilityRole="button"
        >
          <Text style={s.textoSecundario}>Enviar mensagem</Text>
        </Pressable>
      </View>
    </Cartao>
  );
}

function CartaoResumo({ financeiro }) {
  return (
    <Cartao titulo="Resumo Financeiro">
      <View style={s.resumo}>
        <View style={s.resumoLinha}>
          <Text style={s.resumoRotulo}>Valor do projeto</Text>
          <Text style={s.resumoValor}>{financeiro.valor}</Text>
        </View>
        <View style={s.resumoLinha}>
          <Text style={s.resumoRotulo}>Taxa da plataforma</Text>
          <Text style={s.resumoValor}>{financeiro.taxa}</Text>
        </View>
        <View style={s.resumoLinha}>
          <Text style={s.resumoRotulo}>Forma de pagamento</Text>
          <Text style={s.resumoValor}>{financeiro.pagamento}</Text>
        </View>

        <View style={[s.resumoLinha, s.resumoTotal]}>
          <Text style={s.resumoTotalRotulo}>Total</Text>
          <Text style={s.resumoTotalValor}>{financeiro.total}</Text>
        </View>
      </View>
    </Cartao>
  );
}

function CartaoAcoes({
  podeCancelar,
  confirmando,
  onMensagem,
  onComprovante,
  onPedirCancelamento,
  onNaoCancelar,
  onCancelar,
}) {
  return (
    <Cartao titulo="Ações">
      <View style={s.acoes}>
        <Pressable
          onPress={onMensagem}
          style={({ pressed }) => [s.btn, s.btnPrincipal, pressed && s.pressionado]}
          accessibilityRole="button"
        >
          <Text style={s.textoPrincipal}>Falar com o profissional</Text>
        </Pressable>

        <Pressable
          onPress={onComprovante}
          style={({ pressed }) => [s.btn, s.btnSecundario, pressed && s.pressionado]}
          accessibilityRole="button"
        >
          <Text style={s.textoSecundario}>Baixar comprovante</Text>
        </Pressable>

        {podeCancelar &&
          (confirmando ? (
            <View style={s.confirmacao}>
              <Text style={s.confirmacaoTexto}>Cancelar este pedido?</Text>
              <View style={s.confirmacaoBotoes}>
                <Pressable
                  onPress={onNaoCancelar}
                  style={({ pressed }) => [s.btn, s.btnSecundario, s.btnMeio, pressed && s.pressionado]}
                  accessibilityRole="button"
                >
                  <Text style={s.textoSecundario}>Não</Text>
                </Pressable>
                <Pressable
                  onPress={onCancelar}
                  style={({ pressed }) => [s.btn, s.btnPerigo, s.btnMeio, pressed && s.pressionado]}
                  accessibilityRole="button"
                >
                  <Text style={s.textoPerigo}>Sim, cancelar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={onPedirCancelamento}
              style={({ pressed }) => [s.btn, s.btnPerigo, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoPerigo}>Cancelar pedido</Text>
            </Pressable>
          ))}
      </View>
    </Cartao>
  );
}

/* ================================================= */
/* TELA                                              */
/* ================================================= */

export default function Pedidodetalhe() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const id = param(params.id, '0001');
  const [tipoStatus, setTipoStatus] = useState(tipoDoStatus(param(params.status, 'Em andamento')));
  const [confirmando, setConfirmando] = useState(false);

  // TODO: trocar pelos dados reais do pedido (API). Enquanto isso, usa os
  // parâmetros da rota e, na falta deles, os mesmos textos da versão web.
  const projeto = {
    nome: param(params.titulo, 'Nome da planta'),
    descricao: param(params.descricao, 'Descrição resumida do projeto contratado neste pedido.'),
    imagem: param(params.imagem, ''),
    area: param(params.area, '120 m²'),
    quartos: param(params.quartos, '3'),
    banheiros: param(params.banheiros, '2'),
    garagens: param(params.garagens, '1'),
  };

  const profissional = {
    nome: param(params.profissional, 'Nome do profissional'),
    info: param(params.registro, 'Arquiteto(a) • CAU 00000-0'),
  };

  const financeiro = {
    valor: param(params.valor, 'R$ 0,00'),
    taxa: param(params.taxa, 'R$ 0,00'),
    pagamento: param(params.pagamento, 'Pix'),
    total: param(params.total, 'R$ 0,00'),
  };

  const dataPedido = param(params.data, '10/10/2026');
  const datas = [dataPedido, param(params.dataAprovacao, '11/10/2026'), 'Em andamento', ''];

  const irParaMensagens = () => router.push('/MensagensU');
  const voltar = () => router.push('/MeusPedidos');
  const baixarComprovante = () =>
    // TODO: gerar / baixar o comprovante
    Alert.alert('Comprovante', 'O download do comprovante poderá ser conectado aqui.');
  const cancelarPedido = () => {
    // TODO: chamar a API de cancelamento
    setTipoStatus('cancelado');
    setConfirmando(false);
  };

  return (
    <LayoutConta
      tipo="usuario"
      ativo="pedidos"
      titulo={`Pedido #${id}`}
      subtitulo={`Realizado em ${dataPedido}`}
    >
      {({ mobile }) => {
        // Duas colunas só quando há espaço (a largura inclui o menu lateral)
        const duasColunas = !mobile && width >= 1100;

        return (
          <View style={s.conteudo}>
            <View style={s.topo}>
              <Pressable
                onPress={voltar}
                hitSlop={8}
                style={({ pressed }) => [pressed && s.pressionado]}
                accessibilityRole="link"
              >
                <Text style={s.voltar}>← Voltar aos Pedidos</Text>
              </Pressable>

              <SeloStatus tipo={tipoStatus} />
            </View>

            <View style={[s.grade, duasColunas && s.gradeDuas]}>
              <View style={[s.colunaPrincipal, duasColunas && s.colunaPrincipalDuas]}>
                <CartaoProjeto projeto={projeto} mobile={mobile} />
                <CartaoAndamento tipo={tipoStatus} datas={datas} />
                <CartaoProfissional
                  profissional={profissional}
                  mobile={mobile}
                  onMensagem={irParaMensagens}
                />
              </View>

              <View style={[s.colunaLateral, duasColunas && s.colunaLateralDuas]}>
                <CartaoResumo financeiro={financeiro} />
                <CartaoAcoes
                  podeCancelar={tipoStatus === 'andamento'}
                  confirmando={confirmando}
                  onMensagem={irParaMensagens}
                  onComprovante={baixarComprovante}
                  onPedirCancelamento={() => setConfirmando(true)}
                  onNaoCancelar={() => setConfirmando(false)}
                  onCancelar={cancelarPedido}
                />
              </View>
            </View>
          </View>
        );
      }}
    </LayoutConta>
  );
}

/* ================================================= */
/* ESTILOS                                           */
/* ================================================= */

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  conteudo: { ...ALTURA_AUTO, gap: 16 },

  /* ----- Topo: voltar + status ----- */
  topo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  voltar: { color: '#d4af6a', fontSize: 13 },

  status: {
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusPonto: { width: 8, height: 8, borderRadius: 4 },
  statusTexto: { fontSize: 12 },

  /* ----- Grade ----- */
  grade: { ...ALTURA_AUTO, gap: 16 },
  gradeDuas: { flexDirection: 'row', alignItems: 'flex-start' },
  colunaPrincipal: { ...ALTURA_AUTO, gap: 16, minWidth: 0 },
  colunaPrincipalDuas: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  colunaLateral: { ...ALTURA_AUTO, gap: 16, minWidth: 0 },
  colunaLateralDuas: { width: 300, flexGrow: 0, flexShrink: 0 },

  /* ----- Cartões ----- */
  cartao: {
    ...ALTURA_AUTO,
    minWidth: 0,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cartaoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  cartaoBarra: { width: 4, height: 16, backgroundColor: DOURADO, borderRadius: 2 },
  cartaoTituloTexto: { color: DOURADO, fontSize: 15, fontWeight: '600' },

  /* ----- Projeto ----- */
  projeto: { flexDirection: 'row', gap: 18 },
  projetoMobile: { flexDirection: 'column' },
  projetoImg: {
    width: 200,
    minHeight: 170,
    overflow: 'hidden',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 10,
  },
  projetoImgMobile: { width: '100%', height: 200, minHeight: 0 },
  imagem: { width: '100%', height: '100%' },
  projetoInfo: { flex: 1, minWidth: 0, gap: 10 },
  projetoNome: { color: '#fff', fontSize: 18, fontWeight: '600' },
  projetoDesc: { color: '#bdbdbd', fontSize: 13, lineHeight: 20 },

  dados: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  dado: {
    flexGrow: 1,
    flexBasis: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  dadoRotulo: { marginBottom: 4, color: '#999', fontSize: 11 },
  dadoValor: { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* ----- Linha do tempo ----- */
  etapa: { flexDirection: 'row', gap: 14 },
  etapaTrilho: { width: 16, alignItems: 'center' },
  marcador: {
    width: 16,
    height: 16,
    marginTop: 2,
    backgroundColor: '#171717',
    borderWidth: 2,
    borderColor: '#3c4148',
    borderRadius: 8,
  },
  marcadorFeito: { backgroundColor: DOURADO, borderColor: DOURADO },
  marcadorAtual: {
    backgroundColor: '#171717',
    borderColor: DOURADO,
    borderWidth: 3,
  },
  etapaLinha: { flex: 1, width: 2, marginTop: 2, backgroundColor: '#292929' },
  etapaTexto: { flex: 1, minWidth: 0 },
  etapaTextoEspaco: { paddingBottom: 20 },
  etapaTitulo: { marginBottom: 3, color: '#8a8d94', fontSize: 14 },
  etapaTituloFeito: { color: '#fff' },
  etapaTituloAtual: { color: '#f0ca61', fontWeight: '600' },
  etapaDesc: { color: '#6f737a', fontSize: 12 },
  etapaDescAtiva: { color: '#c7c7c7' },
  etapaData: { marginTop: 3, color: '#777b83', fontSize: 11 },

  /* ----- Profissional ----- */
  profissional: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  profissionalMobile: { flexDirection: 'column', alignItems: 'stretch', flexWrap: 'nowrap' },
  profissionalLinha: { flexDirection: 'row', alignItems: 'center', gap: 14, flexShrink: 1 },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 28,
  },
  avatarTexto: { color: DOURADO, fontSize: 20, fontWeight: 'bold' },
  profissionalDados: { flexShrink: 1, minWidth: 0 },
  profissionalNome: { color: '#fff', fontSize: 15, fontWeight: '600' },
  profissionalInfo: { marginTop: 3, color: '#999', fontSize: 12 },

  /* ----- Resumo financeiro ----- */
  resumo: { gap: 12 },
  resumoLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  resumoRotulo: { color: '#999', fontSize: 13 },
  resumoValor: { color: '#fff', fontSize: 13 },
  resumoTotal: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  resumoTotalRotulo: { color: '#fff', fontSize: 14 },
  resumoTotalValor: { color: DOURADO, fontSize: 22, fontWeight: 'bold' },

  /* ----- Ações / botões ----- */
  acoes: { gap: 10 },
  btn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnAuto: { alignSelf: 'stretch' },
  btnMeio: { flex: 1 },
  btnPrincipal: { backgroundColor: DOURADO, borderWidth: 1, borderColor: DOURADO },
  textoPrincipal: { color: '#111', fontSize: 13, fontWeight: '600' },
  btnSecundario: { backgroundColor: '#292929', borderWidth: 1, borderColor: DOURADO },
  textoSecundario: { color: DOURADO, fontSize: 13, fontWeight: '600' },
  btnPerigo: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#5a2d2d' },
  textoPerigo: { color: '#e07a7a', fontSize: 13, fontWeight: '600' },

  confirmacao: { gap: 10 },
  confirmacaoTexto: { color: '#fff', fontSize: 13 },
  confirmacaoBotoes: { flexDirection: 'row', gap: 10 },
});