/**
 * Adapta as telas compartilhadas para uma versão de Usuário e outra de Profissional.
 *
 * COMO USAR (na raiz do projeto, onde fica a pasta "src"):
 *   node adaptar-telas.js
 *
 * O que faz:
 *   1) Acha a tela de Endereços   (função Meusenderecos) -> src/components/TelaEnderecos.js
 *   2) Acha a tela de Agendamentos (função Agendamentos) -> src/components/TelaAgendamentos.js
 *   3) Acha a tela de Mensagens   (função Mensagens)     -> src/components/TelaMensagens.js
 *      (procura dentro de src pelo conteúdo; o nome do arquivo não importa)
 *   4) Ajusta src/components/TelaConta.js (LayoutConta passa a aceitar a prop "tipo")
 *   5) Cria as 6 telas finas em src/app (EnderecosUsuario, EnderecosProfissional, etc.)
 *
 * Os arquivos originais NÃO são apagados nem alterados (exceto TelaConta.js,
 * que ganha um backup TelaConta.js.bak). Se algum trecho não for encontrado,
 * o script avisa e não grava aquele arquivo.
 */
const fs = require('fs');
const path = require('path');

const APP = path.join('src', 'app');
const COMP = path.join('src', 'components');

let erros = 0;

// Procura, dentro de src, o arquivo que contém a função indicada
// (assim o nome do arquivo não importa).
function achar(assinatura) {
  const resultados = [];
  (function varrer(pasta) {
    for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
      const caminho = path.join(pasta, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules') varrer(caminho);
      } else if (/\.(js|jsx|ts|tsx)$/.test(item.name)) {
        if (fs.readFileSync(caminho, 'utf8').includes(assinatura)) resultados.push(caminho);
      }
    }
  })('src');
  return resultados;
}

function ler(arquivo) {
  if (!fs.existsSync(arquivo)) {
    console.error(`✗ Não encontrei ${arquivo}`);
    erros++;
    return null;
  }
  return fs.readFileSync(arquivo, 'utf8');
}

// Aplica uma lista de trocas; todas precisam acontecer, senão não grava.
function trocar(texto, trocas, nome) {
  let saida = texto;
  for (const [de, para, descricao] of trocas) {
    const ok = de instanceof RegExp ? de.test(saida) : saida.includes(de);
    if (!ok) {
      console.error(`✗ ${nome}: não achei o trecho -> ${descricao}`);
      erros++;
      return null;
    }
    saida = de instanceof RegExp ? saida.replace(de, para) : saida.replace(de, () => para);
  }
  return saida;
}

function gravar(arquivo, conteudo) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, conteudo, 'utf8');
  console.log(`✓ ${arquivo}`);
}

/* ---------------- 1) Endereços ---------------- */
{
  const origem = achar('export default function Meusenderecos() {')[0] || path.join(APP, 'Meusenderecos.js');
  const src = ler(origem);
  if (src) {
    const novo = trocar(src, [
      [/import \{ usarConta \} from '\.\.\/components\/ContaProvider';\r?\n/, '', "import { usarConta }"],
      ["import ContaMenu from '../components/MenuConta';", "import ContaMenu from './MenuConta';", 'import ContaMenu'],
      ['export default function Meusenderecos() {', 'export default function TelaEnderecos({ tipo }) {', 'export default function Meusenderecos'],
      [/[ \t]*const \{ tipo \} = usarConta\(\);\r?\n/, '', 'const { tipo } = usarConta()'],
      ['<ContaMenu aoSelecionar={() => setMenuAberto(false)} />', '<ContaMenu tipo={tipo} aoSelecionar={() => setMenuAberto(false)} />', '<ContaMenu aoSelecionar=...>'],
    ], origem);
    if (novo) {
      console.log(`  (origem: ${origem})`);
      gravar(path.join(COMP, 'TelaEnderecos.js'), novo);
    }
  }
}

