import React from 'react';
import { View, Image, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Cabecalho, Rodape } from './Comuns';

/**
 * Estrutura padrão de TODA tela do app:
 *   [ fundo fixo atrás ]  +  rolagem( cabeçalho → conteúdo → rodapé )
 *
 * - O rodapé é sempre o último item e nunca sobra área abaixo dele.
 * - Se o conteúdo for curto, o miolo cresce e empurra o rodapé para o fim da tela.
 */
export default function Pagina({
  children,
  fundo,               // require(...) opcional: imagem fixa atrás da página
  escurecer = 0.5,     // 0 a 1: quanto escurecer a imagem de fundo
  comCabecalho = true,
  translucido = false, // cabeçalho semitransparente sobre o fundo
  comRodape = true,
  menuAtivo,           // rota do item do menu a destacar (ex.: '/planta'); padrão = rota atual
  estiloMiolo,         // estilo extra do bloco de conteúdo
}) {
  return (
    <View style={s.raiz}>
      <StatusBar barStyle="light-content" />

      {fundo && (
        <>
          <Image source={fundo} style={s.fundo} resizeMode="cover" />
          <View style={[s.fundo, { backgroundColor: `rgba(0,0,0,${escurecer})` }]} />
        </>
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {comCabecalho && <Cabecalho translucido={translucido} ativo={menuAtivo} />}

        {/* flexGrow: 1 faz o miolo ocupar o espaço que sobra */}
        <View style={[s.miolo, estiloMiolo]}>{children}</View>

        {comRodape && <Rodape />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0a0a0a' },
  fundo: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudo: { flexGrow: 1 },
  miolo: { flexGrow: 1 },
});