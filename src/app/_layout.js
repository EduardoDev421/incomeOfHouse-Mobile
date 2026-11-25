import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router';
import { LegalProvider } from '../components/LegalProvider';
import { ContaProvider, useConta } from '../components/ContaProvider';

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

  if (!carregado) return null;

  const profissional = autenticado && tipo === 'profissional';
  const usuario = autenticado && tipo === 'usuario';

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      {/* Rotas públicas: Home, autenticação, cadastro e recuperação. */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="CadastroProfissional" />
      <Stack.Screen name="EsqueceuSenha" />
      <Stack.Screen name="AuthCallback" />
      <Stack.Screen name="AlterarSenha" />

      {/* Qualquer outra página exige uma sessão autenticada. */}
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="Avaliacoes" />
        <Stack.Screen name="Comentarios" />
        <Stack.Screen name="DadosPermissoes" />
        <Stack.Screen name="EnderecosP" />
        <Stack.Screen name="EnderecosU" />
        <Stack.Screen name="Pedidodetalhe" />
        <Stack.Screen name="Tutoriais" />
        <Stack.Screen name="detalhesPlantas" />
        <Stack.Screen name="detalhesProfissionais" />
        <Stack.Screen name="faleConosco" />
        <Stack.Screen name="planta" />
        <Stack.Screen name="profissionais" />
        <Stack.Screen name="perguntasFrequentes" />
        <Stack.Screen name="registroProfissional" />
        <Stack.Screen name="sobreNos" />

        <Stack.Protected guard={profissional}>
          <Stack.Screen name="AgendamentosP" />
          <Stack.Screen name="AutenticacaoDuasEtapas" />
          <Stack.Screen name="ConfigProfissionais" />
          <Stack.Screen name="DadosEmpresa" />
          <Stack.Screen name="DadosRecebimento" />
          <Stack.Screen name="DispositivosConectados" />
          <Stack.Screen name="HistoricoPagamentos" />
          <Stack.Screen name="MensagensP" />
          <Stack.Screen name="Meuportfolio" />
          <Stack.Screen name="MeusenderecosP" />
          <Stack.Screen name="NotaFicais" />
          <Stack.Screen name="PerfilProfissional" />
          <Stack.Screen name="Projetos" />
          <Stack.Screen name="publicarPlanta" />
        </Stack.Protected>

        <Stack.Protected guard={usuario}>
          <Stack.Screen name="AgendamentosU" />
          <Stack.Screen name="ConfigUsuario" />
          <Stack.Screen name="MensagensU" />
          <Stack.Screen name="MeusPedidos" />
          <Stack.Screen name="MeusProjetos" />
          <Stack.Screen name="Meusprofissionais" />
          <Stack.Screen name="PerfilUsuario" />
          <Stack.Screen name="meusenderecosU" />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
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
