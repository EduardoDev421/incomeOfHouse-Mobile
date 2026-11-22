import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLegal } from '../components/LegalProvider';
import { PROFISSIONAIS } from '../constants/profissionais';

// Cores da página (iguais ao DetalhesProfissionais.css da web)
const OURO = '#d9ad52'; // destaque do nome e dos dados
const OURO_CLARO = '#dfb454'; // estrelas, barra do título, botão "Ver mais"
const OURO_MENU = '#d4af6a'; // menu e rodapé

// Mesma imagem de fundo da web (BackGroundPlantasEProfissionais.png).
// Salve o arquivo em src/assets/images/ com exatamente este nome.
const FUNDO = require('../../assets/images/BackGroundPlantasEProfissionais.png');

// Degradê no navegador; no celular usa uma cor sólida parecida
const degrade = (angulo, c1, c2, solida) =>
  Platform.select({
    web: { backgroundImage: `linear-gradient(${angulo}deg, ${c1}, ${c2})` },
    default: { backgroundColor: solida },
  });

/* ------------------------------------------------------------------ */
/* DADOS DE EXEMPLO (nomes fictícios)                                  */

const DESCRICAO_PADRAO =
  'Profissional especializado em projetos arquitetônicos modernos e residenciais. Trabalha com soluções personalizadas, buscando unir sofisticação, funcionalidade e qualidade em cada projeto.';

const PROFISSIONAL_PADRAO = {
  nome: 'Nome do Profissional',
  profissao: 'Arquiteto',
  cidade: 'Brasília - DF',
  anos: 8,
  nota: 0,
  avaliacoes: 0,
};

const COMENTARIO = {
  cliente: 'Nome do Cliente',
  quando: 'Há 1 ano',
  nota: 5,
  texto:
    'Excelente profissional! Muito atencioso, responsável e comprometido com o projeto. Fiquei muito satisfeito com o resultado.',
};

const ITENS_ORCAMENTO = [
  { glifo: 'R$', titulo: 'Investimento inicial', texto: 'A partir de ', destaque: 'R$ 2.500' },
  { icone: 'stopwatch-outline', titulo: 'Prazo estimado', texto: '5 a 10 dias úteis' },
  { icone: 'locate-outline', titulo: 'Atendimento', texto: 'Presencial e online' },
];

const formatarNota = (n) => n.toFixed(1).replace('.', ',');

function Estrelas({ nota, tamanho = 18, espaco = 4 }) {
  return (
    <View style={[styles.estrelas, { gap: espaco }]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={tamanho}
          color={i < Math.round(nota) ? OURO_CLARO : '#3a3a3a'}
        />
      ))}
    </View>
  );
}

