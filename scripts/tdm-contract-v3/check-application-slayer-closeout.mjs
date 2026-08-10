import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';
const root = process.cwd();
const gates = ['wave01','wave02','wave02-hotfix','wave03','wave04','wave05','wave06'].map(name => `scripts/tdm-contract-v3/check-application-slayer-${name}.mjs`);
for (const gate of gates) {
  if (!fs.existsSync(path.join(root, gate))) throw new Error(`Missing SO-010 gate: ${gate}`);
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`SO-010 gate failed: ${gate}`);
  }
}
const applicationRoots = [
  'src/features/theory-of-change/canvas/application',
  'src/features/auth/application'
];
const forbidden = [
  /from\s+['"][^'"]*\/ui(?:\/|['"])/,
  /from\s+['"][^'"]*\/react-flow(?:\/|['"])/,
  /from\s+['"][^'"]*\/infrastructure(?:\/|['"])/,
  /from\s+['"][^'"]*\/server(?:\/|['"])/,
  /from\s+['"]react(?:\/|['"])/,
  /from\s+['"]next(?:\/|['"])/,
  /from\s+['"]@xyflow\/react['"]/
];
for (const rel of applicationRoots) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) throw new Error(`Missing Application root: ${rel}`);
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
    const file = path.join(absolute, entry.name);
    const source = fs.readFileSync(file, 'utf8');
    for (const rule of forbidden) if (rule.test(source)) throw new Error(`Forbidden dependency in ${path.relative(root,file)}: ${rule}`);
  }
}
const requiredOwners = [
  'src/features/theory-of-change/canvas/application/canvas-node-actions.ts',
  'src/features/theory-of-change/canvas/application/canvas-relation-actions.ts',
  'src/features/theory-of-change/canvas/application/canvas-project-content.ts',
  'src/features/theory-of-change/canvas/application/canvas-save-policy.ts',
  'src/features/auth/application/attempt-user-login.ts'
];
for (const rel of requiredOwners) if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing SO-010 owner: ${rel}`);
const state = JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/current-state.json'),'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/bite-ledger.json'),'utf8'));
const bite = ledger.bites.find(item => item.id === 'SO-010');
if (!bite || bite.status !== 'COMPLETE' || !bite.completedAt) throw new Error('SO-010 ledger entry is not COMPLETE');
const stillAtHandoff = state.activeBite === 'SO-010 | Application Slayer'
  && state.activeBiteStatus === 'COMPLETE'
  && state.lastBite === 'SO-010 | Application Slayer Closeout'
  && state.nextBite === 'SO-011 | React Flow Isolation Audit';
const registeredProgression = assertRegisteredProgression({
  state,
  ledger,
  minimumBite: 11,
  completedBites: ['SO-010'],
});
if (!stillAtHandoff && !registeredProgression) {
  throw new Error('Current State lost the SO-010 closeout or a registered downstream progression');
}
console.log('PASS SO-010 Application Slayer Closeout: framework-neutral Application ownership, aggregate wave gates and downstream SO-011/SO-012 progression are regression-armored.');
