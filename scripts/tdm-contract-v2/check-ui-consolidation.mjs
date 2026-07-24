#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.TDM_PROJECT_ROOT
  ? path.resolve(process.env.TDM_PROJECT_ROOT)
  : process.cwd();

const REQUIRED_CANONICAL_FILES = [
  'src/shared/ui/tdm-button/index.ts',
  'src/shared/ui/tdm-button/tdm-button.tsx',
  'src/shared/ui/tdm-icon-button/index.ts',
  'src/shared/ui/tdm-icon-button/tdm-icon-button.tsx',
  'src/shared/ui/tdm-menu/index.ts',
  'src/shared/ui/tdm-menu/tdm-menu.tsx',
  'src/shared/ui/tdm-tooltip/index.ts',
  'src/shared/ui/tdm-tooltip/tdm-tooltip.tsx',
  'src/shared/ui/tdm-surface/index.ts',
  'src/shared/ui/tdm-surface/tdm-surface.tsx'
];

const FORBIDDEN_LEGACY_PATHS = [
  'src/shared/ui/public-button',
  'src/shared/ui/public-icon-button',
  'src/features/theory-of-change/components/public-pages/guide-page.tsx',
  'src/features/theory-of-change/components/public-pages/interactive-page.tsx',
  'src/app/exemplos/exemplos-client.tsx',
  'src/app/home-color-bends-background.tsx',
  'src/components/ColorBends',
  'src/features/theory-of-change/components/floating-header'
];

const PROTECTED_PREFIXES = [
  'src/app/canvas/',
  'src/app/exemplos/canvas/',
  'src/features/theory-of-change/components/canvas/',
  'src/features/theory-of-change/components/canvas-resultado/',
  'src/features/theory-of-change/components/sidebar/',
  'src/features/theory-of-change/components/edge/',
  'src/features/theory-of-change/components/form-field/',
  'src/features/theory-of-change/components/stage-'
];

const CANONICAL_DIRECT_IMPORTS = [
  '@/shared/ui/tdm-button/tdm-button',
  '@/shared/ui/tdm-icon-button/tdm-icon-button',
  '@/shared/ui/tdm-tooltip/tdm-tooltip',
  '@/shared/ui/tdm-surface/tdm-surface'
];

const DEFERRED_PROTECTED_DUPLICATES = [
  'src/shared/ui/tooltip/tdm-anchored-tooltip.tsx',
  'src/features/theory-of-change/components/result-view/tdm-glass-surface.tsx',
  'src/features/theory-of-change/components/result-view/liquid-glass/glass-surface.tsx'
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
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

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function isProtected(relativePath) {
  return PROTECTED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

const errors = [];
const warnings = [];

for (const relativePath of REQUIRED_CANONICAL_FILES) {
  if (!exists(relativePath)) errors.push(`Primitive canônico ausente: ${relativePath}`);
}

for (const relativePath of FORBIDDEN_LEGACY_PATHS) {
  if (exists(relativePath)) errors.push(`Legado reintroduzido: ${relativePath}`);
}

for (const file of walk(path.join(ROOT, 'src'))) {
  const relativePath = relative(file);
  if (isProtected(relativePath)) continue;
  const source = fs.readFileSync(file, 'utf8');

  if (/\b(?:PublicButton|PublicIconButton)\b/.test(source)) {
    errors.push(`Adapter visual legado usado fora do Canvas: ${relativePath}`);
  }

  for (const deepImport of CANONICAL_DIRECT_IMPORTS) {
    if (source.includes(deepImport)) {
      errors.push(`Import profundo do primitive canônico; use o barrel: ${relativePath} -> ${deepImport}`);
    }
  }
}

for (const relativePath of DEFERRED_PROTECTED_DUPLICATES) {
  if (exists(relativePath)) {
    warnings.push(`Duplicação protegida adiada para rodada própria: ${relativePath}`);
  }
}

if (warnings.length > 0) {
  console.log('TDM UI CONSOLIDATION: WARN');
  warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (errors.length > 0) {
  console.error('TDM UI CONSOLIDATION: PORTA FECHADA');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log('TDM UI CONSOLIDATION: PASS');
console.log('  - um único button primitive fora do Canvas');
console.log('  - um único icon button primitive fora do Canvas');
console.log('  - adapters públicos removidos');
console.log('  - imports canônicos passam pelos barrels');
console.log('  - legados órfãos conhecidos não podem retornar');