export default function DetalhesProfissionais() {
  const router = useRouter();
  const { abrirLegal } = useLegal();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const largo = width >= 900;

  const navegar = (rota) => router.push(rota);

  const selecionado = PROFISSIONAIS.find((profissional) => profissional.id === String(id));
  const p = selecionado
    ? {
        nome: selecionado.nome,
        profissao: selecionado.profissaoNome,
        cidade: selecionado.cidade,
        anos: selecionado.anos,
        nota: selecionado.avaliacao,
        avaliacoes: selecionado.avaliacoes,
        descricao: selecionado.descricao,
        foto: selecionado.foto,
      }
    : PROFISSIONAL_PADRAO;
  const descricao = p.descricao || DESCRICAO_PADRAO;

  // Nome em duas linhas, como no site: "Nome do" (branco) e "Profissional" (dourado)
  const palavras = p.nome.split(' ');
  const ultima = palavras.pop();
  const inicio = palavras.join(' ');

  const menuTopo = (
    <View style={[styles.menu, !largo && styles.menuEstreito]}>
      <Pressable style={styles.item} onPress={() => navegar('/')}>
        <Text style={styles.textoItem}>Início</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navegar('/planta')}>
        <Text style={styles.textoItem}>Plantas</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navegar('/profissionais')}>
        <Text style={styles.textoItem}>Profissionais</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navegar('/sobreNos')}>
        <Text style={styles.textoItem}>Sobre Nós</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.raiz}>
      <StatusBar barStyle="light-content" />

      {/* Fundo da página inteira (a imagem da web não tem véu escuro por cima) */}
      <Image source={FUNDO} style={styles.fundoImagem} resizeMode="cover" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudo}>
        {/* Cabeçalho: logo à esquerda e menu centralizado, como na web */}
        <View style={[styles.topo, largo ? styles.topoLargo : styles.topoEstreito]}>
          <Pressable onPress={() => navegar('/')} accessibilityRole="button" accessibilityLabel="Início">
            <Image
              source={require('../../assets/images/Logo.png')}
              style={[styles.logo, largo && styles.logoLargo]}
              resizeMode="contain"
            />
          </Pressable>

          {largo ? (
            <View style={styles.menuCentro} pointerEvents="box-none">
              {menuTopo}
            </View>
          ) : (
            menuTopo
          )}
        </View>

        <View style={styles.pagina}>
          {/* Perfil */}
          <View
            style={[
              styles.perfilCard,
              degrade(145, 'rgba(29,29,29,0.98)', 'rgba(12,12,12,0.98)', '#161616'),
              largo && styles.perfilCardLargo,
            ]}
          >
            <View style={[styles.fotoArea, largo && styles.fotoAreaLarga]}>
              {p.foto ? (
                <Image source={p.foto} style={styles.foto} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={110} color="#333" />
              )}
            </View>

            <View style={[styles.info, largo && styles.infoLargo]}>
              <View>
                {!!inicio && <Text style={[styles.nome, largo && styles.nomeLargo]}>{inicio}</Text>}
                <Text style={[styles.nome, styles.nomeDestaque, largo && styles.nomeLargo]}>{ultima}</Text>
              </View>

              <Text style={styles.profissao}>{p.profissao}</Text>

              <View style={styles.avaliacaoLinha}>
                <Ionicons name="star" size={22} color="#e3b957" />
                <Text style={styles.avaliacaoNota}>{formatarNota(p.nota)}</Text>
                <Text style={styles.avaliacaoQtd}>({p.avaliacoes} avaliações)</Text>
              </View>

              <View style={styles.dados}>
                <View
                  style={[
                    styles.dado,
                    degrade(145, 'rgba(40,40,40,0.65)', 'rgba(20,20,20,0.65)', '#1c1c1c'),
                  ]}
                >
                  <Text style={styles.dadoTitulo}>Cidade</Text>
                  <Text style={styles.dadoTexto}>{p.cidade}</Text>
                </View>
                <View
                  style={[
                    styles.dado,
                    degrade(145, 'rgba(40,40,40,0.65)', 'rgba(20,20,20,0.65)', '#1c1c1c'),
                  ]}
                >
                  <Text style={styles.dadoTitulo}>Tempo de Experiência</Text>
                  <Text style={styles.dadoTexto}>{p.anos} anos</Text>
                </View>
              </View>

              <Text style={styles.descricao}>{descricao}</Text>
            </View>
          </View>

          {/* Cards inferiores */}
          <View style={[styles.inferiores, largo && styles.inferioresLargo]}>
            {/* Avaliações */}
            <View
              style={[
                styles.cardAvaliacoes,
                degrade(145, 'rgba(24,24,24,0.98)', 'rgba(10,10,10,0.98)', '#121212'),
                largo && styles.cardAvaliacoesLargo,
              ]}
            >
              <View style={styles.tituloAvaliacao}>
                <View style={styles.barraTitulo} />
                <Text style={styles.tituloAvaliacaoTexto}>Avaliações do Cliente</Text>
              </View>

              <View style={styles.notaGeral}>
                <Text style={styles.notaGeralNumero}>{formatarNota(p.nota)}</Text>
                <Estrelas nota={p.nota} tamanho={18} espaco={7} />
                <Text style={styles.notaGeralQtd}>{p.avaliacoes} avaliações</Text>
              </View>

              <View style={styles.comentario}>
                <View style={styles.cliente}>
                  <View style={styles.clienteFoto}>
                    <Ionicons name="person" size={22} color="#555" />
                  </View>
                  <View style={styles.clienteInfo}>
                    <Text style={styles.clienteNome}>{COMENTARIO.cliente}</Text>
                    <Text style={styles.clienteQuando}>{COMENTARIO.quando}</Text>
                  </View>
                </View>

                <View style={styles.comentarioEstrelas}>
                  <Estrelas nota={COMENTARIO.nota} tamanho={16} espaco={4} />
                </View>

                <Text style={styles.comentarioTexto}>{COMENTARIO.texto}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.verMais, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  // TODO: abrir a tela de comentários quando ela existir
                }}
                accessibilityRole="button"
              >
                <Text style={styles.verMaisTexto}>Ver mais avaliações</Text>
                <Text style={styles.verMaisSeta}>→</Text>
              </Pressable>
            </View>

            {/* Orçamento */}
            <View
              style={[
                styles.cardOrcamento,
                degrade(145, 'rgba(35,30,21,0.98)', 'rgba(15,15,15,0.98)', '#1a1812'),
                largo && styles.cardOrcamentoLargo,
              ]}
            >
              <Text style={styles.orcamentoTitulo}>Solicitar Orçamento</Text>
              <Text style={styles.orcamentoTexto}>
                Descreva seu projeto e receba um orçamento personalizado.
              </Text>

              <View style={styles.orcamentoItens}>
                {ITENS_ORCAMENTO.map((o) => (
                  <View key={o.titulo} style={styles.orcamentoItem}>
                    <View style={styles.orcamentoIcone}>
                      {o.glifo ? (
                        <Text style={styles.orcamentoGlifo}>{o.glifo}</Text>
                      ) : (
                        <Ionicons name={o.icone} size={15} color={OURO_CLARO} />
                      )}
                    </View>
                    <View style={styles.orcamentoItemTextos}>
                      <Text style={styles.orcamentoItemTitulo}>{o.titulo}</Text>
                      <Text style={styles.orcamentoItemTexto}>
                        {o.texto}
                        {o.destaque && <Text style={styles.orcamentoDestaque}>{o.destaque}</Text>}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.pagamento}>
                <Text style={styles.pagamentoTitulo}>Formas de Pagamento</Text>
                <Text style={styles.pagamentoTexto}>PIX, Boleto e Cartão de Crédito</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.btnOrcamento,
                  degrade(135, '#f0c76a', '#d39f32', '#e0b048'),
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => {
                  // TODO: enviar a solicitação de orçamento para o seu backend
                }}
                accessibilityRole="button"
              >
                <Text style={styles.btnOrcamentoTexto}>Solicitar Orçamento</Text>
                <Text style={styles.btnOrcamentoSeta}>→</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Rodapé: texto à esquerda e links à direita, como na web */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0b0b0b' },

  fundoImagem: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

  scroll: { flex: 1, backgroundColor: 'transparent' },
  conteudo: { flexGrow: 1 },

  /* ---------- Cabeçalho ---------- */
  topo: {
    backgroundColor: 'rgba(10, 10, 10, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
  textoItem: { color: '#ffffff', fontSize: 14, fontWeight: '500' },

  /* ---------- Conteúdo ---------- */
  pagina: {
    flexGrow: 1,
    width: '92%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 25,
    paddingBottom: 60,
    gap: 18,
  },

  /* ---------- Cartão principal ---------- */
  perfilCard: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(218, 174, 82, 0.38)',
  },
  perfilCardLargo: { flexDirection: 'row', minHeight: 480 },
  fotoArea: {
    width: '100%',
    height: 320,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fotoAreaLarga: { width: 430, height: 'auto' },
  foto: { width: '100%', height: '100%' },
  info: { padding: 28, gap: 0 },
  infoLargo: { flex: 1, minWidth: 0, paddingVertical: 55, paddingHorizontal: 50, justifyContent: 'center' },

  nome: { color: '#ffffff', fontSize: 30, fontWeight: '600', lineHeight: 35 },
  nomeLargo: { fontSize: 36, lineHeight: 41 },
  nomeDestaque: { color: OURO },
  profissao: { color: '#aaaaaa', fontSize: 16, marginTop: 10, marginBottom: 22 },

  avaliacaoLinha: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 30 },
  avaliacaoNota: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  avaliacaoQtd: { color: '#777777', fontSize: 12 },

  dados: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 28 },
  dado: {
    flexGrow: 1,
    flexBasis: 150,
    padding: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dadoTitulo: { color: '#999999', fontSize: 12, fontWeight: '500', marginBottom: 6 },
  dadoTexto: { color: OURO, fontSize: 14 },

  descricao: { color: '#aaaaaa', fontSize: 13, lineHeight: 23, maxWidth: 620 },

  /* ---------- Cards inferiores ---------- */
  inferiores: { gap: 18 },
  inferioresLargo: { flexDirection: 'row', alignItems: 'stretch' },

  /* Avaliações */
  cardAvaliacoes: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(218, 174, 82, 0.35)',
  },
  cardAvaliacoesLargo: { flexGrow: 1.35, flexShrink: 1, flexBasis: 0, minWidth: 0, paddingHorizontal: 40 },

  tituloAvaliacao: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 15 },
  barraTitulo: { width: 5, height: 30, borderRadius: 5, backgroundColor: OURO_CLARO },
  tituloAvaliacaoTexto: { flexShrink: 1, color: '#ffffff', fontSize: 22, fontWeight: 'bold' },

  notaGeral: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  notaGeralNumero: { color: '#ffffff', fontSize: 31 },
  notaGeralQtd: { color: '#777777', fontSize: 12 },
  estrelas: { flexDirection: 'row' },

  comentario: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
  },
  cliente: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  clienteFoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: OURO_CLARO,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clienteInfo: { gap: 4 },
  clienteNome: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  clienteQuando: { color: '#777777', fontSize: 11 },
  comentarioEstrelas: { marginBottom: 10 },
  comentarioTexto: { color: '#b7b7b7', fontSize: 12, lineHeight: 20 },

  verMais: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    marginTop: 25,
    paddingVertical: 13,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4a943',
  },
  verMaisTexto: { color: OURO_CLARO, fontSize: 13, fontWeight: '500' },
  verMaisSeta: { color: OURO_CLARO, fontSize: 17 },

  /* Orçamento */
  cardOrcamento: {
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 174, 82, 0.30)',
  },
  cardOrcamentoLargo: { flexGrow: 0.85, flexShrink: 1, flexBasis: 0, minWidth: 0 },

  orcamentoTitulo: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  orcamentoTexto: { color: '#d0a94f', fontSize: 12, lineHeight: 20, marginTop: 6, marginBottom: 25 },

  orcamentoItens: { gap: 15, marginBottom: 25 },
  orcamentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
  },
  orcamentoIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(218, 174, 82, 0.55)',
    backgroundColor: 'rgba(218, 174, 82, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orcamentoGlifo: { color: OURO_CLARO, fontSize: 12, fontWeight: '600' },
  orcamentoItemTextos: { flex: 1, minWidth: 0, gap: 4 },
  orcamentoItemTitulo: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  orcamentoItemTexto: { color: '#888888', fontSize: 11 },
  orcamentoDestaque: { color: OURO_CLARO, fontWeight: '500' },

  pagamento: {
    paddingTop: 20,
    marginBottom: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  pagamentoTitulo: { color: '#ffffff', fontSize: 13, marginBottom: 7 },
  pagamentoTexto: { color: OURO_CLARO, fontSize: 12, lineHeight: 18 },

  btnOrcamento: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 11,
  },
  btnOrcamentoTexto: { color: '#111111', fontSize: 13, fontWeight: '600' },
  btnOrcamentoSeta: { color: '#111111', fontSize: 18 },

  /* ---------- Rodapé (igual à web) ---------- */
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