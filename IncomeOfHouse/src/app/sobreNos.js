import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cabecalho, Rodape, DOURADO, LARGO } from '../components/Comuns';

const FUNDO = require('../../assets/images/BackGroundSobre.png');

const ESTATISTICAS = [
  { icone: 'people-outline', numero: '+500', texto: 'Profissionais cadastrados' },
  { icone: 'home-outline', numero: '+1200', texto: 'Plantas disponíveis' },
  { icone: 'checkbox-outline', numero: '+3000', texto: 'Projetos realizados' },
];

const VALORES = [
  {
    icone: 'shield-checkmark-outline',
    titulo: 'Confiança',
    texto: 'Garantimos segurança em cada etapa, conectando você aos melhores profissionais.',
  },
  {
    icone: 'leaf-outline',
    titulo: 'Sustentabilidade',
    texto: 'Incentivamos práticas que valorizam a natureza e o futuro do planeta.',
  },
  {
    icone: 'trophy-outline',
    titulo: 'Qualidade',
    texto: 'Trabalhamos com excelência para entregar o melhor em cada detalhe.',
  },
  {
    icone: 'heart-outline',
    titulo: 'Paixão',
    texto: 'Somos movidos pelo amor ao design, à natureza e às boas conexões.',
  },
];

export default function Sobre() {
  const { width, height } = useWindowDimensions();
  const largo = width >= LARGO;
  const medio = width >= 600;

  const tamanhoTitulo = largo ? 50 : Math.min(44, width * 0.1);
  const larguraValor = largo ? '23%' : medio ? '48%' : '100%';

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Cabeçalho + Quem somos, sobre a foto de fundo */}
      <ImageBackground
        source={FUNDO}
        style={[styles.hero, largo && { minHeight: Math.max(height, 700) }]}
        imageStyle={styles.heroImagem}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <Cabecalho translucido />

        <View style={[styles.corpo, largo && styles.corpoLargo]}>
          <View style={styles.texto}>
            <View style={styles.etiquetaLinha}>
              <View style={styles.traco} />
              <Text style={styles.etiquetaTexto}>SOBRE NÓS</Text>
              <View style={styles.traco} />
            </View>

            <Text
              style={[
                styles.titulo,
                { fontSize: tamanhoTitulo, lineHeight: tamanhoTitulo * 1.15 },
              ]}
            >
              Quem Somos <Text style={styles.tituloDestaque}>nós?</Text>
            </Text>

            <Text style={styles.paragrafo}>
              A Income Of Houses é uma plataforma dedicada a conectar pessoas à
              natureza. Oferecemos uma seleção de plantas de alta qualidade e
              reunimos profissionais especializados em paisagismo e jardinagem
              para transformar ambientes com praticidade, confiança e excelência.
            </Text>

            <Text style={styles.paragrafo}>
              Nosso compromisso é proporcionar uma experiência simples, segura e
              inspiradora, ajudando você a criar espaços mais verdes, acolhedores
              e cheios de vida.
            </Text>
          </View>

          {/* Estatísticas: três colunas no celular, linha no desktop */}
          <View style={[styles.estatisticas, largo && styles.estatisticasLargo]}>
            {ESTATISTICAS.map((e) => (
              <View
                key={e.numero}
                style={largo ? styles.estatisticaLarga : styles.estatistica}
                accessible
                accessibilityLabel={`${e.numero} ${e.texto}`}
              >
                <Ionicons name={e.icone} size={largo ? 30 : 26} color={DOURADO} />
                <View>
                  <Text style={[styles.estNumero, !largo && styles.centrado]}>{e.numero}</Text>
                  <Text style={[styles.estTexto, !largo && styles.centrado]}>{e.texto}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>

      {/* Nossos valores */}
      <View style={[styles.valores, largo && styles.valoresLargo]}>
        <View style={[styles.etiquetaLinha, styles.centro]}>
          <View style={styles.traco} />
          <Text style={styles.etiquetaTexto}>NOSSOS VALORES</Text>
          <View style={styles.traco} />
        </View>

        <Text style={[styles.tituloValores, largo && styles.tituloValoresLargo]}>
          O que nos move
        </Text>

        <View style={styles.valoresGrid}>
          {VALORES.map((v) => (
            <View key={v.titulo} style={[styles.valorCard, { width: larguraValor }]}>
              <View style={styles.valorIcone}>
                <Ionicons name={v.icone} size={20} color={DOURADO} />
              </View>
              <Text style={styles.valorTitulo}>{v.titulo}</Text>
              <Text style={styles.valorTexto}>{v.texto}</Text>
            </View>
          ))}
        </View>
      </View>

      <Rodape />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0d0d0d' },
  conteudo: { flexGrow: 1 },

  // Primeira seção
  hero: { width: '100%', backgroundColor: '#000' },
  heroImagem: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.62)' },

  // Quem somos
  corpo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    gap: 32,
  },
  corpoLargo: { paddingHorizontal: 115, paddingBottom: 140, gap: 40 },
  texto: { maxWidth: 520 },

  etiquetaLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  centro: { justifyContent: 'center' },
  traco: { width: 40, height: 1, backgroundColor: '#6b5a36' },
  etiquetaTexto: { color: DOURADO, fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },

  titulo: { color: '#ffffff', fontWeight: '900' },
  tituloDestaque: { color: DOURADO },
  paragrafo: { color: '#e8e8e8', fontSize: 15, lineHeight: 26, marginTop: 16 },

  // Estatísticas
  estatisticas: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(12, 12, 12, 0.92)',
    borderWidth: 1,
    borderColor: '#2f2a1e',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  estatisticasLargo: {
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    gap: 50,
    paddingHorizontal: 34,
    paddingVertical: 26,
  },
  estatistica: { flex: 1, alignItems: 'center', gap: 8 },
  estatisticaLarga: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  estNumero: { color: '#ffffff', fontSize: 19, fontWeight: '800' },
  estTexto: { color: '#cfcfcf', fontSize: 11, lineHeight: 15, marginTop: 2 },
  centrado: { textAlign: 'center' },

  // Nossos valores
  valores: {
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  valoresLargo: { paddingVertical: 70, paddingHorizontal: 24 },
  tituloValores: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 32,
  },
  tituloValoresLargo: { fontSize: 36, marginBottom: 44 },
  valoresGrid: {
    width: '100%',
    maxWidth: 1300,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  valorCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 22,
  },
  valorIcone: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#2a2418',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorTitulo: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 18 },
  valorTexto: { color: '#b0b0b0', fontSize: 14, lineHeight: 22, marginTop: 10 },
});