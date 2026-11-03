import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalSearchParams, useFocusEffect } from 'expo-router';

// Chave utilizada para guardar o tipo de conta no celular
const CHAVE = 'tipoConta';

// Tipos de conta permitidos
const TIPOS = ['usuario', 'profissional'];

// Menus de cada tipo de conta
export const MENUS = {
  usuario: [
    {
      id: 'perfil',
      nome: 'Meu Perfil',
      icone: 'person-outline',
      rota: '/PerfilUsuario',
    },
    {
      id: 'enderecos',
      nome: 'Meus Endereços',
      icone: 'location-outline',
      rota: '/Meusenderecos',
    },
    {
      id: 'pedidos',
      nome: 'Meus Pedidos',
      icone: 'grid-outline',
      rota: '/MeusPedidos',
    },
    {
      id: 'favoritos',
      nome: 'Meus Profissionais Favoritos',
      icone: 'star-outline',
      rota: '/Meusprofissionais',
    },
    {
      id: 'salvos',
      nome: 'Meus Projetos Favoritos',
      icone: 'bookmark-outline',
      rota: '/MeusProjetos',
    },
    {
      id: 'agendamentos',
      nome: 'Agendamentos',
      icone: 'calendar-outline',
      rota: '/Agendamentos',
    },
    {
      id: 'mensagem',
      nome: 'Mensagem',
      icone: 'chatbox-outline',
      rota: '/Mensagens',
    },
    {
      id: 'configUsuario',
      nome: 'Configurações',
      icone: 'settings-outline',
      rota: '/ConfigUsuario',
    },
  ],

  profissional: [
    {
      id: 'perfil',
      nome: 'Meu Perfil',
      icone: 'person-outline',
      rota: '/PerfilProfissional',
    },
    {
      id: 'enderecos',
      nome: 'Meus Endereços',
      icone: 'location-outline',
      rota: '/Meusenderecos',
    },
    {
      id: 'portfolio',
      nome: 'Meu Portfolio',
      icone: 'images-outline',
      rota: '/MeuPortfolio',
    },
    {
      id: 'plantas',
      nome: 'Publicar Plantas',
      icone: 'cloud-upload-outline',
      rota: '/PublicarPlanta',
    },
    {
      id: 'projetos',
      nome: 'Projetos',
      icone: 'grid-outline',
      rota: '/Projetos',
    },
    {
      id: 'avaliacoes',
      nome: 'Avaliações',
      icone: 'star-outline',
      rota: '/Avaliacoes',
    },
    {
      id: 'agendamentos',
      nome: 'Agendamentos',
      icone: 'calendar-outline',
      rota: '/Agendamentos',
    },
    {
      id: 'mensagem',
      nome: 'Mensagem',
      icone: 'chatbox-outline',
      rota: '/Mensagens',
    },
    {
      id: 'config',
      nome: 'Configurações',
      icone: 'settings-outline',
      rota: '/configuracoesProfissional',
    },
  ],
};

// Cria o contexto que será compartilhado pelo aplicativo
const ContaContext = createContext(null);

export function ContaProvider({ children }) {
  const params = useGlobalSearchParams();

  // Tipo de conta salvo no aparelho
  const [salvo, setSalvo] = useState(null);

  // Tipo temporário usado apenas para testes
  const [teste, setTeste] = useState(null);

  // Informa se o AsyncStorage já terminou de carregar
  const [carregado, setCarregado] = useState(false);

  // Recupera o tipo de conta quando o aplicativo inicia
  useEffect(() => {
    async function carregarConta() {
      try {
        const valor = await AsyncStorage.getItem(CHAVE);

        if (TIPOS.includes(valor)) {
          setSalvo(valor);
        }
      } catch (erro) {
        console.error('Erro ao carregar tipo de conta:', erro);
      } finally {
        setCarregado(true);
      }
    }

    carregarConta();
  }, []);

  // Permite testar o menu usando ?tipo=profissional ou ?tipo=usuario
  useEffect(() => {
    const param = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;

    if (TIPOS.includes(param)) setTeste(param);
    else if (param === 'limpar') setTeste(null);
    // sem parâmetro: mantém o teste atual (como no web)
  }, [params.tipo]);

  // Define o tipo de conta após o login
  const definir = useCallback(async (tipo) => {
    if (!TIPOS.includes(tipo)) {
      console.warn('Tipo de conta inválido:', tipo);
      return false;
    }

    try {
      await AsyncStorage.setItem(CHAVE, tipo);

      setSalvo(tipo);
      setTeste(null);

      return true;
    } catch (erro) {
      console.error('Erro ao salvar tipo de conta:', erro);
      return false;
    }
  }, []);

  // Remove o tipo de conta no logout
  const limpar = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CHAVE);

      setSalvo(null);
      setTeste(null);

      return true;
    } catch (erro) {
      console.error('Erro ao limpar tipo de conta:', erro);
      return false;
    }
  }, []);

  // O teste tem prioridade sobre o tipo salvo
  const tipo = teste || salvo;

  // Seleciona o menu de acordo com o tipo
  const menu = tipo ? MENUS[tipo] || [] : [];

  // Organiza os dados disponibilizados pelo Provider
  const valor = useMemo(() => ({
    tipo,
    menu,
    carregado,
    autenticado: Boolean(salvo),
    emModoTeste: Boolean(teste),
    definir,
    limpar,
  }), [
    tipo,
    menu,
    carregado,
    salvo,
    teste,
    definir,
    limpar,
  ]);

  return (
    <ContaContext.Provider value={valor}>
      {children}
    </ContaContext.Provider>
  );
}

// Hook para acessar os dados do Provider
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
  const { tipo, carregado, definir } = usarConta();

  useFocusEffect(
    useCallback(() => {
      if (carregado) definir(esperado);
    }, [carregado, esperado, definir])
  );

  return carregado && tipo === esperado;
}