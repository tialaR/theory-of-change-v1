#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.TDM_PROJECT_ROOT
  ? path.resolve(process.env.TDM_PROJECT_ROOT)
  : process.cwd();

const FORBIDDEN_FILES = [
  'src/features/theory-of-change/components/public-pages/public-pages.tsx',
  `src/shared/ui/${['lu', 'sion'].join('')}-${['re', 'send'].join('')}-ds/${['lu', 'sion'].join('')}-${['re', 'send'].join('')}-ds.tsx`,
  `src/shared/ui/${['lu', 'sion'].join('')}-${['re', 'send'].join('')}-ds/${['lu', 'sion'].join('')}-${['re', 'send'].join('')}-ds.module.sass`
];

const REQUIRED_FILES = [
  'src/shared/ui/tdm-public-layout/index.ts',
  'src/shared/ui/tdm-public-layout/public-shell.tsx',
  'src/shared/ui/tdm-public-layout/public-header.tsx',
  'src/shared/ui/tdm-public-layout/public-content.tsx',
  'src/shared/ui/tdm-public-layout/public-reveal.tsx',
  'src/features/theory-of-change/components/public-pages/home-page.tsx',
  'src/features/theory-of-change/components/public-pages/examples-page.tsx',
  'src/features/theory-of-change/components/public-pages/flow-page.tsx',
  'src/features/theory-of-change/components/public-pages/result-page.tsx',
  'src/features/theory-of-change/components/public-pages/references-page.tsx'
];

const SERVER_ROUTE_COMPONENTS = [
  'src/features/theory-of-change/components/public-pages/home-page.tsx',
  'src/features/theory-of-change/components/public-pages/guide-page.tsx',
  'src/features/theory-of-change/components/public-pages/examples-page.tsx',
  'src/features/theory-of-change/components/public-pages/flow-page.tsx',
  'src/features/theory-of-change/components/public-pages/result-page.tsx',
  'src/features/theory-of-change/components/public-pages/references-page.tsx'
];

const SIZE_LIMITS = new Map([
  ['src/shared/ui/tdm-public-layout/public-shell.tsx', 100],
  ['src/shared/ui/tdm-public-layout/public-header.tsx', 180],
  ['src/shared/ui/tdm-public-layout/public-content.tsx', 180],
  ['src/shared/ui/tdm-public-layout/public-reveal.tsx', 100],
  ['src/shared/ui/tdm-public-layout/public-timeline.tsx', 150],
  ['src/features/theory-of-change/components/public-pages/home-page.tsx', 180],
  ['src/features/theory-of-change/components/public-pages/examples-page.tsx', 100],
  ['src/features/theory-of-change/components/public-pages/flow-page.tsx', 180],
  ['src/features/theory-of-change/components/public-pages/result-page.tsx', 200],
  ['src/features/theory-of-change/components/public-pages/references-page.tsx', 160],
  ['src/features/theory-of-change/components/public-pages/interactive-page.tsx', 220]
]);

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function lineCount(relativePath) {
  return read(relativePath).split(/\r?\n/).length;
}

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

const errors = [];
const warnings = [];

for (const relativePath of FORBIDDEN_FILES) {
  if (fs.existsSync(absolute(relativePath))) {
    errors.push(`God component/legado proibido ainda existe: ${relativePath}`);
  }
}

for (const relativePath of REQUIRED_FILES) {
  if (!fs.existsSync(absolute(relativePath))) {
    errors.push(`Contrato arquitetural ausente: ${relativePath}`);
  }
}

for (const relativePath of SERVER_ROUTE_COMPONENTS) {
  if (!fs.existsSync(absolute(relativePath))) continue;
  const source = read(relativePath).slice(0, 300);
  if (/['"]use client['"]/.test(source)) {
    errors.push(`Boundary Client desnecessário em rota estática: ${relativePath}`);
  }
}

for (const [relativePath, limit] of SIZE_LIMITS) {
  if (!fs.existsSync(absolute(relativePath))) continue;
  const lines = lineCount(relativePath);
  if (lines > limit) {
    errors.push(`Arquivo acima do contrato SRP (${lines}/${limit} linhas): ${relativePath}`);
  }
}

const sourceFiles = walk(path.join(ROOT, 'src'));
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(ROOT, file).split(path.sep).join('/');
  if (source.includes(`@/shared/ui/${['lu', 'sion'].join('')}-${['re', 'send'].join('')}-ds`)) {
    errors.push(`Import legado do DS público: ${relativePath}`);
  }
}

const canonicalFiles = walk(path.join(ROOT, 'src/shared/ui/tdm-public-layout'));
for (const file of canonicalFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(ROOT, file).split(path.sep).join('/');
  if (new RegExp(`\\b(?:${['lu', 'sion'].join('')}|${['re', 'send'].join('')})\\b`, 'i').test(`${relativePath}\n${source}`)) {
    errors.push(`Nome de referência externa dentro do componente canônico: ${relativePath}`);
  }
  if (new RegExp(`!${'important'}\\b`).test(source)) {
    errors.push(`Override de prioridade proibido no DS público canônico: ${relativePath}`);
  }
}

if (warnings.length > 0) {
  console.log('TDM PUBLIC ARCHITECTURE: WARN');
  warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (errors.length > 0) {
  console.error('TDM PUBLIC ARCHITECTURE: PORTA FECHADA');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log('TDM PUBLIC ARCHITECTURE: PASS');
console.log('  - DS público dividido por responsabilidade');
console.log('  - rotas públicas estáticas preservadas como Server Components');
console.log('  - imports legados bloqueados');
console.log('  - limites SRP ativos');
