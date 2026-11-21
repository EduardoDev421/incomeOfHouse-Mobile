import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLegal } from '../components/LegalProvider';

// Este arquivo está em src/app/index.js.
// '../../assets' = pasta assets na RAIZ do projeto.
// Se a sua pasta assets estiver dentro de src, troque por '../assets'.
const LOGO = require('../../assets/images/Logo.png');
const FUNDO = require('../../assets/images/fundo-casa.png');

const DOURADO = '#c9a45c';
const ALTURA_TOPO = 78;

const menu = [
  { rotulo: 'Início', rota: '/' },
  { rotulo: 'Plantas', rota: '/planta' },
  { rotulo: 'Profissionais', rota: '/profissionais' },
  { rotulo: 'Sobre Nós', rota: '/sobreNos' },
];

const destaques = [
  {
    icone: 'folder-open-outline',
    titulo: 'Diversidade de Projetos',
    texto:
      'Explore plantas residenciais com diferentes tamanhos, distribuições e características para encontrar opções que atendam às suas necessidades.',
  },
  {
    icone: 'people-outline',
    titulo: 'Conheça Profissionais',
    texto:
      'Descubra profissionais da arquitetura e construção civil e conheça seus trabalhos e projetos publicados na plataforma.',
  },
  {
    icone: 'ribbon-outline',
    titulo: 'Encontre Seu Projeto',
    texto:
      'Compare características, explore diferentes plantas e descubra os projetos que combinam com o que você procura.',
  },
];

