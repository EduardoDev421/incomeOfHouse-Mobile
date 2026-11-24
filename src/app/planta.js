import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabaseClient } from '../services/supabase.js';
import { useConta } from '../components/ContaProvider';
import { Ionicons } from '@expo/vector-icons';
import {
  Cabecalho,
  Rodape,
  Seletor,
  Paginacao,
  Vazio,
} from '../components/Comuns.js';

/* ------------------------------------------------------------------ */
/* CONSTANTES                                                          */
/* ------------------------------------------------------------------ */
const OURO = '#d4af6a';
const POR_PAGINA = 6;

// Copie BackGroundPlantasEProfissionais.png da pasta img do site web
// para assets/images/ antes de rodar.
const FUNDO = require('../../assets/images/BackGroundPlantasEProfissionais.png');
const CASA = require('../../assets/images/casa.png');

const GAP_FILTROS_X = 30;
const GAP_FILTROS_Y = 22;
const GAP_CARDS = 24;

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

// Ordem igual à do site: Projetos, Quartos, Garagens / Área, Estilo, Pesquisar
const CAMPOS = [
  { chave: 'tipo', rotulo: 'Projetos', icone: 'home-outline', opcoes: OPCOES_TIPO },
  { chave: 'quartos', rotulo: 'Quartos', icone: 'bed-outline', opcoes: OPCOES_QUARTOS },
  { chave: 'garagem', rotulo: 'Garagens', icone: 'car-outline', opcoes: OPCOES_GARAGEM },
  { chave: 'area', rotulo: 'Área construída', icone: 'resize-outline', opcoes: OPCOES_AREA },
  { chave: 'estilo', rotulo: 'Estilo', icone: 'color-palette-outline', opcoes: OPCOES_ESTILO },
];

const FILTROS_VAZIOS = { tipo: '', quartos: '', garagem: '', area: '', estilo: '' };

/* ------------------------------------------------------------------ */
/* FUNÇÕES AUXILIARES                                                  */
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

// Mesmos pontos de quebra do site: 3 colunas, 2 (até 1000px), 1 (até 640px)
const colunasPorLargura = (w) => (w >= 1000 ? 3 : w >= 640 ? 2 : 1);

// Largura de cada célula de uma grade, a partir da largura medida do contêiner
const larguraCelula = (total, colunas, gap) => {
  if (!total) return '100%';
  if (colunas === 1) return total;
  return Math.floor((total - gap * (colunas - 1)) / colunas);
};

