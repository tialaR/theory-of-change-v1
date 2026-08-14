#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';
const root = process.cwd();
const errors = [];
const waveGates = [
  'check-canvas-engine-wave01.mjs',
  'check-legacy-closeout-progression-hotfix.mjs',
  'check-canvas-engine-wave02.mjs',
  'check-canvas-engine-wave03.mjs',
  'check-canvas-engine-wave04.mjs',
  'check-canvas-engine-wave05.mjs',
  'check-canvas-engine-wave06.mjs',
  'check-canvas-engine-wave07.mjs',
  'check-canvas-engine-wave08.mjs',
  'check-canvas-engine-wave09.mjs',
  'check-canvas-engine-wave09-hotfix.mjs',
];
for (const gateName of waveGates) {
  const gate = path.join('scripts/tdm-contract-v3', gateName);
  if (!fs.existsSync(path.join(root, gate))) { errors.push(`gate ausente: ${gate}`); continue; }
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    errors.push(`gate falhou: ${gate}`);
  }
}
const engineRoot = path.join(root, 'src/features/theory-of-change/canvas/engine');
for (const file of ['canvas-engine.ts','canvas-engine.contracts.ts','canvas-engine-state.ts','canvas-engine-commands.ts','canvas-engine-history.ts','canvas-engine-layout.ts','canvas-engine-persistence.ts','canvas-engine-selection.ts','canvas-engine-interaction.ts']) {
  if (!fs.existsSync(path.join(engineRoot, file))) errors.push(`owner da Engine ausente: ${file}`);
}
const forbidden = [/from\s+['"]react(?:\/|['"])/,/from\s+['"]next(?:\/|['"])/,/from\s+['"]@xyflow\/react(?:\/|['"])/,/from\s+['"][^'"]*\/ui(?:\/|['"])/,/from\s+['"][^'"]*\/infrastructure(?:\/|['"])/,/from\s+['"][^'"]*\/server(?:\/|['"])/];
for (const entry of fs.readdirSync(engineRoot,{withFileTypes:true})) {
  if (!entry.isFile() || !/\.ts$/.test(entry.name)) continue;
  const source=fs.readFileSync(path.join(engineRoot,entry.name),'utf8');
  for (const rule of forbidden) if (rule.test(source)) errors.push(`dependencia proibida na Engine: ${entry.name}`);
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{const absolute=path.join(dir,entry.name);if(entry.isDirectory())return walk(absolute);return /\.(ts|tsx)$/.test(entry.name)?[absolute]:[];});}
const canvasRoot=path.join(root,'src/features/theory-of-change/canvas');
const deepImport=/\/engine\/canvas-engine-(?:contracts|state|commands|history|layout|persistence|selection|interaction)['"]/;
for(const file of walk(canvasRoot)){const relative=path.relative(root,file);if(relative.includes('/engine/'))continue;const source=fs.readFileSync(file,'utf8');if(deepImport.test(source))errors.push(`deep import externo proibido: ${relative}`);}
const state=JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/current-state.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/bite-ledger.json'),'utf8'));
const bite=ledger.bites.find((item)=>item.id==='SO-012');
if(!bite||bite.status!=='COMPLETE'||!bite.completedAt)errors.push('SO-012 nao esta COMPLETE no Bite Ledger');
const atCloseout=state.activeBite==='SO-012 | Canvas Engine'&&state.activeBiteStatus==='COMPLETE'&&state.lastBite==='SO-012 | Canvas Engine Closeout'&&state.nextBite==='SO-013 | Infrastructure Cleanup Audit';
const registeredProgression=assertRegisteredProgression({state,ledger,minimumBite:13,completedBites:['SO-012']});
if(!atCloseout&&!registeredProgression)errors.push('Current State perdeu o closeout do SO-012 ou uma progressao downstream registrada');
const handoff=fs.readFileSync(path.join(root,'docs/sharkops/HANDOFF.md'),'utf8');
if(!handoff.includes('SO-012 Canvas Engine Closeout'))errors.push('handoff nao registra o closeout do SO-012');
if(!handoff.includes('SO-013 Infrastructure Cleanup Audit'))errors.push('handoff nao registra o proximo ataque SO-013');
if(errors.length){console.error('\nSO-012 CANVAS ENGINE CLOSEOUT: FAIL\n');errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));process.exit(1);}
console.log('PASS SO-012 Canvas Engine Closeout: all ten waves, facade-only consumption, framework-neutral kernels, SharkOps completion and SO-013 handoff are regression-armored.');
