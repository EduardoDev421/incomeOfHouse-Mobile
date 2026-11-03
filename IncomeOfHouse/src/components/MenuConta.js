import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

import { usarConta, MENUS } from './ContaProvider';

export default function ContaMenu({ tipo: tipoForcado, aoSelecionar }) {
  const conta = usarConta();
  const router = useRouter();
  const pathname = usePathname().toLowerCase();

  // Tipo informado pela tela ou recuperado pelo Provider
  const tipo = tipoForcado || conta.tipo;

  // Busca o menu correspondente
  const menu = tipo ? MENUS[tipo] || [] : [];

  // Aguarda somente quando não existe tipo forçado
  if (!conta.carregado && !tipoForcado) {
    return null;
  }

  // Verifica se existe um tipo de conta
  if (!tipo) {
    return (
      <View style={styles.container}>
        <Text style={styles.mensagem}>
          Faça login para acessar sua conta.
        </Text>
      </View>
    );
  }

  // Encerrar sessão
  const sair = async () => {
    await conta.limpar();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {menu.map((item) => {
        const ativo = pathname === item.rota.toLowerCase();

        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.item,
              ativo && styles.ativo,
              pressed && styles.pressionado,
            ]}
            onPress={() => {
              aoSelecionar?.();
              if (!ativo) router.push(item.rota);
            }}
          >
            <Ionicons name={item.icone} size={20} color="#c9a45c" />
            <Text style={styles.texto}>{item.nome}</Text>
          </Pressable>
        );
      })}

      <View style={styles.divisor} />

      <Pressable
        style={({ pressed }) => [
          styles.item,
          pressed && styles.pressionado,
        ]}
        onPress={sair}
      >
        <Ionicons name="log-out-outline" size={20} color="#c9a45c" />
        <Text style={styles.texto}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#101010',
  },

  item: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 5,
    backgroundColor: '#1d1d1f',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
  },

  ativo: {
    backgroundColor: '#29231a',
    borderColor: '#6e572b',
  },

  texto: {
    flexShrink: 1,
    color: '#fff',
    fontSize: 12,
  },

  divisor: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#333',
  },

  pressionado: {
    opacity: 0.65,
    borderColor: '#c9a45c',
  },

  mensagem: {
    color: '#fff',
    fontSize: 13,
  },
});