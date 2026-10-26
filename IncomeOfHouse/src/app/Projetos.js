
import React, { useState } from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView,
  TextInput, StyleSheet, Pressable, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dourado = '#c9a45c';

const projetosIniciais = [
  { id: '1', titulo: 'Casa moderna', tipo: 'Residencial' },
  { id: '2', titulo: 'Casa de campo', tipo: 'Residencial' },
  { id: '3', titulo: 'Sala elegante', tipo: 'Interiores' },
  { id: '4', titulo: 'Jardim moderno', tipo: 'Jardins' },
  { id: '5', titulo: 'Cozinha planejada', tipo: 'Interiores' },
  { id: '6', titulo: 'Casa minimalista', tipo: 'Residencial' },
  { id: '7', titulo: 'Área externa', tipo: 'Jardins' },
  { id: '8', titulo: 'Quarto moderno', tipo: 'Interiores' },
  { id: '9', titulo: 'Casa contemporânea', tipo: 'Residencial' },
];

export default function Projetos() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colunas = width >= 700 ? 3 : width >= 450 ? 2 : 1;

  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [pesquisou, setPesquisou] = useState(false);

  const projetos = projetosIniciais.filter((p) =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) &&
    (tipo === 'Todos' || p.tipo === tipo)
  );

  return (
    <ImageBackground
      source={require('../../assets/images/BackgroundFundo.png')}
      style={s.fundo}
      resizeMode="cover"
    >
      <View style={s.sombra} />

      <ScrollView contentContainerStyle={s.conteudo}>
        <View style={s.topo}>
          <Pressable onPress={() => router.push('/')}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={s.menu}>Início   Plantas   Profissionais   Sobre</Text>

          <Pressable onPress={() => router.back()}>
            <Ionicons name="person-circle-outline" size={25} color={dourado} />
          </Pressable>
        </View>

        <Text style={s.titulo}>Projetos</Text>

        <View style={s.filtros}>
          <Text style={s.chamada}>Encontre o projeto perfeito para você</Text>

          <Text style={s.rotulo}>Nome do projeto</Text>
          <TextInput
            style={s.campo}
            placeholder="Digite o nome do projeto"
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />

          <Text style={s.rotulo}>Categoria</Text>
          <View style={s.categorias}>
            {['Todos', 'Residencial', 'Interiores', 'Jardins'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setTipo(item)}
                style={[s.categoria, tipo === item && s.categoriaAtiva]}
              >
                <Text style={s.textoCategoria}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={s.botao} onPress={() => setPesquisou(true)}>
            <Ionicons name="search-outline" size={16} color="#171512" />
            <Text style={s.textoBotao}>Pesquisar</Text>
          </Pressable>
        </View>

        <Text style={s.resultado}>
          {pesquisou ? 'Resultados encontrados' : 'Conheça nossos projetos'}
        </Text>

        <View style={s.grade}>
          {projetos.map((projeto) => (
            <View
              key={projeto.id}
              style={[s.card, { width: `${100 / colunas - 2}%` }]}
            >
              <View style={s.imagem}>
                <Ionicons name="image-outline" size={25} color="#777" />
              </View>

              <Text style={s.nome}>{projeto.titulo}</Text>
              <Text style={s.tipo}>{projeto.tipo}</Text>

              <Pressable
                style={s.detalhes}
                onPress={() =>
                  router.push({
                    pathname: '/pedidodetalhe',
                    params: { id: projeto.id, titulo: projeto.titulo },
                  })
                }
              >
                <Text style={s.textoDetalhes}>Detalhes</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {projetos.length === 0 && (
          <Text style={s.vazio}>Nenhum projeto encontrado.</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#111' },
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  conteudo: { padding: 18, paddingBottom: 40 },
  topo: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 25,
  },
  logo: { width: 90, height: 42 },
  menu: { color: '#eee', fontSize: 11 },
  titulo: { color: '#fff', fontSize: 25, fontWeight: 'bold' },
  filtros: {
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderWidth: 1, borderColor: '#51432c',
    borderRadius: 7, padding: 15, marginTop: 12,
  },
  chamada: {
    color: '#fff', fontWeight: 'bold',
    textAlign: 'center', marginBottom: 15,
  },
  rotulo: { color: '#ddd', fontSize: 12, marginBottom: 5 },
  campo: {
    backgroundColor: '#fff', color: '#222',
    borderRadius: 3, padding: 9, marginBottom: 12,
  },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  categoria: {
    backgroundColor: '#333', borderRadius: 3,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  categoriaAtiva: { backgroundColor: '#80662f' },
  textoCategoria: { color: '#fff', fontSize: 11 },
  botao: {
    backgroundColor: dourado, padding: 10, borderRadius: 3,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginTop: 14,
  },
  textoBotao: { color: '#171512', fontWeight: 'bold' },
  resultado: { color: dourado, marginVertical: 16, fontWeight: 'bold' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 4,
    overflow: 'hidden', marginBottom: 5,
  },
  imagem: {
    height: 85, backgroundColor: '#e9e9e9',
    alignItems: 'center', justifyContent: 'center',
  },
  nome: { color: '#222', fontWeight: 'bold', fontSize: 12, padding: 8 },
  tipo: { color: '#666', fontSize: 10, paddingHorizontal: 8 },
  detalhes: {
    backgroundColor: '#171512', padding: 7,
    alignItems: 'center', margin: 5, borderRadius: 2,
  },
  textoDetalhes: { color: '#fff', fontSize: 11 },
  vazio: { color: '#fff', textAlign: 'center', marginTop: 25 },
});
