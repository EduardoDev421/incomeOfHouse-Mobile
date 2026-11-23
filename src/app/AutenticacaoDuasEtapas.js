  import React, { useRef, useState } from 'react';
  import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Share,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    useWindowDimensions,
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  import { useLegal } from '../components/LegalProvider';
  import { usarConta } from '../components/ContaProvider';

  // Dependencias OPCIONAIS (a tela funciona mesmo sem elas):
  //   npx expo install expo-clipboard react-native-svg
  //   npm install react-native-qrcode-svg
  // Sem expo-clipboard, o botao "Copiar" abre o menu de compartilhar.
  // Sem react-native-qrcode-svg, o QR Code nao aparece (use a chave manual).
  let Clipboard = null;
  try {
    Clipboard = require('expo-clipboard');
  } catch (e) {}

  let QRCode = null;
  try {
    QRCode = require('react-native-qrcode-svg').default;
  } catch (e) {}

  const LOGO = require('../../assets/images/Logo.png');

  const COLORS = {
    bg: '#080a0b',
    topo: '#080808',
    lateral: '#0d0d0e',
    conteudo: '#111111',
    card: '#141414',
    campo: '#1a1a1c',
    border: '#292929',
    borderLinha: '#242424',
    borderLateral: '#252729',
    borderTopo: 'rgba(255,255,255,0.12)',
    borderTitulo: '#cfcfcf',
    gold: '#d4a63a',
    goldClaro: '#f0ca4c',
    goldBorda: '#59431f',
    goldBtn: '#8a701e',
    goldFundo: '#29231a',
    text: '#ffffff',
    textSuave: '#e7e7e7',
    suave: '#a8abad',
    muted: '#8f9497',
    rodape: '#7e8385',
    danger: '#e5484d',
  };

  // Ajuste as rotas conforme os nomes dos arquivos em src/app
  const MENU = [
    { label: 'Meu Perfil', icon: 'person-circle-outline', route: '/PerfilProfissional' },
    { label: 'Meus Endereços', icon: 'location-outline', route: '/MeusenderecosP' },
    { label: 'Meus Pedidos', icon: 'grid-outline', route: '/Projetos' },
    { label: 'Meus Profissionais Favoritos', icon: 'star-outline', route: '/Meusprofissionais' },
    { label: 'Projetos Salvos', icon: 'bookmark-outline', route: '/MeusProjetos' },
    { label: 'Agendamentos', icon: 'calendar-outline', route: '/AgendamentosP' },
    { label: 'Mensagem', icon: 'chatbox-ellipses-outline', route: '/MensagensP' },
    { label: 'Configurações', icon: 'settings-outline', route: '/ConfigProfissionais', ativo: true },
    { label: 'Sair', icon: 'log-out-outline', route: '/login', separador: true },
  ];

  const LINKS_TOPO = [
    ['Início', '/'],
    ['Plantas', '/planta'],
    ['Profissionais', '/profissionais'],
    ['Sobre Nós', '/sobreNos'],
  ];

  const ROTA_CONFIGURACOES = '/ConfigProfissionais';
  // A verificação em duas etapas ainda NÃO existe no backend. Enquanto esta flag for false,
  // o assistente não abre e nenhuma proteção é "ativada" de mentira.
  // Só mude para true depois de validar o código no servidor (Supabase MFA: auth.mfa.*).
  const DUAS_ETAPAS_DISPONIVEL = false;

  const METODOS = [
    {
      id: 'app',
      icon: 'phone-portrait-outline',
      titulo: 'Aplicativo autenticador',
      desc: 'Google Authenticator ou Microsoft Authenticator.',
    },
    {
      id: 'email',
      icon: 'mail-outline',
      titulo: 'E-mail',
      desc: 'Receba o código de verificação no seu e-mail.',
    },
  ];

  const ETAPAS = ['1. Configurar', '2. Verificar', '3. Códigos de backup'];

  /* ---------- Funções utilitárias ---------- */

  const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function gerarChave() {
    let chave = '';
    for (let i = 0; i < 16; i++) chave += BASE32[Math.floor(Math.random() * BASE32.length)];
    return chave;
  }

  function formatarChave(chave) {
    return chave.match(/.{1,4}/g).join(' ');
  }

  function gerarCodigosBackup() {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const pedaco = () => Array.from({ length: 4 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
    return Array.from({ length: 8 }, () => `${pedaco()}-${pedaco()}`);
  }

  function mascararEmail(email) {
    if (!email || !email.includes('@')) return '';
    const [usuario, dominio] = email.split('@');
    return `${usuario[0]}${'•'.repeat(Math.max(usuario.length - 1, 3))}@${dominio}`;
  }

  /* ---------- Tela ---------- */

  export default function AutenticacaoDuasEtapas() {
    const router = useRouter();
    const { abrirLegal } = useLegal();
    const { user } = usarConta();
    const EMAIL_USUARIO = user?.email || '';
    const { width } = useWindowDimensions();
    const largo = width >= 900; // layout igual ao da web: menu lateral fixo + cabeçalho completo
    const [menuAberto, setMenuAberto] = useState(false);

    // Painel principal
    const [ativo, setAtivo] = useState(false);
    const [metodo, setMetodo] = useState('app');
    const [metodoConfigurado, setMetodoConfigurado] = useState(null);

    // Assistente
    const [assistente, setAssistente] = useState(false);
    const [etapa, setEtapa] = useState(1);
    const [chave, setChave] = useState(gerarChave);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [erro, setErro] = useState('');
    const [codigos, setCodigos] = useState([]);
    const [confirmou, setConfirmou] = useState(false);
    const otpRefs = useRef([]);

    // Toast
    const [toast, setToast] = useState('');
    const toastTimer = useRef(null);

    const mostrarToast = (msg) => {
      setToast(msg);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(''), 2500);
    };

    const ir = (route) => {
      setMenuAberto(false);
      router.push(route);
    };

    const voltarConfig = () => router.push(ROTA_CONFIGURACOES);

    /* ----- Painel principal ----- */
    const salvar = () => {
      if (!DUAS_ETAPAS_DISPONIVEL) {
        mostrarToast('Recurso em desenvolvimento: ainda não está disponível.');
        return;
      }
      if (!ativo) {
        setMetodoConfigurado(null);
        mostrarToast('Autenticação em duas etapas desativada.');
        return;
      }
      if (metodoConfigurado === metodo) {
        mostrarToast('Nenhuma alteração para salvar.');
        return;
      }
      // Abre o assistente
      setChave(gerarChave());
      setOtp(['', '', '', '', '', '']);
      setErro('');
      setConfirmou(false);
      setEtapa(1);
      setAssistente(true);
    };

    /* ----- Assistente ----- */
    const fecharAssistente = () => setAssistente(false);

    const copiar = async (texto, mensagem) => {
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(texto);
        mostrarToast(mensagem);
      } else {
        try {
          await Share.share({ message: texto });
        } catch (e) {}
      }
    };

    const copiarChave = () => copiar(chave, 'Chave copiada.');

    const copiarCodigos = () => copiar(codigos.join('\n'), 'Códigos copiados.');

    const irEtapa2 = () => {
      setOtp(['', '', '', '', '', '']);
      setErro('');
      setEtapa(2);
    };

    const alterarOtp = (indice, texto) => {
      const digitos = texto.replace(/\D/g, '');
      setErro('');

      if (digitos.length > 1) {
        // colar código completo
        const novo = ['', '', '', '', '', ''];
        digitos
          .slice(0, 6)
          .split('')
          .forEach((d, i) => (novo[i] = d));
        setOtp(novo);
        otpRefs.current[Math.min(digitos.length, 6) - 1]?.focus();
        return;
      }

      const novo = [...otp];
      novo[indice] = digitos;
      setOtp(novo);
      if (digitos && indice < 5) otpRefs.current[indice + 1]?.focus();
    };

    const teclaOtp = (indice, tecla) => {
      if (tecla === 'Backspace' && !otp[indice] && indice > 0) {
        const novo = [...otp];
        novo[indice - 1] = '';
        setOtp(novo);
        otpRefs.current[indice - 1]?.focus();
      }
    };

    const reenviar = () => {
      setOtp(['', '', '', '', '', '']);
      setErro('');
      otpRefs.current[0]?.focus();
      mostrarToast('Código reenviado para o seu e-mail.');
    };

    const codigoCompleto = otp.every((d) => d !== '');

    const verificar = () => {
      // TODO: validar o código no backend (Supabase MFA: auth.mfa.challengeAndVerify).
      // Nunca avance a etapa sem essa validação.
      if (!DUAS_ETAPAS_DISPONIVEL) {
        setErro('A verificação em duas etapas ainda não está disponível.');
        return;
      }
      setCodigos(gerarCodigosBackup());
      setConfirmou(false);
      setEtapa(3);
    };

    const ativarProtecao = () => {
      setMetodoConfigurado(metodo);
      setAssistente(false);
      mostrarToast('Autenticação em duas etapas ativada.');
    };

    /* ---------- Pedaços reutilizados ---------- */

    const avatar = (
      <TouchableOpacity style={styles.avatarArea} onPress={() => ir('/PerfilProfissional')} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color="#1a1a1c" />
        </View>
        <Ionicons name="chevron-down" size={12} color={COLORS.textSuave} />
      </TouchableOpacity>
    );

    const sino = (
      <TouchableOpacity style={styles.topoBtnPeq} onPress={() => mostrarToast('Sem novas notificações.')}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.textSuave} />
      </TouchableOpacity>
    );

    const itensMenu = MENU.map((item) => (
      <View key={item.label}>
        {item.separador && <View style={styles.menuSep} />}
        <TouchableOpacity
          style={[styles.menuItem, item.ativo && styles.menuItemAtivo]}
          onPress={() => ir(item.route)}
          activeOpacity={0.8}
        >
          <Ionicons name={item.icon} size={16} color={COLORS.gold} />
          <Text style={[styles.menuItemTxt, item.ativo && { color: COLORS.gold }]}>{item.label}</Text>
        </TouchableOpacity>
      </View>
    ));

    const conteudo = (
      <>
        <TouchableOpacity style={styles.voltar} onPress={voltarConfig} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color={COLORS.suave} />
          <Text style={styles.voltarTxt}>Voltar para configurações</Text>
        </TouchableOpacity>

        <View style={styles.tituloRow}>
          <Ionicons name="shield-checkmark-outline" size={26} color={COLORS.gold} />
          <Text style={[styles.h1, !largo && { fontSize: 20 }]}>Autenticação em duas etapas</Text>
        </View>
        <Text style={styles.sub}>Aumente a segurança da sua conta.</Text>
        <View style={styles.divisor} />

        {!DUAS_ETAPAS_DISPONIVEL && (
          <View style={[styles.avisoEmail, { marginTop: 0, marginBottom: 14 }]}>
            <Ionicons name="construct-outline" size={18} color={COLORS.gold} />
            <Text style={[styles.avisoEmailTxt, styles.flex]}>
              Recurso em desenvolvimento. A verificação em duas etapas ainda não está disponível
              e nenhuma alteração feita aqui é salva.
            </Text>
          </View>
        )}

        {!assistente ? (
          /* ========== PAINEL PRINCIPAL ========== */
          <View style={styles.card}>
            <View style={styles.secaoTitulo}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gold} />
              <Text style={styles.secaoTituloTxt}>Segurança extra</Text>
            </View>

            <View style={styles.linha}>
              <View style={styles.flex}>
                <Text style={styles.linhaTitulo}>Verificação em duas etapas</Text>
                <Text style={styles.linhaDesc}>
                  A autenticação em duas etapas adiciona uma camada extra de proteção à sua conta.
                </Text>
              </View>
              <Switch
                value={ativo}
                onValueChange={setAtivo}
                trackColor={{ false: '#2c2c2e', true: COLORS.gold }}
                thumbColor="#eeeeee"
                activeThumbColor="#eeeeee"
              />
            </View>

            <View style={styles.secaoTitulo}>
              <Ionicons name="phone-portrait-outline" size={20} color={COLORS.gold} />
              <Text style={styles.secaoTituloTxt}>Método de autenticação</Text>
            </View>

            {METODOS.map((m) => {
              const selecionado = metodo === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.opcao, selecionado && styles.opcaoAtiva, !ativo && { opacity: 0.45 }]}
                  onPress={() => ativo && setMetodo(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radio, selecionado && styles.radioAtivo]}>
                    {selecionado && <View style={styles.radioPonto} />}
                  </View>
                  <Ionicons name={m.icon} size={20} color={COLORS.gold} />
                  <View style={styles.flex}>
                    <Text style={styles.linhaTitulo}>{m.titulo}</Text>
                    <Text style={styles.linhaDesc}>{m.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.acoesPainel}>
              <TouchableOpacity style={styles.btnPrincipal} onPress={salvar} activeOpacity={0.85}>
                <Text style={styles.btnPrincipalTxt}>Salvar alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ========== ASSISTENTE ========== */
          <View style={styles.card}>
            <View style={[styles.secaoTitulo, styles.secaoSemLinhaAcima]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.gold} />
              <Text style={[styles.secaoTituloTxt, styles.flex]}>Configurar autenticação em duas etapas</Text>
            </View>

            <View style={styles.corpoAssistente}>
              {/* Progresso */}
              <View style={styles.progresso}>
                {ETAPAS.map((label, i) => {
                  const n = i + 1;
                  const feito = n < etapa;
                  const atual = n === etapa;
                  return (
                    <View key={label} style={styles.progressoItem}>
                      <View style={[styles.progressoBarra, (feito || atual) && styles.progressoBarraAtiva]} />
                      <View style={styles.progressoLabelRow}>
                        {feito && <Ionicons name="checkmark" size={11} color={COLORS.gold} />}
                        <Text
                          style={[
                            styles.progressoTxt,
                            atual && { color: COLORS.textSuave },
                            feito && { color: COLORS.gold },
                          ]}
                        >
                          {label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Etapa 1 */}
              {etapa === 1 && (
                <View>
                  {metodo === 'app' ? (
                    <View>
                      <Text style={styles.etapaTitulo}>Escaneie o QR Code</Text>
                      <Text style={styles.etapaDesc}>Abra o aplicativo autenticador e adicione uma nova conta.</Text>

                      <View style={[styles.qrArea, largo && styles.qrAreaLinha]}>
                        {QRCode ? (
                          <View style={styles.qrBox}>
                            <QRCode
                              value={`otpauth://totp/IncomeOfHouses:${EMAIL_USUARIO}?secret=${chave}&issuer=IncomeOfHouses`}
                              size={150}
                              backgroundColor="#ffffff"
                              color="#000000"
                            />
                          </View>
                        ) : (
                          <View style={styles.qrFallback}>
                            <Ionicons name="qr-code-outline" size={40} color={COLORS.gold} />
                            <Text style={styles.qrFallbackTxt}>
                              QR Code indisponível. Use a chave manual abaixo no aplicativo autenticador.
                            </Text>
                          </View>
                        )}

                        <View style={[styles.chaveArea, largo && styles.flex]}>
                          <Text style={styles.chaveTitulo}>Não consegue escanear?</Text>
                          <Text style={[styles.etapaDesc, { marginBottom: 2 }]}>Digite esta chave no aplicativo:</Text>
                          <View style={styles.chaveRow}>
                            <Text style={styles.chaveTxt} selectable>
                              {formatarChave(chave)}
                            </Text>
                            <TouchableOpacity style={styles.btn} onPress={copiarChave}>
                              <Text style={styles.btnTxt}>Copiar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.etapaTitulo}>Confirme seu e-mail</Text>
                      <Text style={styles.etapaDesc}>
                        Vamos enviar um código de 6 dígitos para o e-mail cadastrado na sua conta.
                      </Text>
                      <View style={styles.avisoEmail}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.gold} />
                        <Text style={styles.avisoEmailTxt}>{mascararEmail(EMAIL_USUARIO)}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.acoes}>
                    <TouchableOpacity style={styles.btn} onPress={fecharAssistente}>
                      <Text style={styles.btnTxt}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrincipal} onPress={irEtapa2}>
                      <Text style={styles.btnPrincipalTxt}>Continuar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Etapa 2 */}
              {etapa === 2 && (
                <View>
                  <Text style={styles.etapaTitulo}>Digite o código de 6 dígitos</Text>
                  <Text style={styles.etapaDesc}>
                    {metodo === 'app'
                      ? 'Abra o aplicativo autenticador e digite o código exibido para a sua conta.'
                      : `Enviamos um código para ${mascararEmail(EMAIL_USUARIO)}.`}
                  </Text>

                  <View style={styles.otpRow}>
                    {otp.map((d, i) => (
                      <TextInput
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        style={[
                          styles.otpInput,
                          largo ? { width: 44 } : { flex: 1, minWidth: 0 },
                          d !== '' && styles.otpInputPreenchido,
                          !!erro && styles.otpInputErro,
                          Platform.OS === 'web' && { outlineStyle: 'none' },
                        ]}
                        value={d}
                        onChangeText={(t) => alterarOtp(i, t)}
                        onKeyPress={({ nativeEvent }) => teclaOtp(i, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={6}
                        textContentType="oneTimeCode"
                        selectTextOnFocus
                        autoFocus={i === 0}
                      />
                    ))}
                  </View>

                  {!!erro && <Text style={styles.erro}>{erro}</Text>}

                  {metodo === 'email' && (
                    <TouchableOpacity onPress={reenviar} style={styles.reenviar}>
                      <Text style={styles.reenviarTxt}>Reenviar código</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.acoes}>
                    <TouchableOpacity style={styles.btn} onPress={() => setEtapa(1)}>
                      <Text style={styles.btnTxt}>Voltar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnPrincipal, !codigoCompleto && styles.btnDesabilitado]}
                      onPress={verificar}
                      disabled={!codigoCompleto}
                    >
                      <Text style={styles.btnPrincipalTxt}>Verificar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Etapa 3 */}
              {etapa === 3 && (
                <View>
                  <Text style={styles.etapaTitulo}>Guarde seus códigos de backup</Text>
                  <Text style={styles.etapaDesc}>
                    Se perder o acesso ao seu método de verificação, cada código abaixo pode ser usado uma única vez
                    para entrar na conta.
                  </Text>

                  <View style={styles.codigosGrid}>
                    {codigos.map((c) => (
                      <View key={c} style={[styles.codigoItem, { width: largo ? '23.5%' : '48%' }]}>
                        <Text style={styles.codigoTxt}>{c}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={[styles.btn, { alignSelf: 'flex-start' }]} onPress={copiarCodigos}>
                    <Ionicons name="copy-outline" size={14} color={COLORS.goldClaro} />
                    <Text style={styles.btnTxt}>Copiar códigos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirma} onPress={() => setConfirmou((v) => !v)} activeOpacity={0.8}>
                    <Ionicons
                      name={confirmou ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={confirmou ? COLORS.gold : COLORS.muted}
                    />
                    <Text style={styles.confirmaTxt}>Guardei meus códigos em um lugar seguro</Text>
                  </TouchableOpacity>

                  <View style={styles.acoes}>
                    <TouchableOpacity
                      style={[styles.btnPrincipal, !confirmou && styles.btnDesabilitado]}
                      onPress={ativarProtecao}
                      disabled={!confirmou}
                    >
                      <Text style={styles.btnPrincipalTxt}>Ativar proteção</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </>
    );

    const rodape = (
      <View style={[styles.rodape, largo ? styles.rodapeLargo : styles.rodapeEstreito]}>
        <Text style={styles.rodapeTxt}>©IncomeOfHouses. Todos os direitos reservados.</Text>
        <View style={styles.rodapeLinks}>
          <TouchableOpacity onPress={() => abrirLegal('termos')}>
            <Text style={styles.rodapeTxt}>Termos de Uso</Text>
          </TouchableOpacity>
          <Text style={styles.rodapeTxt}>|</Text>
          <TouchableOpacity onPress={() => abrirLegal('privacidade')}>
            <Text style={styles.rodapeTxt}>Política de Privacidade</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    /* ---------- Render ---------- */
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.topo} />

        {largo ? (
          <>
            {/* Topo (igual ao da web): logo à esquerda, menu centralizado, sino e avatar à direita */}
            <View style={styles.topo}>
              <TouchableOpacity onPress={() => ir('/')}>
                <Image source={LOGO} style={styles.logoLargo} resizeMode="contain" />
              </TouchableOpacity>

              <View style={styles.menuTopoCentro} pointerEvents="box-none">
                <View style={styles.menuTopoLinha}>
                  {LINKS_TOPO.map(([label, route]) => (
                    <TouchableOpacity key={label} onPress={() => ir(route)}>
                      <Text style={styles.menuTopoTxtLargo}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.topoAcoes}>
                {sino}
                {avatar}
              </View>
            </View>

            <View style={styles.corpoLargo}>
              {/* Menu lateral fixo */}
              <View style={styles.lateral}>
                <ScrollView contentContainerStyle={styles.lateralScroll} showsVerticalScrollIndicator={false}>
                  {itensMenu}
                </ScrollView>
              </View>

              <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                  style={styles.areaConteudo}
                  contentContainerStyle={styles.scrollLargo}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.conteudoLargo}>{conteudo}</View>
                  {rodape}
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </>
        ) : (
          <>
            {/* Topo (celular) */}
            <View style={styles.topo}>
              <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.topoBtn}>
                <Ionicons name="menu" size={26} color={COLORS.gold} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => ir('/')}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              </TouchableOpacity>

              <View style={styles.topoAcoes}>
                {sino}
                {avatar}
              </View>
            </View>

            <View style={styles.menuTopo}>
              {LINKS_TOPO.map(([label, route]) => (
                <TouchableOpacity key={label} onPress={() => ir(route)}>
                  <Text style={styles.menuTopoTxt}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView
                style={styles.areaConteudo}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.conteudoEstreito}>{conteudo}</View>
                {rodape}
              </ScrollView>
            </KeyboardAvoidingView>
          </>
        )}

        {/* Toast */}
        {!!toast && (
          <View style={styles.toast} pointerEvents="none">
            <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
            <Text style={styles.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* Menu lateral (celular) */}
        <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
          <View style={styles.modalRoot}>
            <SafeAreaView style={styles.drawer}>
              <View style={styles.drawerHeader}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                <TouchableOpacity onPress={() => setMenuAberto(false)}>
                  <Ionicons name="close" size={24} color={COLORS.gold} />
                </TouchableOpacity>
              </View>

              <ScrollView>{itensMenu}</ScrollView>
            </SafeAreaView>
            <Pressable style={styles.overlay} onPress={() => setMenuAberto(false)} />
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    flex: { flex: 1 },

    /* ---------- Topo ---------- */
    topo: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: '3%',
      backgroundColor: COLORS.topo,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderTopo,
      zIndex: 20,
    },
    topoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    topoAcoes: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    topoBtnPeq: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    avatarArea: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#cfcfcf',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: { width: 58, height: 50 },
    logoLargo: { width: 58, height: 50 },

    menuTopoCentro: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    menuTopoLinha: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    menuTopoTxtLargo: { color: '#eeeeee', fontSize: 14, fontWeight: '500' },

    menuTopo: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.topo,
    },
    menuTopoTxt: { color: COLORS.text, fontSize: 12, fontWeight: '600' },

    /* ---------- Estrutura ---------- */
    corpoLargo: { flex: 1, flexDirection: 'row' },
    lateral: {
      width: 250,
      backgroundColor: COLORS.lateral,
      borderRightWidth: 1,
      borderRightColor: COLORS.borderLateral,
    },
    lateralScroll: { paddingVertical: 16, paddingHorizontal: 12 },
    areaConteudo: { backgroundColor: COLORS.conteudo },
    scrollLargo: { flexGrow: 1 },
    scroll: { flexGrow: 1 },
    conteudoLargo: { flexGrow: 1, paddingTop: 26, paddingHorizontal: 32, paddingBottom: 32 },
    conteudoEstreito: { flexGrow: 1, padding: 16 },

    /* ---------- Título ---------- */
    voltar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, alignSelf: 'flex-start' },
    voltarTxt: { color: COLORS.suave, fontSize: 12 },
    tituloRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    h1: { color: COLORS.text, fontSize: 24, fontWeight: '600', flex: 1 },
    sub: { color: COLORS.suave, fontSize: 13, marginTop: 6 },
    divisor: { height: 1, backgroundColor: COLORS.borderTitulo, marginTop: 14, marginBottom: 20 },

    /* ---------- Card único ---------- */
    card: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    secaoTitulo: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    secaoSemLinhaAcima: { borderTopWidth: 0 },
    secaoTituloTxt: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

    linha: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    linhaTitulo: { color: COLORS.textSuave, fontSize: 13, fontWeight: '700' },
    linhaDesc: { color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },

    /* ---------- Opções (linhas, sem caixas) ---------- */
    opcao: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLinha,
    },
    opcaoAtiva: { backgroundColor: COLORS.goldFundo },
    radio: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#5a5d60',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioAtivo: { borderColor: COLORS.gold },
    radioPonto: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },

    /* ---------- Botões ---------- */
    acoesPainel: { flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 14, paddingHorizontal: 16 },
    acoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
    btnPrincipal: {
      height: 34,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.gold,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 5,
    },
    btnPrincipalTxt: { color: '#111111', fontSize: 12, fontWeight: '700' },
    btnDesabilitado: { opacity: 0.4 },
    btn: {
      height: 34,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: COLORS.goldBtn,
      borderRadius: 5,
    },
    btnTxt: { color: COLORS.goldClaro, fontSize: 12 },

    /* ---------- Assistente ---------- */
    corpoAssistente: { padding: 16 },
    progresso: { flexDirection: 'row', gap: 8, marginBottom: 18 },
    progressoItem: { flex: 1 },
    progressoBarra: { height: 2, backgroundColor: COLORS.border, marginBottom: 7 },
    progressoBarraAtiva: { backgroundColor: COLORS.gold },
    progressoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    progressoTxt: { color: '#666666', fontSize: 11 },

    etapaTitulo: { color: COLORS.textSuave, fontSize: 14, fontWeight: '700' },
    etapaDesc: { color: COLORS.muted, fontSize: 12, marginTop: 4, lineHeight: 17 },

    qrArea: { gap: 16, marginTop: 14 },
    qrAreaLinha: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    qrBox: {
      alignSelf: 'center',
      backgroundColor: '#ffffff',
      padding: 8,
      borderRadius: 8,
    },
    qrFallback: {
      alignItems: 'center',
      gap: 10,
      backgroundColor: COLORS.campo,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 18,
    },
    qrFallbackTxt: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
    chaveArea: {},
    chaveTitulo: { color: COLORS.textSuave, fontSize: 12, fontWeight: '700' },
    chaveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    chaveTxt: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      color: COLORS.goldClaro,
      backgroundColor: '#0b0c0d',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 5,
      fontSize: 12,
      letterSpacing: 1.2,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    avisoEmail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: COLORS.campo,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 14,
      marginTop: 14,
    },
    avisoEmailTxt: { color: COLORS.textSuave, fontSize: 12 },

    /* ---------- Código de 6 dígitos ---------- */
    otpRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    otpInput: {
      height: 50,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: '#0b0c0d',
      color: COLORS.text,
      fontSize: 20,
      textAlign: 'center',
      padding: 0,
    },
    otpInputPreenchido: { borderColor: COLORS.gold },
    otpInputErro: { borderColor: '#e5736b' },
    erro: { color: '#e5736b', fontSize: 12, marginTop: 8 },
    reenviar: { alignSelf: 'flex-start', marginTop: 12 },
    reenviarTxt: { color: COLORS.goldClaro, fontSize: 11, textDecorationLine: 'underline' },

    /* ---------- Backup ---------- */
    codigosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 14 },
    codigoItem: {
      backgroundColor: '#0b0c0d',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 5,
      paddingVertical: 9,
      paddingHorizontal: 6,
      alignItems: 'center',
    },
    codigoTxt: {
      color: COLORS.textSuave,
      fontSize: 12,
      letterSpacing: 1,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    confirma: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
    confirmaTxt: { color: COLORS.muted, fontSize: 12, flex: 1 },

    /* ---------- Toast ---------- */
    toast: {
      position: 'absolute',
      right: 24,
      left: 24,
      bottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: COLORS.goldFundo,
      borderWidth: 1,
      borderColor: COLORS.goldBorda,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    toastTxt: { color: COLORS.goldClaro, fontSize: 12, flex: 1 },

    /* ---------- Rodapé ---------- */
    rodape: {
      backgroundColor: COLORS.bg,
      borderTopWidth: 1,
      borderTopColor: '#8a8a8a',
    },
    rodapeLargo: {
      minHeight: 55,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 32,
    },
    rodapeEstreito: { paddingVertical: 16, alignItems: 'center', gap: 8 },
    rodapeTxt: { color: COLORS.rodape, fontSize: 12 },
    rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 9 },

    /* ---------- Menu (barra lateral e menu do celular) ---------- */
    menuItem: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: COLORS.campo,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 5,
    },
    menuItemAtivo: { borderColor: COLORS.goldBorda, backgroundColor: COLORS.goldFundo },
    menuItemTxt: { color: '#eeeeee', fontSize: 12, fontWeight: '500', flex: 1 },
    menuSep: { height: 1, backgroundColor: COLORS.border, marginTop: 3, marginBottom: 8 },

    /* ---------- Menu do celular ---------- */
    modalRoot: { flex: 1, flexDirection: 'row' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    drawer: {
      width: 260,
      backgroundColor: COLORS.lateral,
      borderRightWidth: 1,
      borderRightColor: COLORS.borderLateral,
      paddingHorizontal: 12,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      marginBottom: 6,
    },
  });