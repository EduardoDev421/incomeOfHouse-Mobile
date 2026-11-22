import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLegal } from '../components/LegalProvider';

const DOURADO = '#c9a45c';
const OURO_MENU = '#d4af6a'; // dourado do cabeçalho e do rodapé (igual à web)

// Fundo da página (o mesmo BackGroundPlantasEProfissionais.png da web).
// 1) Copie a imagem do site para src/assets/images/BackGroundPlantasEProfissionais.png
// 2) Troque a linha abaixo por:
//    const FUNDO_PLANTAS = require('../../assets/images/BackGroundPlantasEProfissionais.png');
// Enquanto estiver null, a tela usa o fundo antigo (BackgroundFundo.png).
const FUNDO_PLANTAS = require('../../assets/images/BackGroundPlantasEProfissionais.png');

const FUNDO = require('../../assets/images/BackgroundFundo.png');
const IMAGEM_PADRAO = require('../../assets/images/casa.png');

/* ------------------------------------------------------------------ */
/* DADOS DE EXEMPLO                                                    */
/* O "id" vem da tela de Plantas (botão "Ver detalhes").               */
/* Troque por seus dados reais (API/banco). Campos opcionais por       */
/* planta: imagem, resumo, descricao, distribuicao, destaques.         */
/* ------------------------------------------------------------------ */
const PLANTAS = {
  1: { nome: 'Casa Moderna Aurora', categoria: 'Sobrado', quartos: 4, garagens: 3, banheiros: 5, area: 320, estilo: 'Moderno', preco: 4800, profissional: 2 },
  2: { nome: 'Residência Horizonte', categoria: 'Casa Térrea', quartos: 3, garagens: 2, banheiros: 3, area: 180, estilo: 'Contemporâneo', preco: 3200, profissional: 3 },
  3: { nome: 'Casa Minimal', categoria: 'Casa Térrea', quartos: 2, garagens: 1, banheiros: 2, area: 95, estilo: 'Minimalista', preco: 2200, profissional: 6 },
  4: { nome: 'Sobrado Jardins', categoria: 'Sobrado', quartos: 3, garagens: 2, banheiros: 3, area: 210, estilo: 'Clássico', preco: 3500, profissional: 8 },
  5: { nome: 'Casa de Campo Serra', categoria: 'Casa de Campo', quartos: 5, garagens: 4, banheiros: 5, area: 450, estilo: 'Rústico', preco: 5200, profissional: 1 },
  6: { nome: 'Studio Urbano', categoria: 'Kitnet / Studio', quartos: 1, garagens: 0, banheiros: 1, area: 45, estilo: 'Industrial', preco: 1500, profissional: 3 },
  7: { nome: 'Casa Tropical Brisa', categoria: 'Casa de Praia', quartos: 4, garagens: 2, banheiros: 4, area: 260, estilo: 'Tropical', preco: 4200, profissional: 4 },
  8: { nome: 'Edícula Gourmet', categoria: 'Edícula', quartos: 1, garagens: 1, banheiros: 1, area: 55, estilo: 'Escandinavo', preco: 1800, profissional: 8 },
  9: { nome: 'Residência Neoclássica', categoria: 'Casa de Condomínio', quartos: 5, garagens: 4, banheiros: 6, area: 520, estilo: 'Neoclássico', preco: 6500, profissional: 7 },
};

// Profissionais responsáveis (nomes fictícios; mesmos ids da tela de Profissionais)
const PROFISSIONAIS = {
  1: { nome: 'Carlos Mendes', profissao: 'Engenheiro(a) Civil', nota: 5.0, avaliacoes: 128 },
  2: { nome: 'Ana Beatriz Souza', profissao: 'Arquiteto(a)', nota: 4.9, avaliacoes: 96 },
  3: { nome: 'Rafael Lima', profissao: 'Designer de Interiores', nota: 4.8, avaliacoes: 74 },
  4: { nome: 'Juliana Castro', profissao: 'Paisagista', nota: 4.9, avaliacoes: 61 },
  6: { nome: 'Fernanda Alves', profissao: 'Especialista BIM', nota: 5.0, avaliacoes: 52 },
  7: { nome: 'Paulo Henrique Dias', profissao: 'Projetista Estrutural', nota: 4.8, avaliacoes: 89 },
  8: { nome: 'Camila Rocha', profissao: 'Arquiteto(a) e Urbanista', nota: 4.7, avaliacoes: 67 },
};

