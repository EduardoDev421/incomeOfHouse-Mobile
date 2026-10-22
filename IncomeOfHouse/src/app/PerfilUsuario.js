
import React from 'react';
import {
  View, Text, Image, ImageBackground, ScrollView,
  StyleSheet, Pressable, useWindowDimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dourado = '#c9a45c';

export default function PerfilUsuario() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 650;

  const menu = [
    ['Meu Perfil', 'person-outline', '/PerfilUsuario'],
    ['Meus Endereços', 'location-outline', '/meusenderecos'],
    ['Meus Pedidos', 'grid-outline', '/meuspedidos'],
    ['Meus Profissionais Favoritos', 'star-outline', '/meusprofissionais'],
    ['Projetos Salvos', 'bookmark-outline', '/projetossalvos'],
    ['Agendamentos', 'calendar-outline', '/agendamentos'],
    ['Mensagem', 'chatbox-outline', '/mensagens'],
    ['Configurações', 'settings-outline', '/configuracoes'],
  ];

  const atividades = [
    {
      titulo: 'Projeto salvo',
      descricao: 'Você salvou o projeto "Casa Moderna".',
      data: 'Hoje, 14:30',
      icone: 'bookmark-outline',
    },
    {
      titulo: 'Profissional favoritado',
      descricao: 'Você favoritou o profissional "Arq. João Silva".',
      data: 'Ontem, 10:15',
      icone: 'heart-outline',
    },
    {
      titulo: 'Pedido realizado',
      descricao: 'Novo pedido realizado: #1294',
      data: '18/05/2025',
      icone: 'briefcase-outline',
    },
    {
      titulo: 'Mensagem recebida',
      descricao: 'Você recebeu uma nova mensagem.',
      data: '17/05/2024',
      icone: 'chatbubble-outline',
    },
  ];

  const estatisticas = [
    { numero: '12', titulo: 'Projetos Salvos', icone: 'bookmark-outline' },
    { numero: '8', titulo: 'Profissionais Favoritos', icone: 'star-outline' },
    { numero: '15', titulo: 'Pedidos Realizados', icone: 'briefcase-outline' },
  ];

  const informacoes = [
    ['Nome Completo', 'Nome Sobrenome', 'person-outline'],
    ['Data de Nascimento', '00/00/0000', 'calendar-outline'],
    ['CPF', '000.000.000-00', 'card-outline'],
    ['E-mail', 'email@gmail.com', 'mail-outline'],
    ['Telefone', '(00) 00000-0000', 'call-outline'],
    ['Senha', '••••••••••', 'lock-closed-outline'],
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/BackgroundFundo.png')}
      style={s.fundo}
      resizeMode="cover"
    >
      <View style={s.sombra} />

      <ScrollView contentContainerStyle={s.conteudo}>
        <View style={[s.topo, mobile && s.topoMobile]}>
          <Pressable onPress={() => router.push('/')}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </Pressable>

          <View style={s.linksTopo}>
            {[
              ['Início', '/'],
              ['Plantas', '/plantas'],
              ['Profissionais', '/profissionais'],
              ['Sobre Nós', '/sobre'],
            ].map(([nome, rota]) => (
              <Pressable key={nome} onPress={() => router.push(rota)}>
                <Text style={s.linkTopo}>{nome}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[s.painel, mobile && s.painelMobile]}>
          <View style={[s.menuLateral, mobile && s.menuMobile]}>
            {menu.map(([nome, icone, rota], index) => (
              <Pressable
                key={nome}
                style={[s.itemMenu, index === 0 && s.itemAtivo]}
                onPress={() => {
                  if (index !== 0) router.push(rota);
                }}
              >
                <Ionicons name={icone} size={16} color={dourado} />
                <Text style={s.textoMenu}>{nome}</Text>
              </Pressable>
            ))}

            <Pressable
              style={s.itemMenu}
              onPress={() => router.replace('/login')}
            >
              <Ionicons name="log-out-outline" size={16} color={dourado} />
              <Text style={s.textoMenu}>Sair</Text>
            </Pressable>
          </View>

          <View style={s.principal}>
            <Text style={s.aviso}>
              Você precisa estar logado para visualizar seus dados.
            </Text>

            <Pressable onPress={() => router.push('/login')}>
              <Text style={s.linkLogin}>Ir para o login</Text>
            </Pressable>

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
                <Ionicons name="create-outline" size={15} color={dourado} />
                <Text style={s.textoEditar}>Editar Perfil</Text>
              </Pressable>
            </View>

            <View style={[s.resumo, mobile && s.resumoMobile]}>
              <View style={s.usuario}>
                <View style={s.foto}>
                  <Ionicons
                    name="person-circle-outline"
                    size={66}
                    color={dourado}
                  />
                </View>

                <View style={s.dadosUsuario}>
                  <Text style={s.nome}>Usuário não identificado</Text>
                  <Text style={s.dataMembro}>
                    <Ionicons name="calendar-outline" size={14} color={dourado} />
                    {'  '}Membro Desde: Janeiro/2024
                  </Text>
                </View>
              </View>

              <View style={s.estatisticas}>
                {estatisticas.map((item) => (
                  <View key={item.titulo} style={s.cardEstatistica}>
                    <Ionicons name={item.icone} size={23} color={dourado} />
                    <Text style={s.numero}>{item.numero}</Text>
                    <Text style={s.nomeEstatistica}>{item.titulo}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[s.colunas, mobile && s.colunasMobile]}>
              <View style={s.cardGrande}>
                <Text style={s.tituloCard}>Informações Pessoais</Text>

                {informacoes.map(([nome, valor, icone]) => (
                  <View key={nome} style={s.linhaInfo}>
                    <View style={s.rotulo}>
                      <Ionicons name={icone} size={15} color={dourado} />
                      <Text style={s.textoInfo}>{nome}</Text>
                    </View>
                    <Text style={s.valorInfo}>{valor}</Text>
                  </View>
                ))}

                <Pressable
                  style={s.botaoLargo}
                  onPress={() => router.push('/alterarsenha')}
                >
                  <Text style={s.textoBotao}>Alterar Senha</Text>
                </Pressable>
              </View>

              <View style={s.cardGrande}>
                <Text style={s.tituloCard}>Atividades Recentes</Text>

                {atividades.map((item) => (
                  <View key={item.titulo} style={s.atividade}>
                    <Ionicons name={item.icone} size={19} color={dourado} />

                    <View style={s.detalhesAtividade}>
                      <Text style={s.tituloAtividade}>{item.titulo}</Text>
                      <Text style={s.descricaoAtividade}>{item.descricao}</Text>
                    </View>

                    <Text style={s.dataAtividade}>{item.data}</Text>
                  </View>
                ))}

                <Pressable
                  style={s.botaoLargo}
                  onPress={() => Alert.alert(
                    'Atividades',
                    'A lista completa poderá ser conectada ao histórico do usuário.'
                  )}
                >
                  <Text style={s.textoBotao}>Ver todas as atividades</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={s.rodape}>
          <Text style={s.textoRodape}>
            ©IncomeOfHouses. Todos os direitos reservados.
          </Text>
          <Text style={s.termos}>
            Termos de Uso  |  Política de Privacidade
          </Text>
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
    minHeight: 76, flexDirection: 'row',
    justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: 25, borderBottomWidth: 1, borderColor: '#292929',
  },
  topoMobile: { flexWrap: 'wrap', paddingVertical: 8, gap: 10 },
  logo: { width: 110, height: 62 },
  linksTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 30 },
  linkTopo: { color: '#fff', fontSize: 13 },
  painel: {
    width: '96%', maxWidth: 1120, alignSelf: 'center',
    flexDirection: 'row', marginTop: 28, marginBottom: 90,
    backgroundColor: '#111', borderWidth: 1,
    borderColor: '#333', borderRadius: 10, overflow: 'hidden',
  },
  painelMobile: { flexDirection: 'column', marginTop: 14 },
  menuLateral: {
    width: 180, padding: 11, gap: 4,
    backgroundColor: '#101010', borderRightWidth: 1, borderColor: '#333',
  },
  menuMobile: {
    width: '100%', flexDirection: 'row', flexWrap: 'wrap',
    borderRightWidth: 0, borderBottomWidth: 1,
  },
  itemMenu: {
    minHeight: 32, flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: 8, borderRadius: 6, backgroundColor: '#1d1d1f',
  },
  itemAtivo: { borderWidth: 1, borderColor: '#6e572b' },
  textoMenu: { color: '#fff', fontSize: 11, flexShrink: 1 },
  principal: { flex: 1, minWidth: 0, padding: 12 },
  aviso: { color: '#fff', fontSize: 11 },
  linkLogin: { color: '#a58cff', fontSize: 12, textDecorationLine: 'underline' },
  cabecalho: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: 10, marginTop: 14,
    paddingBottom: 17, borderBottomWidth: 1, borderColor: dourado,
  },
  titulos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  subtitulo: { color: '#eee', fontSize: 12 },
  botaoEditar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    padding: 9, borderWidth: 1, borderColor: dourado, borderRadius: 8,
  },
  textoEditar: { color: dourado, fontSize: 11 },
  resumo: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 15, marginVertical: 14,
  },
  resumoMobile: { flexDirection: 'column', alignItems: 'stretch' },
  usuario: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  foto: {
    width: 100, height: 100, borderWidth: 1,
    borderStyle: 'dashed', borderColor: dourado,
    borderRadius: 60, alignItems: 'center', justifyContent: 'center',
  },
  dadosUsuario: { flex: 1 },
  nome: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  dataMembro: { color: '#fff', fontSize: 11, marginTop: 15 },
  estatisticas: { flexDirection: 'row', gap: 10 },
  cardEstatistica: {
    width: 105, minHeight: 118, alignItems: 'center',
    justifyContent: 'center', gap: 7, padding: 8,
    borderWidth: 1, borderColor: '#292929',
    backgroundColor: '#171717', borderRadius: 10,
  },
  numero: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
  nomeEstatistica: { color: '#fff', fontSize: 11, textAlign: 'center' },
  colunas: { flexDirection: 'row', gap: 18 },
  colunasMobile: { flexDirection: 'column' },
  cardGrande: {
    flex: 1, minWidth: 0, padding: 14,
    backgroundColor: '#181818', borderWidth: 1,
    borderColor: '#333', borderRadius: 10,
  },
  tituloCard: {
    color: '#fff', fontSize: 18, fontWeight: 'bold',
    paddingBottom: 12, borderBottomWidth: 1, borderColor: '#383838',
  },
  linhaInfo: {
    minHeight: 47, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    gap: 8, borderBottomWidth: 1, borderColor: '#353535',
  },
  rotulo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  textoInfo: { color: '#aaa', fontSize: 11 },
  valorInfo: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  botaoLargo: {
    minHeight: 35, alignItems: 'center', justifyContent: 'center',
    marginTop: 14, padding: 8, borderWidth: 1,
    borderColor: dourado, backgroundColor: '#292929', borderRadius: 7,
  },
  textoBotao: { color: dourado, fontSize: 11 },
  atividade: {
    minHeight: 72, flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderColor: '#353535',
  },
  detalhesAtividade: { flex: 1 },
  tituloAtividade: { color: '#fff', fontSize: 12 },
  descricaoAtividade: { color: '#aaa', fontSize: 9, marginTop: 3 },
  dataAtividade: { color: '#aaa', fontSize: 10 },
  rodape: {
    minHeight: 55, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', alignItems: 'center',
    gap: 10, paddingHorizontal: 25, paddingVertical: 15,
    backgroundColor: '#090909', borderTopWidth: 1, borderColor: dourado,
  },
  textoRodape: { color: '#aaa', fontSize: 10 },
  termos: { color: dourado, fontSize: 10 },
});
