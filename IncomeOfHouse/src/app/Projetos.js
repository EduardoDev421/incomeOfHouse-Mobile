import React, { useState, useMemo } from 'react';
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

const DOURADO = '#c9a45c';

const ALTURA_AUTO = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };

const SALVOS_INICIAIS = [
  { id: '1', nome: 'Casa moderna', descricao: 'Projeto residencial contemporâneo', tipo: 'Residencial', quartos: 4, garagens: 3, area: 320, salvoEm: '2026-10-20' },
  { id: '2', nome: 'Casa de campo', descricao: 'Projeto integrado à natureza', tipo: 'Campo', quartos: 5, garagens: 4, area: 450, salvoEm: '2026-10-12' },
];

const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function CardResumo({ rotulo, valor, mobile }) {
  return (
    <View
      style={[s.cardResumo, mobile && s.cardResumoMobile]}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <Text style={s.rotuloResumo}>{rotulo}</Text>
      <Text
        style={[s.valorResumo, mobile && s.valorResumoMobile]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {valor}
      </Text>
    </View>
  );
}

function CardSalvo({ projeto, mobile, confirmando, onAcessar, onPedirRemover, onCancelar, onRemover }) {
  return (
    <View style={[s.card, mobile && s.cardMobile]}>
      <View style={s.thumb}>
        {projeto.foto ? (
          <Image source={projeto.foto} style={s.fotoThumb} resizeMode="cover" />
        ) : (
          <Ionicons name="home-outline" size={54} color={DOURADO} style={s.iconeThumb} />
        )}

        <View style={s.tag}>
          <Text style={s.textoTag}>{projeto.tipo}</Text>
        </View>

        <View style={s.coracao} accessible accessibilityLabel="Projeto salvo">
          <Ionicons name="heart" size={16} color={DOURADO} />
        </View>
      </View>

      <View style={s.corpo}>
        <Text style={s.nome}>{projeto.nome}</Text>
        <Text style={s.descricao}>{projeto.descricao}</Text>

        <View style={s.specs}>
          <View style={s.spec}>
            <Ionicons name="bed-outline" size={15} color={DOURADO} />
            <Text style={s.textoSpec}>{projeto.quartos}</Text>
          </View>
          <View style={s.spec}>
            <Ionicons name="car-outline" size={15} color={DOURADO} />
            <Text style={s.textoSpec}>{projeto.garagens}</Text>
          </View>
          <View style={s.spec}>
            <Ionicons name="resize-outline" size={15} color={DOURADO} />
            <Text style={s.textoSpec}>{projeto.area} m²</Text>
          </View>
        </View>

        <Text style={s.salvoEm}>Salvo em {formatarData(projeto.salvoEm)}</Text>

        {confirmando ? (
          <View style={s.confirmar} accessibilityLiveRegion="polite">
            <Text style={s.textoConfirmar}>Remover dos salvos?</Text>
            <View style={s.acoes}>
              <Pressable
                onPress={onCancelar}
                style={({ pressed }) => [s.botaoCancelar, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoCancelar}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={onRemover}
                style={({ pressed }) => [s.botaoConfirmar, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoBotaoConfirmar}>Remover</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={s.acoes}>
            <Pressable
              onPress={onAcessar}
              style={({ pressed }) => [s.botaoPrincipal, pressed && s.pressionado]}
              accessibilityRole="button"
              accessibilityLabel={`Acessar projeto ${projeto.nome}`}
            >
              <Text style={s.textoPrincipal}>Acessar projeto</Text>
              <Ionicons name="chevron-forward" size={16} color="#111" />
            </Pressable>

            <Pressable
              onPress={onPedirRemover}
              style={({ pressed }) => [s.botaoRemover, pressed && s.pressionado]}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${projeto.nome} dos salvos`}
              hitSlop={4}
            >
              <Ionicons name="trash-outline" size={19} color="#c9c9c9" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ProjetosSalvos() {
  const router = useRouter();
  useDeclararConta('cliente');

  const [salvos, setSalvos] = useState(SALVOS_INICIAIS);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [ordem, setOrdem] = useState('recentes');
  const [confirmando, setConfirmando] = useState(null);

  const tipos = useMemo(() => {
    const unicos = [...new Set(salvos.map((p) => p.tipo))];
    return [
      { chave: 'todos', texto: 'Todos', total: salvos.length },
      ...unicos.map((t) => ({
        chave: t,
        texto: t,
        total: salvos.filter((p) => p.tipo === t).length,
      })),
    ];
  }, [salvos]);

  const tipoAtivo = tipos.some((t) => t.chave === tipo) ? tipo : 'todos';

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtrados = salvos.filter(
      (p) =>
        (tipoAtivo === 'todos' || p.tipo === tipoAtivo) &&
        (!termo ||
          normalizar(p.nome).includes(termo) ||
          normalizar(p.descricao).includes(termo))
    );

    return [...filtrados].sort((a, b) =>
      ordem === 'nome'
        ? a.nome.localeCompare(b.nome)
        : b.salvoEm.localeCompare(a.salvoEm)
    );
  }, [salvos, busca, tipoAtivo, ordem]);

  const maisRecente = useMemo(
    () => (salvos.length ? [...salvos].sort((a, b) => b.salvoEm.localeCompare(a.salvoEm))[0] : null),
    [salvos]
  );

  const filtrosAtivos = tipoAtivo !== 'todos' || !!busca.trim();

  const limparFiltros = () => {
    setTipo('todos');
    setBusca('');
  };

  const remover = (id) => {
    setSalvos((lista) => lista.filter((p) => p.id !== id));
    setConfirmando(null);
  };

  return (
    <LayoutConta
      ativo="projetosSalvos"
      titulo="Projetos salvos"
      subtitulo="Gerencie seus projetos salvos."
    >
      {({ mobile }) => (
        <>
          {salvos.length === 0 ? (
            <View style={s.vazio}>
              <View style={s.vazioIcone}>
                <Ionicons name="heart-outline" size={30} color={DOURADO} />
              </View>
              <Text style={s.tituloVazio}>Você ainda não salvou nenhum projeto</Text>
              <Text style={s.textoVazio}>
                Toque no coração de uma planta para guardá-la aqui e acessar depois.
              </Text>
              <Pressable
                onPress={() => router.push('/planta')}
                style={({ pressed }) => [s.botaoExplorar, pressed && s.pressionado]}
                accessibilityRole="button"
              >
                <Text style={s.textoExplorar}>Explorar plantas</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={s.resumo}>
                <CardResumo rotulo="Projetos salvos" valor={String(salvos.length)} mobile={mobile} />
                <CardResumo
                  rotulo="Salvo mais recente"
                  valor={maisRecente ? formatarData(maisRecente.salvoEm) : '-'}
                  mobile={mobile}
                />
              </View>

              <View style={[s.controles, mobile && s.controlesMobile]}>
                <View style={[s.campoBusca, mobile && s.campoBuscaMobile]}>
                  <Ionicons name="search-outline" size={16} color={DOURADO} />
                  <TextInput
                    style={s.inputBusca}
                    placeholder="Buscar nos salvos"
                    placeholderTextColor="#777b83"
                    selectionColor={DOURADO}
                    value={busca}
                    onChangeText={setBusca}
                    returnKeyType="search"
                    autoCorrect={false}
                    accessibilityLabel="Buscar nos projetos salvos"
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

                <Pressable
                  onPress={() => setOrdem((o) => (o === 'recentes' ? 'nome' : 'recentes'))}
                  style={({ pressed }) => [s.botaoOrdem, pressed && s.pressionado]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ordenação: ${ordem === 'recentes' ? 'mais recentes' : 'nome A-Z'}. Tocar para alternar`}
                >
                  <Ionicons name="swap-vertical-outline" size={16} color={DOURADO} />
                  <Text style={s.textoOrdem}>
                    {ordem === 'recentes' ? 'Mais recentes' : 'Nome (A-Z)'}
                  </Text>
                </Pressable>
              </View>

              {tipos.length > 2 && (
                <View style={s.chips}>
                  {tipos.map((t) => {
                    const ativo = tipoAtivo === t.chave;
                    return (
                      <Pressable
                        key={t.chave}
                        onPress={() => setTipo(t.chave)}
                        style={({ pressed }) => [s.chip, ativo && s.chipAtivo, pressed && s.pressionado]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: ativo }}
                      >
                        <Text style={[s.textoChip, ativo && s.textoChipAtivo]}>
                          {t.texto} ({t.total})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={s.contagem} accessibilityLiveRegion="polite">
                {visiveis.length === 1 ? '1 projeto' : `${visiveis.length} projetos`}
              </Text>

              {visiveis.length === 0 ? (
                <View style={s.vazio}>
                  <Ionicons name="folder-open-outline" size={32} color={DOURADO} />
                  <Text style={s.textoVazio}>Nenhum projeto encontrado.</Text>
                  {filtrosAtivos && (
                    <Pressable
                      onPress={limparFiltros}
                      style={({ pressed }) => [s.botaoExplorar, pressed && s.pressionado]}
                      accessibilityRole="button"
                    >
                      <Text style={s.textoExplorar}>Limpar filtros</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={[s.grade, mobile && s.gradeMobile]}>
                  {visiveis.map((projeto) => (
                    <CardSalvo
                      key={projeto.id}
                      projeto={projeto}
                      mobile={mobile}
                      confirmando={confirmando === projeto.id}
                      onAcessar={() =>
                        router.push({
                          pathname: '/detalhesPlantas',
                          params: { id: projeto.id },
                        })
                      }
                      onPedirRemover={() => setConfirmando(projeto.id)}
                      onCancelar={() => setConfirmando(null)}
                      onRemover={() => remover(projeto.id)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </>
      )}
    </LayoutConta>
  );
}

const s = StyleSheet.create({
  pressionado: { opacity: 0.75 },

  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardResumo: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 150,
    gap: 8,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardResumoMobile: { flexBasis: '47%', minWidth: 0, padding: 14 },
  rotuloResumo: { color: '#a5a5a5', fontSize: 12 },
  valorResumo: { color: '#d4a63a', fontSize: 22, fontWeight: 'bold' },
  valorResumoMobile: { fontSize: 18 },

  controles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlesMobile: { ...ALTURA_AUTO, flexDirection: 'column' },
  campoBusca: {
    width: 280,
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
  botaoOrdem: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 8,
  },
  textoOrdem: { color: '#eee', fontSize: 13 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 20,
  },
  chipAtivo: { backgroundColor: '#d4a63a', borderColor: '#d4a63a' },
  textoChip: { color: '#d3d4d8', fontSize: 13 },
  textoChipAtivo: { color: '#111', fontWeight: '600' },

  contagem: { color: '#a5a5a5', fontSize: 13 },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gradeMobile: { ...ALTURA_AUTO, flexDirection: 'column' },

  card: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 260,
    overflow: 'hidden',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
  },
  cardMobile: { ...ALTURA_AUTO, minWidth: 0, borderRadius: 14 },

  thumb: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1a12',
    borderBottomWidth: 1,
    borderColor: '#292929',
  },
  iconeThumb: { opacity: 0.7 },
  fotoThumb: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(41, 35, 26, 0.92)',
    borderWidth: 1,
    borderColor: '#59431f',
    borderRadius: 14,
  },
  textoTag: { color: '#d4a63a', fontSize: 12 },
  coracao: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
  },

  corpo: { gap: 6, padding: 16 },
  nome: { color: '#fff', fontSize: 16, fontWeight: '600' },
  descricao: { color: '#a5a5a5', fontSize: 13, lineHeight: 19 },
  specs: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#292929',
  },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textoSpec: { color: '#d0d0d0', fontSize: 13 },
  salvoEm: { color: '#8a8a8a', fontSize: 12, marginTop: 2, marginBottom: 8 },

  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoPrincipal: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#d4a63a',
    borderRadius: 8,
  },
  textoPrincipal: { color: '#111', fontSize: 14, fontWeight: 'bold' },
  botaoRemover: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 8,
  },

  confirmar: {
    gap: 10,
    padding: 12,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#3c4148',
    borderRadius: 8,
  },
  textoConfirmar: { color: '#eee', fontSize: 13 },
  botaoCancelar: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
  },
  textoCancelar: { color: '#fff', fontSize: 13 },
  botaoConfirmar: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4a63a',
    borderRadius: 8,
  },
  textoBotaoConfirmar: { color: '#111', fontSize: 13, fontWeight: 'bold' },

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
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29231a',
  },
  tituloVazio: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  textoVazio: { color: '#a5a5a5', fontSize: 14, textAlign: 'center', maxWidth: 360 },
  botaoExplorar: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d4a63a',
    backgroundColor: '#292929',
    borderRadius: 8,
  },
  textoExplorar: { color: '#d4a63a', fontSize: 14, fontWeight: '600' },
});