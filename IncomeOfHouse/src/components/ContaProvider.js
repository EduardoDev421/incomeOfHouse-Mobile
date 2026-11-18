import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalSearchParams } from 'expo-router';

// Chave usada para guardar o tipo de conta no aparelho
const CHAVE = 'tipoConta';

// Deixe true para ver no console QUEM está trocando o tipo de conta.
// Quando o menu parar de trocar, mude para false.
export const DEBUG_CONTA = true;


// Tipos de conta permitidos
const TIPOS = ['usuario', 'profissional'];

// Menus de cada tipo de conta
export const MENUS = {
  usuario: [
    { id: 'perfil', nome: 'Meu Perfil', icone: 'person-outline', rota: '/PerfilUsuario' },
    { id: 'enderecos', nome: 'Meus Endereços', icone: 'location-outline', rota: '/EnderecosUsuario' },
    { id: 'pedidos', nome: 'Meus Pedidos', icone: 'grid-outline', rota: '/MeusPedidos' },
    { id: 'favoritos', nome: 'Meus Profissionais Favoritos', icone: 'star-outline', rota: '/Meusprofissionais' },
    { id: 'salvos', nome: 'Meus Projetos Favoritos', icone: 'bookmark-outline', rota: '/MeusProjetos' },
    { id: 'agendamentos', nome: 'Agendamentos', icone: 'calendar-outline', rota: '/AgendamentosUsuario' },
    { id: 'mensagem', nome: 'Mensagem', icone: 'chatbox-outline', rota: '/MensagensUsuario' },
    { id: 'configUsuario', nome: 'Configurações', icone: 'settings-outline', rota: '/ConfigUsuario' },
  ],

  profissional: [
    { id: 'perfil', nome: 'Meu Perfil', icone: 'person-outline', rota: '/PerfilProfissional' },
    { id: 'enderecos', nome: 'Meus Endereços', icone: 'location-outline', rota: '/EnderecosProfissional' },
    { id: 'portfolio', nome: 'Meu Portfolio', icone: 'images-outline', rota: '/MeuPortfolio' },
    { id: 'plantas', nome: 'Publicar Plantas', icone: 'cloud-upload-outline', rota: '/PublicarPlanta' },
    { id: 'projetos', nome: 'Projetos', icone: 'grid-outline', rota: '/Projetos' },
    { id: 'avaliacoes', nome: 'Avaliações', icone: 'star-outline', rota: '/Avaliacoes' },
    { id: 'agendamentos', nome: 'Agendamentos', icone: 'calendar-outline', rota: '/AgendamentosProfissional' },
    { id: 'mensagem', nome: 'Mensagem', icone: 'chatbox-outline', rota: '/MensagensProfissional' },
    { id: 'config', nome: 'Configurações', icone: 'settings-outline', rota: '/configuracoesProfissional' },
  ],
};

const ContaContext = createContext(null);

export function ContaProvider({ children }) {
  const params = useGlobalSearchParams();

  // ÚNICA fonte da verdade: o tipo de conta guardado no aparelho
  const [tipo, setTipo] = useState(null);

  // Informa se o AsyncStorage já terminou de carregar
  const [carregado, setCarregado] = useState(false);

  // Indica que o tipo atual veio de ?tipo= na URL (modo de teste)
  const [viaUrl, setViaUrl] = useState(false);

  // Evita reprocessar o mesmo valor de ?tipo=
  const ultimoParam = useRef(null);

  // Recupera o tipo de conta quando o app inicia
  useEffect(() => {
    async function carregarConta() {
      try {
        const valor = await AsyncStorage.getItem(CHAVE);
        if (TIPOS.includes(valor)) setTipo(valor);
      } catch (erro) {
        console.error('Erro ao carregar tipo de conta:', erro);
      } finally {
        setCarregado(true);
      }
    }

    carregarConta();
  }, []);

  // Define o tipo de conta (login). Salva e atualiza o estado.
  const definir = useCallback(async (novoTipo) => {
    if (DEBUG_CONTA) {
      console.log('[conta] definir ->', novoTipo);
      console.trace('[conta] quem chamou definir');
    }

    if (!TIPOS.includes(novoTipo)) {
      console.warn('Tipo de conta inválido:', novoTipo);
      return false;
    }

    try {
      await AsyncStorage.setItem(CHAVE, novoTipo);
      setTipo(novoTipo);
      setViaUrl(false);
      return true;
    } catch (erro) {
      console.error('Erro ao salvar tipo de conta:', erro);
      return false;
    }
  }, []);

  // Remove o tipo de conta (logout)
  const limpar = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CHAVE);
      setTipo(null);
      setViaUrl(false);
      return true;
    } catch (erro) {
      console.error('Erro ao limpar tipo de conta:', erro);
      return false;
    }
  }, []);

  // Modo de teste: ?tipo=profissional | ?tipo=usuario | ?tipo=limpar
  // Agora o valor é SALVO, então vale para todas as telas, inclusive as
  // compartilhadas, e não existe mais um segundo "tipo de teste" competindo.
  useEffect(() => {
    if (!carregado) return;

    const param = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;
    if (!param || param === ultimoParam.current) return;
    ultimoParam.current = param;

    if (TIPOS.includes(param)) {
      definir(param).then(() => setViaUrl(true));
    } else if (param === 'limpar') {
      limpar();
    }
  }, [params.tipo, carregado, definir, limpar]);

  const menu = tipo ? MENUS[tipo] || [] : [];

  const valor = useMemo(
    () => ({
      tipo,
      menu,
      carregado,
      autenticado: Boolean(tipo),
      emModoTeste: viaUrl,
      definir,
      limpar,
    }),
    [tipo, menu, carregado, viaUrl, definir, limpar]
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

// Mantido só para não quebrar PerfilUsuario / PerfilProfissional.
// NÃO troca mais a conta sozinho: nenhuma tela muda o tipo ao ser aberta.
// O tipo só muda no login (definir), no logout (limpar) ou com ?tipo= na URL.
export function useDeclararConta(esperado) {
  const { tipo, carregado } = usarConta();
  return carregado && tipo === esperado;
}