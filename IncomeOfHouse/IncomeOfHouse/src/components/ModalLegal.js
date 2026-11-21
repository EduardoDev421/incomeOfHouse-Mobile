import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { LEGAL } from '../constants/conteudoLegal';

const DOURADO = '#d4af6a';

// Na web a camada fica "fixed" (presa à janela do navegador);
// no celular nativo ela cobre a tela inteira do app.
const POSICAO =
  Platform.OS === 'web'
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
    : StyleSheet.absoluteFillObject;

export default function ModalLegal({ aba, onFechar, onTrocarAba }) {
  const scrollRef = useRef(null);
  const janelaTela = useWindowDimensions();
  const [caixa, setCaixa] = useState(null); // tamanho real da camada
  const visivel = aba !== null;             // null = fechado
  const dados = LEGAL[aba ?? 'termos'];

  // largura/altura reais da camada (cai para o tamanho da tela até medir)
  const larguraBase = caixa?.w ?? janelaTela.width;
  const alturaBase = caixa?.h ?? janelaTela.height;
  const larguraJanela = Math.max(240, Math.min(780, larguraBase - 32));
  const alturaMaxima = alturaBase * 0.86;

  // volta ao topo ao trocar de aba
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [aba]);

  // fecha com Esc (web) e com o botão voltar (Android)
  useEffect(() => {
    if (!visivel) return undefined;

    if (Platform.OS === 'web') {
      const aoTecla = (e) => {
        if (e.key === 'Escape') onFechar();
      };
      document.addEventListener('keydown', aoTecla);
      return () => document.removeEventListener('keydown', aoTecla);
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onFechar();
      return true;
    });
    return () => sub.remove();
  }, [visivel, onFechar]);

  if (!visivel) return null;

  return (
    <Pressable
      style={[styles.overlay, POSICAO]}
      onPress={onFechar}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setCaixa({ w: width, h: height });
      }}
      accessibilityViewIsModal
    >
      {/* Janela: este Pressable impede que o toque "vaze" para o fundo */}
      <Pressable
        style={[styles.janela, { width: larguraJanela, maxHeight: alturaMaxima }]}
        onPress={() => {}}
      >
        {/* Cabeçalho */}
        <View style={styles.topo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{dados.titulo}</Text>
            <View style={styles.traco} />
            <Text style={styles.data}>{dados.atualizacao}</Text>
          </View>
          <Pressable
            onPress={onFechar}
            style={styles.fechar}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            hitSlop={8}
          >
            <Text style={styles.fecharX}>×</Text>
          </Pressable>
        </View>

        {/* Abas */}
        <View style={styles.abas}>
          {['termos', 'privacidade'].map((chave) => {
            const ativa = chave === aba;
            return (
              <Pressable
                key={chave}
                onPress={() => onTrocarAba(chave)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                style={[styles.aba, ativa && styles.abaAtiva]}
              >
                <Text style={[styles.abaTexto, ativa && styles.abaTextoAtivo]}>
                  {LEGAL[chave].titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Corpo que rola */}
        <ScrollView
          ref={scrollRef}
          style={styles.corpo}
          contentContainerStyle={styles.corpoConteudo}
          showsVerticalScrollIndicator={false}
        >
          {dados.secoes.map((s) => (
            <View key={s.titulo} style={styles.secao}>
              <Text style={styles.secaoTitulo}>{s.titulo}</Text>

              {s.textos?.map((t, i) => (
                <Text key={i} style={styles.texto}>
                  {t}
                  {/* link inline no fim do último parágrafo */}
                  {s.link && i === s.textos.length - 1 && (
                    <>
                      <Text
                        style={styles.link}
                        accessibilityRole="link"
                        onPress={() => onTrocarAba(s.link.destino)}
                      >
                        {' '}{s.link.rotulo}
                      </Text>
                      {s.link.depois}
                    </>
                  )}
                </Text>
              ))}

              {s.itens?.map((item, i) => (
                <View key={i} style={styles.itemLinha}>
                  <View style={styles.bolinha} />
                  <Text style={[styles.texto, { flex: 1, marginBottom: 0 }]}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Pressable
            onPress={onFechar}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botao, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.botaoTexto}>Entendi</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'rgba(5,5,5,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // largura e altura máxima vêm do tamanho medido da camada
  janela: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  topo: { flexDirection: 'row', gap: 16, padding: 22, paddingBottom: 14 },
  titulo: { color: '#f5f5f5', fontSize: 22, fontWeight: '800' },
  traco: { width: 46, height: 3, backgroundColor: DOURADO, borderRadius: 2, marginTop: 10 },
  data: { color: '#a3a3a3', fontSize: 12.5, marginTop: 10 },
  fechar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecharX: { color: '#e6e6e6', fontSize: 20, lineHeight: 22 },

  abas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  aba: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  abaAtiva: { backgroundColor: DOURADO, borderColor: DOURADO },
  abaTexto: { color: '#cccccc', fontSize: 13, fontWeight: '600' },
  abaTextoAtivo: { color: '#111111' },

  corpo: { flexGrow: 0, flexShrink: 1, minHeight: 0 },
  corpoConteudo: { padding: 18, paddingHorizontal: 22, gap: 14 },
  secao: {
    backgroundColor: '#0e0e0e',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secaoTitulo: { color: '#f5f5f5', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  texto: { color: '#c7c7c7', fontSize: 13.5, lineHeight: 22, marginBottom: 8 },
  link: { color: DOURADO, textDecorationLine: 'underline' },
  itemLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 3 },
  bolinha: { width: 6, height: 6, borderRadius: 3, backgroundColor: DOURADO, marginTop: 8 },

  rodape: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 14,
    paddingHorizontal: 22,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  botao: { backgroundColor: DOURADO, paddingVertical: 11, paddingHorizontal: 28, borderRadius: 8 },
  botaoTexto: { color: '#111111', fontWeight: '700', fontSize: 14 },
});