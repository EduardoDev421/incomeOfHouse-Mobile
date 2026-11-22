import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker'; // npx expo install expo-document-picker
import { usarConta } from '../components/ContaProvider';
import {
  AuthTela, CartaoTitulo, Campo, Seletor, Linha, CaixaErro, Botao,
  Divisor, LinkConta, LinkContorno, maskCPF, maskTelefone, maskData,
  validarEmail, validarTelefone, validarCPF, validarData, dourado,
} from '../components/AuthComponentes';
import TextoLegal from '../components/TextoLegal';
import { cadastrarComEmail, dataParaISO, mensagemErroAuth } from '../services/auth';
import { enviarComprovanteProfissional, tipoComprovante } from '../services/documentos';

const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'],
  ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'],
  ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'], ['PE', 'Pernambuco'],
  ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'],
  ['SC', 'Santa Catarina'], ['SP', 'São Paulo'], ['SE', 'Sergipe'],
  ['TO', 'Tocantins'],
];

const PROFISSOES = [
  ['arquiteto', 'Arquiteto(a)'],
  ['arquiteto-urbanista', 'Arquiteto(a) e Urbanista'],
  ['urbanista', 'Urbanista'],
  ['engenheiro-civil', 'Engenheiro(a) Civil'],
  ['engenheiro-eletrico', 'Engenheiro(a) Eletricista'],
  ['engenheiro-mecanico', 'Engenheiro(a) Mecânico(a)'],
  ['engenheiro-sanitarista', 'Engenheiro(a) Sanitarista'],
  ['engenheiro-ambiental', 'Engenheiro(a) Ambiental'],
  ['designer-de-interiores', 'Designer de Interiores'],
  ['desenhista-projetista', 'Desenhista Projetista'],
  ['desenhista-cadista', 'Desenhista CAD'],
  ['projetista-arquitetonico', 'Projetista Arquitetônico'],
  ['projetista-de-edificacoes', 'Projetista de Edificações'],
  ['tecnico-em-edificacoes', 'Técnico(a) em Edificações'],
  ['modelador-3d', 'Modelador(a) 3D'],
  ['artista-3d', 'Artista 3D'],
  ['renderizador-3d', 'Renderizador(a) 3D'],
  ['especialista-bim', 'Especialista BIM'],
  ['coordenador-bim', 'Coordenador(a) BIM'],
  ['projetista-eletrico', 'Projetista Elétrico'],
  ['projetista-hidraulico', 'Projetista Hidráulico'],
  ['projetista-estrutural', 'Projetista Estrutural'],
  ['projetista-sanitario', 'Projetista Sanitário'],
  ['projetista-de-incendio', 'Projetista de Prevenção contra Incêndio'],
  ['projetista-de-climatizacao', 'Projetista de Climatização'],
  ['calculista-estrutural', 'Calculista Estrutural'],
  ['tecnico-em-construcao', 'Técnico(a) em Construção Civil'],
  ['tecnico-em-estruturas', 'Técnico(a) em Estruturas'],
  ['topografo', 'Topógrafo(a)'],
  ['tecnico-em-topografia', 'Técnico(a) em Topografia'],
  ['agrimensor', 'Agrimensor(a)'],
  ['paisagista', 'Paisagista'],
  ['projetista-de-paisagismo', 'Projetista de Paisagismo'],
  ['planejador-de-obras', 'Planejador(a) de Obras'],
  ['gestor-de-projetos', 'Gestor(a) de Projetos'],
  ['compatibilizador-de-projetos', 'Compatibilizador(a) de Projetos'],
  ['consultor-em-arquitetura', 'Consultor(a) em Arquitetura'],
  ['consultor-em-projetos', 'Consultor(a) em Projetos'],
  ['outro', 'Outro profissional da área'],
];

