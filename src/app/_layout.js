import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router';
import { LegalProvider } from '../components/LegalProvider';
import { ContaProvider, useConta } from '../components/ContaProvider';

// Mantém a splash visível até a sessão e o perfil terminarem de carregar.
SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const router = useRouter();
  const pathname = usePathname();
  const { autenticado, tipo, carregado } = useConta();

  useEffect(() => {
    if (carregado) SplashScreen.hide();
  }, [carregado]);

  useEffect(() => {
    if (!carregado) return;
    if (Platform.OS === 'web' && (pathname === '/index' || pathname === '/index.html')) {
      router.replace('/');
    }
  }, [carregado, pathname, router]);

  // Só renderiza as rotas depois de saber quem é o usuário.
  if (!carregado) return null;

  // Telas exclusivas de profissionais logados.
  // Quem não tiver acesso é redirecionado para a rota inicial.
  const profissional = autenticado && tipo === 'profissional';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={profissional}>
        <Stack.Screen name="ConfigProfissionais" />
        <Stack.Screen name="DadosEmpresa" />
        <Stack.Screen name="DadosRecebimento" />
        <Stack.Screen name="HistoricoPagamentos" />
        <Stack.Screen name="NotaFicais" />
        <Stack.Screen name="DispositivosConectados" />
        <Stack.Screen name="AutenticacaoDuasEtapas" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Web: sem rolagem lateral e raiz com a altura da janela
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const estilo = document.createElement('style');
    estilo.id = 'padrao-app-web';
    estilo.textContent = `
      html, body { height: 100%; max-width: 100%; overflow-x: hidden; }
      #root { height: 100%; max-width: 100vw; overflow-x: hidden; }
    `;
    document.head.appendChild(estilo);

    return () => estilo.remove();
  }, []);

  return (
    <LegalProvider>
      <ContaProvider>
        <Navegacao />
      </ContaProvider>
    </LegalProvider>
  );
}