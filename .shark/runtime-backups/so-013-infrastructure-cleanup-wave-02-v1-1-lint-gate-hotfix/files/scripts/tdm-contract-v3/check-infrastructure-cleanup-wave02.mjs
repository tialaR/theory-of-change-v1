#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const removedFacade = 'src/features/theory-of-change/components/result-view/result-view.utils.ts';
const canonicalGeometry = 'src/features/theory-of-change/components/result-view/result-view-utils.geometry.ts';
const canonicalBarrel = 'src/features/theory-of-change/components/result-view/result-view-utils.ts';

if (fs.existsSync(path.join(root, removedFacade))) {
  errors.push(`fachada utilitaria duplicada reapareceu: ${removedFacade}`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) ? [absolute] : [];
  });
}

for (const scanRoot of ['src', 'scripts', 'tools']) {
  for (const file of walk(path.join(root, scanRoot))) {
    const relative = path.relative(root, file);
    if (relative.endsWith('check-infrastructure-cleanup-wave02.mjs')) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes('result-view.utils')) {
      errors.push(`referencia residual a fachada removida: ${relative}`);
    }
  }
}

const geometrySource = fs.readFileSync(path.join(root, canonicalGeometry), 'utf8');
for (const symbol of [
  'isValidCardRect',
  'isValidMarkerPoint',
  'buildMeasuredEdgePath',
  'areCardRectsEqual',
  'roundZoom',
  'getLayoutRectRelativeTo'
]) {
  if (!geometrySource.includes(`export function ${symbol}`)) {
    errors.push(`helper canonico ausente em result-view-utils.geometry.ts: ${symbol}`);
  }
}

const barrelSource = fs.readFileSync(path.join(root, canonicalBarrel), 'utf8');
if (!barrelSource.includes("export * from './result-view-utils.geometry';")) {
  errors.push('barrel canonico nao exporta result-view-utils.geometry');
}

const predecessor = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave01.mjs'], {
  cwd: root,
  encoding: 'utf8'
});
if (predecessor.status !== 0) {
  process.stdout.write(predecessor.stdout || '');
  process.stderr.write(predecessor.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 01');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
if (!bite || bite.status !== 'ACTIVE' || bite.revision < 2) {
  errors.push('SO-013 Wave 02 nao esta ACTIVE/revision 2 no Bite Ledger');
}
if (state.lastBite !== 'SO-013 | Infrastructure Cleanup Wave 02') {
  errors.push('Current State nao registra a Wave 02 do SO-013');
}
if (state.activeBite !== 'SO-013 | Infrastructure Cleanup' || state.activeBiteStatus !== 'ACTIVE') {
  errors.push('Current State nao registra SO-013 Infrastructure Cleanup como ACTIVE');
}

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 02: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 02: duplicate result-view utility facade removed, live consumers migrated to canonical modules, and predecessor gates remain green.');
