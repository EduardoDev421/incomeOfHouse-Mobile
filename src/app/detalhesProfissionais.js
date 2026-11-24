import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, StatusBar, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLegal } from '../components/LegalProvider';
import { buscarProfissional } from '../services/profissionais';

const OURO = '#d9ad52';
const FUNDO = require('../../assets/images/BackGroundPlantasEProfissionais.png');
const ESTADOS = {
  AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará',
  DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão', MT:'Mato Grosso',
  MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará', PB:'Paraíba', PR:'Paraná',
  PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro', RN:'Rio Grande do Norte',
  RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima', SC:'Santa Catarina',
  SP:'São Paulo', SE:'Sergipe', TO:'Tocantins',
};
export default function DetalhesProfissionais() {
  const router = useRouter();
  const { abrirLegal } = useLegal();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const largo = width >= 900;
  const idProfissional = Array.isArray(id) ? id[0] : id;
  const [profissional, setProfissional] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    buscarProfissional(idProfissional)
      .then((dados) => { if (ativo) setProfissional(dados); })
      .catch((falha) => { if (ativo) setErro(falha?.message || 'Não foi possível carregar este profissional.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [idProfissional]));
  const localizacao = profissional
    ? [profissional.cidade, ESTADOS[profissional.estado] || profissional.estado].filter(Boolean).join(' - ') || 'Não informado'
    : '';
  return (
    <View style={styles.raiz}>
      <StatusBar barStyle="light-content" />
      <Image source={FUNDO} style={styles.fundoImagem} resizeMode="cover" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudo}>
        <View style={[styles.topo, largo ? styles.topoLargo : styles.topoEstreito]}>
          <Pressable onPress={() => router.push('/')} accessibilityRole="button">
            <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
          <View style={[styles.menu, !largo && styles.menuEstreito]}>
            <Pressable style={styles.item} onPress={() => router.push('/')}><Text style={styles.textoItem}>Início</Text></Pressable>
            <Pressable style={styles.item} onPress={() => router.push('/planta')}><Text style={styles.textoItem}>Plantas</Text></Pressable>
            <Pressable style={styles.item} onPress={() => router.push('/profissionais')}><Text style={styles.textoItem}>Profissionais</Text></Pressable>
            <Pressable style={styles.item} onPress={() => router.push('/sobreNos')}><Text style={styles.textoItem}>Sobre Nós</Text></Pressable>
          </View>
        </View>
        <View style={[styles.pagina, largo && styles.paginaLarga]}>
          {carregando ? <Text style={styles.mensagem}>Carregando perfil profissional...</Text>
            : erro ? <View style={styles.estadoVazio}><Text style={styles.mensagem}>Não foi possível carregar o perfil.</Text><Text style={styles.mensagemDetalhe}>{erro}</Text></View>
            : !profissional ? <View style={styles.estadoVazio}><Text style={styles.mensagem}>Profissional não encontrado.</Text></View>
            : <View style={[styles.cartao, largo && styles.cartaoLargo]}>
              <View style={[styles.fotoArea, largo && styles.fotoAreaLarga]}><Ionicons name="person" size={100} color="#444" /></View>
              <View style={styles.informacoes}>
                <Text style={styles.nome}>{profissional.nome}</Text>
                <Text style={styles.profissao}>{profissional.profissaoNome}</Text>
                <View style={styles.status}>
                  <Ionicons name={profissional.statusVerificacao === 'verified' ? 'shield-checkmark' : 'time-outline'} size={17} color={OURO} />
                  <Text style={styles.statusTexto}>{profissional.statusLabel}</Text>
                </View>
                <View style={styles.dados}>
                  <View style={styles.dado}><Text style={styles.dadoTitulo}>Localização</Text><Text style={styles.dadoTexto}>{localizacao}</Text></View>
                  <View style={styles.dado}><Text style={styles.dadoTitulo}>Registro profissional</Text><Text style={styles.dadoTexto}>{profissional.registro || 'Não informado'}</Text></View>
                </View>
                <Text style={styles.descricao}>Perfil profissional cadastrado no IncomeOfHouse. A situação da verificação é exibida separadamente e não representa, por si só, uma certificação.</Text>
                <Pressable style={({ pressed }) => [styles.botaoVoltar, pressed && styles.pressionado]} onPress={() => router.back()} accessibilityRole="button">
                  <Text style={styles.botaoVoltarTexto}>Voltar para profissionais</Text>
                </Pressable>
              </View>
            </View>}
        </View>
        <View style={styles.rodape}>
          <Text style={styles.textoRodape}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.linksRodape}>
            <Pressable onPress={() => abrirLegal('termos')} accessibilityRole="button" hitSlop={8}><Text style={styles.linkRodape}>Termos de Uso</Text></Pressable>
            <Text style={styles.separadorRodape}>|</Text>
            <Pressable onPress={() => abrirLegal('privacidade')} accessibilityRole="button" hitSlop={8}><Text style={styles.linkRodape}>Política de Privacidade</Text></Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  raiz:{flex:1,backgroundColor:'#0b0b0b'}, fundoImagem:{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'},
  scroll:{flex:1,backgroundColor:'transparent'}, conteudo:{flexGrow:1},
  topo:{backgroundColor:'rgba(10,10,10,0.25)',borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.05)',paddingHorizontal:24},
  topoLargo:{height:75,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:'6%'},
  topoEstreito:{alignItems:'center',paddingTop:40,paddingBottom:16}, logo:{width:90,height:48},
  menu:{flexDirection:'row',alignItems:'center',gap:8}, menuEstreito:{flexWrap:'wrap',justifyContent:'center',marginTop:10},
  item:{paddingVertical:10,paddingHorizontal:12}, textoItem:{color:'#fff',fontSize:13,fontWeight:'500'},
  pagina:{width:'92%',maxWidth:1100,alignSelf:'center',paddingVertical:32,flexGrow:1}, paginaLarga:{paddingVertical:55},
  cartao:{backgroundColor:'rgba(18,18,18,0.96)',borderRadius:20,borderWidth:1,borderColor:'rgba(218,174,82,0.38)',overflow:'hidden'},
  cartaoLargo:{flexDirection:'row',minHeight:430}, fotoArea:{height:250,backgroundColor:'#161616',alignItems:'center',justifyContent:'center'},
  fotoAreaLarga:{width:320,height:430}, informacoes:{flex:1,padding:28,gap:12},
  nome:{color:'#fff',fontSize:30,fontWeight:'700'}, profissao:{color:OURO,fontSize:17,fontWeight:'600'},
  status:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:'rgba(217,173,82,0.45)',backgroundColor:'rgba(217,173,82,0.08)',borderRadius:20,paddingVertical:8,paddingHorizontal:12},
  statusTexto:{color:'#e5c77f',fontSize:13,fontWeight:'600'}, dados:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:10},
  dado:{flexGrow:1,flexBasis:190,backgroundColor:'rgba(255,255,255,0.035)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:12,padding:16},
  dadoTitulo:{color:'#999',fontSize:12,marginBottom:7}, dadoTexto:{color:OURO,fontSize:14,fontWeight:'500'},
  descricao:{color:'#aaa',fontSize:13,lineHeight:22,marginTop:8}, botaoVoltar:{alignSelf:'flex-start',marginTop:10,paddingVertical:12,paddingHorizontal:18,borderRadius:9,borderWidth:1,borderColor:OURO},
  botaoVoltarTexto:{color:OURO,fontSize:13,fontWeight:'600'}, pressionado:{opacity:0.75},
  estadoVazio:{minHeight:260,justifyContent:'center',alignItems:'center',gap:10}, mensagem:{color:'#eee',fontSize:16,textAlign:'center',marginVertical:20},
  mensagemDetalhe:{color:'#999',fontSize:12,textAlign:'center'},
  rodape:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:16,paddingVertical:22,paddingHorizontal:'6%',backgroundColor:'#080808',borderTopWidth:1,borderTopColor:'#d4af6a'},
  textoRodape:{color:'#888',fontSize:13},linksRodape:{flexDirection:'row',alignItems:'center',gap:10},
  linkRodape:{color:'#d4af6a',fontSize:13},separadorRodape:{color:'#555',fontSize:13},
});
