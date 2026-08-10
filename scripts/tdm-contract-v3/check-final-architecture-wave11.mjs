#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const proofRel='.sharkops/state/so-014-wave-11-precloseout-proof.json';
if(!exists(proofRel)) errors.push('prova pre-closeout da Final Regression Armor ausente');
const proof=exists(proofRel)?json(proofRel):{};
if(proof.wave!=='11'||proof.predecessor!=='SO-014 Wave 10'||proof.finalRegressionArmor!=='PASS') errors.push('prova pre-closeout invalida');

const state=json('.sharkops/state/current-state.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const pkg=json('package.json');
const so14=ledger.bites.find(b=>b.id==='SO-014');
const active=ledger.bites.filter(b=>b.status==='ACTIVE');
const complete=ledger.bites.filter(b=>b.status==='COMPLETE');

if(!so14||so14.status!=='COMPLETE'||so14.revision!==11||so14.path!=='.sharkops/bites/so-014-final-architecture-closeout-wave-11'||!so14.completedAt) errors.push('SO-014 ledger nao esta fechado corretamente na Wave 11');
if(active.length!==0) errors.push('estado terminal deve ter zero bites ACTIVE');
if(complete.length!==14) errors.push('SO-001 a SO-014 devem estar COMPLETE');
for(let i=1;i<=14;i++){
  const id=`SO-${String(i).padStart(3,'0')}`;
  const bite=ledger.bites.find(b=>b.id===id);
  if(!bite||bite.status!=='COMPLETE'||!bite.completedAt) errors.push(`${id} nao esta COMPLETE com completedAt`);
}
if(state.activeBite||state.activeBiteStatus) errors.push('current-state terminal nao deve possuir activeBite');
const goldenStateComplete=state.goldenStateStatus==='COMPLETE';
if(goldenStateComplete){
  if(state.phase!=='Golden State Snapshot Complete'||state.lastBite!=='SO-014 | Final Architecture Closeout'||state.nextBite!=='No active bite | Start a new scoped SharkOps initiative for future runtime work') errors.push('current-state Golden State invalido');
}else if(state.phase!=='Architecture Diamond Complete'||state.lastBite!=='SO-014 | Final Architecture Closeout'||state.nextBite!=='Golden State Snapshot | Project Handoff') errors.push('current-state terminal invalido');

for(const rel of [
  'docs/sharkops/SO-014-FINAL-ARCHITECTURE-CLOSEOUT.json',
  'docs/sharkops/SO-014-WAVE-11-FINAL-ARCHITECTURE-CLOSEOUT.md',
  'docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json',
  'docs/sharkops/SO-014-SHARKOPS-CONSOLIDATED-STATE.json',
  'docs/architecture/adr/ADR-008-final-canvas-architecture-constitution.md'
]) if(!exists(rel)) errors.push('artefato final ausente: '+rel);

if(!pkg.scripts?.['check:tdm:final-architecture:wave11']) errors.push('npm script Wave 11 ausente');
const manifest=json('.sharkops/bites/so-014-final-architecture-closeout-wave-11/MANIFEST.json');
if(manifest.wave!=='11'||manifest.status!=='COMPLETE'||manifest.runtimeChanges!==false||manifest.closeout!==true) errors.push('manifest Wave 11 inconsistente');

const matrix=json('docs/sharkops/SO-014-FINAL-GATE-MATRIX.json');
const sealing=matrix.groups.find(g=>g.id==='so014-sealing-waves');
for(const [id,script] of [['wave10','check:tdm:final-architecture:wave10'],['wave11','check:tdm:final-architecture:wave11']]){
  if(!sealing?.gates?.some(g=>g.id===id&&g.script===script)) errors.push(`matriz final nao registra ${id}`);
}

const consolidated=json('docs/sharkops/SO-014-SHARKOPS-CONSOLIDATED-STATE.json');
if(consolidated.activeBite!==null||consolidated.currentWave!=='11'||consolidated.finalArchitectureComplete!==true||!consolidated.completedInitiatives?.includes('SO-014')) errors.push('snapshot SharkOps terminal inconsistente');
const closeout=json('docs/sharkops/SO-014-FINAL-ARCHITECTURE-CLOSEOUT.json');
if(closeout.status!=='COMPLETE'||closeout.wave!=='11'||closeout.runtimeChanges!==false||closeout.terminalGovernance?.activeBites!==0) errors.push('closeout canonico inconsistente');

const verify=read('tools/sharkops/verify.mjs');
if(!verify.includes("activeBites.length === 0 && allComplete")||!verify.includes("terminal state: no active bite and all ledger bites COMPLETE")) errors.push('shark:verify nao protege estado terminal sem active bite');
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-014 Final Architecture Closeout - Wave 11')||!handoff.includes('Golden State Snapshot / Project Handoff')) errors.push('HANDOFF nao registra closeout e proximo snapshot');

if(errors.length){
  console.error('\nSO-014 FINAL ARCHITECTURE CLOSEOUT: FAIL\n');
  errors.forEach((e,i)=>console.error((i+1)+'. '+e+'.'));
  process.exit(1);
}
console.log('PASS SO-014 Final Architecture Wave 11: SO-014 is COMPLETE, terminal SharkOps governance is sealed, final regression armor remains mandatory and no runtime code changed.');
