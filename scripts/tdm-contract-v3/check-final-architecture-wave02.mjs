#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const runGate=(script,label)=>{
  if(!fs.existsSync(path.join(root,script))){ errors.push(`gate ausente: ${script}`); return; }
  const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  if(result.status!==0){ process.stdout.write(result.stdout||''); process.stderr.write(result.stderr||''); errors.push(`gate falhou: ${label}`); }
};

const boundaryGates=[
  ['scripts/tdm-contract-v3/check-final-architecture-wave01.mjs','SO-014 Wave 01'],
  ['scripts/tdm-contract-v3/check-application-slayer-closeout.mjs','SO-010 Application boundary'],
  ['scripts/tdm-contract-v3/check-react-flow-isolation-closeout.mjs','SO-011 React Flow boundary'],
  ['scripts/tdm-contract-v3/check-canvas-engine-closeout.mjs','SO-012 Canvas Engine boundary'],
  ['scripts/tdm-contract-v3/check-infrastructure-cleanup-closeout.mjs','SO-013 Infrastructure boundary'],
];
for(const [script,label] of boundaryGates) runGate(script,label);

const canvasRoot='src/features/theory-of-change/canvas';
for(const owner of ['domain','application','engine','react-flow','infrastructure','server','ui']){
  const ownerPath=path.join(root,canvasRoot,owner);
  if(!fs.existsSync(ownerPath)||!fs.statSync(ownerPath).isDirectory()) errors.push(`owner arquitetural ausente: ${canvasRoot}/${owner}`);
}

const requiredDocs=[
  'docs/architecture/adr/ADR-006-application-layer-ownership.md',
  'docs/architecture/adr/ADR-007-react-flow-isolation.md',
  'docs/sharkops/SO-014-FINAL-ARCHITECTURE-AUDIT.md',
  'docs/sharkops/SO-014-WAVE-02-FINAL-BOUNDARY-VERIFICATION.md',
];
for(const doc of requiredDocs) if(!fs.existsSync(path.join(root,doc))) errors.push(`documento de fronteira ausente: ${doc}`);

const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const so14=(ledger.bites??[]).find((bite)=>bite.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||Number(so14.revision)<2) errors.push('SO-014 nao esta ACTIVE revision >= 2');
const exactWave02=so14?.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-02'
  && state.lastBite==='SO-014 | Final Boundary Verification'
  && state.nextBite==='SO-014 | Dependency Direction Verification';
const registeredDownstream=Boolean(
  so14 && Number(so14.revision)>=3
  && typeof so14.path==='string'
  && so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')
  && state.activeBite==='SO-014 | Final Architecture Closeout'
  && state.activeBiteStatus==='ACTIVE'
  && typeof state.lastBite==='string' && state.lastBite.startsWith('SO-014 | ')
  && typeof state.nextBite==='string' && state.nextBite.startsWith('SO-014 | ')
);
if(!exactWave02&&!registeredDownstream) errors.push('Current State perdeu a Wave 02 ou uma progressao SO-014 downstream registrada');
if(!pkg.scripts?.['check:tdm:final-architecture:wave02']) errors.push('script npm da Wave 02 ausente');
const manifest='.sharkops/bites/so-014-final-architecture-closeout-wave-02/MANIFEST.json';
if(!fs.existsSync(path.join(root,manifest))) errors.push('manifest da Wave 02 ausente');
const handoff=fs.readFileSync(path.join(root,'docs/sharkops/HANDOFF.md'),'utf8');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 02')) errors.push('HANDOFF sem Wave 02');
if(errors.length){ console.error('\nSO-014 FINAL BOUNDARY VERIFICATION: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1); }
console.log('PASS SO-014 Final Architecture Wave 02: final Canvas ownership boundaries remain present and predecessor Application, React Flow, Canvas Engine and Infrastructure boundary closeouts remain green without runtime changes.');
