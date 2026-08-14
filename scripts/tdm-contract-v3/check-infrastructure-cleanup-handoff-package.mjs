#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
const errors = [];
const packer = path.join(root, 'tools/sharkops/handoff-pack.sh');
if (!fs.existsSync(packer)) errors.push('handoff packer ausente');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts?.['shark:handoff'] !== 'bash tools/sharkops/handoff-pack.sh') errors.push('script shark:handoff ausente ou divergente');
const source = fs.existsSync(packer) ? fs.readFileSync(packer, 'utf8') : '';
for (const required of ['.patch-backups/*', '.shark/*', '.tdm-patches/*', '.tdm-backups/*', '.tdm-integration/*/references/*', 'docs/references/**/*.mov']) {
  if (!source.includes(required)) errors.push(`exclusao obrigatoria ausente: ${required}`);
}
if (!errors.length) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tdm-handoff-'));
  const env = { ...process.env, TDM_HANDOFF_STAMP: 'gate' };
  const run = spawnSync('bash', ['tools/sharkops/handoff-pack.sh', tmp], { cwd: root, env, encoding: 'utf8' });
  if (run.status !== 0) {
    errors.push(`packer falhou no dry-run: ${(run.stderr || run.stdout || '').trim()}`);
  } else {
    const zip = path.join(tmp, `${path.basename(root)}-SHARKOPS-HANDOFF-gate.zip`);
    if (!fs.existsSync(zip)) {
      errors.push('packer nao gerou ZIP esperado');
    } else {
      const list = spawnSync('unzip', ['-Z1', zip], { encoding: 'utf8' });
      const entries = (list.stdout || '').split('\n').filter(Boolean);
      const prefix = `${path.basename(root)}/`;
      for (const required of ['package.json', '.sharkops/state/current-state.json', '.sharkops/state/bite-ledger.json', 'docs/sharkops/HANDOFF.md', 'src/', 'scripts/', 'tools/sharkops/']) {
        if (!entries.some((entry) => entry === prefix + required || entry.startsWith(prefix + required))) errors.push(`ZIP slim perdeu caminho critico: ${required}`);
      }
      for (const banned of ['.patch-backups/', '.shark/', '.tdm-patches/', '.tdm-backups/']) {
        if (entries.some((entry) => entry.startsWith(prefix + banned))) errors.push(`ZIP slim contem artefato proibido: ${banned}`);
      }
      if (entries.some((entry) => entry.startsWith(prefix + '.tdm-integration/') && entry.includes('/references/'))) errors.push('ZIP slim contem referencias pesadas de .tdm-integration');
      if (entries.some((entry) => /docs\/references\/.*\.(mov|mp4|webm|png|jpe?g)$/i.test(entry))) errors.push('ZIP slim contem midia pesada de docs/references');
      const sizeMb = fs.statSync(zip).size / (1024 * 1024);
      if (sizeMb > 40) errors.push(`ZIP slim excede 40 MB: ${sizeMb.toFixed(1)} MB`);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (errors.length) {
  console.error('\nSO-013 HANDOFF PACKAGE CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-013 Handoff Package Contract: slim handoff preserves live architecture and SharkOps while excluding backup/runtime/reference weight.');
