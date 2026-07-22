#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { contractConfig } from './tdm-ds-contract.config.mjs';

const root = process.cwd();
const errors = [];
const warnings = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  const output = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) output.push(...walk(path.relative(root, child)));
    else output.push(path.relative(root, child));
  }
  return output;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

for (const file of contractConfig.requiredFiles) {
  if (!exists(file)) errors.push(`Contrato ausente: ${file}`);
}

const configPaths = [
  'canonicalPublicHeaderModule',
  'canonicalPublicHeaderStyleModule',
  'canonicalPublicButtonModule',
  'canonicalPublicIconButtonModule',
  'canonicalExamplePreviewFrameModule',
];

for (const key of configPaths) {
  const value = contractConfig[key];
  if (!value) warnings.push(`Configuração pendente: ${key}`);
  else if (!exists(value)) errors.push(`Caminho canônico inexistente em ${key}: ${value}`);
}

for (const legacy of contractConfig.legacyPublicHeaderModules) {
  if (exists(legacy)) {
    const token = path.basename(legacy).replace(/\.(ts|tsx)$/, '');
    const imports = walk('src')
      .filter(file => /\.(ts|tsx)$/.test(file))
      .filter(file => file !== legacy)
      .filter(file => read(file).includes(token));
    if (imports.length) errors.push(`Header legado ainda consumido: ${legacy} -> ${imports.join(', ')}`);
  }
}

const publicFiles = contractConfig.publicUiRoots.flatMap(walk);
for (const file of publicFiles) {
  if (!/\.module\.sass$/.test(file)) continue;
  const source = read(file);
  if (/!important\b/.test(source)) errors.push(`!important proibido em UI pública: ${file}`);
  if (/(^|[^\w-])\d+(?:\.\d+)?px\b/m.test(source)) errors.push(`Unidade px proibida em UI pública: ${file}`);
}

const forbiddenImports = [
  'public-button',
  'public-icon-button',
  'public-header',
  'example-preview-frame',
];

for (const rootPath of contractConfig.canvasDenylistRoots) {
  for (const file of walk(rootPath).filter(file => /\.(ts|tsx)$/.test(file))) {
    const source = read(file);
    for (const token of forbiddenImports) {
      if (source.includes(token)) errors.push(`Canvas importando primitive público (${token}): ${file}`);
    }
  }
}

if (contractConfig.canonicalPublicHeaderModule && exists(contractConfig.canonicalPublicHeaderModule)) {
  const headerSource = read(contractConfig.canonicalPublicHeaderModule);
  const headerTags = (headerSource.match(/<header\b/g) || []).length;
  if (headerTags !== 1) errors.push(`Header canônico deve declarar exatamente um <header>; encontrado: ${headerTags}`);
}

if (errors.length) {
  console.error('\nTDM DS CONTRACT: FAIL\n');
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error('\nAvisos:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('TDM DS CONTRACT: PASS');
if (warnings.length) {
  console.log('\nAvisos:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
