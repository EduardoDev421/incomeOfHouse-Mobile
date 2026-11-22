import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ImageBackground,
  Modal, StyleSheet, useWindowDimensions, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cabecalho, Rodape } from './Comuns';

export const dourado = '#c9a45c';

// Tons usados na versão web desta tela
const DOURADO_TITULO = '#cfa835';
const DOURADO_BOTAO = '#d4af6a';
const DOURADO_BORDA = '#cda432';

// >>> Copie a foto para assets/images/ (caminho relativo a ESTE arquivo)
const FUNDO = require('../../assets/images/BackGroundCadastroELogin.png');

// Áreas exibidas abaixo do parágrafo: [nome, ícone Ionicons]
const ITENS_MINI = [
  ['Arquitetura', 'home-outline'],
  ['Engenharia', 'construct-outline'],
  ['Design', 'color-palette-outline'],
  ['Paisagismo', 'leaf-outline'],
];

/* ------------------------------------------------------------------ */
/* Responsividade                                                      */
/* mobile = celular em pé | medio = celular deitado/tablet | largo = site */
/* ------------------------------------------------------------------ */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const mobile = width < 650;
  const medio = !mobile && (width < 1000 || height < 500);
  return { mobile, medio, largo: !mobile && !medio, width, height };
}

/* ------------------------------------------------------------------ */
/* Máscaras                                                            */
/* ------------------------------------------------------------------ */
export const maskCPF = (t) => {
  const d = t.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const maskTelefone = (t) => {
  const d = t.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const maskData = (t) => {
  const d = t.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/* ------------------------------------------------------------------ */
/* Validações                                                          */
/* ------------------------------------------------------------------ */
export const validarEmail = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim());

// telefone com DDD: 10 dígitos (fixo) ou 11 (celular)
export const validarTelefone = (t) => {
  const d = t.replace(/\D/g, '');
  return d.length === 10 || d.length === 11;
};

// confere os dois dígitos verificadores do CPF
export const validarCPF = (t) => {
  const d = t.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (tam) => {
    let soma = 0;
    for (let i = 0; i < tam; i++) soma += Number(d[i]) * (tam + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
};

// dd/mm/aaaa: a data precisa existir, não pode ser futura e ser de 1900 em diante
export const validarData = (t) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  if (!m) return false;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const data = new Date(ano, mes - 1, dia);
  return (
    ano >= 1900 &&
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= new Date()
  );
};

/* ------------------------------------------------------------------ */
/* "Arquitetura / Engenharia / Design / Paisagismo"                    */
/* Caixas com ícone dourado e o nome embaixo                           */
/* ------------------------------------------------------------------ */
function MiniCards() {
  const { mobile } = useLayout();

  return (
    <View style={[a.miniCards, mobile && a.miniCardsMobile]}>
      {ITENS_MINI.map(([nome, icone]) => (
        <View key={nome} style={a.miniCard}>
          <View style={a.imgCard}>
            <Ionicons name={icone} size={mobile ? 20 : 24} color={dourado} />
          </View>
          <Text style={a.miniTexto}>{nome}</Text>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Tela base: fundo + cabeçalho + (apresentação | cartão) + rodapé     */
/* O cabeçalho e o rodapé são os mesmos das telas principais (Comuns). */
/* ------------------------------------------------------------------ */
export function AuthTela({ titulo, destaque, texto, miniCards = false, children }) {
  const { mobile, medio } = useLayout();

  return (
    <ImageBackground source={FUNDO} style={a.fundo} resizeMode="cover">
      <View style={a.sombra} pointerEvents="none" />

      <KeyboardAvoidingView
        style={a.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={a.pagina}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Cabecalho translucido />

          <View
            style={[
              a.principal,
              medio && a.principalMedio,
              mobile && a.principalMobile,
            ]}
          >
            {/* Lado esquerdo: apresentação */}
            <View style={[a.intro, medio && a.introMedio, mobile && a.introMobile]}>
              <Text style={[a.h1, medio && a.h1Medio, mobile && a.h1Mobile]}>
                {titulo}
                <Text style={a.destaque}>{destaque}</Text>
              </Text>

              {/* No celular o formulário vem primeiro, sem o parágrafo no meio */}
              {!mobile && <Text style={[a.paragrafo, medio && a.paragrafoMedio]}>{texto}</Text>}

              {miniCards && <MiniCards />}
            </View>

            {/* Lado direito: cartão do formulário */}
            <View
              style={[
                a.cartao,
                medio && a.cartaoMedio,
                mobile && a.cartaoMobile,
              ]}
            >
              {children}
            </View>
          </View>

          <Rodape />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

/* ------------------------------------------------------------------ */
/* Peças do formulário                                                 */
/* ------------------------------------------------------------------ */
export function CartaoTitulo({ titulo, subtitulo }) {
  const { mobile } = useLayout();
  return (
    <View style={a.cartaoCabecalho}>
      <Text style={[a.cartaoTitulo, mobile && a.cartaoTituloMobile]}>{titulo}</Text>
      <Text style={[a.cartaoSubtitulo, mobile && a.cartaoSubtituloMobile]}>{subtitulo}</Text>
    </View>
  );
}

// Duas colunas em tela larga/deitada; empilhado no celular em pé
export function Linha({ children }) {
  const { mobile } = useLayout();
  return (
    <View style={[a.linha, !mobile && a.linhaLarga]}>
      {React.Children.map(children, (filho) => (
        <View style={!mobile && a.coluna}>{filho}</View>
      ))}
    </View>
  );
}

// "icone" é opcional: sem ele o campo fica sem ícone (como na web)
export function Campo({
  icone, rotulo, valor, aoMudar, placeholder,
  senha = false, mascara, ...resto
}) {
  const { mobile } = useLayout();
  const [foco, setFoco] = useState(false);
  const [ver, setVer] = useState(false);

  return (
    <View style={a.grupo}>
      <Text style={[a.rotulo, mobile && a.rotuloMobile]}>{rotulo}</Text>
      <View style={[a.campo, foco && a.campoFoco]}>
        {!!icone && <Ionicons name={icone} size={18} color={DOURADO_BOTAO} />}
        <TextInput
          // 16px no celular evita o zoom automático ao tocar no campo (iOS)
          style={[a.input, mobile && a.inputMobile]}
          value={valor}
          onChangeText={(t) => aoMudar(mascara ? mascara(t) : t)}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          secureTextEntry={senha && !ver}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          accessibilityLabel={rotulo}
          {...resto}
        />
        {senha && (
          <Pressable
            onPress={() => setVer(!ver)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={ver ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={ver ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#aaa"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// Campo de seleção (abre uma folha na parte de baixo).
// opcoes = [[valor, rótulo], ...]
export function Seletor({ icone, rotulo, valor, aoMudar, opcoes, placeholder }) {
  const { mobile } = useLayout();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const escolhido = opcoes.find(([v]) => v === valor);

  return (
    <View style={a.grupo}>
      <Text style={[a.rotulo, mobile && a.rotuloMobile]}>{rotulo}</Text>

      <Pressable
        style={[a.campo, aberto && a.campoFoco]}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${escolhido ? escolhido[1] : placeholder}`}
      >
        {!!icone && <Ionicons name={icone} size={18} color={DOURADO_BOTAO} />}
        <Text
          style={[a.input, a.textoSelecao, !escolhido && { color: '#737373' }]}
          numberOfLines={1}
        >
          {escolhido ? escolhido[1] : placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#aaa" />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={a.modalFundo} onPress={() => setAberto(false)}>
          <Pressable
            style={[
              a.modalCaixa,
              { maxHeight: height * 0.75, paddingBottom: insets.bottom },
            ]}
            onPress={() => {}}
          >
            <View style={a.modalTopo}>
              <Text style={a.modalTitulo}>{rotulo}</Text>
              <Pressable
                onPress={() => setAberto(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close-outline" size={26} color={dourado} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {opcoes.map(([v, nome]) => (
                <Pressable
                  key={v}
                  style={[a.opcao, v === valor && a.opcaoAtiva]}
                  onPress={() => {
                    aoMudar(v);
                    setAberto(false);
                  }}
                >
                  <Text style={[a.opcaoTexto, v === valor && { color: dourado }]}>
                    {nome}
                  </Text>
                  {v === valor && (
                    <Ionicons name="checkmark-outline" size={18} color={dourado} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function CaixaErro({ texto }) {
  if (!texto) return null;
  return (
    <View style={a.caixaErro} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={16} color="#ff7777" />
      <Text style={a.erro}>{texto}</Text>
    </View>
  );
}

// desativado: use enquanto estiver enviando, para evitar toque duplo
export function Botao({ texto, aoPressionar, desativado = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        a.botao,
        (pressed || desativado) && a.botaoApagado,
      ]}
      onPress={aoPressionar}
      disabled={desativado}
      accessibilityRole="button"
    >
      <Text style={a.textoBotao}>{texto}</Text>
    </Pressable>
  );
}

export function Divisor({ texto }) {
  return (
    <View style={a.divisor}>
      <View style={a.divisorLinha} />
      <Text style={a.divisorTexto}>{texto}</Text>
      <View style={a.divisorLinha} />
    </View>
  );
}

// "Lembrou sua senha? Entrar"
export function LinkConta({ pergunta, acao, aoPressionar }) {
  return (
    <Pressable onPress={aoPressionar} hitSlop={8} accessibilityRole="link">
      <Text style={a.linkConta}>
        {pergunta} <Text style={a.linkContaAcao}>{acao}</Text>
      </Text>
    </Pressable>
  );
}

// Botão contornado (ex.: "Quero me cadastrar como profissional")
export function LinkContorno({ texto, aoPressionar }) {
  return (
    <Pressable
      style={({ pressed }) => [a.linkContorno, pressed && a.botaoApagado]}
      onPress={aoPressionar}
      accessibilityRole="button"
    >
      <Text style={a.linkContornoTexto}>{texto}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */
const a = StyleSheet.create({
  flex: { flex: 1 },
  fundo: { flex: 1, backgroundColor: '#090909' },
  // escurecimento leve para a foto aparecer como na web
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pagina: { flexGrow: 1 },

  // ----- Área principal -----
  principal: {
    flexGrow: 1, flexShrink: 0, flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 60,
    paddingHorizontal: '8%', paddingTop: 60, paddingBottom: 60,
  },
  principalMedio: { gap: 24, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 24 },
  principalMobile: {
    flexDirection: 'column', alignItems: 'stretch',
    justifyContent: 'flex-start', gap: 22,
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32,
  },

  // ----- Apresentação (lado esquerdo) -----
  intro: { flex: 1, minWidth: 0, paddingLeft: 20, paddingRight: 40 },
  introMedio: { paddingLeft: 0, paddingRight: 0 },
  introMobile: {
    flexGrow: 0, flexShrink: 0, flexBasis: 'auto',
    width: '100%', maxWidth: '100%', padding: 0,
  },
  h1: { color: '#f5f5f5', fontSize: 50, fontWeight: 'bold', lineHeight: 60 },
  h1Medio: { fontSize: 32, lineHeight: 38 },
  h1Mobile: { fontSize: 30, lineHeight: 36 },
  destaque: { color: DOURADO_TITULO },
  paragrafo: {
    maxWidth: 380, marginTop: 12, color: '#f0f0f0', fontSize: 17,
    fontWeight: '500', lineHeight: 25,
    textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  paragrafoMedio: { fontSize: 14, lineHeight: 21 },

  // ----- Mini cards -----
  miniCards: { flexDirection: 'row', gap: 10, marginTop: 22 },
  miniCardsMobile: { marginTop: 16, gap: 8 },
  miniCard: {
    flex: 1, alignItems: 'center', gap: 8, paddingVertical: 12,
    paddingHorizontal: 4, backgroundColor: 'rgba(23,23,23,0.9)',
    borderWidth: 1, borderColor: '#292929', borderRadius: 10,
  },
  imgCard: {
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#594823', borderRadius: 10,
  },
  miniTexto: { color: '#fff', fontSize: 11, textAlign: 'center' },

  // ----- Cartão (lado direito) -----
  cartao: {
    width: 500, maxWidth: '100%', paddingVertical: 40, paddingHorizontal: 45,
    backgroundColor: '#0a0a0a', borderWidth: 2, borderColor: DOURADO_BORDA,
    borderRadius: 20,
  },
  cartaoMedio: { flex: 1, width: undefined, paddingVertical: 24, paddingHorizontal: 24 },
  cartaoMobile: { width: '100%', paddingVertical: 28, paddingHorizontal: 22, flexShrink: 0 },
  cartaoCabecalho: { alignItems: 'center', marginBottom: 24 },
  cartaoTitulo: { color: '#f5f5f5', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
  cartaoTituloMobile: { fontSize: 24 },
  cartaoSubtitulo: {
    marginTop: 10, color: '#a3a3a3', fontSize: 18, textAlign: 'center',
  },
  cartaoSubtituloMobile: { fontSize: 15 },

  // ----- Grade -----
  linha: { flexDirection: 'column' },
  linhaLarga: { flexDirection: 'row', gap: 14 },
  coluna: { flex: 1, minWidth: 0 },

  // ----- Campos -----
  grupo: { marginBottom: 20 },
  rotulo: { color: '#e5e5e5', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  rotuloMobile: { fontSize: 14 },
  campo: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#363636',
    borderRadius: 6, backgroundColor: '#0d0d0d',
  },
  campoFoco: { borderColor: DOURADO_BORDA },
  input: {
    flex: 1, minWidth: 0, color: '#e5e5e5', fontSize: 15, paddingVertical: 10,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  inputMobile: { fontSize: 16 },
  textoSelecao: { paddingVertical: 0 },
  caixaErro: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10,
    marginBottom: 10, borderWidth: 1, borderColor: '#5a2b2b',
    backgroundColor: '#241414', borderRadius: 8,
  },
  erro: { color: '#ff9a9a', fontSize: 13, flex: 1 },

  // ----- Botões, divisor e links -----
  botao: {
    minHeight: 52, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, paddingHorizontal: 20,
    backgroundColor: DOURADO_BOTAO, borderRadius: 10,
  },
  botaoApagado: { opacity: 0.7 },
  textoBotao: { color: '#111', fontSize: 15, fontWeight: 'bold' },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 30, marginBottom: 24 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: '#333' },
  divisorTexto: { color: '#777', fontSize: 12 },
  linkConta: { color: '#e5e5e5', textAlign: 'center', fontSize: 15, fontWeight: 'bold' },
  linkContaAcao: { color: DOURADO_BOTAO, fontWeight: 'bold' },
  linkContorno: {
    minHeight: 44, alignItems: 'center', justifyContent: 'center',
    marginTop: 12, padding: 9, borderWidth: 1, borderColor: dourado,
    backgroundColor: '#292929', borderRadius: 8,
  },
  linkContornoTexto: { color: dourado, fontSize: 13 },

  // ----- Seletor (folha na parte de baixo) -----
  modalFundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end',
  },
  modalCaixa: {
    width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: '#111',
    borderWidth: 1, borderColor: '#333', borderTopLeftRadius: 18,
    borderTopRightRadius: 18, overflow: 'hidden',
  },
  modalTopo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderColor: dourado,
  },
  modalTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  opcao: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#262626',
  },
  opcaoAtiva: { backgroundColor: '#252117' },
  opcaoTexto: { color: '#eee', fontSize: 14, flex: 1 },
});