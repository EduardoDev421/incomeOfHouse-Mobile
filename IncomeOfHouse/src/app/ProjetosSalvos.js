
import React, { useState } from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView,
  StyleSheet, Pressable, Alert, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dourado = '#c9a45c';

const iniciais = [
  { id: '1', titulo: 'Casa moderna', descricao: 'Projeto residencial contemporâneo' },
  { id: '2', titulo: 'Casa de campo', descricao: 'Projeto integrado à natureza' },
  { id: '3', titulo: 'Design de interiores', descricao: 'Ideias para sua casa' },
];

export default function ProjetosSalvos() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [salvos, setSalvos] = useState(iniciais);

  function remover(id) {
    Alert.alert('Remover projeto', 'Deseja remover este projeto dos salvos?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setSalvos((lista) => lista.filter((p) => p.id !== id)),
      },
    ]);
  }

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
          <Pressable onPress={() => router.back()} style={s.voltar}>
            <Ionicons name="arrow-back" size={20} color={dourado} />
            <Text style={s.textoVoltar}>Voltar</Text>
          </Pressable>
        </View>

        <View style={[s.painel, { flexDirection: width >= 600 ? 'row' : 'column' }]}>
          <View style={s.menuLateral}>
            <Text style={s.itemMenu}>Meu perfil</Text>
            <Text style={s.itemMenu}>Meus endereços</Text>
            <Text style={s.itemMenu}>Meus pedidos</Text>
            <Text style={s.itemMenu}>Meus profissionais favoritos</Text>
            <Text style={s.itemAtivo}>Projetos salvos</Text>
            <Text style={s.itemMenu}>Mensagens</Text>
            <Text style={s.itemMenu}>Configurações</Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={s.itemMenu}>Sair</Text>
            </Pressable>
          </View>

          <View style={s.principal}>
            <Text style={s.titulo}>Projetos salvos</Text>
            <Text style={s.subtitulo}>
              Gerencie seus projetos salvos.
            </Text>

            <View style={s.lista}>
              <Text style={s.tituloLista}>Projetos salvos</Text>

              {salvos.map((projeto) => (
                <View key={projeto.id} style={s.card}>
                  <View style={s.info}>
                    <Text style={s.nome}>{projeto.titulo}</Text>
                    <Text style={s.descricao}>{projeto.descricao}</Text>
                  </View>

                  <View style={s.acoes}>
                    <Pressable
                      style={s.acessar}
                      onPress={() =>
                        router.push({
                          pathname: '/pedidodetalhe',
                          params: {
                            id: projeto.id,
                            titulo: projeto.titulo,
                          },
                        })
                      }
                    >
                      <Text style={s.textoAcao}>Acessar projeto</Text>
                    </Pressable>

                    <Pressable onPress={() => remover(projeto.id)} style={s.remover}>
                      <Text style={s.textoRemover}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {salvos.length === 0 && (
                <Text style={s.vazio}>Você ainda não salvou projetos.</Text>
              )}
            </View>
          </View>
        </View>
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
  conteudo: { padding: 18, flexGrow: 1 },
  topo: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  logo: { width: 100, height: 45 },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textoVoltar: { color: '#fff', fontSize: 12 },
  painel: {
    alignSelf: 'center', width: '100%', maxWidth: 850,
    backgroundColor: 'rgba(20,20,20,0.97)',
    borderWidth: 1, borderColor: '#51432c', borderRadius: 7,
    overflow: 'hidden',
  },
  menuLateral: {
    width: 155, backgroundColor: '#191919',
    padding: 12, borderRightWidth: 1, borderColor: '#333',
  },
  itemMenu: { color: '#ddd', fontSize: 11, paddingVertical: 10 },
  itemAtivo: {
    color: dourado, fontSize: 11,
    fontWeight: 'bold', paddingVertical: 10,
  },
  principal: { flex: 1, padding: 15 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  subtitulo: { color: '#aaa', fontSize: 12, marginTop: 5, marginBottom: 15 },
  lista: { borderWidth: 1, borderColor: '#444', padding: 10 },
  tituloLista: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  card: {
    flexDirection: 'row', flexWrap: 'wrap',
    alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#191919', borderWidth: 1,
    borderColor: '#383838', padding: 10, marginBottom: 8, gap: 10,
  },
  info: { flex: 1, minWidth: 120 },
  nome: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  descricao: { color: '#aaa', fontSize: 10, marginTop: 5 },
  acoes: { alignItems: 'flex-start', gap: 4 },
  acessar: { backgroundColor: dourado, padding: 6, borderRadius: 2 },
  textoAcao: { color: '#171512', fontSize: 9, fontWeight: 'bold' },
  remover: { backgroundColor: '#eee', padding: 4, borderRadius: 2 },
  textoRemover: { color: '#222', fontSize: 9 },
  vazio: { color: '#ccc', paddingVertical: 20, textAlign: 'center' },
});