const moeda = (v) =>
  'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function Plantas() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useConta();
  const largo = width >= 1000;
  const colunas = colunasPorLargura(width);

  const rolar = useRef(null);
  const pos = useRef({ pagina: 0, lista: 0 });

  const [plantas, setPlantas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [favoritos, setFavoritos] = useState([]);
  const [alterandoFavorito, setAlterandoFavorito] = useState(null);
  const [larguraGrade, setLarguraGrade] = useState(0);
  const [larguraLista, setLarguraLista] = useState(0);

  useEffect(() => {
    let ativo = true;
    async function carregarPlantas() {
      try {
        setCarregando(true);
        setErro('');
        const supabase = getSupabaseClient();
        const { data, error: erroConsulta } = await supabase
          .from('plantas').select('*').eq('ativa', true)
          .order('criado_em', { ascending: false });
        if (erroConsulta) throw erroConsulta;
        if (ativo) setPlantas((data || []).map((row) => ({
          id: row.id, nome: row.nome, tipo: row.categoria,
          quartos: Number(row.quartos) || 0, garagens: Number(row.garagem) || 0,
          area: Number(row.area) || 0, estilo: row.estilo || '',
          foto: row.imagem_url ? { uri: row.imagem_url } : null, preco: row.preco,
        })));
      } catch (e) {
        console.error('Erro ao carregar plantas:', e);
        if (ativo) setErro('Não foi possível carregar as plantas. Tente novamente mais tarde.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregarPlantas();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregarFavoritos() {
      if (!user?.id) { setFavoritos([]); return; }
      try {
        const { data, error } = await getSupabaseClient().from('plantas_favoritas')
          .select('planta_id').eq('usuario_id', user.id);
        if (error) throw error;
        if (ativo) setFavoritos((data || []).map((item) => String(item.planta_id)));
      } catch (falha) {
        console.error('Erro ao carregar favoritos das plantas:', falha);
      }
    }
    carregarFavoritos();
    return () => { ativo = false; };
  }, [user?.id]);

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

  const alternarFavorito = async (id) => {
    if (!user?.id) { router.push('/login'); return; }
    const chave = String(id);
    if (alterandoFavorito === chave) return;
    setAlterandoFavorito(chave);
    try {
      const supabase = getSupabaseClient();
      if (favoritos.includes(chave)) {
        const { error } = await supabase.from('plantas_favoritas')
          .delete().eq('usuario_id', user.id).eq('planta_id', id);
        if (error) throw error;
        setFavoritos((lista) => lista.filter((item) => item !== chave));
      } else {
        const { error } = await supabase.from('plantas_favoritas')
          .insert({ usuario_id: user.id, planta_id: id });
        if (error && error.code !== '23505') throw error;
        setFavoritos((lista) => lista.includes(chave) ? lista : [...lista, chave]);
      }
    } catch (falha) {
      console.error('Erro ao favoritar planta:', falha);
      setErro('Não foi possível atualizar o favorito. Verifique sua conexão e tente novamente.');
    } finally {
      setAlterandoFavorito(null);
    }
  };

  const ativos = Object.values(aplicados).filter(Boolean).length;
  const resultado = filtrar(plantas, aplicados);
  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  const visiveis = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const celulaFiltro = larguraCelula(larguraGrade, colunas, GAP_FILTROS_X);
  const larguraCard = larguraCelula(larguraLista, colunas, GAP_CARDS);

  return (
    <ScrollView
      ref={rolar}
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.corpo}>
        {/* Fundo com as folhas e as linhas douradas (igual ao site) */}
        <Image source={FUNDO} style={styles.fundo} resizeMode="cover" />

        <Cabecalho />

        {/* Hero */}
        <View style={[styles.hero, styles.contenedor]}>
          <View style={styles.etiqueta}>
            <View style={styles.etiquetaLinha} />
            <Text style={styles.etiquetaTexto}>PLANTAS</Text>
            <View style={styles.etiquetaLinha} />
          </View>

          <View style={styles.tituloBloco}>
            <Text style={[styles.titulo, !largo && styles.tituloPequeno]}>
              Encontre o projeto{'\n'}perfeito para você
            </Text>
            <View style={styles.tituloBarra} />
          </View>

          <Text style={styles.heroTexto}>
            Explore nossa coleção de plantas arquitetônicas e filtre por suas
            preferências para encontrar o projeto ideal.
          </Text>
        </View>

        <View
          style={[styles.pagina, styles.contenedor]}
          onLayout={(e) => (pos.current.pagina = e.nativeEvent.layout.y)}
        >
          {/* Card de filtros */}
          <View style={styles.filtros}>
            <View
              style={styles.filtrosGrade}
              onLayout={(e) => setLarguraGrade(e.nativeEvent.layout.width)}
            >
              {CAMPOS.map((c) => (
                <View key={c.chave} style={[styles.celula, { width: celulaFiltro }]}>
                  <Seletor
                    rotulo={c.rotulo}
                    icone={c.icone}
                    valor={filtros[c.chave]}
                    opcoes={c.opcoes}
                    aoMudar={mudar(c.chave)}
                  />
                </View>
              ))}

              <View style={[styles.celula, { width: celulaFiltro }]}>
                <Pressable
                  onPress={pesquisar}
                  style={({ pressed }) => [styles.btnPesquisar, pressed && styles.pressionado]}
                  accessibilityRole="button"
                  accessibilityLabel="Pesquisar"
                >
                  <Ionicons name="search-outline" size={18} color="#111" />
                  <Text style={styles.btnPesquisarTexto}>Pesquisar</Text>
                </Pressable>
              </View>
            </View>

            {ativos > 0 && (
              <Pressable onPress={limpar} hitSlop={8} style={styles.limpar} accessibilityRole="button">
                <Text style={styles.limparTexto}>Limpar filtros</Text>
              </Pressable>
            )}
          </View>

          {/* Mensagem + lista */}
          <View onLayout={(e) => (pos.current.lista = e.nativeEvent.layout.y)}>
            {carregando ? (
              <Text style={styles.semPlantas}>Carregando plantas...</Text>
            ) : erro ? (
              <Text style={styles.semPlantas}>{erro}</Text>
            ) : plantas.length === 0 ? (
              <Text style={styles.semPlantas}>Nenhuma planta disponível no momento.</Text>
            ) : resultado.length === 0 ? (
              <Vazio texto="Nenhum projeto encontrado com esses filtros." aoLimpar={limpar} />
            ) : (
              <>
                <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                  {resultado.length} {resultado.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
                </Text>

                <View
                  style={styles.lista}
                  onLayout={(e) => setLarguraLista(e.nativeEvent.layout.width)}
                >
                  {visiveis.map((p) => {
                    const favorito = favoritos.includes(String(p.id));
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
                              size={17}
                              color={favorito ? OURO : '#ffffff'}
                            />
                          </Pressable>
                        </View>

                        <View style={styles.cardCorpo}>
                          <Text style={styles.cardNome} numberOfLines={1}>
                            {p.nome}
                          </Text>

                          <View style={styles.tags}>
                            <View style={styles.tag}>
                              <Text style={styles.tagTexto}>{p.tipo}</Text>
                            </View>
                            <View style={styles.tag}>
                              <Text style={styles.tagTexto}>{p.estilo}</Text>
                            </View>
                          </View>

                          <View style={styles.specs}>
                            <View style={styles.spec}>
                              <Ionicons name="bed-outline" size={15} color={OURO} />
                              <Text style={styles.specTexto}>{p.quartos}</Text>
                            </View>
                            <View style={styles.spec}>
                              <Ionicons name="car-outline" size={15} color={OURO} />
                              <Text style={styles.specTexto}>{p.garagens}</Text>
                            </View>
                            <View style={styles.spec}>
                              <Ionicons name="resize-outline" size={15} color={OURO} />
                              <Text style={styles.specTexto}>{p.area} m²</Text>
                            </View>
                          </View>

                          {p.preco != null && <Text style={styles.preco}>{moeda(p.preco)}</Text>}

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

          {resultado.length > 0 && (
            <Paginacao pagina={pagina} total={totalPaginas} aoMudar={irParaPagina} />
          )}
        </View>
      </View>

      <Rodape />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* ESTILOS                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  conteudo: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  // Fundo
  // Cresce para ocupar o espaço livre (sem usar flex: 1, que zeraria o flex-basis)
  // e assim o rodapé fica sempre no final da página
  corpo: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    backgroundColor: '#0b0b0b',
    overflow: 'hidden',
  },
  fundo: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

  // Contêiner central (90% da largura, máx. 1300)
  contenedor: { width: '90%', maxWidth: 1300, alignSelf: 'center' },

  // Hero
  hero: { paddingTop: 56, paddingBottom: 10 },
  etiqueta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  etiquetaLinha: { width: 40, height: 1, backgroundColor: 'rgba(212, 175, 106, 0.5)' },
  etiquetaTexto: { color: OURO, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },

  tituloBloco: { alignSelf: 'flex-start', paddingBottom: 14, marginBottom: 16 },
  titulo: { color: '#f5f5f5', fontSize: 40, fontWeight: '800', lineHeight: 48 },
  tituloPequeno: { fontSize: 30, lineHeight: 36 },
  tituloBarra: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 46,
    height: 3,
    backgroundColor: OURO,
    borderRadius: 2,
  },
  heroTexto: { color: '#c7c7c7', fontSize: 14, lineHeight: 24 },

  // Página
  pagina: { paddingTop: 22, paddingBottom: 36 },

  // Card de filtros
  filtros: {
    padding: 26,
    paddingHorizontal: 30,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  filtrosGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    columnGap: GAP_FILTROS_X,
    rowGap: GAP_FILTROS_Y,
  },
  // Em linha para o Seletor ocupar a largura da célula sem colapsar a altura
  celula: { flexDirection: 'row' },
  btnPesquisar: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: OURO,
    borderRadius: 8,
  },
  btnPesquisarTexto: { color: '#111', fontSize: 14, fontWeight: '700' },
  limpar: { alignSelf: 'flex-start', marginTop: 16 },
  limparTexto: { color: OURO, fontSize: 13, textDecorationLine: 'underline' },

  // Mensagem + lista
  mensagem: { color: '#a3a3a3', fontSize: 13, marginTop: 30, marginBottom: 6, minHeight: 22 },
  semPlantas: { color: '#a3a3a3', fontSize: 13, marginTop: 30, marginBottom: 40 },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP_CARDS, paddingVertical: 20 },

  // Card
  card: {
    minWidth: 0,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardImagem: { width: '100%', height: 210, backgroundColor: '#0e0e0e' },
  favorito: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    borderRadius: 17,
  },
  cardCorpo: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 },
  cardNome: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 10 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(212, 175, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 106, 0.35)',
    borderRadius: 999,
  },
  tagTexto: { color: OURO, fontSize: 11.5, fontWeight: '600' },

  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 14 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  specTexto: { color: '#a3a3a3', fontSize: 12.5 },

  preco: { color: OURO, fontSize: 19, fontWeight: '700', marginBottom: 16 },

  btnDetalhes: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 106, 0.4)',
    borderRadius: 8,
  },
  btnDetalhesTexto: { color: OURO, fontSize: 13, fontWeight: '600' },
});