function ItemMenu({ rotulo, ativo, largo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
      style={({ pressed }) => [
        largo ? styles.item : styles.itemMobile,
        ativo && styles.itemAtivo,
        pressed && styles.pressionado,
      ]}
    >
      <Text style={[styles.textoItem, ativo && styles.textoAtivo]}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const rotaAtual = usePathname();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { abrirLegal } = useLegal();
  const largo = width >= 900;
  const [menuAberto, setMenuAberto] = useState(false);

  const navegar = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const itensMenu = menu.map((item) => (
    <ItemMenu
      key={item.rota}
      rotulo={item.rotulo}
      ativo={rotaAtual === item.rota}
      largo={largo}
      onPress={() => navegar(item.rota)}
    />
  ));

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Cabeçalho */}
      <View style={[styles.topo, { paddingTop: insets.top }]}>
        <View style={[styles.barra, largo && styles.barraLarga]}>
          <Pressable
            onPress={() => navegar('/')}
            accessibilityRole="button"
            accessibilityLabel="Ir para o início"
          >
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </Pressable>

          {largo && <View style={styles.menuLargo}>{itensMenu}</View>}

          <View style={styles.acoes}>
            <Pressable
              onPress={() => navegar('/login')}
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressionado}
            >
              <Ionicons
                name="person-circle-outline"
                size={largo ? 42 : 36}
                color={DOURADO}
              />
            </Pressable>

            {!largo && (
              <Pressable
                onPress={() => setMenuAberto((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.botaoMenu,
                  pressed && styles.pressionado,
                ]}
              >
                <Ionicons
                  name={menuAberto ? 'close' : 'menu'}
                  size={28}
                  color="#ffffff"
                />
              </Pressable>
            )}
          </View>
        </View>

        {!largo && menuAberto && (
          <View style={styles.menuMobile}>{itensMenu}</View>
        )}
      </View>

      {/* Hero */}
      <ImageBackground
        source={FUNDO}
        style={[
          styles.fundo,
          largo && { minHeight: Math.max(height - ALTURA_TOPO, 640) },
        ]}
        imageStyle={styles.imagemFundo}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.hero}>
          <View style={[styles.textos, largo && styles.textosLargo]}>
            <Text
              style={[
                styles.titulo,
                {
                  fontSize: largo ? 64 : Math.min(48, width * 0.12),
                  lineHeight: largo ? 62 : Math.min(48, width * 0.12) * 1.1,
                },
              ]}
            >
              ENCONTRE.{'\n'}
              PROJETE.{'\n'}
              <Text style={styles.destaque}>REALIZE.</Text>
            </Text>

            <Text style={styles.descricao}>
              Descubra projetos arquitetônicos residenciais, explore diferentes
              modelos de plantas e conheça profissionais para transformar seus
              planos em realidade.
            </Text>

            <View style={[styles.botoes, largo && styles.botoesLargo]}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.botaoCriar,
                  pressed && styles.pressionado,
                ]}
                onPress={() => navegar('/planta')}
              >
                <Text style={styles.textoBotaoCriar}>Explorar Plantas</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.botaoLogar,
                  pressed && styles.pressionado,
                ]}
                onPress={() => navegar('/profissionais')}
              >
                <Text style={styles.textoBotaoLogar}>Conhecer Profissionais</Text>
              </Pressable>
            </View>
          </View>

          {/* Cards de destaque */}
          <View style={[styles.cards, largo && styles.cardsLargo]}>
            {destaques.map((d) => (
              <View
                key={d.titulo}
                style={[styles.card, largo && styles.cardLargo]}
              >
                <View style={styles.cardIcone}>
                  <Ionicons name={d.icone} size={24} color={DOURADO} />
                </View>
                <View style={styles.cardTextos}>
                  <Text style={styles.tituloCard}>{d.titulo}</Text>
                  <Text style={styles.textoCard}>{d.texto}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>

      {/* Rodapé */}
      <View
        style={[
          styles.rodape,
          largo && styles.rodapeLargo,
          { paddingBottom: 20 + insets.bottom },
        ]}
      >
        <Text style={styles.textoRodape}>
          © 2026 IncomeOfHouse. Todos os direitos reservados.
        </Text>
        <View style={styles.linksRodape}>
          <Pressable
            onPress={() => abrirLegal('termos')}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.linkRodape}>Termos de Uso</Text>
          </Pressable>
          <Text style={styles.separador}>|</Text>
          <Pressable
            onPress={() => abrirLegal('privacidade')}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.linkRodape}>Política de Privacidade</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  conteudo: {
    flexGrow: 1,
  },

  pressionado: {
    opacity: 0.75,
  },

  // Cabeçalho
  topo: {
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    zIndex: 10,
  },

  barra: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  barraLarga: {
    height: ALTURA_TOPO,
    paddingHorizontal: 140,
  },

  logo: {
    width: 90,
    height: 48,
  },

  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  botaoMenu: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLargo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuMobile: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 6,
  },

  item: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  itemMobile: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  itemAtivo: {
    borderColor: '#6b5a36',
    backgroundColor: '#1c1a14',
  },

  textoItem: {
    color: '#ffffff',
    fontSize: 15,
  },

  textoAtivo: {
    color: DOURADO,
  },

  // Hero
  fundo: {
    width: '100%',
    backgroundColor: '#000000',
  },

  imagemFundo: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  hero: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },

  textos: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
  },

  textosLargo: {
    paddingHorizontal: 150,
  },

  titulo: {
    color: '#ffffff',
    fontWeight: '900',
  },

  destaque: {
    color: DOURADO,
  },

  descricao: {
    color: '#e6e6e6',
    fontSize: 16,
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 28,
    maxWidth: 480,
  },

  botoes: {
    gap: 12,
  },

  botoesLargo: {
    flexDirection: 'row',
    gap: 14,
  },

  botaoCriar: {
    backgroundColor: DOURADO,
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 8,
    alignItems: 'center',
  },

  textoBotaoCriar: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 15,
  },

  botaoLogar: {
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 8,
    alignItems: 'center',
  },

  textoBotaoLogar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Cards
  cards: {
    paddingHorizontal: 24,
    gap: 12,
  },

  cardsLargo: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    maxWidth: 1190,
    alignSelf: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(12, 12, 12, 0.88)',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  cardLargo: {
    flex: 1,
    paddingVertical: 22,
    paddingHorizontal: 24,
  },

  cardIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 164, 92, 0.12)',
  },

  cardTextos: {
    flex: 1,
  },

  tituloCard: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  textoCard: {
    color: '#b5b5b5',
    fontSize: 13,
    lineHeight: 19,
  },

  // Rodapé
  rodape: {
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: DOURADO,
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },

  rodapeLargo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 140,
  },

  textoRodape: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
  },

  linksRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  linkRodape: {
    color: DOURADO,
    fontSize: 13,
  },

  separador: {
    color: '#555555',
  },
});