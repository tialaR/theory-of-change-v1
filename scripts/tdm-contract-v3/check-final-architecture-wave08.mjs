#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const readJson=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const matrixRel='docs/sharkops/SO-014-FINAL-GATE-MATRIX.json';
if(!exists(matrixRel)) errors.push('matriz final de gates ausente');
const matrix=exists(matrixRel)?readJson(matrixRel):{groups:[]};
const pkg=readJson('package.json');
const scripts=pkg.scripts||{};

const requiredGroups=['architecture-closeouts','so014-sealing-waves','repository-regression'];
for(const id of requiredGroups){
  const group=matrix.groups?.find((entry)=>entry.id===id);
  if(!group||group.required!==true||!Array.isArray(group.gates)||group.gates.length===0) errors.push(`grupo obrigatorio ausente/invalido: ${id}`);
}

const expectedScripts=[
  'check:tdm:god-hooks-slayer:closeout',
  'check:tdm:result-view-god-slayer:closeout',
  'check:tdm:narrative-god-slayer:closeout',
  'check:tdm:application-slayer:closeout-hotfix',
  'check:tdm:react-flow-isolation:closeout',
  'check:tdm:canvas-engine:closeout',
  'check:tdm:infrastructure-cleanup:closeout',
  'check:tdm:final-architecture:wave01',
  'check:tdm:final-architecture:wave02',
  'check:tdm:final-architecture:wave03',
  'check:tdm:final-architecture:wave04',
  'check:tdm:final-architecture:wave05',
  'check:tdm:final-architecture:wave06',
  'check:tdm:final-architecture:wave07',
  'typecheck','lint:canvas','test:unit','test:e2e:canvas','shark:verify'
];
const matrixScripts=new Set((matrix.groups||[]).flatMap((g)=>g.gates||[]).map((g)=>g.script));
for(const script of expectedScripts){
  if(!matrixScripts.has(script)) errors.push(`gate obrigatorio fora da matriz: ${script}`);
  if(typeof scripts[script]!=='string'||scripts[script].trim()==='') errors.push(`npm script obrigatorio ausente: ${script}`);
}

const duplicates=[];
const seen=new Set();
for(const group of matrix.groups||[]){
  for(const gate of group.gates||[]){
    const key=gate.script;
    if(seen.has(key)) duplicates.push(key);
    seen.add(key);
  }
}
if(duplicates.length) errors.push(`gate duplicado na matriz: ${[...new Set(duplicates)].join(', ')}`);

const ledger=readJson('.sharkops/state/bite-ledger.json');
for(let n=1;n<=13;n++){
  const id=`SO-${String(n).padStart(3,'0')}`;
  const bite=ledger.bites.find((entry)=>entry.id===id);
  if(!bite||bite.status!=='COMPLETE') errors.push(`${id} deixou de estar COMPLETE`);
}

if(process.env.SO014_WAVE07_VERIFIED!=='1'){
  const predecessor=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave07.mjs'],{cwd:root,encoding:'utf8'});
  if(predecessor.status!==0){process.stdout.write(predecessor.stdout||'');process.stderr.write(predecessor.stderr||'');errors.push('gate predecessor Wave 07 falhou');}
}

const state=readJson('.sharkops/state/current-state.json');
const so14=ledger.bites.find((bite)=>bite.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||so14.revision<8) errors.push('SO-014 Wave 08 state/ledger invalido');
const exactWave08=so14.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-08'&&state.lastBite==='SO-014 | Gate Matrix Consolidation'&&state.nextBite==='SO-014 | SharkOps Final State Consolidation';
const registeredDownstream=Boolean(so14.revision>=9&&typeof so14.path==='string'&&so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')&&state.activeBite==='SO-014 | Final Architecture Closeout'&&state.activeBiteStatus==='ACTIVE'&&typeof state.lastBite==='string'&&state.lastBite.startsWith('SO-014 | ')&&typeof state.nextBite==='string'&&state.nextBite.startsWith('SO-014 | '));
if(!exactWave08&&!registeredDownstream) errors.push('Current State perdeu a Wave 08 ou uma progressao SO-014 downstream registrada');
if(!scripts['check:tdm:final-architecture:wave08']) errors.push('npm script Wave 08 ausente');
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 08')) errors.push('HANDOFF Wave 08 ausente');
for(const rel of ['docs/sharkops/SO-014-WAVE-08-GATE-MATRIX-CONSOLIDATION.md','.sharkops/bites/so-014-final-architecture-closeout-wave-08/MANIFEST.json']) if(!exists(rel)) errors.push(`artefato Wave 08 ausente: ${rel}`);

if(errors.length){
  console.error('\nSO-014 GATE MATRIX CONSOLIDATION: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-014 Final Architecture Wave 08: the canonical closeout gate matrix is consolidated, complete, non-duplicated and wired to live repository scripts without runtime changes.');
