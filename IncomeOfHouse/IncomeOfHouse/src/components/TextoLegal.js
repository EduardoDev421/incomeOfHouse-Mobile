import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLegal } from './LegalProvider';

const DOURADO = '#c9a45c';

export default function TextoLegal({ prefixo = 'Ao continuar, você concorda com os' }) {
  const { abrirLegal } = useLegal();

  return (
    <Text style={s.texto}>
      {prefixo}{' '}
      <Text style={s.link} accessibilityRole="link" onPress={() => abrirLegal('termos')}>
        Termos de Uso
      </Text>{' '}
      e com a{' '}
      <Text style={s.link} accessibilityRole="link" onPress={() => abrirLegal('privacidade')}>
        Política de Privacidade
      </Text>
      .
    </Text>
  );
}

const s = StyleSheet.create({
  texto: {
    color: '#8a8a8a',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  link: { color: DOURADO, textDecorationLine: 'underline' },
});