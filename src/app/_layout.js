import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { LegalProvider } from '../components/LegalProvider';
import { ContaProvider } from '../components/ContaProvider';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === 'web' && (pathname === '/index' || pathname === '/index.html')) {
      router.replace('/');
    }
  }, [pathname, router]);

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
        <Stack screenOptions={{ headerShown: false }} />
      </ContaProvider>
    </LegalProvider>
  );
}