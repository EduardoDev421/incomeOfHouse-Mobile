
import React from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView,
  StyleSheet, Pressable, useWindowDimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dourado = '#c9a45c';

export default function PerfilProfissional() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compacto = width < 600;

  const menu = [
    { nome: 'Meu Perfil', icone: 'person-outline', rota: '/PerfilProfissional', ativo: true },
    { nome: 'Meus Endereços', icone: 'location-outline', rota: '/meusenderecos' },
    { nome: 'Meu Portfólio', icone: 'folder-outline', rota: '/meuportfolio' },
    { nome: 'Publicar Plantas', icone: 'cloud-upload-outline', rota: '/plantas' },
    { nome: 'Projetos', icone: 'grid-outline', rota: '/projetos' },
    { nome: 'Avaliações', icone: 'star-outline', rota: '/comentarios' },
    { nome: 'Agendamentos', icone: 'calendar-outline', rota: '/agendamentos' },
    { nome: 'Mensagem', icone: 'chatbox-outline', rota: '/mensagens' },
    { nome: 'Configurações', icone: 'settings-outline', rota: '/configuracoes' },
  ];

  const estatisticas = [
    { titulo: 'Resumo Profissional', valor: 'Membro desde · Janeiro/2022', icone: 'briefcase-outline' },
    { titulo: 'Projetos concluídos', valor: '156', icone: 'layers-outline' },
    { titulo: 'Clientes atendidos', valor: '98+', icone: 'people-outline' },
    { titulo: 'Taxa de resposta', valor: '98%', icone: 'chatbubble-ellipses-outline' },
    { titulo: 'Tempo médio de resposta', valor: '1h 30min', icone: 'time-outline' },
  ];

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

          <View style={s.linksTopo}>
            {[
              { nome: 'Início', rota: '/' },
              { nome: 'Plantas', rota: '/plantas' },
              { nome: 'Profissionais', rota: '/profissionais' },
              { nome: 'Sobre Nós', rota: '/sobre' },
            ].map((item) => (
              <Pressable key={item.nome} onPress={() => router.push(item.rota)}>
                <Text style={s.link}>{item.nome}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[s.painel, compacto && s.painelMobile]}>
          <View style={[s.menuLateral, compacto && s.menuMobile]}>
            {menu.map((item) => (
              <Pressable
                key={item.nome}
                style={[s.itemMenu, item.ativo && s.itemAtivo]}
                onPress={() => {
                  if (item.ativo) return;
                  router.push(item.rota);
                }}
              >
                <Ionicons
                  name={item.icone}
                  size={15}
                  color={dourado}
                />
                <Text style={s.textoMenu}>{item.nome}</Text>
              </Pressable>
            ))}

            <Pressable
              style={s.itemMenu}
              onPress={() => router.replace('/login')}
            >
              <Ionicons name="log-out-outline" size={15} color={dourado} />
              <Text style={s.textoMenu}>Sair</Text>
            </Pressable>
          </View>

          <View style={s.principal}>
            <View style={s.cabecalho}>
              <View style={s.titulos}>
                <Text style={s.titulo}>Meu Perfil</Text>
                <Text style={s.subtitulo}>
                  Gerencie suas informações pessoais e preferências.
                </Text>
              </View>

              <Pressable
                style={s.botaoEditar}
                onPress={() => router.push('/editarperfil')}
              >
                <Ionicons name="create-outline" size={14} color={dourado} />
                <Text style={s.textoEditar}>Editar Perfil</Text>
              </Pressable>
            </View>

            <View style={s.usuario}>
              <Pressable
                style={s.foto}
                onPress={() =>
                  Alert.alert('Foto do perfil', 'Adicione aqui a função de alterar sua foto.')
                }
              >
                <Ionicons name="person-circle-outline" size={42} color={dourado} />
                <Text style={s.editarFoto}>Editar Foto</Text>
              </Pressable>

              <View style={s.dadosUsuario}>
                <Text style={s.nome}>Nome do Usuário</Text>
                <Text style={s.profissao}>Profissão do profissional</Text>
              </View>
            </View>

            <View style={[s.conteudoPerfil, compacto && s.conteudoMobile]}>
              <View style={s.sobre}>
                <Text style={s.tituloSobre}>Sobre mim</Text>
                <Text style={s.descricaoSobre}>
                  Descrição do profissional
                </Text>
              </View>

              <View style={s.listaEstatisticas}>
                {estatisticas.map((item) => (
                  <View key={item.titulo} style={s.cardEstatistica}>
                    <Ionicons name={item.icone} size={26} color={dourado} />
                    <View style={s.infoEstatistica}>
                      <Text style={s.tituloEstatistica}>{item.titulo}</Text>
                      <Text style={s.valorEstatistica}>{item.valor}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={s.rodape}>
          <Text style={s.textoRodape}>
            ©IncomeOfHouses. Todos os direitos reservados.
          </Text>
          <Text style={s.textoLegal}>Termos de Uso  |  Política de Privacidade</Text>
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
  conteudo: { flexGrow: 1 },
  topo: {
    minHeight: 66, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 15,
    borderBottomWidth: 1, borderColor: '#292929',
  },
  logo: { width: 90, height: 55 },
  linksTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 25 },
  link: { color: '#fff', fontSize: 12 },
  painel: {
    alignSelf: 'center', flexDirection: 'row', width: '95%',
    maxWidth: 805, marginTop: 22, marginBottom: 90,
    backgroundColor: '#111', borderRadius: 10,
    borderWidth: 1, borderColor: '#333', overflow: 'hidden',
  },
  painelMobile: { flexDirection: 'column', marginTop: 10, width: '96%' },
  menuLateral: {
    width: 180, padding: 10, backgroundColor: '#101010',
    borderRightWidth: 1, borderColor: '#333', gap: 4,
  },
  menuMobile: {
    width: '100%', borderRightWidth: 0,
    borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap',
  },
  itemMenu: {
    minHeight: 30, paddingHorizontal: 10, paddingVertical: 7,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1d1d1f', borderRadius: 6,
  },
  itemAtivo: {
    borderWidth: 1, borderColor: '#6e572b',
    backgroundColor: '#24211b',
  },
  textoMenu: { color: '#fff', fontSize: 11, flexShrink: 1 },
  principal: { flex: 1, minWidth: 0, padding: 12 },
  cabecalho: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, borderBottomWidth: 1,
    borderColor: dourado, paddingBottom: 7,
  },
  titulos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
  subtitulo: { color: '#eee', fontSize: 11, marginTop: 3 },
  botaoEditar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: dourado, borderRadius: 8,
    padding: 8,
  },
  textoEditar: { color: dourado, fontSize: 11 },
  usuario: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginVertical: 15,
  },
  foto: {
    width: 90, height: 90, borderWidth: 1,
    borderStyle: 'dashed', borderColor: dourado,
    borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', gap: 2,
  },
  editarFoto: {
    color: dourado, fontSize: 9, borderWidth: 1,
    borderColor: dourado, borderRadius: 10, padding: 4,
  },
  dadosUsuario: { flex: 1 },
  nome: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  profissao: { color: '#fff', fontSize: 11, marginTop: 3 },
  conteudoPerfil: { flexDirection: 'row', gap: 15 },
  conteudoMobile: { flexDirection: 'column' },
  sobre: {
    flex: 1, minHeight: 220, backgroundColor: '#292929',
    borderWidth: 1, borderColor: dourado, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', padding: 15,
  },
  tituloSobre: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
  descricaoSobre: { color: '#fff', fontSize: 11, textAlign: 'center' },
  listaEstatisticas: { flex: 0.8, gap: 8 },
  cardEstatistica: {
    minHeight: 57, flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 10, backgroundColor: '#191919',
    borderWidth: 1, borderColor: '#333', borderRadius: 12,
  },
  infoEstatistica: { flex: 1 },
  tituloEstatistica: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  valorEstatistica: { color: '#bbb', fontSize: 10, marginTop: 2 },
  rodape: {
    minHeight: 55, paddingHorizontal: 20, paddingVertical: 15,
    borderTopWidth: 1, borderColor: dourado,
    backgroundColor: '#090909', flexDirection: 'row',
    flexWrap: 'wrap', justifyContent: 'space-between', gap: 10,
  },
  textoRodape: { color: '#aaa', fontSize: 10 },
  textoLegal: { color: dourado, fontSize: 10 },
});
