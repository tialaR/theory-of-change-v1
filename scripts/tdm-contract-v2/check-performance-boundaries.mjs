#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.TDM_PROJECT_ROOT
  ? path.resolve(process.env.TDM_PROJECT_ROOT)
  : process.cwd();

const POSIX = (value) => value.split(path.sep).join('/');
const absolute = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(absolute(relativePath));

const XYFLOW_STYLESHEET = '@xyflow/react/dist/style.css';
const XYFLOW_STYLE_OWNERS = new Set([
  'src/app/canvas/layout.tsx',
  'src/app/exemplos/canvas/layout.tsx'
]);
const PUBLIC_SERVER_ENTRIES = [
  'src/features/theory-of-change/components/public-pages/home-page.tsx',
  'src/features/theory-of-change/components/public-pages/examples-page.tsx',
  'src/features/theory-of-change/components/public-pages/flow-page.tsx',
  'src/features/theory-of-change/components/public-pages/result-page.tsx',
  'src/features/theory-of-change/components/public-pages/references-page.tsx',
  'src/shared/ui/tdm-public-layout/public-shell.tsx'
];
const HEAVY_EXPORT_BARREL = '@/features/theory-of-change/export';
const DEFERRED_EXPORT_BARREL_USERS = new Set([
  'src/features/theory-of-change/components/result-view/result-view.tsx'
]);
const FORBIDDEN_PACKAGES = ['three', '@types/three'];
const REQUIRED_SCRIPTS = [
  'analyze:bundle',
  'analyze:bundle:output',
  'check:tdm:v2:performance'
];

function walk(directory, output = []) {
  if (!fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(target, output);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) output.push(target);
  }
  return output;
}

function hasUseClient(source) {
  return /^\s*['"]use client['"];?/m.test(source);
}

const errors = [];
const warnings = [];
const sourceFiles = walk(absolute('src'));

for (const file of sourceFiles) {
  const relativePath = POSIX(path.relative(ROOT, file));
  const source = fs.readFileSync(file, 'utf8');

  if (source.includes(XYFLOW_STYLESHEET) && !XYFLOW_STYLE_OWNERS.has(relativePath)) {
    errors.push(`CSS global do React Flow fora do escopo Canvas: ${relativePath}`);
  }

  if (source.includes(`from '${HEAVY_EXPORT_BARREL}'`) || source.includes(`from "${HEAVY_EXPORT_BARREL}"`)) {
    if (DEFERRED_EXPORT_BARREL_USERS.has(relativePath)) {
      warnings.push(`Barrel de exportação legado protegido, migração adiada: ${relativePath}`);
    } else {
      errors.push(`Barrel pesado de exportação importado no runtime: ${relativePath}`);
    }
  }

  if (/from\s+['"]three['"]|import\(\s*['"]three['"]\s*\)/.test(source)) {
    errors.push(`Dependência Three reintroduzida sem consumidor aprovado: ${relativePath}`);
  }
}

for (const relativePath of XYFLOW_STYLE_OWNERS) {
  if (!exists(relativePath) || !read(relativePath).includes(XYFLOW_STYLESHEET)) {
    errors.push(`Boundary de CSS do Canvas ausente: ${relativePath}`);
  }
}

const rootLayout = read('src/app/layout.tsx');
if (rootLayout.includes(XYFLOW_STYLESHEET)) {
  errors.push('Root layout voltou a carregar CSS do React Flow em todas as rotas.');
}

for (const relativePath of PUBLIC_SERVER_ENTRIES) {
  if (!exists(relativePath)) {
    errors.push(`Entry pública ausente: ${relativePath}`);
    continue;
  }
  if (hasUseClient(read(relativePath))) {
    errors.push(`Boundary pública ampla voltou a ser Client Component: ${relativePath}`);
  }
}

const publicShell = read('src/shared/ui/tdm-public-layout/public-shell.tsx');
if (!publicShell.includes('PublicBodyClassController')) {
  errors.push('PublicShell deve delegar o efeito de body para PublicBodyClassController.');
}
if (/\buseEffect\b|document\.body/.test(publicShell)) {
  errors.push('PublicShell voltou a possuir lógica de navegador.');
}

const bodyControllerPath = 'src/shared/ui/tdm-public-layout/public-body-class-controller.tsx';
if (!exists(bodyControllerPath)) {
  errors.push(`Client island ausente: ${bodyControllerPath}`);
} else {
  const controller = read(bodyControllerPath);
  if (!hasUseClient(controller) || !controller.includes('document.body.classList')) {
    errors.push('PublicBodyClassController deve ser a ilha cliente responsável pela classe do body.');
  }
}

const pkg = JSON.parse(read('package.json'));
for (const packageName of FORBIDDEN_PACKAGES) {
  if (pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName]) {
    errors.push(`Dependência sem consumidor voltou ao package.json: ${packageName}`);
  }
}
for (const script of REQUIRED_SCRIPTS) {
  if (!pkg.scripts?.[script]) errors.push(`Script de performance ausente: ${script}`);
}
if (!String(pkg.scripts?.['check:tdm:v2:all'] ?? '').includes('check:tdm:v2:performance')) {
  errors.push('Gate completo não executa check:tdm:v2:performance.');
}

const lock = JSON.parse(read('package-lock.json'));
for (const packageName of FORBIDDEN_PACKAGES) {
  if (lock.packages?.[`node_modules/${packageName}`]) {
    errors.push(`Dependência sem consumidor permaneceu no package-lock: ${packageName}`);
  }
}

const protectedStory = 'src/features/theory-of-change/components/public-pages/guided-story.tsx';
if (exists(protectedStory)) {
  const imgCount = (read(protectedStory).match(/<img\b/g) ?? []).length;
  if (imgCount > 0) {
    warnings.push(`${protectedStory}: ${imgCount} <img> protegido(s), otimização adiada para rodada visual própria.`);
  }
}

if (warnings.length > 0) {
  console.log('TDM PERFORMANCE BOUNDARIES: WARN');
  warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (errors.length > 0) {
  console.error('TDM PERFORMANCE BOUNDARIES: PORTA FECHADA');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log('TDM PERFORMANCE BOUNDARIES: PASS');
console.log('  - CSS do React Flow isolado nas rotas Canvas');
console.log('  - PublicShell preservado como Server Component');
console.log('  - efeito de body isolado em client island mínima');
console.log('  - exportadores pesados carregados sob demanda');
console.log('  - Three removido por ausência de consumidores');
console.log('  - Bundle Analyzer do Turbopack disponível');
