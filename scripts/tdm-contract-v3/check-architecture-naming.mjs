#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const retiredToken = ['re', 'send'].join('');
const trackedOutput = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
const tracked = (trackedOutput ? trackedOutput.split('\n') : []).filter((file) =>
  fs.existsSync(path.join(root, file)) &&
  !file.startsWith('node_modules/') &&
  !file.startsWith('.next/') &&
  !file.startsWith('__MACOSX/') &&
  !file.startsWith('.tdm-wave07-')
);
const scopedRoots = [
  'src/features/auth/',
  'src/features/theory-of-change/canvas/',
  'src/shared/ui/tdm-status-screen/'
];

requireCondition(
  tracked.includes('.cursor/rules/tdm-architecture-and-naming.mdc'),
  'regra oficial de arquitetura e nomenclatura não está versionada'
);

for (const file of tracked) {
  requireCondition(!file.toLowerCase().includes(retiredToken), `nomenclatura externa aposentada no caminho: ${file}`);
  if (/\/_.*\.sass$/.test(file)) errors.push(`partial Sass com underscore: ${file}`);

  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) continue;
  const buffer = fs.readFileSync(absolute);
  const source = buffer.toString('utf8');
  if (source.includes('\uFFFD')) continue;
  requireCondition(!source.toLowerCase().includes(retiredToken), `nomenclatura externa aposentada no conteúdo: ${file}`);
}

for (const file of tracked.filter((candidate) => scopedRoots.some((scope) => candidate.startsWith(scope)))) {
  const segments = file.split('/');
  for (const segment of segments) {
    if (segment.startsWith('(') && segment.endsWith(')')) continue;
    const name = segment.split('.')[0];
    if (!name || name === 'index') continue;
    requireCondition(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name),
      `arquivo ou pasta fora de kebab-case no core: ${file}`
    );
  }

  if (!file.endsWith('.tsx') || /\.(test|e2e|stories)\.tsx$/.test(file)) continue;
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/^export function\s+([A-Za-z0-9_]+)/gm)) {
    const symbol = match[1];
    if (symbol.startsWith('use')) continue;
    requireCondition(/^[A-Z][A-Za-z0-9]*$/.test(symbol), `componente React fora de PascalCase em ${file}: ${symbol}`);
  }
}

const deletedAssets = [
  'liquid-glass-logo-sprite-sidebar.webp',
  'liquid-glass-logo-sprite-transparent.png',
  'logo-tmd-v1.png'
];
for (const file of tracked.filter((candidate) => candidate.startsWith('src/'))) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) continue;
  const source = fs.readFileSync(absolute, 'utf8');
  for (const asset of deletedAssets) {
    requireCondition(!source.includes(asset), `referência a asset excluído em ${file}: ${asset}`);
  }
}

if (errors.length) {
  console.error('\nTDM ARCHITECTURE + NAMING CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: naming, Sass legível, regra arquitetural e assets removidos íntegros.');
