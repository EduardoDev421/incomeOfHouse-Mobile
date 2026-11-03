import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
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

const FAVORITOS_INICIAIS = [
  { id: '1', nome: 'Carlos Silva', funcao: 'Arquiteto', especialidade: 'Projetos residenciais' },
  { id: '2', nome: 'Juliana Martins', funcao: 'Engenheira Civil', especialidade: 'Reformas' },
  { id: '3', nome: 'Fernanda Lima', funcao: 'Arquiteta', especialidade: 'Plantas e interiores' },
  { id: '4', nome: 'Lucas Pereira', funcao: 'Designer de interiores', especialidade: '' },
];

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const iniciais = (nome) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

function CardProfissional({ profissional, mobile, onPerfil, onRemover }) {
  return (
    <View style={[s.card, mobile && s.cardMobile]}>
      <View style={s.topoCard}>
        <View style={s.avatar}>
          {profissional.foto ? (
            <Image source={profissional.foto} style={s.foto} resizeMode="cover" />
          ) : (
            <Text style={s.iniciais}>{iniciais(profissional.nome)}</Text>
          )}
        </View>

        <View style={s.dados}>
          <Text style={s.nome} numberOfLines={1}>
            {profissional.nome}
          </Text>
          <View style={s.tag}>
            <Text style={s.textoTag} numberOfLines={1}>
              {profissional.funcao}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onRemover}
          style={({ pressed }) => [s.btnRemover, pressed && s.pressionado]}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${profissional.nome} dos favoritos`}
          hitSlop={6}
        >
          <Ionicons name="heart" size={18} color={DOURADO} />
        </Pressable>
      </View>

      {!!profissional.especialidade && (
        <View style={s.linhaEspecialidade}>
          <Ionicons name="briefcase-outline" size={14} color={DOURADO} />
          <Text style={s.especialidade}>{profissional.especialidade}</Text>
        </View>
      )}

      <Pressable
        onPress={onPerfil}
        style={({ pressed }) => [s.btnPerfil, pressed && s.pressionado]}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${profissional.nome}`}
      >
        <Text style={s.textoPerfil}>Ver perfil</Text>
        <Ionicons name="chevron-forward" size={16} color="#111" />
      </Pressable>
    </View>
  );
}

export default function Meusprofissionais() {
  const router = useRouter();
  useDeclararConta('usuario');

  const [favoritos, setFavoritos] = useState(FAVORITOS_INICIAIS);
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
      (p) =>
        normalizar(p.nome).includes(termo) ||
        normalizar(p.funcao).includes(termo) ||
        normalizar(p.especialidade).includes(termo)
    );
  }, [favoritos, busca]);

  const remover = (profissional) => {
    setRemovido({
      profissional,
      indice: favoritos.findIndex((p) => p.id === profissional.id),
    });
    setFavoritos((lista) => lista.filter((p) => p.id !== profissional.id));
  };

  const desfazer = () => {
    if (!removido) return;
    setFavoritos((lista) => {
      const copia = [...lista];
      copia.splice(Math.min(removido.indice, copia.length), 0, removido.profissional);
      return copia;
    });
    setRemovido(null);
  };

  return (
    <LayoutConta
      ativo="favoritos"
      titulo="Meus Profissionais Favoritos"
      subtitulo="Encontre rapidamente os profissionais que você salvou."
    >
      {({ mobile }) => (
        <>
          {favoritos.length > 0 && (
            <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
              <Ionicons name="search-outline" size={16} color={DOURADO} />
              <TextInput
                style={s.inputBusca}
                placeholder="Buscar por nome ou profissão"
                placeholderTextColor="#777b83"
                selectionColor={DOURADO}
                value={busca}
                onChangeText={setBusca}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Buscar por nome ou profissão"
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
          )}

          {!!removido && (
            <View style={s.aviso} accessibilityLiveRegion="polite">
              <Text style={s.textoAviso} numberOfLines={2}>
                {removido.profissional.nome} foi removido dos favoritos.
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

          {favoritos.length === 0 ? (
            <View style={s.vazio}>
              <View style={s.vazioIcone}>
                <Ionicons name="heart-outline" size={28} color={DOURADO} />
              </View>
              <Text style={s.tituloVazio}>Você ainda não favoritou nenhum profissional</Text>
              <Text style={s.textoVazio}>
                Explore os profissionais e favorite os que mais combinam com o seu projeto.
              </Text>
              <Pressable
                onPress={() => router.push('/profissionais')}
                style={({ pressed }) => [s.btnPerfil, s.btnVazio, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoPerfil}>Encontrar profissionais</Text>
              </Pressable>
            </View>
          ) : visiveis.length === 0 ? (
            <View style={s.vazio}>
              <Ionicons name="search-outline" size={30} color={DOURADO} />
              <Text style={s.textoVazio}>Nenhum profissional encontrado.</Text>
              <Pressable
                onPress={() => setBusca('')}
                style={({ pressed }) => [s.btnSecundario, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoSecundario}>Limpar busca</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={s.contagem} accessibilityLiveRegion="polite">
                {visiveis.length === 1 ? '1 profissional' : `${visiveis.length} profissionais`}
              </Text>

              <View style={[s.grade, mobile && s.gradeMobile]}>
                {visiveis.map((profissional) => (
                  <CardProfissional
                    key={profissional.id}
                    profissional={profissional}
                    mobile={mobile}
                    onPerfil={() =>
                      router.push({
                        pathname: '/detalhesProfissionais',
                        params: { id: profissional.id },
                      })
                    }
                    onRemover={() => remover(profissional)}
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
    flexBasis: 280,
    minWidth: 260,
    gap: 12,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardMobile: { ...ALTURA_AUTO, minWidth: 0, borderRadius: 14 },

  topoCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 28,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  iniciais: { color: DOURADO, fontSize: 18, fontWeight: 'bold' },
  dados: { flex: 1, minWidth: 0, gap: 6 },
  nome: { color: '#fff', fontSize: 16, fontWeight: '600' },
  tag: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#29231a',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  textoTag: { color: DOURADO, fontSize: 12 },

  btnRemover: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
  },

  linhaEspecialidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#292929',
  },
  especialidade: { flex: 1, color: '#a5a5a5', fontSize: 13 },

  btnPerfil: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    backgroundColor: DOURADO,
    borderRadius: 8,
  },
  textoPerfil: { color: '#111', fontSize: 14, fontWeight: 'bold' },

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
  btnVazio: { marginTop: 6 },
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