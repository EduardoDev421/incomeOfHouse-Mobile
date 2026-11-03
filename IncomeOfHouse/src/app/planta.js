import React, { useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Cabecalho,
  Rodape,
  Seletor,
  PainelFiltros,
  Paginacao,
  Vazio,
  DOURADO,
  LARGO,
} from '../components/Comuns.js';

const POR_PAGINA = 6;
const FUNDO = require('../../assets/images/fundo-casa.png');
const CASA = require('../../assets/images/casa.png');

/* ------------------------------------------------------------------ */
/* DADOS DE EXEMPLO                                                    */
/* Troque por seus dados reais (API/banco). Cada planta precisa ter:   */
/* id, nome, tipo, quartos, garagens, area, estilo                     */
/* Opcional: foto (require('...') ou { uri: '...' })                   */
/* ------------------------------------------------------------------ */
const PLANTAS = [
  { id: 1, nome: 'Casa Moderna Aurora', tipo: 'Sobrado', quartos: 4, garagens: 3, area: 320, estilo: 'Moderno' },
  { id: 2, nome: 'Residência Horizonte', tipo: 'Casa Térrea', quartos: 3, garagens: 2, area: 180, estilo: 'Contemporâneo' },
  { id: 3, nome: 'Casa Minimal', tipo: 'Casa Térrea', quartos: 2, garagens: 1, area: 95, estilo: 'Minimalista' },
  { id: 4, nome: 'Sobrado Jardins', tipo: 'Sobrado', quartos: 3, garagens: 2, area: 210, estilo: 'Clássico' },
  { id: 5, nome: 'Casa de Campo Serra', tipo: 'Casa de Campo', quartos: 5, garagens: 4, area: 450, estilo: 'Rústico' },
  { id: 6, nome: 'Studio Urbano', tipo: 'Kitnet / Studio', quartos: 1, garagens: 0, area: 45, estilo: 'Industrial' },
  { id: 7, nome: 'Casa Tropical Brisa', tipo: 'Casa de Praia', quartos: 4, garagens: 2, area: 260, estilo: 'Tropical' },
  { id: 8, nome: 'Edícula Gourmet', tipo: 'Edícula', quartos: 1, garagens: 1, area: 55, estilo: 'Escandinavo' },
  { id: 9, nome: 'Residência Neoclássica', tipo: 'Casa de Condomínio', quartos: 5, garagens: 4, area: 520, estilo: 'Neoclássico' },
];

/* ------------------------------------------------------------------ */
/* OPÇÕES DOS FILTROS                                                  */
/* ------------------------------------------------------------------ */
const GRUPOS_TIPO = {
  Residencial: ['Casa Térrea', 'Sobrado', 'Casa Geminada', 'Casa de Condomínio', 'Casa de Campo', 'Casa de Praia', 'Chácara', 'Sítio', 'Fazenda'],
  Apartamentos: ['Apartamento', 'Kitnet / Studio', 'Loft', 'Cobertura'],
  'Construções Especiais': ['Edícula', 'Casa de Madeira', 'Casa Pré-Fabricada', 'Casa Modular'],
  Comercial: ['Loja', 'Sala Comercial', 'Escritório', 'Galpão', 'Prédio Comercial'],
  Industrial: ['Galpão Industrial', 'Fábrica', 'Centro de Distribuição'],
  Lazer: ['Área de Lazer', 'Espaço Gourmet', 'Salão de Festas', 'Área de Piscina'],
  Projetos: ['Projeto Residencial', 'Projeto Comercial', 'Projeto Industrial', 'Projeto Arquitetônico'],
};

const OPCOES_TIPO = [{ label: 'Todos os projetos', valor: '' }];
Object.keys(GRUPOS_TIPO).forEach((grupo) => {
  OPCOES_TIPO.push({ grupo });
  GRUPOS_TIPO[grupo].forEach((t) => OPCOES_TIPO.push({ label: t, valor: t }));
});

const OPCOES_QUARTOS = [
  { label: 'Todos', valor: '' },
  { label: '1 quarto', valor: '1' },
  { label: '2 quartos', valor: '2' },
  { label: '3 quartos', valor: '3' },
  { label: '4 quartos', valor: '4' },
  { label: '5+ quartos', valor: '5+' },
];

const OPCOES_GARAGEM = [
  { label: 'Todas', valor: '' },
  { label: 'Sem garagem', valor: '0' },
  { label: '1 vaga', valor: '1' },
  { label: '2 vagas', valor: '2' },
  { label: '3 vagas', valor: '3' },
  { label: '4+ vagas', valor: '4+' },
];

