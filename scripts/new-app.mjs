#!/usr/bin/env node
/**
 * Gera uma aplicação nova a partir da casca (app-shell-starter).
 *
 * Uso:
 *   node scripts/new-app.mjs <pasta-destino> [opções]
 *   npm run new-app -- <pasta-destino> [opções]
 *
 * Opções:
 *   --name      "Sentinel IAM"          nome exibido (sidebar, login, título da aba)
 *   --slug      sentinel-iam            nome técnico (package.json, angular.json, localStorage)
 *   --tenant    contoso-br              tenant exibido na sidebar ('' para ocultar)
 *   --tagline   "Gestão de acessos"     frase curta exibida no login e no rodapé
 *   --theme     default | mint          tema definido em src/styles/tokens.css
 *   --accent    "#10b981"               cor de destaque customizada (sobrescreve o tema)
 *   --install                           roda npm install no projeto gerado
 *   --git                               roda git init + commit inicial
 *   --yes                               não pergunta nada; usa defaults/argumentos
 *
 * Sem argumentos o script pergunta o que faltar.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const TEMPLATE_SLUG = 'app-shell-starter';
const TEMPLATE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDED = new Set(['node_modules', 'dist', '.angular', '.git', 'scripts', '.vscode']);

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: 'string' },
    slug: { type: 'string' },
    tenant: { type: 'string' },
    tagline: { type: 'string' },
    theme: { type: 'string' },
    accent: { type: 'string' },
    install: { type: 'boolean', default: false },
    git: { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help) {
  console.log(
    (await readFile(fileURLToPath(import.meta.url), 'utf8')).split('*/')[0].replace(/^#!.*\n\/\*\*?\n?/, '').replace(/^ \* ?/gm, ''),
  );
  process.exit(0);
}

const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const titleCase = (slug) => slug.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

const interactive = process.stdin.isTTY && !values.yes;
const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const ask = async (question, fallback) => {
  if (!rl) return fallback;
  const answer = (await rl.question(`${question}${fallback !== undefined ? ` (${fallback})` : ''}: `)).trim();
  return answer || fallback;
};

// ---------- coleta de parâmetros ----------
const targetArg = positionals[0] ?? (await ask('Pasta do novo projeto', undefined));
if (!targetArg) {
  console.error('Informe a pasta de destino. Ex.: node scripts/new-app.mjs ../meu-app --name "Meu App"');
  process.exit(1);
}
const target = path.resolve(process.cwd(), targetArg);

const defaultName = titleCase(slugify(path.basename(target)));
const name = values.name ?? (await ask('Nome do produto', defaultName));
const slug = slugify(values.slug ?? (await ask('Slug técnico', slugify(name))));
const tenant = values.tenant ?? (await ask("Tenant exibido na sidebar (vazio = ocultar)", 'demo'));
const tagline = values.tagline ?? (await ask('Frase curta (tagline)', `${name} — plataforma web`));
const theme = values.theme ?? (await ask('Tema (default | mint)', 'default'));
const accent = values.accent;
rl?.close();

if (!slug) {
  console.error('Slug inválido.');
  process.exit(1);
}
if (accent && !/^#[0-9a-fA-F]{6}$/.test(accent)) {
  console.error('--accent deve estar no formato #RRGGBB.');
  process.exit(1);
}
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`A pasta ${target} já existe e não está vazia.`);
  process.exit(1);
}

// ---------- cópia ----------
await cp(TEMPLATE_ROOT, target, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(TEMPLATE_ROOT, src);
    return !rel.split(path.sep).some((part) => EXCLUDED.has(part));
  },
});

// ---------- helpers de edição ----------
const edit = async (relPath, transform) => {
  const file = path.join(target, relPath);
  if (!existsSync(file)) return;
  await writeFile(file, transform(await readFile(file, 'utf8')));
};
const escapeTs = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const setConfig = (source, key, value) =>
  source.replace(new RegExp(`^(\\s*\\w+:\\s*)'[^']*'(.*// gen:${key})`, 'm'), (_m, pre, post) => `${pre}'${escapeTs(value)}'${post}`);

// nome técnico
for (const file of ['package.json', 'package-lock.json', 'angular.json']) {
  await edit(file, (text) => text.replaceAll(TEMPLATE_SLUG, slug));
}

// o gerador não é copiado para o app novo, então remove o atalho npm que apontaria para ele
await edit('package.json', (text) => {
  const pkg = JSON.parse(text);
  delete pkg.scripts?.['new-app'];
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

// shell.config.ts
await edit('src/app/core/config/shell.config.ts', (text) => {
  let out = text;
  out = setConfig(out, 'productName', name);
  out = setConfig(out, 'tagline', tagline);
  out = setConfig(out, 'tenant', tenant);
  out = setConfig(out, 'theme', theme);
  out = setConfig(out, 'storagePrefix', slug);
  out = setConfig(out, 'footerText', name);
  return out;
});

// título da aba
await edit('src/index.html', (text) => text.replace(/<title>.*<\/title>/, `<title>${name}</title>`));

// cor de destaque customizada
if (accent) {
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const fg = luminance > 0.6 ? '#0b111b' : '#ffffff';
  await edit('src/styles/tokens.css', (text) => `${text}\n/* cor de destaque definida na criação do projeto */\n:root,\n:root[data-theme] {\n  --accent: ${accent};\n  --accent-fg: ${fg};\n}\n`);
}

// README do app gerado
await writeFile(
  path.join(target, 'README.md'),
  `# ${name}

${tagline}

Gerado a partir do **app-shell-starter** (Angular + casca de aplicação).

## Rodar

\`\`\`bash
npm install
npm start          # http://localhost:4200
\`\`\`

Modo demonstração (sem backend): login \`admin@app.local\` / \`admin123\`.

## Onde mexer

| O quê                    | Arquivo                                     |
|--------------------------|---------------------------------------------|
| Nome, tenant, tema, API  | \`src/app/core/config/shell.config.ts\`       |
| Menu e permissões        | \`src/app/core/navigation/nav.config.ts\`     |
| Rotas / telas            | \`src/app/app.routes.ts\` + \`src/app/features/\` |
| Cores e fontes           | \`src/styles/tokens.css\`                     |
| Componentes reutilizáveis| \`src/app/shared/ui/\`                        |

Para integrar com o backend Spring Boot: \`api.useMock = false\` em \`shell.config.ts\`
e suba a API em \`http://localhost:8080\` (o \`proxy.conf.json\` encaminha \`/api\`).

Veja \`docs/ARQUITETURA.md\` para o padrão completo.
`,
);

// ---------- pós-processamento opcional ----------
const run = (cmd, args) => spawnSync(cmd, args, { cwd: target, stdio: 'inherit', shell: process.platform === 'win32' });

if (values.install) {
  console.log('\n> npm install');
  run('npm', ['install']);
}
if (values.git) {
  console.log('\n> git init');
  run('git', ['init', '-q']);
  run('git', ['add', '-A']);
  run('git', ['commit', '-q', '-m', `chore: projeto ${name} gerado a partir do app-shell-starter`]);
}

console.log(`
✔ Projeto "${name}" criado em ${target}

Próximos passos:
  cd ${path.relative(process.cwd(), target) || '.'}${values.install ? '' : '\n  npm install'}
  npm start
`);
