import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AuthTela, CartaoTitulo, Campo, Linha, CaixaErro, Botao, Divisor,
  LinkConta, LinkContorno, maskCPF, maskTelefone, maskData,
  validarEmail, validarTelefone, validarCPF, validarData,
} from '../components/AuthComponentes';
import TextoLegal from '../components/TextoLegal';
import { cadastrarComEmail, dataParaISO, mensagemErroAuth } from '../services/auth';

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  // limpa a mensagem de erro assim que a pessoa volta a digitar
  const mudar = (set) => (valor) => {
    set(valor);
    if (erro) setErro('');
  };

  const validar = () => {
    if (
      !nome.trim() || !email.trim() || !cpf || !telefone ||
      !nascimento || !senha || !confirmar
    ) return 'Preencha todos os campos.';
    if (!validarEmail(email)) return 'Digite um e-mail válido.';
    if (!validarCPF(cpf)) return 'CPF inválido. Confira os números.';
    if (!validarTelefone(telefone)) return 'Informe o telefone com DDD.';
    if (!validarData(nascimento)) return 'Data de nascimento inválida. Use o formato dd/mm/aaaa.';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (senha !== confirmar) return 'As senhas não conferem.';
    return '';
  };

  const cadastrar = async () => {
    if (enviando) return;

    const mensagem = validar();
    if (mensagem) {
      setErro(mensagem);
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const resultado = await cadastrarComEmail(email, senha, {
        account_type: 'usuario',
        full_name: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        phone: telefone.replace(/\D/g, ''),
        birth_date: dataParaISO(nascimento),
      });

      if (resultado.session) {
        router.replace('/');
      } else {
        setSenha('');
        setConfirmar('');
        setAviso('Cadastro criado. Verifique seu e-mail para confirmar a conta antes de entrar.');
      }
    } catch (e) {
      setErro(mensagemErroAuth(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthTela
      titulo={'Seu próximo projeto\n'}
      destaque="começa aqui."
      texto="Cadastre-se para encontrar profissionais, descobrir projetos e transformar suas ideias em realidade."
      miniCards
    >
      <CartaoTitulo
        titulo="Crie sua conta"
        subtitulo="Faça seu cadastro e comece a explorar projetos e profissionais."
      />

      <Linha>
        <Campo
          icone="person-outline"
          rotulo="Nome"
          valor={nome}
          aoMudar={mudar(setNome)}
          placeholder="Digite seu nome"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <Campo
          icone="mail-outline"
          rotulo="E-mail"
          valor={email}
          aoMudar={mudar(setEmail)}
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
      </Linha>

      <Linha>
        <Campo
          icone="card-outline"
          rotulo="CPF"
          valor={cpf}
          aoMudar={mudar(setCpf)}
          mascara={maskCPF}
          placeholder="Digite seu CPF"
          keyboardType="numeric"
        />
        <Campo
          icone="call-outline"
          rotulo="Telefone"
          valor={telefone}
          aoMudar={mudar(setTelefone)}
          mascara={maskTelefone}
          placeholder="Digite seu telefone"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </Linha>

      <Campo
        icone="calendar-outline"
        rotulo="Data de nascimento"
        valor={nascimento}
        aoMudar={mudar(setNascimento)}
        mascara={maskData}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
      />

      <Linha>
        <Campo
          icone="lock-closed-outline"
          rotulo="Senha"
          valor={senha}
          aoMudar={mudar(setSenha)}
          placeholder="Mínimo de 6 caracteres"
          senha
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Campo
          icone="shield-checkmark-outline"
          rotulo="Confirmar senha"
          valor={confirmar}
          aoMudar={mudar(setConfirmar)}
          placeholder="Confirme sua senha"
          senha
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={cadastrar}
        />
      </Linha>

      <CaixaErro texto={erro} />
      {!!aviso && <Text style={s.aviso} accessibilityLiveRegion="polite">{aviso}</Text>}

      <TextoLegal prefixo="Ao se cadastrar, você concorda com os" />

      <Botao
        texto={enviando ? 'Cadastrando...' : 'Cadastrar'}
        aoPressionar={cadastrar}
        desativado={enviando}
      />

      <Divisor texto="ou" />

      <LinkConta
        pergunta="Já possui uma conta?"
        acao="Entrar"
        aoPressionar={() => router.push('/login')}
      />

      <LinkContorno
        texto="Quero me cadastrar como profissional"
        aoPressionar={() => router.push('/CadastroProfissional')}
      />
    </AuthTela>
  );
}

const s = StyleSheet.create({
  aviso: { color: '#b5b5b5', fontSize: 13, textAlign: 'center', marginBottom: 12 },
});