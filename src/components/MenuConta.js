import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

import { useConta, MENUS, DEBUG_CONTA } from './ContaProvider';

function ItemConta({ item, router, aoSelecionar }) {
  const pathname = usePathname().toLowerCase();
  const ativo = pathname === item.rota.toLowerCase();

  return (
    <Pressable
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
}

// Cada tela é de UM tipo de conta (ex.: EnderecosUsuario, EnderecosProfissional),
// então ela pode informar o "tipo" e o menu certo aparece.
// Sem a prop, o menu usa o tipo de conta guardado no Provider.
export default function ContaMenu({ tipo: tipoProp, aoSelecionar }) {
  const conta = useConta();
  const router = useRouter();

  const tipo = tipoProp || conta.tipo || null;
  const menu = tipo ? MENUS[tipo] || [] : [];

  // Aguarda a sessão e o perfil remoto terminarem de carregar
  if (!conta.carregado) {
    return null;
  }

  if (conta.user && conta.erroPerfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.mensagemErro}>
          Não foi possível carregar seu perfil: {conta.erroPerfil}
        </Text>
      </View>
    );
  }

  if (!tipo) {
    return (
      <View style={styles.container}>
        <Text style={styles.mensagem}>
          {conta.user
            ? 'Seu perfil ainda não está disponível. Confira a configuração do Supabase.'
            : 'Faça login para acessar sua conta.'}
        </Text>
      </View>
    );
  }

  const sair = async () => {
    if (await conta.limpar()) router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {DEBUG_CONTA && (
        <Text style={styles.debug}>
          DEBUG conta: {String(tipo)}
        </Text>
      )}
      {!!conta.erroSessao && (
        <Text style={styles.mensagemErro}>Falha ao sair: {conta.erroSessao}</Text>
      )}

      {menu.map((item) => (
        <ItemConta
          key={item.id}
          item={item}
          router={router}
          aoSelecionar={aoSelecionar}
        />
      ))}

      <View style={styles.divisor} />

      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
        onPress={sair}
      >
        <Ionicons name="log-out-outline" size={20} color="#c9a45c" />
        <Text style={styles.texto}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#101010' },
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
  ativo: { backgroundColor: '#29231a', borderColor: '#6e572b' },
  texto: { flexShrink: 1, color: '#fff', fontSize: 12 },
  divisor: { height: 1, marginVertical: 8, backgroundColor: '#333' },
  pressionado: { opacity: 0.65, borderColor: '#c9a45c' },
  mensagem: { color: '#fff', fontSize: 13 },
  mensagemErro: { color: '#ff8b80', fontSize: 12, lineHeight: 18 },
  debug: { marginBottom: 6, color: '#ff5c5c', fontSize: 10 },
});