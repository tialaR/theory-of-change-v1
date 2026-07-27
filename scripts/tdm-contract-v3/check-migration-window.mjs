#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, '.tdm', 'migration-window.json');
const errors = [];

if (!fs.existsSync(file)) {
  errors.push('janela de migração ausente');
} else {
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
  if (record.state !== 'open') errors.push(`estado inválido: ${record.state}`);
  if (record.branch !== branch) errors.push(`branch atual ${branch} difere da autorizada ${record.branch}`);
  if (!record.openedAt) errors.push('openedAt ausente');
  if (record.closeAfterPatch !== 'canvas-wave-03-lockdown') errors.push('alvo de fechamento inválido');
  if (record.protectedVisualHashes == null) errors.push('hashes visuais protegidos ausentes');
}

if (errors.length) {
  console.error('\nTDM MIGRATION WINDOW: PORTA FECHADA\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS: janela de migração aberta, íntegra e limitada à branch autorizada.');
