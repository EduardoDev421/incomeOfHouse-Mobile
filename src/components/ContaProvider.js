import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import { atualizarPerfil, buscarPerfil } from '../services/auth';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase';

export const DEBUG_CONTA = false;

export const MENUS = {
  usuario: [
    { id: 'perfil', nome: 'Meu Perfil', icone: 'person-outline', rota: '/PerfilUsuario' },
    { id: 'enderecos', nome: 'Meus Endereços', icone: 'location-outline', rota: '/meusenderecosU' },
    { id: 'pedidos', nome: 'Meus Pedidos', icone: 'grid-outline', rota: '/MeusPedidos' },
    { id: 'favoritos', nome: 'Meus Profissionais Favoritos', icone: 'star-outline', rota: '/Meusprofissionais' },
    { id: 'salvos', nome: 'Meus Projetos Favoritos', icone: 'bookmark-outline', rota: '/MeusProjetos' },
    { id: 'agendamentos', nome: 'Agendamentos', icone: 'calendar-outline', rota: '/AgendamentosU' },
    { id: 'mensagem', nome: 'Mensagem', icone: 'chatbox-outline', rota: '/MensagensU' },
    { id: 'configUsuario', nome: 'Configurações', icone: 'settings-outline', rota: '/ConfigUsuario' },
  ],

  profissional: [
    { id: 'perfil', nome: 'Meu Perfil', icone: 'person-outline', rota: '/PerfilProfissional' },
    { id: 'enderecos', nome: 'Meus Endereços', icone: 'location-outline', rota: '/MeusenderecosP' },
    { id: 'portfolio', nome: 'Meu Portfolio', icone: 'images-outline', rota: '/Meuportfolio' },
    { id: 'plantas', nome: 'Publicar Plantas', icone: 'cloud-upload-outline', rota: '/publicarPlanta' },
    { id: 'projetos', nome: 'Projetos', icone: 'grid-outline', rota: '/Projetos' },
    { id: 'avaliacoes', nome: 'Avaliações', icone: 'star-outline', rota: '/Avaliacoes' },
    { id: 'agendamentos', nome: 'Agendamentos', icone: 'calendar-outline', rota: '/AgendamentosP' },
    { id: 'mensagem', nome: 'Mensagem', icone: 'chatbox-outline', rota: '/MensagensP' },
    { id: 'config', nome: 'Configurações', icone: 'settings-outline', rota: '/ConfigProfissionais' },
  ],
};

const ContaContext = createContext(null);

export function ContaProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [sessaoCarregada, setSessaoCarregada] = useState(false);
  const [perfilCarregado, setPerfilCarregado] = useState(false);
  const [erroSessao, setErroSessao] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSessaoCarregada(true);
      setPerfilCarregado(true);
      return undefined;
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (error) {
      setErroSessao(error?.message || 'Configuração inválida do Supabase.');
      setSessaoCarregada(true);
      setPerfilCarregado(true);
      return undefined;
    }
    let ativo = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!ativo) return;
        setUser(session?.user || null);
        setErroSessao('');
        setSessaoCarregada(true);
      }
    );

    supabase.auth.getSession().then(({ data, error }) => {
      if (!ativo) return;
      if (error) setErroSessao(error.message);
      setUser(data.session?.user || null);
      setSessaoCarregada(true);
    }).catch((error) => {
      if (!ativo) return;
      setErroSessao(error?.message || 'Não foi possível restaurar a sessão.');
      setSessaoCarregada(true);
    });

    let appStateSubscription;
    if (Platform.OS !== 'web') {
      appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      });

      if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    }

    return () => {
      ativo = false;
      subscription.unsubscribe();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPerfil(null);
      setErroPerfil('');
      setPerfilCarregado(true);
      return undefined;
    }

    let ativo = true;
    setPerfil(null);
    setErroPerfil('');
    setPerfilCarregado(false);

    buscarPerfil(user.id).then((dados) => {
      if (!ativo) return;
      setPerfil(dados);
      setPerfilCarregado(true);
    }).catch((error) => {
      if (!ativo) return;
      setErroPerfil(error?.message || 'Não foi possível carregar o perfil.');
      setPerfilCarregado(true);
    });

    return () => {
      ativo = false;
    };
  }, [user?.id]);

  const limpar = useCallback(async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      setErroSessao(error.message);
      return false;
    }

    setErroSessao('');
    return true;
  }, []);

  const usuarioId = user?.id;
  const salvarPerfil = useCallback(async (campos) => {
    if (!usuarioId) {
      throw new Error('Entre na sua conta para editar o perfil.');
    }

    const perfilAtualizado = await atualizarPerfil(usuarioId, campos);
    setPerfil(perfilAtualizado);
    return perfilAtualizado;
  }, [usuarioId]);

  const recarregarPerfil = useCallback(async () => {
    if (!usuarioId) {
      throw new Error('Entre na sua conta para carregar o perfil.');
    }

    setPerfilCarregado(false);
    try {
      const perfilAtualizado = await buscarPerfil(usuarioId);
      setPerfil(perfilAtualizado);
      setErroPerfil('');
      return perfilAtualizado;
    } catch (error) {
      setErroPerfil(error?.message || 'Não foi possível carregar o perfil.');
      throw error;
    } finally {
      setPerfilCarregado(true);
    }
  }, [usuarioId]);

  const tipo = perfil?.account_type || null;
  const menu = useMemo(
    () => (tipo ? MENUS[tipo] || [] : []),
    [tipo]
  );
  const carregado = sessaoCarregada && perfilCarregado;

  const valor = useMemo(
    () => ({
      user,
      perfil,
      tipo,
      menu,
      carregado,
      autenticado: Boolean(user),
      erroSessao,
      erroPerfil,
      limpar,
      salvarPerfil,
      recarregarPerfil,
    }),
    [
      user,
      perfil,
      tipo,
      menu,
      carregado,
      erroSessao,
      erroPerfil,
      limpar,
      salvarPerfil,
      recarregarPerfil,
    ]
  );

  return <ContaContext.Provider value={valor}>{children}</ContaContext.Provider>;
}

export function usarConta() {
  const contexto = useContext(ContaContext);

  if (!contexto) {
    throw new Error(
      'usarConta precisa estar dentro de <ContaProvider>. Verifique o _layout.js.'
    );
  }

  return contexto;
}

export function useDeclararConta(esperado) {
  const { tipo, carregado } = usarConta();
  return carregado && tipo === esperado;
}
