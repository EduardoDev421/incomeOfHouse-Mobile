import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LayoutConta } from './TelaConta';

const DOURADO = '#d4a63a';
const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const ICONES_TIPO = {
  casa: 'home-outline',
  trabalho: 'briefcase-outline',
  outro: 'location-outline',
};

const ENDERECOS_INICIAIS = [
  {
    id: '1',
    titulo: 'Minha casa',
    tipo: 'casa',
    cep: '70000000',
    rua: 'Rua das Flores',
    numero: '100',
    complemento: '',
    bairro: 'Asa Sul',
    cidade: 'Brasília',
    uf: 'DF',
    padrao: true,
  },
  {
    id: '2',
    titulo: 'Trabalho',
    tipo: 'trabalho',
    cep: '70000001',
    rua: 'Avenida Central',
    numero: '250',
    complemento: 'Sala 12',
    bairro: 'Asa Norte',
    cidade: 'Brasília',
    uf: 'DF',
    padrao: false,
  },
];

const FORM_VAZIO = {
  id: null,
  titulo: '',
  tipo: 'casa',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  padrao: false,
};

const apenasDigitos = (texto) => texto.replace(/\D/g, '');

const formatarCep = (cep) => {
  const d = apenasDigitos(cep).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const linhaRua = (e) =>
  [`${e.rua}, ${e.numero}`, e.complemento].filter(Boolean).join(' · ');

const linhaCidade = (e) =>
  [e.bairro, `${e.cidade} - ${e.uf}`].filter(Boolean).join(' · ');

const validar = (f) => {
  if (!f.titulo.trim()) return 'Dê um nome ao endereço (ex.: Minha casa).';
  if (apenasDigitos(f.cep).length !== 8) return 'Informe um CEP com 8 dígitos.';
  if (!f.rua.trim()) return 'Informe a rua.';
  if (!f.numero.trim()) return 'Informe o número.';
  if (!f.cidade.trim()) return 'Informe a cidade.';
  if (f.uf.trim().length !== 2) return 'Informe a UF com 2 letras.';
  return '';
};

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function CardEndereco({
  endereco,
  mobile,
  confirmando,
  onEditar,
  onPedirExclusao,
  onCancelar,
  onExcluir,
  onPadrao,
}) {
  return (
    <View style={[s.card, mobile && s.cardMobile, endereco.padrao && s.cardPadrao]}>
      <View style={s.cardTopo}>
        <View style={s.iconeCirculo}>
          <Ionicons
            name={ICONES_TIPO[endereco.tipo] || ICONES_TIPO.outro}
            size={18}
            color={DOURADO}
          />
        </View>

        <View style={s.cardTitulos}>
          <Text style={[s.cardTitulo, mobile && s.cardTituloMobile]} numberOfLines={1}>
            {endereco.titulo}
          </Text>
          {endereco.padrao && (
            <View style={s.selo}>
              <Ionicons name="checkmark-circle" size={12} color={DOURADO} />
              <Text style={s.textoSelo}>Endereço padrão</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.cardCorpo}>
        <Text style={[s.linhaPrincipal, mobile && s.linhaPrincipalMobile]}>
          {linhaRua(endereco)}
        </Text>
        <Text style={[s.linhaSecundaria, mobile && s.linhaSecundariaMobile]}>
          {linhaCidade(endereco)}
        </Text>
        <Text style={[s.linhaSecundaria, mobile && s.linhaSecundariaMobile]}>
          CEP {formatarCep(endereco.cep)}
        </Text>
      </View>

      {confirmando ? (
        <View style={s.cardAcoes}>
          <Text style={s.textoConfirmar}>Excluir "{endereco.titulo}"?</Text>
          <View style={s.confirmacao}>
            <Pressable
              onPress={onCancelar}
              style={({ pressed }) => [s.btnSecundarioPequeno, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoSecundario}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onExcluir}
              style={({ pressed }) => [s.btnPerigo, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoPerigo}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={s.cardAcoes}>
          {!endereco.padrao && (
            <Pressable
              onPress={onPadrao}
              style={({ pressed }) => [s.acao, pressed && s.pressionado]}
              hitSlop={6}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={DOURADO} />
              <Text style={s.textoAcao}>Tornar padrão</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onEditar}
            style={({ pressed }) => [s.acao, pressed && s.pressionado]}
            hitSlop={6}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={16} color={DOURADO} />
            <Text style={s.textoAcao}>Editar</Text>
          </Pressable>

          <Pressable
            onPress={onPedirExclusao}
            style={({ pressed }) => [s.acao, s.acaoExcluir, pressed && s.pressionado]}
            hitSlop={6}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color="#ff8a80" />
            <Text style={[s.textoAcao, s.textoExcluir]}>Excluir</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Campo({ rotulo, estilo, ...props }) {
  return (
    <View style={[s.campo, estilo]}>
      <Text style={s.rotuloCampo}>{rotulo}</Text>
      <TextInput
        style={s.input}
        placeholderTextColor="#777b83"
        selectionColor={DOURADO}
        accessibilityLabel={rotulo}
        {...props}
      />
    </View>
  );
}

function FormEndereco({ visivel, inicial, onFechar, onSalvar }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (visivel) {
      setForm(inicial || FORM_VAZIO);
      setErro('');
    }
  }, [visivel, inicial]);

  const mudar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = () => {
    const mensagem = validar(form);
    if (mensagem) {
      setErro(mensagem);
      return;
    }
    onSalvar({
      ...form,
      cep: apenasDigitos(form.cep),
      uf: form.uf.toUpperCase(),
    });
  };

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={s.modalFundo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.areaFechar} onPress={onFechar} />

        <View style={s.modalCaixa}>
          <View style={s.modalTopo}>
            <Text style={s.modalTitulo}>{form.id ? 'Editar endereço' : 'Novo endereço'}</Text>
            <Pressable
              onPress={onFechar}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close-outline" size={26} color={DOURADO} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.modalCorpo} keyboardShouldPersistTaps="handled">
            <View style={s.tipos}>
              {Object.keys(ICONES_TIPO).map((t) => {
                const ativo = form.tipo === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => mudar('tipo')(t)}
                    style={[s.tipo, ativo && s.tipoAtivo]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                  >
                    <Ionicons name={ICONES_TIPO[t]} size={16} color={ativo ? DOURADO : '#aaa'} />
                    <Text style={[s.textoTipo, ativo && s.textoTipoAtivo]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Campo
              rotulo="Nome do endereço"
              placeholder="Ex.: Minha casa"
              value={form.titulo}
              onChangeText={mudar('titulo')}
            />
            <Campo
              rotulo="CEP"
              placeholder="00000-000"
              keyboardType="number-pad"
              value={formatarCep(form.cep)}
              onChangeText={(v) => mudar('cep')(apenasDigitos(v).slice(0, 8))}
            />
            <Campo
              rotulo="Rua"
              placeholder="Rua, avenida..."
              value={form.rua}
              onChangeText={mudar('rua')}
            />

            <View style={s.linhaCampos}>
              <Campo
                rotulo="Número"
                estilo={s.campoPequeno}
                keyboardType="number-pad"
                value={form.numero}
                onChangeText={mudar('numero')}
              />
              <Campo
                rotulo="Complemento"
                estilo={s.campoGrande}
                placeholder="Apto, sala..."
                value={form.complemento}
                onChangeText={mudar('complemento')}
              />
            </View>

            <Campo rotulo="Bairro" value={form.bairro} onChangeText={mudar('bairro')} />

            <View style={s.linhaCampos}>
              <Campo
                rotulo="Cidade"
                estilo={s.campoGrande}
                value={form.cidade}
                onChangeText={mudar('cidade')}
              />
              <Campo
                rotulo="UF"
                estilo={s.campoPequeno}
                autoCapitalize="characters"
                maxLength={2}
                value={form.uf}
                onChangeText={mudar('uf')}
              />
            </View>

            <Pressable
              onPress={() => setForm((f) => ({ ...f, padrao: !f.padrao }))}
              style={s.linhaPadrao}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: form.padrao }}
            >
              <Ionicons
                name={form.padrao ? 'checkbox' : 'square-outline'}
                size={22}
                color={DOURADO}
              />
              <Text style={s.textoPadrao}>Usar como endereço padrão</Text>
            </Pressable>

            {!!erro && <Text style={s.erro}>{erro}</Text>}
          </ScrollView>

          <View style={s.modalRodape}>
            <Pressable
              onPress={onFechar}
              style={({ pressed }) => [s.botaoCancelar, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoCancelar}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={salvar}
              style={({ pressed }) => [s.botaoSalvar, pressed && s.pressionado]}
              accessibilityRole="button"
            >
              <Text style={s.textoSalvar}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EstadoVazio({ onAdicionar }) {
  return (
    <View style={s.vazio}>
      <View style={s.vazioIcone}>
        <Ionicons name="location-outline" size={34} color={DOURADO} />
      </View>
      <Text style={s.vazioTitulo}>Nenhum endereço cadastrado</Text>
      <Text style={s.vazioTexto}>Adicione um endereço para usar nos seus pedidos.</Text>
      <Pressable
        onPress={onAdicionar}
        style={({ pressed }) => [s.botaoAdicionar, pressed && s.pressionado]}
        accessibilityRole="button"
      >
        <Ionicons name="add-outline" size={20} color={DOURADO} />
        <Text style={s.textoAdicionar}>Adicionar endereço</Text>
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

export default function TelaEnderecos({ tipo: tipoConta }) {
  const [enderecos, setEnderecos] = useState(ENDERECOS_INICIAIS);
  const [formVisivel, setFormVisivel] = useState(false);
  const [editando, setEditando] = useState(null);
  const [pendente, setPendente] = useState(null);

  const abrirNovo = () => {
    setEditando({ ...FORM_VAZIO, padrao: enderecos.length === 0 });
    setFormVisivel(true);
  };

  const abrirEdicao = (endereco) => {
    setEditando(endereco);
    setFormVisivel(true);
  };

  const salvar = (dados) => {
    setEnderecos((lista) => {
      const existe = dados.id != null && lista.some((e) => e.id === dados.id);
      const idFinal = existe ? dados.id : String(Date.now());

      const novo = existe
        ? lista.map((e) => (e.id === dados.id ? dados : e))
        : [...lista, { ...dados, id: idFinal }];

      const idPadrao = dados.padrao
        ? idFinal
        : novo.find((e) => e.padrao)?.id ?? novo[0]?.id;

      return novo.map((e) => ({ ...e, padrao: e.id === idPadrao }));
    });

    setFormVisivel(false);
  };

  const tornarPadrao = (id) =>
    setEnderecos((lista) => lista.map((e) => ({ ...e, padrao: e.id === id })));

  const excluir = (endereco) => {
    setEnderecos((lista) => {
      const restante = lista.filter((e) => e.id !== endereco.id);
      if (endereco.padrao && restante.length > 0) {
        restante[0] = { ...restante[0], padrao: true };
      }
      return restante;
    });
    setPendente(null);
  };

  return (
    <LayoutConta
      tipo={tipoConta}
      ativo="enderecos"
      titulo="Meus Endereços"
      subtitulo="Gerencie os endereços utilizados nos seus pedidos."
    >
      {({ mobile }) => (
        <View style={s.conteudo}>
          {!mobile && enderecos.length > 0 && (
            <View style={s.barra}>
              <Pressable
                onPress={abrirNovo}
                style={({ pressed }) => [s.botaoAdicionar, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Ionicons name="add-outline" size={18} color={DOURADO} />
                <Text style={s.textoAdicionar}>Novo endereço</Text>
              </Pressable>
            </View>
          )}

          {enderecos.length === 0 ? (
            <EstadoVazio onAdicionar={abrirNovo} />
          ) : (
            <View style={[s.lista, !mobile && s.listaSite]}>
              {enderecos.map((endereco) => (
                <CardEndereco
                  key={endereco.id}
                  endereco={endereco}
                  mobile={mobile}
                  confirmando={pendente === endereco.id}
                  onEditar={() => abrirEdicao(endereco)}
                  onPedirExclusao={() => setPendente(endereco.id)}
                  onCancelar={() => setPendente(null)}
                  onExcluir={() => excluir(endereco)}
                  onPadrao={() => tornarPadrao(endereco.id)}
                />
              ))}
            </View>
          )}

          {mobile && enderecos.length > 0 && (
            <Pressable
              onPress={abrirNovo}
              style={({ pressed }) => [
                s.botaoAdicionar,
                s.botaoAdicionarMobile,
                pressed && s.pressionado,
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="add-outline" size={20} color={DOURADO} />
              <Text style={s.textoAdicionar}>Adicionar novo endereço</Text>
            </Pressable>
          )}

          <FormEndereco
            visivel={formVisivel}
            inicial={editando}
            onFechar={() => setFormVisivel(false)}
            onSalvar={salvar}
          />
        </View>
      )}
    </LayoutConta>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },
  areaFechar: { flex: 1 },

  conteudo: { ...ALTURA_AUTO, gap: 16 },
  barra: { flexDirection: 'row', justifyContent: 'flex-end' },

  lista: { ...ALTURA_AUTO, gap: 14 },
  listaSite: { flexDirection: 'row', flexWrap: 'wrap' },

  card: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 240,
    gap: 12,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 12,
  },
  cardMobile: { ...ALTURA_AUTO, minWidth: 0, borderRadius: 14 },
  cardPadrao: { borderColor: '#59431f', backgroundColor: '#1c1a14' },

  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeCirculo: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 166, 58, 0.12)',
    borderRadius: 19,
  },
  cardTitulos: { flex: 1, minWidth: 0, gap: 4 },
  cardTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardTituloMobile: { fontSize: 17 },
  selo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(212, 166, 58, 0.12)',
    borderRadius: 10,
  },
  textoSelo: { color: DOURADO, fontSize: 11 },

  cardCorpo: {
    gap: 3,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  linhaPrincipal: { color: '#fff', fontSize: 13 },
  linhaPrincipalMobile: { fontSize: 15 },
  linhaSecundaria: { color: '#a5a5a5', fontSize: 12 },
  linhaSecundariaMobile: { fontSize: 13 },

  cardAcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 8,
  },
  acaoExcluir: { borderColor: '#5a2f2b' },
  textoAcao: { color: DOURADO, fontSize: 12 },
  textoExcluir: { color: '#ff8a80' },

  textoConfirmar: { flexBasis: '100%', color: '#fff', fontSize: 13 },
  confirmacao: { flexDirection: 'row', gap: 8 },
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

  botaoAdicionar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  botaoAdicionarMobile: {
    minHeight: 48,
    backgroundColor: '#1d1b16',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  textoAdicionar: { color: DOURADO, fontSize: 13, fontWeight: '600' },

  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#292929',
    borderRadius: 14,
  },
  vazioIcone: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 166, 58, 0.12)',
    borderRadius: 32,
  },
  vazioTitulo: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  vazioTexto: { marginBottom: 6, color: '#a5a5a5', fontSize: 13, textAlign: 'center' },

  /* modal */
  modalFundo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalCaixa: {
    maxHeight: '92%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#59431f',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  modalTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalCorpo: { gap: 14, padding: 16 },

  tipos: { flexDirection: 'row', gap: 8 },
  tipo: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 10,
  },
  tipoAtivo: { backgroundColor: '#29231a', borderColor: DOURADO },
  textoTipo: { color: '#aaa', fontSize: 13 },
  textoTipoAtivo: { color: DOURADO, fontWeight: '600' },

  campo: { gap: 6 },
  campoPequeno: { flex: 1 },
  campoGrande: { flex: 2 },
  linhaCampos: { flexDirection: 'row', gap: 10 },
  rotuloCampo: { color: '#a5a5a5', fontSize: 13 },
  input: {
    height: 46,
    paddingHorizontal: 12,
    color: '#eee',
    fontSize: 16,
    backgroundColor: '#0d0d0e',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  linhaPadrao: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  textoPadrao: { color: '#eee', fontSize: 14 },
  erro: { color: '#ff8a80', fontSize: 13, fontWeight: '600' },

  modalRodape: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  botaoCancelar: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
  },
  textoCancelar: { color: '#ccc', fontSize: 14 },
  botaoSalvar: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  textoSalvar: { color: '#111', fontSize: 15, fontWeight: 'bold' },
});