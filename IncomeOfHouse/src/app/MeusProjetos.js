import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LayoutConta } from '../components/TelaConta';
import { useDeclararConta } from '../components/ContaProvider';

const DOURADO = '#d4a63a';

const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const PROJETOS_INICIAIS = [
  { id: '1', nome: 'Casa moderna', tipo: 'Residencial', descricao: 'Projeto residencial contemporâneo, com ambientes integrados e muita luz natural.' },
  { id: '2', nome: 'Casa de campo', tipo: 'Residencial', descricao: 'Projeto integrado à natureza, pensado para o descanso e a vida ao ar livre.' },
  { id: '3', nome: 'Sala elegante', tipo: 'Interiores', descricao: 'Sala de estar com acabamentos sofisticados e iluminação que valoriza cada detalhe.' },
  { id: '4', nome: 'Jardim moderno', tipo: 'Jardins', descricao: 'Paisagismo de áreas externas com linhas limpas e plantas de fácil manutenção.' },
  { id: '5', nome: 'Cozinha planejada', tipo: 'Interiores', descricao: 'Cozinha funcional com marcenaria sob medida e aproveitamento total do espaço.' },
  { id: '6', nome: 'Casa minimalista', tipo: 'Residencial', descricao: 'Arquitetura enxuta, de poucos elementos e muita elegância, com foco no essencial.' },
];

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function CardProjeto({ projeto, mobile, onVer, onRemover }) {
  return (
    <View style={[s.card, mobile && s.cardMobile]}>
      <View style={s.thumb}>
        <Ionicons name="home-outline" size={48} color={DOURADO} style={s.iconeThumb} />

        <Pressable
          onPress={onRemover}
          style={({ pressed }) => [s.btnRemover, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${projeto.nome} dos favoritos`}
          hitSlop={6}
        >
          <Ionicons name="heart" size={18} color={DOURADO} />
        </Pressable>
      </View>

      <Text style={s.nome}>{projeto.nome}</Text>

      <View style={s.tag}>
        <Text style={s.textoTag}>{projeto.tipo}</Text>
      </View>

      <Text style={s.descricao}>{projeto.descricao}</Text>

      <Pressable
        onPress={onVer}
        style={({ pressed }) => [s.btnVer, pressed && s.pressionado]}
        accessibilityRole="button"
        accessibilityLabel={`Ver projeto ${projeto.nome}`}
      >
        <Text style={s.textoVer}>Ver Projeto</Text>
      </Pressable>
    </View>
  );
}

export default function MeusProjetos() {
  const router = useRouter();
  useDeclararConta('usuario');
  const [favoritos, setFavoritos] = useState(PROJETOS_INICIAIS);
  const [busca, setBusca] = useState('');
  const [removido, setRemovido] = useState(null);

  useEffect(() => {
    if (!removido) return undefined;
    const t = setTimeout(() => setRemovido(null), 6000);
    return () => clearTimeout(t);
  }, [removido]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return favoritos;
    return favoritos.filter(
      (p) => normalizar(p.nome).includes(termo) || normalizar(p.tipo).includes(termo)
    );
  }, [favoritos, busca]);

  const remover = (projeto) => {
    setRemovido({ projeto, indice: favoritos.findIndex((p) => p.id === projeto.id) });
    setFavoritos((lista) => lista.filter((p) => p.id !== projeto.id));
  };

  const desfazer = () => {
    if (!removido) return;
    setFavoritos((lista) => {
      const copia = [...lista];
      copia.splice(Math.min(removido.indice, copia.length), 0, removido.projeto);
      return copia;
    });
    setRemovido(null);
  };

  return (
    <LayoutConta
      ativo="salvos"
      titulo="Meus Projetos Favoritos"
      subtitulo="Visualize e gerencie os projetos que você salvou."
    >
      {({ mobile }) => (
        <>
          <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
            <Ionicons name="search-outline" size={16} color={DOURADO} />
            <TextInput
              style={s.inputBusca}
              placeholder="Buscar por nome ou tipo de projeto"
              placeholderTextColor="#777b83"
              selectionColor={DOURADO}
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Buscar por nome ou tipo de projeto"
            />
            {!!busca && (
              <Pressable
                onPress={() => setBusca('')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
              >
                <Ionicons name="close-circle" size={18} color="#777b83" />
              </Pressable>
            )}
          </View>

          {!!removido && (
            <View style={s.aviso} accessibilityLiveRegion="polite">
              <Text style={s.textoAviso} numberOfLines={2}>
                {removido.projeto.nome} foi removido dos favoritos.
              </Text>
              <Pressable
                onPress={desfazer}
                hitSlop={10}
                accessibilityRole="button"
                style={({ pressed }) => pressed && s.pressionado}
              >
                <Text style={s.textoDesfazer}>Desfazer</Text>
              </Pressable>
            </View>
          )}

          {visiveis.length === 0 ? (
            <View style={s.vazio}>
              <View style={s.vazioIcone}>
                <Ionicons name="heart-outline" size={28} color={DOURADO} />
              </View>
              <Text style={s.tituloVazio}>Nenhum projeto encontrado</Text>
              <Text style={s.textoVazio}>
                Explore as plantas e salve os projetos que mais combinam com você.
              </Text>

              <View style={s.acoesVazio}>
                {!!busca.trim() && (
                  <Pressable
                    onPress={() => setBusca('')}
                    style={({ pressed }) => [s.btnSecundario, pressed && s.pressionado]}
                    accessibilityRole="button"
                  >
                    <Text style={s.textoSecundario}>Limpar busca</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => router.push('/planta')}
                  style={({ pressed }) => [s.btnVer, s.btnVazio, pressed && s.pressionado]}
                  accessibilityRole="button"
                >
                  <Text style={s.textoVer}>Explorar projetos</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={s.contagem} accessibilityLiveRegion="polite">
                {visiveis.length === 1 ? '1 projeto' : `${visiveis.length} projetos`}
              </Text>

              <View style={[s.grade, mobile && s.gradeMobile]}>
                {visiveis.map((projeto) => (
                  <CardProjeto
                    key={projeto.id}
                    projeto={projeto}
                    mobile={mobile}
                    onVer={() =>
                      router.push({
                        pathname: '/detalhesPlantas',
                        params: { id: projeto.id },
                      })
                    }
                    onRemover={() => remover(projeto)}
                  />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </LayoutConta>
  );
}

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  campoBusca: {
    width: 320,
    maxWidth: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  campoBuscaMobile: { width: '100%' },
  inputBusca: {
    flex: 1,
    height: '100%',
    color: '#eee',
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 10,
  },
  textoAviso: { flex: 1, color: '#eee', fontSize: 13 },
  textoDesfazer: {
    color: DOURADO,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  contagem: { color: '#a5a5a5', fontSize: 13 },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gradeMobile: { ...ALTURA_AUTO, flexDirection: 'column', flexWrap: 'nowrap' },

  card: {
    flexGrow: 1,
    flexBasis: 260,
    minWidth: 240,
    gap: 8,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardMobile: { ...ALTURA_AUTO, minWidth: 0, borderRadius: 14 },

  thumb: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#1b1711',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
    overflow: 'hidden',
  },
  iconeThumb: { opacity: 0.7 },
  btnRemover: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
  },

  nome: { color: '#fff', fontSize: 17, fontWeight: '600' },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  textoTag: { color: DOURADO, fontSize: 12 },
  descricao: { color: '#a5a5a5', fontSize: 13, lineHeight: 20 },

  btnVer: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: DOURADO,
    borderRadius: 8,
  },
  textoVer: { color: DOURADO, fontSize: 14, fontWeight: '600' },

  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  vazioIcone: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderRadius: 30,
  },
  tituloVazio: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  textoVazio: { color: '#a5a5a5', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  acoesVazio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  btnVazio: { marginTop: 0 },
  btnSecundario: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
  },
  textoSecundario: { color: '#fff', fontSize: 14 },
});