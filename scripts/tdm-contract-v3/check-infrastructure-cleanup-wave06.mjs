#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';

const root = process.cwd();
const errors = [];
const removedDuplicate = 'public/tdm-construtor-header-canonical.webp';
const canonicalAsset = 'public/brand/tmd-construtor-header-canonical.webp';
const expectedCanonicalSha = '538183a8ace4047ba8d15b58415666b8bb972f2b3971b782472fc6d090d2172f';

if (fs.existsSync(path.join(root, removedDuplicate))) {
  errors.push(`asset duplicado reapareceu: ${removedDuplicate}`);
}
if (!fs.existsSync(path.join(root, canonicalAsset))) {
  errors.push(`asset canonico ausente: ${canonicalAsset}`);
} else {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, canonicalAsset))).digest('hex');
  if (sha !== expectedCanonicalSha) errors.push(`hash inesperado para asset canonico: ${canonicalAsset}`);
}

const liveRefFiles = [
  'src/features/theory-of-change/canvas/ui/components/canvas-header.tsx',
];
for (const relative of liveRefFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (!source.includes('/brand/tmd-construtor-header-canonical.webp')) {
    errors.push(`consumidor vivo deixou de apontar para asset canonico: ${relative}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return [absolute];
  });
}
for (const scanRoot of ['src', 'scripts', 'tools', 'tests']) {
  for (const file of walk(path.join(root, scanRoot))) {
    let source;
    try { source = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (source.includes('/tdm-construtor-header-canonical.webp') && !source.includes('/brand/tmd-construtor-header-canonical.webp')) {
      errors.push(`referencia viva ao caminho duplicado removido: ${path.relative(root, file)}`);
    }
  }
}

const predecessor = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave05.mjs'], { cwd: root, encoding: 'utf8' });
if (predecessor.status !== 0) {
  process.stdout.write(predecessor.stdout || '');
  process.stderr.write(predecessor.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 05');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
const progressionOk = assertRegisteredProgression({ state, ledger, minimumBite: 13, completedBites: ['SO-012'] });
if (!bite || bite.revision < 7 || !['ACTIVE','COMPLETE'].includes(bite.status)) errors.push('SO-013 progression/revision invariant failed for this wave');
if (!progressionOk) errors.push('Current State/Ledger lost registered cumulative progression for SO-013 or downstream');

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 06: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-013 Infrastructure Cleanup Wave 06: proven duplicate dead header asset removed, canonical live asset preserved, and predecessor gates remain green.');
