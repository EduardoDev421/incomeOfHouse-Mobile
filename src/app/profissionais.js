import React, { useRef, useState } from 'react';
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
import { PROFISSIONAIS } from '../constants/profissionais';

const POR_PAGINA = 6;
const FUNDO = require('../../assets/images/BackGroundPlantasEProfissionais.png');

/* ------------------------------------------------------------------ */
/* OPÇÕES DOS FILTROS (iguais às do site)                              */
/* ------------------------------------------------------------------ */
const PROFISSOES = [
  ['arquiteto', 'Arquiteto(a)'],
  ['arquiteto-urbanista', 'Arquiteto(a) e Urbanista'],
  ['urbanista', 'Urbanista'],
  ['engenheiro-civil', 'Engenheiro(a) Civil'],
  ['engenheiro-eletrico', 'Engenheiro(a) Eletricista'],
  ['engenheiro-mecanico', 'Engenheiro(a) Mecânico(a)'],
  ['engenheiro-sanitarista', 'Engenheiro(a) Sanitarista'],
  ['engenheiro-ambiental', 'Engenheiro(a) Ambiental'],
  ['designer-de-interiores', 'Designer de Interiores'],
  ['desenhista-projetista', 'Desenhista Projetista'],
  ['desenhista-cadista', 'Desenhista CAD'],
  ['projetista-arquitetonico', 'Projetista Arquitetônico'],
  ['projetista-de-edificacoes', 'Projetista de Edificações'],
  ['tecnico-em-edificacoes', 'Técnico(a) em Edificações'],
  ['modelador-3d', 'Modelador(a) 3D'],
  ['artista-3d', 'Artista 3D'],
  ['renderizador-3d', 'Renderizador(a) 3D'],
  ['especialista-bim', 'Especialista BIM'],
  ['coordenador-bim', 'Coordenador(a) BIM'],
  ['projetista-eletrico', 'Projetista Elétrico'],
  ['projetista-hidraulico', 'Projetista Hidráulico'],
  ['projetista-estrutural', 'Projetista Estrutural'],
  ['projetista-sanitario', 'Projetista Sanitário'],
  ['projetista-de-incendio', 'Projetista de Prevenção contra Incêndio'],
  ['projetista-de-climatizacao', 'Projetista de Climatização'],
  ['calculista-estrutural', 'Calculista Estrutural'],
  ['tecnico-em-construcao', 'Técnico(a) em Construção Civil'],
  ['tecnico-em-estruturas', 'Técnico(a) em Estruturas'],
  ['topografo', 'Topógrafo(a)'],
  ['tecnico-em-topografia', 'Técnico(a) em Topografia'],
  ['agrimensor', 'Agrimensor(a)'],
  ['paisagista', 'Paisagista'],
  ['projetista-de-paisagismo', 'Projetista de Paisagismo'],
  ['planejador-de-obras', 'Planejador(a) de Obras'],
  ['gestor-de-projetos', 'Gestor(a) de Projetos'],
  ['compatibilizador-de-projetos', 'Compatibilizador(a) de Projetos'],
  ['consultor-em-arquitetura', 'Consultor(a) em Arquitetura'],
  ['consultor-em-projetos', 'Consultor(a) em Projetos'],
];

const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];

const EXPERIENCIAS = [8, 9, 10, 12, 15, 18];
const AVALIACOES = [5, 4.9, 4.8, 4.7];

const TODAS = { label: 'Todas', valor: '' };
const TODOS = { label: 'Todos', valor: '' };
const OPCOES_PROFISSAO = [TODAS, ...PROFISSOES.map(([v, l]) => ({ label: l, valor: v }))];
const OPCOES_ESTADO = [TODOS, ...ESTADOS.map(([v, l]) => ({ label: l, valor: v }))];
const OPCOES_EXPERIENCIA = [TODAS, ...EXPERIENCIAS.map((n) => ({ label: `${n} anos`, valor: String(n) }))];
const OPCOES_AVALIACAO = [TODAS, ...AVALIACOES.map((n) => ({ label: `${n.toFixed(1)} ou mais`, valor: String(n) }))];

