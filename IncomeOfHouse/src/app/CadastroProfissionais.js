import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
// Para o upload de arquivo: npx expo install expo-document-picker
import * as DocumentPicker from 'expo-document-picker';

/* =========================================================
   DADOS
========================================================= */

const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
].map(([valor, rotulo]) => ({ valor, rotulo }));

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
].map(([valor, rotulo]) => ({ valor, rotulo }));

// Troque os emojis pelos seus ícones (ver observação no final da resposta)
const MINI_CARDS = [
  { icone: '🏛️', texto: 'Arquitetura' },
  { icone: '📐', texto: 'Engenharia' },
  { icone: '🛋️', texto: 'Design' },
  { icone: '🌿', texto: 'Paisagismo' },
];

/* =========================================================
   MÁSCARAS
========================================================= */

const soNumeros = (t) => t.replace(/\D/g, '');

const mascaraCPF = (t) => {
  const n = soNumeros(t).slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

const mascaraTelefone = (t) => {
  const n = soNumeros(t).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
};

const mascaraData = (t) => {
  const n = soNumeros(t).slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
};

/* =========================================================
   COMPONENTES
========================================================= */

function Campo({ rotulo, estiloCampo, ...props }) {
  return (
    <View style={[styles.campo, estiloCampo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.input} placeholderTextColor="#737373" {...props} />
    </View>
  );
}

// Substitui o <select>: abre uma lista em modal
function Selecao({ rotulo, opcoes, valor, onChange, placeholder, estiloCampo }) {
  const [aberto, setAberto] = useState(false);
  const selecionada = opcoes.find((o) => o.valor === valor);

  return (
    <View style={[styles.campo, estiloCampo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Pressable style={styles.input} onPress={() => setAberto(true)}>
        <Text style={selecionada ? styles.inputTexto : styles.placeholderTexto} numberOfLines={1}>
          {selecionada ? selecionada.rotulo : placeholder}
        </Text>
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.modalFundo} onPress={() => setAberto(false)}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>{rotulo}</Text>
            <ScrollView>
              {opcoes.map((op) => (
                <Pressable
                  key={op.valor}
                  style={[styles.opcao, op.valor === valor && styles.opcaoAtiva]}
                  onPress={() => {
                    onChange(op.valor);
                    setAberto(false);
                  }}
                >
                  <Text style={[styles.opcaoTexto, op.valor === valor && styles.dourado]}>
                    {op.rotulo}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* =========================================================
   TELA
========================================================= */

export default function CadastroProfissionais() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const lado = width >= 950;       // introdução ao lado do formulário
  const duasColunas = width >= 440; // grid de 2 colunas nos campos

  const [form, setForm] = useState({
    nome: '',
    registro: '',
    email: '',
    telefone: '',
    cpf: '',
    nascimento: '',
    cidade: '',
    estado: '',
    profissao: '',
    senha: '',
    confirmar: '',
  });
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');

  const set = (campo, mascara) => (valor) =>
    setForm((f) => ({ ...f, [campo]: mascara ? mascara(valor) : valor }));

  const escolherArquivo = async () => {
    const r = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!r.canceled) setArquivo(r.assets[0]);
  };

  const cadastrar = () => {
    const f = form;
    if (
      !f.nome.trim() || !f.registro.trim() || !f.email.trim() || !f.telefone.trim() ||
      !f.cpf.trim() || !f.nascimento.trim() || !f.cidade.trim() ||
      !f.estado || !f.profissao || !f.senha || !f.confirmar
    ) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (soNumeros(f.cpf).length !== 11) {
      setErro('CPF inválido.');
      return;
    }
    if (soNumeros(f.nascimento).length !== 8) {
      setErro('Data de nascimento inválida (use DD/MM/AAAA).');
      return;
    }
    if (f.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (f.senha !== f.confirmar) {
      setErro('As senhas não conferem.');
      return;
    }
    setErro('');
    // TODO: enviar form + arquivo para o seu backend aqui
    router.push('/login');
  };

  const Linha = ({ children }) => (
    <View style={duasColunas ? styles.linha : undefined}>{children}</View>
  );

  return (
    <View style={styles.tela}>
      {/* ---------- Header / Menu ---------- */}
      <View style={styles.topo}>
        <Pressable onPress={() => router.push('/')}>
          {/* Para usar a imagem: <Image source={require('../assets/img/Logo.png')} style={styles.logoImg} /> */}
          <Text style={styles.logo}>Income of Houses</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menu}>
          <Pressable onPress={() => router.push('/')}>
            <Text style={styles.menuLink}>Início</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/plantas')}>
            <Text style={styles.menuLink}>Plantas</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/profissionais')}>
            <Text style={styles.menuLink}>Profissionais</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/sobre')}>
            <Text style={styles.menuLink}>Sobre Nós</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.fundo}>
          <View style={styles.overlay} pointerEvents="none" />

          <View style={[styles.secao, lado && styles.secaoLado]}>
            {/* ---------- Introdução ---------- */}
            <View style={[styles.intro, lado && styles.introLado]}>
              <Text style={styles.introH3}>INCOME OF HOUSES</Text>
              <Text style={styles.introH1}>
                Faça parte da nossa{'\n'}
                <Text style={styles.span}>rede de profissionais</Text>
              </Text>
              <Text style={styles.introP}>
                Cadastre seu perfil profissional, divulgue seu trabalho e conecte-se com pessoas
                que procuram seus serviços.
              </Text>

              <View style={styles.miniCards}>
                {MINI_CARDS.map((c, i) => (
                  <View
                    key={c.texto}
                    style={[styles.miniCard, i < MINI_CARDS.length - 1 && styles.miniCardBorda]}
                  >
                    <Text style={styles.miniCardIcone}>{c.icone}</Text>
                    <Text style={styles.miniCardTexto}>{c.texto}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ---------- Card do formulário ---------- */}
            <View style={[styles.card, lado && styles.cardLado]}>
              <Text style={styles.cardTitulo}>Cadastro Profissionais</Text>
              <Text style={styles.cardSub}>Crie seu perfil profissional e apresente seus serviços.</Text>

              <Linha>
                <Campo rotulo="Nome" value={form.nome} onChangeText={set('nome')} placeholder="Digite seu nome" />
                <Campo rotulo="Registro Profissional" value={form.registro} onChangeText={set('registro')} placeholder="Digite seu Registro Profissional" />
              </Linha>
              <Linha>
                <Campo rotulo="E-mail" value={form.email} onChangeText={set('email')} placeholder="Digite seu E-mail" keyboardType="email-address" autoCapitalize="none" />
                <Campo rotulo="Telefone" value={form.telefone} onChangeText={set('telefone', mascaraTelefone)} placeholder="Digite seu Telefone" keyboardType="phone-pad" />
              </Linha>
              <Linha>
                <Campo rotulo="CPF" value={form.cpf} onChangeText={set('cpf', mascaraCPF)} placeholder="Digite seu CPF" keyboardType="numeric" />
                <Campo rotulo="Data de Nascimento" value={form.nascimento} onChangeText={set('nascimento', mascaraData)} placeholder="DD/MM/AAAA" keyboardType="numeric" />
              </Linha>
              <Linha>
                <Campo rotulo="Cidade" value={form.cidade} onChangeText={set('cidade')} placeholder="Digite sua Cidade" />
                <Selecao rotulo="Estado" opcoes={ESTADOS} valor={form.estado} onChange={set('estado')} placeholder="Selecionar estado" />
              </Linha>

              <Selecao
                rotulo="Profissão"
                opcoes={PROFISSOES}
                valor={form.profissao}
                onChange={set('profissao')}
                placeholder="Selecionar sua profissão"
              />

              <Linha>
                <Campo rotulo="Senha" value={form.senha} onChangeText={set('senha')} placeholder="Crie sua Senha" secureTextEntry />
                <Campo rotulo="Confirmar Senha" value={form.confirmar} onChangeText={set('confirmar')} placeholder="Confirme sua Senha" secureTextEntry />
              </Linha>

              {/* ---------- Upload de documentos ---------- */}
              <View style={styles.campoArquivo}>
                <Text style={styles.rotuloArquivo}>Documentos</Text>
                <View style={styles.arquivoBox}>
                  <Pressable style={styles.botaoArquivo} onPress={escolherArquivo}>
                    <Text style={styles.botaoArquivoTexto}>Escolher arquivo</Text>
                  </Pressable>
                  <Text style={styles.nomeArquivo} numberOfLines={1}>
                    {arquivo ? arquivo.name : 'Nenhum arquivo escolhido'}
                  </Text>
                </View>
              </View>

              {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

              <Pressable style={styles.botao} onPress={cadastrar}>
                <Text style={styles.botaoTexto}>Cadastrar</Text>
              </Pressable>

              {/* ---------- Divisor ---------- */}
              <View style={styles.divisor}>
                <View style={styles.divisorLinha} />
                <Text style={styles.divisorTexto}>ou</Text>
                <View style={styles.divisorLinha} />
              </View>

              {/* ---------- Links ---------- */}
              <View style={styles.linkLogin}>
                <Pressable onPress={() => router.push('/login')}>
                  <Text style={styles.linkTexto}>
                    Já possui um cadastro? <Text style={styles.dourado}>Entrar</Text>
                  </Text>
                </Pressable>

                <Pressable style={styles.botaoCliente} onPress={() => router.push('/cadastro')}>
                  <Text style={styles.botaoClienteTexto}>Quero me cadastrar como Cliente</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- Rodapé ---------- */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>©IncomeOfHouses. Todos os direitos reservados.</Text>
          <View style={styles.rodapeLinks}>
            <Pressable onPress={() => router.push('/termos-de-uso')}>
              <Text style={styles.rodapeLink}>Termos de Uso</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>|</Text>
            <Pressable onPress={() => router.push('/politica-de-privacidade')}>
              <Text style={styles.rodapeLink}>Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const OURO = '#d4af6a';
const OURO_BORDA = '#cda432';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0b0b0b' },
  conteudo: { flexGrow: 1 },
  dourado: { color: OURO },

  /* Header */
  topo: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logo: { color: OURO, fontSize: 16, fontWeight: 'bold' },
  logoImg: { width: 60, height: 60, resizeMode: 'contain' },
  menu: { alignItems: 'center', gap: 4, paddingLeft: 12 },
  menuLink: { color: '#fff', fontSize: 14, fontWeight: '500', paddingVertical: 10, paddingHorizontal: 12 },

  /* Fundo */
  fundo: { backgroundColor: '#0f0f0f' }, // troque por <ImageBackground> com BackGroundCadastroELogin.png
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  secao: { padding: 20, paddingTop: 30, gap: 30 },
  secaoLado: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: '8%' },

  /* Introdução */
  intro: { paddingHorizontal: 4 },
  introLado: { flex: 1, paddingRight: 40 },
  introH3: { color: OURO, fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  introH1: { color: '#f5f5f5', fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  span: { color: '#cfa835' },
  introP: { color: '#f0f0f0', fontSize: 16, fontWeight: '500', lineHeight: 24, maxWidth: 380 },
  miniCards: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 28, rowGap: 14 },
  miniCard: { alignItems: 'center', paddingHorizontal: 15, minHeight: 60 },
  miniCardBorda: { borderRightWidth: 3, borderRightColor: '#cfa835' },
  miniCardIcone: { fontSize: 30, marginBottom: 4 },
  miniCardTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* Card */
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: OURO_BORDA,
    borderRadius: 20,
  },
  cardLado: { width: 500, alignSelf: 'flex-start' },
  cardTitulo: { color: '#f5f5f5', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  cardSub: { color: '#a3a3a3', fontSize: 15, textAlign: 'center', marginBottom: 24 },

  /* Campos */
  linha: { flexDirection: 'row', gap: 16 },
  campo: { flex: 1, marginBottom: 14 },
  rotulo: { color: '#e5e5e5', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  input: {
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 4,
    color: '#e5e5e5',
    fontSize: 13,
  },
  inputTexto: { color: '#e5e5e5', fontSize: 13 },
  placeholderTexto: { color: '#737373', fontSize: 13 },

  /* Modal do select */
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCaixa: {
    maxHeight: '70%',
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: OURO_BORDA,
    borderRadius: 12,
    paddingVertical: 8,
  },
  modalTitulo: { color: '#f5f5f5', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 10 },
  opcao: { paddingVertical: 12, paddingHorizontal: 16 },
  opcaoAtiva: { backgroundColor: 'rgba(212,175,106,0.08)' },
  opcaoTexto: { color: '#e5e5e5', fontSize: 14 },

  /* Upload */
  campoArquivo: { width: '100%', marginBottom: 20 },
  rotuloArquivo: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
  arquivoBox: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    backgroundColor: '#0b0b0b',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  botaoArquivo: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 4,
  },
  botaoArquivoTexto: { color: '#fff', fontSize: 12 },
  nomeArquivo: { flex: 1, color: '#777', fontSize: 12 },

  erro: { color: '#e0594a', fontSize: 13, marginBottom: 10 },

  /* Botão */
  botao: { backgroundColor: OURO, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#111', fontSize: 14, fontWeight: '700' },

  /* Divisor */
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 22 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: '#363636' },
  divisorTexto: { color: '#737373', fontSize: 15 },

  /* Links */
  linkLogin: { alignItems: 'center', gap: 15 },
  linkTexto: { color: '#e5e5e5', fontSize: 14 },
  botaoCliente: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,106,0.4)',
    backgroundColor: 'rgba(212,175,106,0.08)',
    borderRadius: 8,
  },
  botaoClienteTexto: { color: OURO, fontSize: 14, fontWeight: '700' },

  /* Rodapé */
  rodape: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#d4a63a',
  },
  rodapeTexto: { color: '#888', fontSize: 13, textAlign: 'center' },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rodapeLink: { color: OURO, fontSize: 13 },
  rodapeSep: { color: '#555' },
});