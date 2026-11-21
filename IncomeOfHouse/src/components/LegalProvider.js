import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import ModalLegal from './ModalLegal';

const LegalContext = createContext({ abrirLegal: () => {} });

export function LegalProvider({ children }) {
  const [aba, setAba] = useState(null); // null | 'termos' | 'privacidade'
  const fechar = useCallback(() => setAba(null), []);
  const valor = useMemo(() => ({ abrirLegal: setAba }), []);

  return (
    <LegalContext.Provider value={valor}>
      <View style={{ flex: 1 }}>
        {children}
        <ModalLegal aba={aba} onFechar={fechar} onTrocarAba={setAba} />
      </View>
    </LegalContext.Provider>
  );
}

// Uso: const { abrirLegal } = useLegal();  →  abrirLegal('termos') | abrirLegal('privacidade')
export const useLegal = () => useContext(LegalContext);