const NOME_ESTADO = Object.fromEntries(ESTADOS);

/* ------------------------------------------------------------------ */
/* DADOS DE EXEMPLO (nomes fictícios)                                  */
/* Troque por seus dados reais (API/banco). Cada profissional precisa  */
/* ter: id, nome, profissao (valor da lista), estado (UF), anos,       */
/* avaliacao. Opcional: foto (require('...') ou { uri: '...' })        */
/* ------------------------------------------------------------------ */
const FILTROS_VAZIOS = { profissao: '', estado: '', experiencia: '', avaliacao: '' };

/* ------------------------------------------------------------------ */
/* LÓGICA DE FILTRO                                                    */
/* ------------------------------------------------------------------ */
function filtrar(lista, f) {
  return lista.filter((p) => {
    if (f.profissao && p.profissao !== f.profissao) return false;
    if (f.estado && p.estado !== f.estado) return false;
    if (f.experiencia && p.anos !== Number(f.experiencia)) return false;
    // Avaliação: mostra quem tem nota igual ou maior que a escolhida
    if (f.avaliacao && p.avaliacao < Number(f.avaliacao)) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function Profissionais() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const largo = width >= LARGO;
  const medio = width >= 600;
  const compacto = !medio; // no celular o cartão vira uma linha horizontal

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
  const resultado = filtrar(PROFISSIONAIS, aplicados);
  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  const visiveis = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const larguraCard = largo ? '31.8%' : '48%';

  return (
    <View style={styles.raiz}>
      <StatusBar barStyle="light-content" />

      {/* Fundo da página inteira */}
      <Image source={FUNDO} style={styles.fundoImagem} resizeMode="cover" />
      <View style={styles.fundoOverlay} />

      <ScrollView
        ref={rolar}
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <Cabecalho translucido />

        <View
          style={styles.pagina}
          onLayout={(e) => (pos.current.pagina = e.nativeEvent.layout.y)}
        >
          {/* Título */}
          <View style={styles.etiquetaLinha}>
            <View style={styles.etiquetaTraco} />
            <Text style={styles.etiquetaTexto}>PROFISSIONAIS</Text>
            <View style={styles.etiquetaTraco} />
          </View>

          <Text style={[styles.titulo, largo && styles.tituloLargo]}>
            Encontre um profissional{'\n'}perfeito para você
          </Text>
          <View style={styles.tituloBarra} />
          <Text style={styles.subtitulo}>
            Navegue e encontre o profissional perfeito para seu projeto
          </Text>

          <PainelFiltros ativos={ativos} aoPesquisar={pesquisar} aoLimpar={limpar}>
            <Seletor rotulo="Profissão" icone="person-outline" valor={filtros.profissao} opcoes={OPCOES_PROFISSAO} aoMudar={mudar('profissao')} />
            <Seletor rotulo="Estado" icone="location-outline" valor={filtros.estado} opcoes={OPCOES_ESTADO} aoMudar={mudar('estado')} />
            <Seletor rotulo="Experiência" icone="time-outline" valor={filtros.experiencia} opcoes={OPCOES_EXPERIENCIA} aoMudar={mudar('experiencia')} />
            <Seletor rotulo="Avaliação" icone="star-outline" valor={filtros.avaliacao} opcoes={OPCOES_AVALIACAO} aoMudar={mudar('avaliacao')} />
          </PainelFiltros>

          <View onLayout={(e) => (pos.current.lista = e.nativeEvent.layout.y)}>
            {resultado.length === 0 ? (
              <Vazio texto="Nenhum profissional encontrado com esses filtros." aoLimpar={limpar} />
            ) : (
              <>
                <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                  {resultado.length}{' '}
                  {resultado.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
                </Text>

                <View style={styles.lista}>
                  {visiveis.map((p) => {
                    const favorito = favoritos.includes(p.id);
                    return (
                      <View
                        key={p.id}
                        style={[
                          styles.card,
                          compacto ? styles.cardCompacto : { width: larguraCard },
                        ]}
                      >
                        <View style={[styles.fotoArea, compacto ? styles.fotoCompacta : styles.fotoGrande]}>
                          {p.foto ? (
                            <Image source={p.foto} style={styles.foto} resizeMode="cover" />
                          ) : (
                            <Ionicons name="person" size={compacto ? 40 : 70} color="#333" />
                          )}
                        </View>

                        <View style={[styles.cardCorpo, compacto && styles.corpoCompacto]}>
                          <Text style={styles.cardProfissao} numberOfLines={1}>
                            {p.profissaoNome}
                          </Text>
                          <Text style={styles.cardNome} numberOfLines={1}>
                            {p.nome}
                          </Text>

                          <View style={styles.meta}>
                            <View style={styles.metaItem}>
                              <Ionicons name="location-outline" size={14} color={DOURADO} />
                              <Text style={styles.metaTexto}>
                                {compacto ? p.estado : NOME_ESTADO[p.estado]}
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Ionicons name="time-outline" size={14} color={DOURADO} />
                              <Text style={styles.metaTexto}>{p.anos} anos</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Ionicons name="star" size={14} color={DOURADO} />
                              <Text style={styles.metaTexto}>{p.avaliacao.toFixed(1)}</Text>
                            </View>
                          </View>

                          <Pressable
                            style={({ pressed }) => [
                              styles.btnDetalhes,
                              compacto && styles.btnDetalhesCompacto,
                              pressed && styles.pressionado,
                            ]}
                            accessibilityRole="button"
                            onPress={() =>
                              router.push({
                                pathname: '/detalhesProfissionais',
                                params: { id: String(p.id) },
                              })
                            }
                          >
                            <Text style={styles.btnDetalhesTexto}>Detalhes</Text>
                          </Pressable>
                        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0a0a0a' },
  fundoImagem: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  fundoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudo: { flexGrow: 1 },
  pressionado: { opacity: 0.75 },

  // Conteúdo
  pagina: {
    width: '100%',
    maxWidth: 1300,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 36,
  },

  // Título
  etiquetaLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  etiquetaTraco: { width: 40, height: 1, backgroundColor: '#6b5a36' },
  etiquetaTexto: { color: DOURADO, fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
  titulo: { color: '#ffffff', fontSize: 28, fontWeight: '800', lineHeight: 36 },
  tituloLargo: { fontSize: 34, lineHeight: 40 },
  tituloBarra: {
    width: 46,
    height: 3,
    backgroundColor: DOURADO,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 14,
  },
  subtitulo: { color: '#d8d8d8', fontSize: 14, lineHeight: 22, marginBottom: 20 },

  // Lista
  mensagem: { color: '#c8c8c8', fontSize: 14, marginTop: 22, marginBottom: 14 },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },

  // Card
  card: {
    backgroundColor: 'rgba(22, 22, 22, 0.96)',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardCompacto: { width: '100%', flexDirection: 'row' },
  fotoArea: { backgroundColor: '#1d1d1d', alignItems: 'center', justifyContent: 'center' },
  fotoGrande: { height: 210 },
  fotoCompacta: { width: 100 },
  foto: { width: '100%', height: '100%' },
  favorito: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCorpo: { padding: 18 },
  corpoCompacto: { flex: 1, padding: 14, paddingRight: 56 },
  cardProfissao: { color: DOURADO, fontSize: 12, fontWeight: 'bold' },
  cardNome: { color: '#ffffff', fontSize: 17, fontWeight: 'bold', marginTop: 3 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTexto: { color: '#b5b5b5', fontSize: 12.5 },
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
  btnDetalhesCompacto: { marginTop: 12, height: 38 },
  btnDetalhesTexto: { color: DOURADO, fontWeight: 'bold', fontSize: 13 },
});