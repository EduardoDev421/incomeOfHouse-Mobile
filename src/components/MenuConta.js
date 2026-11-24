import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

import { useConta, MENUS, DEBUG_CONTA } from './ContaProvider';
import { getSupabaseClient } from '../services/supabase';

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

export default function ContaMenu({ tipo: tipoProp, aoSelecionar }) {
  const conta = useConta();
  const router = useRouter();
  const tipo = tipoProp || conta.tipo || null;
  const menu = tipo ? MENUS[tipo] || [] : [];

  const [modalExcluir, setModalExcluir] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  if (!conta.carregado) return null;

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

  const abrirExclusao = () => {
    aoSelecionar?.();
    setSenha('');
    setErroExclusao('');
    setModalExcluir(true);
  };

  const excluirConta = async () => {
    if (excluindo) return;
    if (!senha) {
      setErroExclusao('Digite sua senha para confirmar a exclusão.');
      return;
    }
    if (!conta.user?.email) {
      setErroExclusao('Não foi possível identificar o e-mail desta conta.');
      return;
    }

    setExcluindo(true);
    setErroExclusao('');
    try {
      const supabase = getSupabaseClient();
      const { error: erroSenha } = await supabase.auth.signInWithPassword({
        email: conta.user.email,
        password: senha,
      });
      if (erroSenha) {
        throw new Error('Senha incorreta. Confira sua senha e tente novamente.');
      }

      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Não foi possível excluir a conta.');
      }

      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      setModalExcluir(false);
      router.replace('/');
    } catch (error) {
      setErroExclusao(error?.message || 'Ocorreu um erro ao excluir sua conta.');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <View style={styles.container}>
      {DEBUG_CONTA && (
        <Text style={styles.debug}>DEBUG conta: {String(tipo)}</Text>
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

      <Pressable
        style={({ pressed }) => [
          styles.item,
          styles.itemExcluir,
          pressed && styles.pressionado,
        ]}
        onPress={abrirExclusao}
      >
        <Ionicons name="trash-outline" size={20} color="#e16b64" />
        <Text style={styles.textoExcluir}>Excluir conta</Text>
      </Pressable>

      <Modal
        visible={modalExcluir}
        transparent
        animationType="fade"
        onRequestClose={() => !excluindo && setModalExcluir(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCartao}>
            <View style={styles.modalIcone}>
              <Ionicons name="warning-outline" size={28} color="#e16b64" />
            </View>
            <Text style={styles.modalTitulo}>Excluir conta permanentemente?</Text>
            <Text style={styles.modalDescricao}>
              Essa ação é irreversível. Seu acesso e os dados vinculados à conta serão excluídos.
              Digite sua senha para confirmar.
            </Text>

            <TextInput
              value={senha}
              onChangeText={(valor) => {
                setSenha(valor);
                if (erroExclusao) setErroExclusao('');
              }}
              placeholder="Sua senha"
              placeholderTextColor="#777"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!excluindo}
              returnKeyType="done"
              onSubmitEditing={excluirConta}
              style={styles.inputSenha}
              accessibilityLabel="Senha da conta"
            />

            {!!erroExclusao && (
              <Text style={styles.erroModal}>{erroExclusao}</Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.botaoExcluir,
                (pressed || excluindo) && styles.pressionado,
              ]}
              onPress={excluirConta}
              disabled={excluindo}
            >
              {excluindo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotaoExcluir}>Confirmar exclusão</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.botaoCancelar}
              onPress={() => setModalExcluir(false)}
              disabled={excluindo}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  itemExcluir: { borderColor: '#5b2927', backgroundColor: '#241514' },
  textoExcluir: { flexShrink: 1, color: '#e88780', fontSize: 12 },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  modalCartao: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#5b2927',
    borderRadius: 14,
  },
  modalIcone: {
    width: 52,
    height: 52,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(225,107,100,0.12)',
    borderRadius: 26,
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDescricao: {
    marginTop: 10,
    marginBottom: 16,
    color: '#b5b5b5',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  inputSenha: {
    minHeight: 46,
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  erroModal: { marginTop: 9, color: '#ff8b80', fontSize: 12, lineHeight: 18 },
  botaoExcluir: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#a83f39',
    borderRadius: 8,
  },
  textoBotaoExcluir: { color: '#fff', fontSize: 13, fontWeight: '700' },
  botaoCancelar: { alignItems: 'center', paddingVertical: 13 },
  textoCancelar: { color: '#c9a45c', fontSize: 13, fontWeight: '600' },
});
