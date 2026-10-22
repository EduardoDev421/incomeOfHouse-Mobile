
import React, { useState } from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView,
  TextInput, StyleSheet, Pressable, Alert, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const gold = '#c9a45c';

const menu = [
  ['Meu Perfil', 'person-outline', '/PerfilUsuario'],
  ['Meus Endereços', 'location-outline', '/Meusenderecos'],
  ['Meus Pedidos', 'bag-handle-outline', '/MeusPedidos'],
  ['Meus Profissionais Favoritos', 'heart-outline', '/Meusprofissionais'],
  ['Projetos Salvos', 'bookmark-outline', '/ProjetosSalvos'],
  ['Meu Portfólio', 'folder-outline', '/Meuportfolio'],
  ['Comentários', 'star-outline', '/Comentarios'],
  ['Mensagens', 'chatbox-outline', '/Mensagens'],
];

export default function TelaConta({
  titulo, subtitulo, ativo, dados = [], tipo = 'lista',
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 650;
  const [busca, setBusca] = useState('');
  const [lista, setLista] = useState(dados);
  const [filtro, setFiltro] = useState('Todos');
  const [form, setForm] = useState({});

  const visiveis = lista.filter((item) =>
    `${item.titulo} ${item.descricao || ''} ${item.profissional || ''}`
      .toLowerCase().includes(busca.toLowerCase()) &&
    (filtro === 'Todos' || !item.status || item.status === filtro)
  );

  function remover(id) {
    Alert.alert('Confirmar exclusão', 'Deseja remover este item?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setLista((atual) => atual.filter((item) => item.id !== id)),
      },
    ]);
  }

  function adicionar() {
    const tituloNovo = (form.titulo || '').trim();
    if (!tituloNovo) {
      Alert.alert('Atenção', 'Preencha o campo principal.');
      return;
    }

    setLista((atual) => [
      ...atual,
      {
        id: String(Date.now()),
        titulo: tituloNovo,
        descricao: form.descricao || '',
        profissional: form.profissional || '',
        status: 'Em andamento',
      },
    ]);
    setForm({});
    Alert.alert('Sucesso', 'Item adicionado à lista.');
  }

  return (
    <ImageBackground
      source={require('../../assets/images/BackgroundFundo.png')}
      style={s.fundo}
      resizeMode="cover"
    >
      <View style={s.sombra} />

      <ScrollView contentContainerStyle={s.pagina}>
        <View style={[s.topo, mobile && s.topoMobile]}>
          <Pressable onPress={() => router.push('/')}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </Pressable>
          <View style={s.links}>
            {[
              ['Início', '/'],
              ['Plantas', '/planta'],
              ['Profissionais', '/profissionais'],
              ['Sobre', '/sobre'],
            ].map(([nome, rota]) => (
              <Pressable key={nome} onPress={() => router.push(rota)}>
                <Text style={s.link}>{nome}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.push('/PerfilUsuario')}>
            <Ionicons name="person-outline" size={22} color={gold} />
          </Pressable>
        </View>

        <View style={[s.painel, mobile && s.painelMobile]}>
          <View style={[s.menu, mobile && s.menuMobile]}>
            {menu.map(([nome, icone, rota]) => (
              <Pressable
                key={nome}
                onPress={() => router.push(rota)}
                style={[s.itemMenu, nome === ativo && s.ativo]}
              >
                <Ionicons name={icone} size={17} color={gold} />
                <Text style={s.textoMenu}>{nome}</Text>
              </Pressable>
            ))}
            <Pressable
              style={s.itemMenu}
              onPress={() => router.replace('/login')}
            >
              <Ionicons name="log-out-outline" size={17} color={gold} />
              <Text style={s.textoMenu}>Sair</Text>
            </Pressable>
          </View>

          <View style={s.principal}>
            <Text style={s.titulo}>{titulo}</Text>
            <Text style={s.subtitulo}>{subtitulo}</Text>

            <View style={s.divisor} />

            {tipo === 'lista' && (
              <TextInput
                style={s.campo}
                placeholder="Buscar..."
                placeholderTextColor="#999"
                value={busca}
                onChangeText={setBusca}
              />
            )}

            {tipo === 'pedidos' && (
              <View style={s.filtros}>
                {['Todos', 'Em andamento', 'Concluído', 'Cancelado'].map((opcao) => (
                  <Pressable
                    key={opcao}
                    onPress={() => setFiltro(opcao)}
                    style={[s.filtro, filtro === opcao && s.filtroAtivo]}
                  >
                    <Text style={s.textoFiltro}>{opcao}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {(tipo === 'enderecos' || tipo === 'portfolio') && (
              <View style={s.formulario}>
                <TextInput
                  style={s.campo}
                  placeholder={tipo === 'enderecos' ? 'Nome do endereço' : 'Título do projeto'}
                  placeholderTextColor="#999"
                  value={form.titulo || ''}
                  onChangeText={(v) => setForm({ ...form, titulo: v })}
                />
                <TextInput
                  style={s.campo}
                  placeholder={tipo === 'enderecos' ? 'Rua, número e cidade' : 'Descrição do projeto'}
                  placeholderTextColor="#999"
                  value={form.descricao || ''}
                  onChangeText={(v) => setForm({ ...form, descricao: v })}
                />
                <Pressable style={s.botaoPrincipal} onPress={adicionar}>
                  <Text style={s.textoBotao}>Adicionar</Text>
                </Pressable>
              </View>
            )}

            {tipo === 'detalhe' && (
              <View style={s.card}>
                <Ionicons name="receipt-outline" size={34} color={gold} />
                <Text style={s.nome}>{titulo}</Text>
                {subtitulo ? <Text style={s.descricao}>{subtitulo}</Text> : null}
                {visiveis.map((item) => (
                  <View key={item.id} style={s.linha}>
                    <Text style={s.nome}>{item.titulo}</Text>
                    <Text style={s.descricao}>{item.descricao}</Text>
                  </View>
                ))}
                <Pressable style={s.botaoPrincipal} onPress={() => router.back()}>
                  <Text style={s.textoBotao}>Voltar aos pedidos</Text>
                </Pressable>
              </View>
            )}

            {tipo === 'avaliacoes' && (
              <View style={s.card}>
                <Text style={s.nome}>Avaliações dos profissionais</Text>
                <Text style={s.nota}>★ 4,8 / 5</Text>
                <Text style={s.descricao}>
                  Confira as avaliações recebidas e os comentários registrados.
                </Text>
              </View>
            )}

            {tipo !== 'detalhe' && tipo !== 'avaliacoes' && (
              <View style={s.lista}>
                {visiveis.map((item) => (
                  <View key={item.id} style={s.card}>
                    <View style={s.iconeCard}>
                      <Ionicons
                        name={
                          tipo === 'pedidos' ? 'bag-handle-outline' :
                          tipo === 'enderecos' ? 'location-outline' :
                          tipo === 'portfolio' ? 'folder-outline' :
                          tipo === 'favoritos' ? 'person-outline' :
                          'document-text-outline'
                        }
                        size={24}
                        color={gold}
                      />
                    </View>

                    <View style={s.info}>
                      <Text style={s.nome}>{item.titulo}</Text>
                      {!!item.descricao && (
                        <Text style={s.descricao}>{item.descricao}</Text>
                      )}
                      {!!item.profissional && (
                        <Text style={s.descricao}>{item.profissional}</Text>
                      )}
                      {!!item.status && (
                        <Text style={s.status}>{item.status}</Text>
                      )}
                    </View>

                    <View style={s.acoes}>
                      {tipo === 'pedidos' && (
                        <Pressable
                          style={s.botaoPequeno}
                          onPress={() => router.push({
                            pathname: '/Pedidodetalhe',
                            params: {
                              id: item.id,
                              titulo: item.titulo,
                              descricao: item.descricao || '',
                              status: item.status || '',
                              profissional: item.profissional || '',
                            },
                          })}
                        >
                          <Text style={s.textoBotao}>Ver detalhes</Text>
                        </Pressable>
                      )}

                      {['enderecos', 'portfolio', 'favoritos'].includes(tipo) && (
                        <Pressable onPress={() => remover(item.id)} style={s.botaoRemover}>
                          <Ionicons name="trash-outline" size={17} color="#ff7777" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}

                {visiveis.length === 0 && (
                  <Text style={s.vazio}>Nenhum item encontrado.</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={s.rodape}>
          <Text style={s.textoRodape}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <Text style={s.termos}>Termos de Uso  |  Política de Privacidade</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#090909' },
  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  pagina: { flexGrow: 1 },
  topo: {
    minHeight: 76, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 20,
    borderBottomWidth: 1, borderColor: '#51432c',
  },
  topoMobile: { flexWrap: 'wrap', paddingVertical: 8, gap: 10 },
  logo: { width: 110, height: 60 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 },
  link: { color: '#fff', fontSize: 12 },
  painel: {
    width: '96%', maxWidth: 1250, alignSelf: 'center',
    flexDirection: 'row', marginTop: 22, marginBottom: 80,
    backgroundColor: 'rgba(15,15,15,0.97)',
    borderWidth: 1, borderColor: '#292929', borderRadius: 10,
    overflow: 'hidden',
  },
  painelMobile: { flexDirection: 'column', marginTop: 12 },
  menu: {
    width: 205, padding: 10, gap: 5, backgroundColor: '#090a0b',
    borderRightWidth: 1, borderColor: '#292929',
  },
  menuMobile: {
    width: '100%', flexDirection: 'row', flexWrap: 'wrap',
    borderRightWidth: 0, borderBottomWidth: 1,
  },
  itemMenu: {
    minHeight: 37, paddingHorizontal: 10, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 6, backgroundColor: '#191a1c',
  },
  ativo: { borderWidth: 1, borderColor: gold, backgroundColor: '#252117' },
  textoMenu: { color: '#eee', fontSize: 11, flexShrink: 1 },
  principal: { flex: 1, minWidth: 0, padding: 20 },
  titulo: { color: '#fff', fontSize: 25, fontWeight: 'bold' },
  subtitulo: { color: '#aeb7c0', fontSize: 12, marginTop: 5 },
  divisor: { height: 1, backgroundColor: '#8e7138', marginVertical: 16 },
  campo: {
    minHeight: 42, borderWidth: 1, borderColor: '#383838',
    borderRadius: 8, paddingHorizontal: 12, color: '#fff',
    backgroundColor: '#101112', marginBottom: 12,
  },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filtro: { paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: '#383838', borderRadius: 22 },
  filtroAtivo: { backgroundColor: gold, borderColor: gold },
  textoFiltro: { color: '#fff', fontSize: 11 },
  formulario: { marginBottom: 12 },
  lista: { gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    gap: 12, padding: 14, backgroundColor: '#111315',
    borderWidth: 1, borderColor: '#303235', borderRadius: 11,
  },
  iconeCard: {
    width: 52, height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#594823', borderRadius: 10,
  },
  info: { flex: 1, minWidth: 130, gap: 4 },
  nome: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  descricao: { color: '#aab4bf', fontSize: 11, marginTop: 3 },
  status: { color: gold, fontSize: 11, marginTop: 4 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoPequeno: { borderWidth: 1, borderColor: gold, borderRadius: 7, padding: 9 },
  botaoRemover: { padding: 8 },
  botaoPrincipal: {
    alignItems: 'center', justifyContent: 'center', padding: 11,
    backgroundColor: gold, borderRadius: 7, marginBottom: 8,
  },
  textoBotao: { color: '#171512', fontSize: 11, fontWeight: 'bold' },
  vazio: { color: '#aaa', textAlign: 'center', padding: 25 },
  linha: { width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#333' },
  nota: { color: gold, fontSize: 24, marginTop: 12 },
  rodape: {
    minHeight: 48, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 10, padding: 15,
    backgroundColor: '#090909', borderTopWidth: 1, borderColor: gold,
  },
  textoRodape: { color: '#aaa', fontSize: 10 },
  termos: { color: gold, fontSize: 10 },
});