const DESTAQUES_PADRAO = [
  'Ambientes integrados',
  'Iluminação natural',
  'Ventilação cruzada',
  'Espaço gourmet',
  'Projeto sustentável',
  'Acabamento de qualidade',
];

const AVALIACAO = {
  cliente: 'Nome do Cliente',
  quando: 'Há 1 ano',
  nota: 5,
  texto:
    'Excelente projeto! Os ambientes são bem distribuídos e o profissional foi muito atencioso durante todo o processo.',
};

const formatarNota = (n) => n.toFixed(1).replace('.', ',');
const formatarPreco = (n) => `R$ ${n.toLocaleString('pt-BR')}`;
const plural = (n, singular, pluralTxt) => `${n} ${n === 1 ? singular : pluralTxt}`;

function Estrelas({ nota, tamanho = 15 }) {
  return (
    <View style={styles.estrelas}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={tamanho}
          color={i < Math.round(nota) ? DOURADO : '#3a3a3a'}
        />
      ))}
    </View>
  );
}

export default function DetalhesPlantas() {
  const router = useRouter();
  const { abrirLegal } = useLegal();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const largo = width >= 900;
  const medio = width >= 600;

  const [favorito, setFavorito] = useState(false);

  const navegar = (rota) => router.push(rota);

  const p = PLANTAS[Number(id)];
  const prof = p ? PROFISSIONAIS[p.profissional] : null;

  const larguraCard = largo ? '31%' : medio ? '48%' : '100%';

  // Fundo da página inteira (a imagem da web não tem véu escuro por cima)
  const fundo = (
    <>
      <Image source={FUNDO_PLANTAS || FUNDO} style={styles.fundoImagem} resizeMode="cover" />
      {!FUNDO_PLANTAS && <View style={styles.fundoOverlay} />}
    </>
  );

  const menuTopo = (
    <View style={[styles.menu, !largo && styles.menuEstreito]}>
      <Pressable style={styles.item} onPress={() => navegar('/')}>
        <Text style={styles.textoItem}>Início</Text>
      </Pressable>
      <Pressable style={styles.itemAtivo} onPress={() => navegar('/planta')}>
        <Text style={styles.textoAtivo}>Plantas</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navegar('/profissionais')}>
        <Text style={styles.textoItem}>Profissionais</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navegar('/sobreNos')}>
        <Text style={styles.textoItem}>Sobre Nós</Text>
      </Pressable>
    </View>
  );

  const botaoPerfil = (
    <Pressable
      style={[styles.perfil, !largo && styles.perfilEstreito]}
      onPress={() => navegar('/login')}
      accessibilityRole="button"
      accessibilityLabel="Entrar"
    >
      <Ionicons name="person-outline" size={20} color={OURO_MENU} />
    </Pressable>
  );

  const cabecalho = (
    <View style={[styles.topo, largo ? styles.topoLargo : styles.topoEstreito]}>
      <Pressable onPress={() => navegar('/')} accessibilityRole="button" accessibilityLabel="Início">
        <Image
          source={require('../../assets/images/Logo.png')}
          style={[styles.logo, largo && styles.logoLargo]}
          resizeMode="contain"
        />
      </Pressable>

      {/* No site o menu fica centralizado na barra, como na web */}
      {largo ? (
        <View style={styles.menuCentro} pointerEvents="box-none">
          {menuTopo}
        </View>
      ) : (
        menuTopo
      )}

      {botaoPerfil}
    </View>
  );

  const rodape = (
    <View style={styles.rodape}>
      <Text style={styles.textoRodape}>©IncomeOfHouses. Todos os direitos reservados.</Text>
      <View style={styles.linksRodape}>
        <Pressable onPress={() => abrirLegal('termos')} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.linkRodape}>Termos de Uso</Text>
        </Pressable>
        <Text style={styles.separadorRodape}>|</Text>
        <Pressable onPress={() => abrirLegal('privacidade')} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.linkRodape}>Política de Privacidade</Text>
        </Pressable>
      </View>
    </View>
  );

  // Planta não encontrada
  if (!p) {
    return (
      <View style={styles.raiz}>
        <StatusBar barStyle="light-content" />
        {fundo}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudo}>
          {cabecalho}
          <View style={styles.principal}>
            <View style={styles.naoEncontrada}>
              <Text style={styles.naoEncontradaTitulo} accessibilityRole="header">
                Planta não encontrada.
              </Text>
              <Text style={styles.naoEncontradaTexto}>
                Volte para a lista de plantas e tente novamente.
              </Text>
            </View>
          </View>
          {rodape}
        </ScrollView>
      </View>
    );
  }

  const resumo =
    p.resumo ||
    `${p.categoria} de estilo ${p.estilo.toLowerCase()} com ${plural(p.quartos, 'quarto', 'quartos')} e ${p.area} m² de área construída.`;

  const descricao =
    p.descricao ||
    `Projeto ${p.estilo.toLowerCase()} do tipo ${p.categoria.toLowerCase()}, pensado para unir conforto, funcionalidade e beleza. Com ${p.area} m² de área construída, oferece ambientes bem distribuídos e integrados, ideais para o dia a dia da família.`;

  const distribuicao =
    p.distribuicao ||
    `Sala de estar e jantar, cozinha, ${plural(p.quartos, 'quarto', 'quartos')}, ${plural(p.banheiros, 'banheiro', 'banheiros')}${
      p.garagens > 0 ? ` e ${plural(p.garagens, 'vaga de garagem', 'vagas de garagem')}` : ''
    }.`;

  const destaques = p.destaques || DESTAQUES_PADRAO;

  const infos = [
    { icone: 'home-outline', titulo: 'Área construída', valor: `${p.area} m²` },
    { icone: 'bed-outline', titulo: 'Quartos', valor: String(p.quartos) },
    { icone: 'car-outline', titulo: 'Vagas de garagem', valor: String(p.garagens) },
    { icone: 'pencil-outline', titulo: 'Estilo', valor: p.estilo },
    { icone: 'water-outline', titulo: 'Banheiros', valor: String(p.banheiros) },
  ];

  return (
    <View style={styles.raiz}>
      <StatusBar barStyle="light-content" />

      {fundo}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudo}>
        {cabecalho}

        <View style={styles.pagina}>
          <Pressable style={styles.voltar} onPress={() => navegar('/planta')}>
            <Ionicons name="arrow-back" size={16} color={DOURADO} />
            <Text style={styles.voltarTexto}>Voltar para plantas</Text>
          </Pressable>

          {/* Início: imagem + painel */}
          <View style={[styles.inicio, largo && styles.inicioLargo]}>
            <View style={[styles.imagemArea, largo && styles.imagemAreaLarga]}>
              <Image
                source={p.imagem || IMAGEM_PADRAO}
                style={styles.imagem}
                resizeMode="cover"
              />
            </View>

            <View style={styles.painel}>
              <View style={styles.pill}>
                <Ionicons name="home-outline" size={14} color={DOURADO} />
                <Text style={styles.pillTexto}>{p.categoria}</Text>
              </View>

              <Text style={[styles.titulo, largo && styles.tituloLargo]}>{p.nome}</Text>
              <Text style={styles.resumo}>{resumo}</Text>
              <Text style={styles.preco}>A partir de {formatarPreco(p.preco)}</Text>

              <View style={styles.cards}>
                {infos.map((i) => (
                  <View key={i.titulo} style={[styles.infoCard, { width: larguraCard }]}>
                    <View style={styles.infoIcone}>
                      <Ionicons name={i.icone} size={18} color={DOURADO} />
                    </View>
                    <Text style={styles.infoTitulo}>{i.titulo}</Text>
                    <Text style={styles.infoValor}>{i.valor}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.botoes}>
                <Pressable
                  style={styles.btnPrincipal}
                  onPress={() => {
                    // TODO: enviar a solicitação do projeto para o seu backend
                  }}
                >
                  <Ionicons name="calendar-outline" size={17} color="#1a1a1a" />
                  <Text style={styles.btnPrincipalTexto}>Solicitar Projeto</Text>
                </Pressable>

                <Pressable
                  style={[styles.btnSecundario, favorito && styles.btnFavoritoAtivo]}
                  onPress={() => setFavorito((f) => !f)}
                >
                  <Ionicons
                    name={favorito ? 'heart' : 'heart-outline'}
                    size={17}
                    color={DOURADO}
                  />
                  <Text style={styles.btnSecundarioTexto}>
                    {favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Parte inferior */}
          <View style={[styles.inferior, largo && styles.inferiorLargo]}>
            {/* Sobre o projeto */}
            <View style={[styles.bloco, largo && styles.blocoSobre]}>
              <View style={styles.blocoTituloLinha}>
                <Ionicons name="home-outline" size={19} color={DOURADO} />
                <Text style={styles.blocoTitulo}>Sobre o Projeto</Text>
              </View>
              <Text style={styles.texto}>{descricao}</Text>

              <View style={styles.distribuicao}>
                <Ionicons name="clipboard-outline" size={22} color={DOURADO} />
                <View style={styles.distribuicaoTextos}>
                  <Text style={styles.distribuicaoTitulo}>Distribuição dos ambientes</Text>
                  <Text style={styles.distribuicaoTexto}>{distribuicao}</Text>
                </View>
              </View>
            </View>

            {/* Destaques */}
            <View style={[styles.bloco, largo && styles.blocoDestaque]}>
              <View style={styles.blocoTituloLinha}>
                <Ionicons name="star" size={19} color={DOURADO} />
                <Text style={styles.blocoTitulo}>Destaques do projeto</Text>
              </View>

              <View style={styles.destaques}>
                {destaques.map((d) => (
                  <View key={d} style={styles.destaqueItem}>
                    <Ionicons name="checkmark-circle" size={17} color={DOURADO} />
                    <Text style={styles.destaqueTexto}>{d}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nota}>
                <Ionicons name="leaf-outline" size={20} color={DOURADO} />
                <Text style={styles.notaTexto}>
                  Um projeto pensado para o seu bem-estar, com qualidade, beleza e
                  sustentabilidade.
                </Text>
              </View>
            </View>

            {/* Profissional responsável + avaliações */}
            <View style={[styles.bloco, largo && styles.blocoProfissional]}>
              <View style={styles.blocoTituloLinha}>
                <Ionicons name="person-outline" size={19} color={DOURADO} />
                <Text style={styles.blocoTitulo}>Profissional responsável</Text>
              </View>

              {prof ? (
                <Pressable
                  style={styles.profInfo}
                  onPress={() =>
                    router.push({
                      pathname: '/detalhesProfissionais',
                      params: { id: String(p.profissional) },
                    })
                  }
                >
                  <View style={styles.profFoto}>
                    <Ionicons name="person" size={28} color="#555" />
                  </View>
                  <View style={styles.profTextos}>
                    <Text style={styles.profNome}>{prof.nome}</Text>
                    <Text style={styles.profProfissao}>{prof.profissao}</Text>
                    <View style={styles.profNotaLinha}>
                      <Ionicons name="star" size={14} color={DOURADO} />
                      <Text style={styles.profNota}>{formatarNota(prof.nota)}</Text>
                      <Text style={styles.profQtd}>({prof.avaliacoes} avaliações)</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#777" />
                </Pressable>
              ) : (
                <Text style={styles.texto}>Profissional ainda não definido.</Text>
              )}

              <View style={styles.avaliacao}>
                <View style={styles.avaliacaoTopo}>
                  <View style={styles.avaliacaoTitulo}>
                    <Ionicons name="chatbubble-outline" size={16} color={DOURADO} />
                    <Text style={styles.avaliacaoTituloTexto}>Avaliações do cliente</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      // TODO: abrir a tela de avaliações quando ela existir
                    }}
                  >
                    <Text style={styles.verMais}>Ver mais avaliações →</Text>
                  </Pressable>
                </View>

                <View style={styles.cardAvaliacao}>
                  <View style={styles.cliente}>
                    <View style={styles.clienteFoto}>
                      <Ionicons name="person" size={18} color="#555" />
                    </View>
                    <View>
                      <Text style={styles.clienteNome}>{AVALIACAO.cliente}</Text>
                      <Text style={styles.clienteQuando}>{AVALIACAO.quando}</Text>
                    </View>
                  </View>
                  <View style={styles.avaliacaoEstrelas}>
                    <Estrelas nota={AVALIACAO.nota} tamanho={14} />
                  </View>
                  <Text style={styles.avaliacaoTexto}>{AVALIACAO.texto}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {rodape}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0b0b0b' },

  fundoImagem: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  fundoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.55)' },

  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudo: { flexGrow: 1 },

  // Cabeçalho
  topo: {
    backgroundColor: 'rgba(10, 10, 10, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 24,
  },
  topoLargo: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
  },
  topoEstreito: { alignItems: 'center', paddingTop: 40, paddingBottom: 16 },
  logo: { width: 90, height: 48 },
  logoLargo: { width: 70, height: 60, marginLeft: 30 },
  menuCentro: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuEstreito: { flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, gap: 8 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemAtivo: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 106, 0.4)',
    backgroundColor: 'rgba(212, 175, 106, 0.08)',
  },
  textoItem: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  textoAtivo: { color: OURO_MENU, fontSize: 14, fontWeight: '500' },
  perfil: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 20,
  },
  perfilEstreito: { position: 'absolute', right: 20, top: 40 },

  // Planta não encontrada
  principal: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  naoEncontrada: {
    paddingVertical: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(218, 174, 82, 0.4)',
    borderRadius: 14,
  },
  naoEncontradaTitulo: {
    marginBottom: 10,
    color: '#d9af52',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  naoEncontradaTexto: { color: '#bdbdbd', fontSize: 16, textAlign: 'center' },

  // Conteúdo
  pagina: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1250,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
    gap: 24,
  },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  voltarTexto: { color: DOURADO, fontSize: 14 },

  // Início
  inicio: { gap: 24 },
  inicioLargo: { flexDirection: 'row', alignItems: 'flex-start', gap: 32 },
  imagemArea: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  imagemAreaLarga: { flex: 1, height: 520 },
  imagem: { width: '100%', height: '100%' },

  painel: { flex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#6b5a36',
    backgroundColor: 'rgba(28, 26, 20, 0.9)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillTexto: { color: DOURADO, fontSize: 12, fontWeight: 'bold' },
  titulo: { color: '#ffffff', fontSize: 30, fontWeight: '900', lineHeight: 38, marginTop: 16 },
  tituloLargo: { fontSize: 38, lineHeight: 46 },
  resumo: { color: '#d0d0d0', fontSize: 14, lineHeight: 23, marginTop: 10 },
  preco: { color: DOURADO, fontSize: 22, fontWeight: '800', marginTop: 14 },

  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  infoCard: {
    backgroundColor: 'rgba(16, 16, 16, 0.94)',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 14,
  },
  infoIcone: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#2a2418',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitulo: { color: '#a8a8a8', fontSize: 12, marginTop: 10 },
  infoValor: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 3 },

  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  btnPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: DOURADO,
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 26,
  },
  btnPrincipalTexto: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 14 },
  btnSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#6b5a36',
    backgroundColor: 'rgba(28, 26, 20, 0.9)',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 22,
  },
  btnFavoritoAtivo: { borderColor: DOURADO },
  btnSecundarioTexto: { color: DOURADO, fontWeight: 'bold', fontSize: 14 },

  // Parte inferior
  inferior: { gap: 24 },
  inferiorLargo: { flexDirection: 'row', alignItems: 'flex-start' },
  bloco: {
    backgroundColor: 'rgba(16, 16, 16, 0.94)',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 24,
  },
  blocoSobre: { flex: 1 },
  blocoDestaque: { flex: 1 },
  blocoProfissional: { flex: 1.3 },
  blocoTituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  blocoTitulo: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  texto: { color: '#d0d0d0', fontSize: 14, lineHeight: 24 },

  distribuicao: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 16,
  },
  distribuicaoTextos: { flex: 1 },
  distribuicaoTitulo: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  distribuicaoTexto: { color: '#b5b5b5', fontSize: 13, lineHeight: 21, marginTop: 4 },

  destaques: { gap: 12 },
  destaqueItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  destaqueTexto: { color: '#e4e4e4', fontSize: 14 },
  nota: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 16,
  },
  notaTexto: { flex: 1, color: '#b5b5b5', fontSize: 13, lineHeight: 21 },

  // Profissional
  profInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 14,
  },
  profFoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profTextos: { flex: 1 },
  profNome: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  profProfissao: { color: DOURADO, fontSize: 13, marginTop: 2 },
  profNotaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  profNota: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  profQtd: { color: '#8a8a8a', fontSize: 12 },

  avaliacao: { marginTop: 22 },
  avaliacaoTopo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  avaliacaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avaliacaoTituloTexto: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  verMais: { color: DOURADO, fontSize: 13, fontWeight: 'bold' },
  cardAvaliacao: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 16,
  },
  cliente: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clienteFoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clienteNome: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  clienteQuando: { color: '#8a8a8a', fontSize: 12, marginTop: 2 },
  avaliacaoEstrelas: { marginTop: 12 },
  estrelas: { flexDirection: 'row', gap: 3 },
  avaliacaoTexto: { color: '#d0d0d0', fontSize: 13, lineHeight: 21, marginTop: 10 },

  // Rodapé (igual à web: texto à esquerda, links à direita)
  rodape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 22,
    paddingHorizontal: '6%',
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: OURO_MENU,
  },
  textoRodape: { color: '#888888', fontSize: 13 },
  linksRodape: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkRodape: { color: OURO_MENU, fontSize: 13 },
  separadorRodape: { color: '#555555', fontSize: 13 },
});