const OPCOES_AREA = [
  { label: 'Todas as áreas', valor: '' },
  { label: 'Até 60 m²', valor: '0-60' },
  { label: '60 a 100 m²', valor: '60-100' },
  { label: '100 a 150 m²', valor: '100-150' },
  { label: '150 a 200 m²', valor: '150-200' },
  { label: '200 a 300 m²', valor: '200-300' },
  { label: '300 a 500 m²', valor: '300-500' },
  { label: 'Acima de 500 m²', valor: '500-' },
];

const OPCOES_ESTILO = [
  { label: 'Todos os estilos', valor: '' },
  ...['Moderno', 'Contemporâneo', 'Minimalista', 'Clássico', 'Neoclássico', 'Colonial', 'Rústico', 'Industrial', 'Escandinavo', 'Tropical'].map(
    (e) => ({ label: e, valor: e })
  ),
];

const FILTROS_VAZIOS = { tipo: '', quartos: '', garagem: '', area: '', estilo: '' };

/* ------------------------------------------------------------------ */
/* LÓGICA DE FILTRO                                                    */
/* ------------------------------------------------------------------ */
function filtrar(lista, f) {
  return lista.filter((p) => {
    if (f.tipo && p.tipo !== f.tipo) return false;

    if (f.quartos) {
      if (f.quartos === '5+') {
        if (p.quartos < 5) return false;
      } else if (p.quartos !== Number(f.quartos)) return false;
    }

    if (f.garagem) {
      if (f.garagem === '4+') {
        if (p.garagens < 4) return false;
      } else if (p.garagens !== Number(f.garagem)) return false;
    }

    if (f.area) {
      const [min, max] = f.area.split('-');
      const minimo = Number(min) || 0;
      const maximo = max === '' ? Infinity : Number(max);
      if (p.area < minimo || p.area > maximo) return false;
    }

    if (f.estilo && p.estilo !== f.estilo) return false;

    return true;
  });
}

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function Plantas() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const largo = width >= LARGO;
  const medio = width >= 600;

  const rolar = useRef(null);
  const pos = useRef({ pagina: 0, lista: 0 });

  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [favoritos, setFavoritos] = useState([]);

  const mudar = (campo) => (valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  const pesquisar = () => {
    setAplicados(filtros);
    setPagina(1);
  };

  const limpar = () => {
    setFiltros(FILTROS_VAZIOS);
    setAplicados(FILTROS_VAZIOS);
    setPagina(1);
  };

  const irParaPagina = (n) => {
    setPagina(n);
    rolar.current?.scrollTo({
      y: Math.max(0, pos.current.pagina + pos.current.lista - 12),
      animated: true,
    });
  };

  const alternarFavorito = (id) =>
    setFavoritos((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const ativos = Object.values(aplicados).filter(Boolean).length;
  const resultado = filtrar(PLANTAS, aplicados);
  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  const visiveis = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const larguraCard = largo ? '31.8%' : medio ? '48%' : '100%';

  return (
    <ScrollView
      ref={rolar}
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      <Cabecalho />

      {/* Hero */}
      <ImageBackground source={FUNDO} style={styles.hero} imageStyle={styles.heroImagem} resizeMode="cover">
        <View style={styles.heroOverlay} />
        <View style={[styles.heroConteudo, largo && styles.heroConteudoLargo]}>
          <View style={styles.etiqueta}>
            <Text style={styles.etiquetaTexto}>Plantas</Text>
          </View>
          <Text style={[styles.heroTitulo, largo && styles.heroTituloLargo]}>
            Encontre o projeto{'\n'}perfeito para você
          </Text>
          <Text style={styles.heroTexto}>
            Explore nossa coleção de plantas arquitetônicas e filtre por suas
            preferências para encontrar o projeto ideal.
          </Text>
        </View>
      </ImageBackground>

      <View
        style={styles.pagina}
        onLayout={(e) => (pos.current.pagina = e.nativeEvent.layout.y)}
      >
        <PainelFiltros ativos={ativos} aoPesquisar={pesquisar} aoLimpar={limpar}>
          <Seletor rotulo="Projetos" icone="home-outline" valor={filtros.tipo} opcoes={OPCOES_TIPO} aoMudar={mudar('tipo')} />
          <Seletor rotulo="Quartos" icone="bed-outline" valor={filtros.quartos} opcoes={OPCOES_QUARTOS} aoMudar={mudar('quartos')} />
          <Seletor rotulo="Garagens" icone="car-outline" valor={filtros.garagem} opcoes={OPCOES_GARAGEM} aoMudar={mudar('garagem')} />
          <Seletor rotulo="Área construída" icone="resize-outline" valor={filtros.area} opcoes={OPCOES_AREA} aoMudar={mudar('area')} />
          <Seletor rotulo="Estilo" icone="color-palette-outline" valor={filtros.estilo} opcoes={OPCOES_ESTILO} aoMudar={mudar('estilo')} />
        </PainelFiltros>

        <View onLayout={(e) => (pos.current.lista = e.nativeEvent.layout.y)}>
          {resultado.length === 0 ? (
            <Vazio texto="Nenhum projeto encontrado com esses filtros." aoLimpar={limpar} />
          ) : (
            <>
              <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                {resultado.length} {resultado.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
              </Text>

              <View style={styles.lista}>
                {visiveis.map((p) => {
                  const favorito = favoritos.includes(p.id);
                  return (
                    <View key={p.id} style={[styles.card, { width: larguraCard }]}>
                      <View>
                        <Image source={p.foto ?? CASA} style={styles.cardImagem} resizeMode="cover" />
                        <Pressable
                          style={styles.favorito}
                          onPress={() => alternarFavorito(p.id)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Favoritar'}
                        >
                          <Ionicons
                            name={favorito ? 'heart' : 'heart-outline'}
                            size={18}
                            color={favorito ? DOURADO : '#ffffff'}
                          />
                        </Pressable>
                      </View>

                      <View style={styles.cardCorpo}>
                        <Text style={styles.cardTipo}>{p.tipo}</Text>
                        <Text style={styles.cardNome}>{p.nome}</Text>

                        <View style={styles.specs}>
                          <View style={styles.spec}>
                            <Ionicons name="bed-outline" size={15} color={DOURADO} />
                            <Text style={styles.specTexto}>{p.quartos}</Text>
                          </View>
                          <View style={styles.spec}>
                            <Ionicons name="car-outline" size={15} color={DOURADO} />
                            <Text style={styles.specTexto}>{p.garagens}</Text>
                          </View>
                          <View style={styles.spec}>
                            <Ionicons name="resize-outline" size={15} color={DOURADO} />
                            <Text style={styles.specTexto}>{p.area} m²</Text>
                          </View>
                        </View>

                        <Text style={styles.cardEstilo}>Estilo {p.estilo}</Text>

                        <Pressable
                          style={({ pressed }) => [styles.btnDetalhes, pressed && styles.pressionado]}
                          accessibilityRole="button"
                          onPress={() =>
                            router.push({ pathname: '/detalhesPlantas', params: { id: String(p.id) } })
                          }
                        >
                          <Text style={styles.btnDetalhesTexto}>Ver detalhes</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <Paginacao pagina={pagina} total={totalPaginas} aoMudar={irParaPagina} />
      </View>

      <Rodape />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0a0a0a' },
  conteudo: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  // Hero
  hero: { width: '100%', backgroundColor: '#000' },
  heroImagem: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  heroConteudo: { paddingHorizontal: 24, paddingVertical: 36 },
  heroConteudoLargo: { paddingHorizontal: 150, paddingVertical: 70 },
  etiqueta: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#6b5a36',
    backgroundColor: '#1c1a14',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  etiquetaTexto: { color: DOURADO, fontSize: 12, fontWeight: 'bold' },
  heroTitulo: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 38 },
  heroTituloLargo: { fontSize: 46, lineHeight: 54 },
  heroTexto: { color: '#d8d8d8', fontSize: 15, lineHeight: 24, marginTop: 14, maxWidth: 520 },

  // Página
  pagina: {
    width: '100%',
    maxWidth: 1190,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  mensagem: { color: '#b5b5b5', fontSize: 14, marginTop: 22, marginBottom: 14 },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },

  // Card
  card: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardImagem: { width: '100%', height: 180, backgroundColor: '#1a1a1a' },
  favorito: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCorpo: { padding: 18 },
  cardTipo: { color: DOURADO, fontSize: 12, fontWeight: 'bold' },
  cardNome: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  specs: { flexDirection: 'row', gap: 18, marginTop: 12 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  specTexto: { color: '#d0d0d0', fontSize: 13 },
  cardEstilo: { color: '#8a8a8a', fontSize: 13, marginTop: 10 },
  btnDetalhes: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#6b5a36',
    backgroundColor: '#1c1a14',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDetalhesTexto: { color: DOURADO, fontWeight: 'bold', fontSize: 14 },
});