/* ---------------- 2) Agendamentos ---------------- */
// Atenção: a tela já tem um estado chamado "tipo" (tipo do compromisso),
// por isso a prop de conta se chama "tipoConta" aqui.
{
  const origem = achar('export default function Agendamentos() {')[0] || path.join(APP, 'Agendamentos.js');
  const src = ler(origem);
  if (src) {
    const novo = trocar(src, [
      ["from '../components/TelaConta'", "from './TelaConta'", "import LayoutConta"],
      ['export default function Agendamentos() {', 'export default function TelaAgendamentos({ tipo: tipoConta }) {', 'export default function Agendamentos'],
      [/<LayoutConta(\s+)ativo="agendamentos"/, '<LayoutConta$1tipo={tipoConta}$1ativo="agendamentos"', '<LayoutConta ativo="agendamentos">'],
    ], origem);
    if (novo) {
      console.log(`  (origem: ${origem})`);
      gravar(path.join(COMP, 'TelaAgendamentos.js'), novo);
    }
  }
}

/* ---------------- 3) Mensagens ---------------- */
{
  const origem = achar('export default function Mensagens() {')[0] || path.join(APP, 'Mensagens.js');
  const src = ler(origem);
  if (src) {
    const novo = trocar(src, [
      ["from '../components/TelaConta'", "from './TelaConta'", "import LayoutConta"],
      ['export default function Mensagens() {', 'export default function TelaMensagens({ tipo: tipoConta }) {', 'export default function Mensagens'],
      [/<LayoutConta(\s+)ativo="mensagem"/, '<LayoutConta$1tipo={tipoConta}$1ativo="mensagem"', '<LayoutConta ativo="mensagem">'],
    ], origem);
    if (novo) {
      console.log(`  (origem: ${origem})`);
      gravar(path.join(COMP, 'TelaMensagens.js'), novo);
    }
  }
}

/* ---------------- 4) TelaConta.js (LayoutConta aceita "tipo") ---------------- */
{
  const arquivo = path.join(COMP, 'TelaConta.js');
  const src = ler(arquivo);
  if (src) {
    if (src.includes('tipoDaTela')) {
      console.log('• TelaConta.js já está adaptado, nada a fazer');
    } else {
      const novo = trocar(src, [
        ["import { usarConta } from './ContaProvider';", "import { usarConta, MENUS } from './ContaProvider';", 'import { usarConta }'],
        [
          'export function LayoutConta({ titulo, subtitulo, ativo, children }) {',
          'export function LayoutConta({ titulo, subtitulo, ativo, tipo: tipoDaTela, children }) {',
          'export function LayoutConta({ ... })',
        ],
        [
          'const { menu, limpar } = usarConta();',
          'const { menu: menuDaConta, limpar } = usarConta();\n  const menu = tipoDaTela ? MENUS[tipoDaTela] : menuDaConta;',
          'const { menu, limpar } = usarConta()',
        ],
      ], 'TelaConta.js');
      if (novo) {
        fs.copyFileSync(arquivo, arquivo + '.bak');
        gravar(arquivo, novo);
        console.log(`  (backup em ${arquivo}.bak)`);
      }
    }
  }
}

/* ---------------- 5) Telas finas por tipo de conta ---------------- */
const TELAS = [
  ['Enderecos', 'TelaEnderecos'],
  ['Agendamentos', 'TelaAgendamentos'],
  ['Mensagens', 'TelaMensagens'],
];

for (const [base, componente] of TELAS) {
  for (const [sufixo, tipo] of [['Usuario', 'usuario'], ['Profissional', 'profissional']]) {
    const nome = `${base}${sufixo}`;
    gravar(
      path.join(APP, `${nome}.js`),
      `import React from 'react';\nimport ${componente} from '../components/${componente}';\n\n` +
        `export default function ${nome}() {\n  return <${componente} tipo="${tipo}" />;\n}\n`
    );
  }
}

console.log(
  erros
    ? `\nTerminou com ${erros} problema(s). Veja as mensagens ✗ acima.`
    : '\nPronto! Confira o app e, quando estiver tudo certo, apague Meusenderecos.js, Agendamentos.js e Mensagens.js de src/app.'
);
process.exit(erros ? 1 : 0);