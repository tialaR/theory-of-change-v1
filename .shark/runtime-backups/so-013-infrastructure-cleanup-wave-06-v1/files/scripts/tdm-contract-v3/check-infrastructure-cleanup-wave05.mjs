#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const legacyStore = 'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.mock-store.ts';
const neutralStore = 'src/features/theory-of-change/canvas/infrastructure/memory/canvas-project.mock-store.ts';
const serverRepo = 'src/features/theory-of-change/canvas/server/canvas-server.repository.ts';
const handlers = 'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.ts';
const handlerTest = 'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.test.ts';

if (fs.existsSync(path.join(root, legacyStore))) errors.push('store compartilhado reapareceu dentro da boundary MSW');
if (!fs.existsSync(path.join(root, neutralStore))) errors.push('store in-memory neutro ausente');

for (const relative of [serverRepo]) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (/infrastructure\/msw/.test(source)) errors.push(`server volta a depender de infrastructure/msw: ${relative}`);
  if (!source.includes('../infrastructure/memory/canvas-project.mock-store')) errors.push(`server nao usa o store in-memory neutro: ${relative}`);
}
for (const relative of [handlers, handlerTest]) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (!source.includes('../memory/canvas-project.mock-store')) errors.push(`MSW nao usa o store in-memory neutro: ${relative}`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) ? [absolute] : [];
  });
}
for (const file of walk(path.join(root, 'src/features/theory-of-change/canvas/server'))) {
  const source = fs.readFileSync(file, 'utf8');
  if (/from\s+['"][^'"]*infrastructure\/msw\//.test(source)) {
    errors.push(`dependencia proibida server -> infrastructure/msw: ${path.relative(root, file)}`);
  }
}

const predecessor = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave04.mjs'], { cwd: root, encoding: 'utf8' });
if (predecessor.status !== 0) {
  process.stdout.write(predecessor.stdout || '');
  process.stderr.write(predecessor.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 04');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
if (!bite || bite.status !== 'ACTIVE' || bite.revision < 6) errors.push('SO-013 Wave 05 nao esta ACTIVE/revision >= 6 no Bite Ledger');
if (!String(state.lastBite || '').startsWith('SO-013 | Infrastructure Cleanup Wave 05')) errors.push('Current State nao registra a Wave 05 do SO-013');
if (state.activeBite !== 'SO-013 | Infrastructure Cleanup' || state.activeBiteStatus !== 'ACTIVE') errors.push('Current State nao registra SO-013 Infrastructure Cleanup como ACTIVE');

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 05: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-013 Infrastructure Cleanup Wave 05: server no longer depends on MSW infrastructure, shared in-memory store is neutral, and predecessor gates remain green.');