const formatarTamanho = (bytes) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function CadastroProfissional() {
  const router = useRouter();
  const { recarregarPerfil } = usarConta();

  const [nome, setNome] = useState('');
  const [registro, setRegistro] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [profissao, setProfissao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [sessaoCriada, setSessaoCriada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [continuando, setContinuando] = useState(false);

  // limpa a mensagem de erro assim que a pessoa volta a preencher
  const mudar = (set) => (valor) => {
    set(valor);
    if (erro) setErro('');
  };

  // Alert.alert não funciona no navegador, então os erros ficam na própria tela
  const escolherArquivo = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (r.canceled || !r.assets?.length) return;

      const escolhido = r.assets[0];
      const mimeType = tipoComprovante(escolhido);
      if (!mimeType) {
        setErro('Escolha um comprovante em PDF, JPEG ou PNG.');
        return;
      }
      if (escolhido.size && escolhido.size > TAMANHO_MAX) {
        setErro('O arquivo deve ter no máximo 10 MB.');
        return;
      }
      setErro('');
      setArquivo({ ...escolhido, mimeType });
    } catch (error) {
      setErro(error?.message || 'Não foi possível abrir o seletor de arquivos.');
    }
  };

  const validar = () => {
    if (
      !nome.trim() || !registro.trim() || !email.trim() || !telefone ||
      !cpf || !nascimento || !cidade.trim() || !estado || !profissao ||
      !senha || !confirmar
    ) return 'Preencha todos os campos.';
    if (!validarEmail(email)) return 'Digite um e-mail válido.';
    if (!validarTelefone(telefone)) return 'Informe o telefone com DDD.';
    if (!validarCPF(cpf)) return 'CPF inválido. Confira os números.';
    if (!validarData(nascimento)) return 'Data de nascimento inválida. Use o formato dd/mm/aaaa.';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (senha !== confirmar) return 'As senhas não conferem.';
    if (!arquivo) return 'Anexe um documento que comprove seu registro profissional.';
    return '';
  };

  const cadastrar = async () => {
    if (enviando || cadastroConcluido) return;

    const mensagem = validar();
    if (mensagem) {
      setErro(mensagem);
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const resultado = await cadastrarComEmail(email, senha, {
        account_type: 'profissional',
        full_name: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        phone: telefone.replace(/\D/g, ''),
        birth_date: dataParaISO(nascimento),
        city: cidade.trim(),
        state: estado,
        profession: profissao,
        professional_registration: registro.trim(),
      });

      const sessaoAtiva = Boolean(resultado.session);
      let mensagemCadastro;
      if (sessaoAtiva) {
        try {
          await enviarComprovanteProfissional(arquivo);
          mensagemCadastro = 'Conta criada e comprovante enviado para análise.';
        } catch (erroDocumento) {
          mensagemCadastro =
            `Conta criada, mas o comprovante não foi enviado: ${mensagemErroAuth(erroDocumento)}. ` +
            'Você pode tentar novamente na tela do perfil profissional.';
        }
      } else {
        mensagemCadastro =
          'Cadastro criado. Confirme seu e-mail; depois, envie o comprovante pelo perfil profissional.';
      }

      setCadastroConcluido(true);
      setSessaoCriada(sessaoAtiva);
      setSenha('');
      setConfirmar('');
      setAviso(mensagemCadastro);
    } catch (e) {
      setErro(mensagemErroAuth(e));
    } finally {
      setEnviando(false);
    }
  };

  const continuar = async () => {
    if (!sessaoCriada) {
      router.replace('/login');
      return;
    }

    setContinuando(true);
    try {
      await recarregarPerfil();
      router.replace('/PerfilProfissional');
    } catch (error) {
      setAviso(`Conta criada, mas não foi possível carregar o perfil: ${mensagemErroAuth(error)}`);
    } finally {
      setContinuando(false);
    }
  };

  return (
    <AuthTela
      titulo={'Faça parte da nossa\n'}
      destaque="rede de profissionais"
      texto="Cadastre seu perfil profissional, divulgue seu trabalho e conecte-se com pessoas que procuram seus serviços."
      miniCards
    >
      <CartaoTitulo
        titulo="Cadastro Profissionais"
        subtitulo="Crie seu perfil profissional e apresente seus serviços."
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
          icone="ribbon-outline"
          rotulo="Registro Profissional"
          valor={registro}
          aoMudar={mudar(setRegistro)}
          placeholder="Digite seu Registro Profissional"
          autoCapitalize="characters"
        />
      </Linha>

      <Linha>
        <Campo
          icone="mail-outline"
          rotulo="E-mail"
          valor={email}
          aoMudar={mudar(setEmail)}
          placeholder="Digite seu E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Campo
          icone="call-outline"
          rotulo="Telefone"
          valor={telefone}
          aoMudar={mudar(setTelefone)}
          mascara={maskTelefone}
          placeholder="Digite seu Telefone"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
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
          icone="calendar-outline"
          rotulo="Data de Nascimento"
          valor={nascimento}
          aoMudar={mudar(setNascimento)}
          mascara={maskData}
          placeholder="dd/mm/aaaa"
          keyboardType="numeric"
        />
      </Linha>

      <Linha>
        <Campo
          icone="business-outline"
          rotulo="Cidade"
          valor={cidade}
          aoMudar={mudar(setCidade)}
          placeholder="Digite sua Cidade"
          autoCapitalize="words"
        />
        <Seletor
          icone="location-outline"
          rotulo="Estado"
          valor={estado}
          aoMudar={mudar(setEstado)}
          opcoes={ESTADOS}
          placeholder="Selecionar estado"
        />
      </Linha>

      <Seletor
        icone="briefcase-outline"
        rotulo="Profissão"
        valor={profissao}
        aoMudar={mudar(setProfissao)}
        opcoes={PROFISSOES}
        placeholder="Selecionar sua profissão"
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
          rotulo="Confirmar Senha"
          valor={confirmar}
          aoMudar={mudar(setConfirmar)}
          placeholder="Confirme sua Senha"
          senha
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </Linha>

      {/* Documentos */}
      <View style={s.grupoArquivo}>
        <Text style={s.rotuloArquivo}>Documentos</Text>
        <View style={s.caixaArquivo}>
          <Pressable
            style={({ pressed }) => [s.botaoArquivo, pressed && s.apagado]}
            onPress={escolherArquivo}
            accessibilityRole="button"
          >
            <Ionicons name="attach-outline" size={18} color={dourado} />
            <Text style={s.textoBotaoArquivo}>
              {arquivo ? 'Trocar' : 'Escolher arquivo'}
            </Text>
          </Pressable>

          <View style={s.infoArquivo}>
            <Text style={s.nomeArquivo} numberOfLines={1}>
              {arquivo ? arquivo.name : 'Nenhum arquivo escolhido'}
            </Text>
            {!!arquivo?.size && (
              <Text style={s.tamanhoArquivo}>{formatarTamanho(arquivo.size)}</Text>
            )}
          </View>

          {!!arquivo && (
            <Pressable
              onPress={() => setArquivo(null)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Remover arquivo"
            >
              <Ionicons name="close-circle-outline" size={22} color="#aaa" />
            </Pressable>
          )}
        </View>
        <Text style={s.dicaArquivo}>
          Comprovante do registro profissional, em PDF ou imagem, até 10 MB.
        </Text>
      </View>

      <CaixaErro texto={erro} />
      {!!aviso && <Text style={s.aviso} accessibilityLiveRegion="polite">{aviso}</Text>}
      {cadastroConcluido && (
        <Botao
          texto={
            continuando
              ? 'Carregando perfil...'
              : sessaoCriada
                ? 'Continuar para o perfil'
                : 'Ir para o login'
          }
          aoPressionar={continuar}
          desativado={continuando}
        />
      )}

      <TextoLegal prefixo="Ao se cadastrar, você concorda com os" />

      <Botao
        texto={enviando ? 'Cadastrando...' : 'Cadastrar'}
        aoPressionar={cadastrar}
        desativado={enviando || cadastroConcluido}
      />

      <Divisor texto="ou" />

      <LinkConta
        pergunta="Já possui um cadastro?"
        acao="Entrar"
        aoPressionar={() => router.push('/login')}
      />

      <LinkContorno
        texto="Quero me cadastrar como Cliente"
        aoPressionar={() => router.push('/cadastro')}
      />
    </AuthTela>
  );
}

const s = StyleSheet.create({
  grupoArquivo: { marginBottom: 14 },
  aviso: { color: '#d8b965', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  rotuloArquivo: { color: '#b5b5b5', fontSize: 12, marginBottom: 6 },
  caixaArquivo: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: '#383838',
    borderRadius: 8, backgroundColor: '#101112',
  },
  botaoArquivo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38,
    paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1,
    borderColor: dourado, backgroundColor: '#292929', borderRadius: 6,
  },
  apagado: { opacity: 0.7 },
  textoBotaoArquivo: { color: dourado, fontSize: 13 },
  infoArquivo: { flex: 1, minWidth: 0 },
  nomeArquivo: { color: '#ddd', fontSize: 13 },
  tamanhoArquivo: { color: '#888', fontSize: 11, marginTop: 2 },
  dicaArquivo: { color: '#888', fontSize: 11, marginTop: 6 },
});