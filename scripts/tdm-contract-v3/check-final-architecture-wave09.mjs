#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd(); const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

if(process.env.SO014_WAVE08_VERIFIED!=='1'){
  const p=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave08.mjs'],{cwd:root,encoding:'utf8'});
  if(p.status!==0){process.stdout.write(p.stdout||'');process.stderr.write(p.stderr||'');errors.push('gate predecessor Wave 08 falhou');}
}

const state=json('.sharkops/state/current-state.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const pkg=json('package.json');
const canonicalRel='docs/sharkops/SO-014-SHARKOPS-CONSOLIDATED-STATE.json';
if(!exists(canonicalRel)) errors.push('snapshot consolidado SharkOps ausente');
const canonical=exists(canonicalRel)?json(canonicalRel):{};
const active=ledger.bites.filter((b)=>b.status==='ACTIVE');
if(active.length!==1||active[0]?.id!=='SO-014') errors.push('ledger deve conter exatamente um bite ACTIVE: SO-014');
for(let n=1;n<=13;n++){
  const id=`SO-${String(n).padStart(3,'0')}`;
  const b=ledger.bites.find((x)=>x.id===id);
  if(!b||b.status!=='COMPLETE'||!b.completedAt) errors.push(`${id} deve permanecer COMPLETE com completedAt`);
}
const so14=ledger.bites.find((b)=>b.id==='SO-014');
const revision=Number(so14?.revision);
const revisionWave=Number.isInteger(revision)?String(revision).padStart(2,'0'):'';
const expectedPath=revisionWave?`.sharkops/bites/so-014-final-architecture-closeout-wave-${revisionWave}`:'';
if(!so14||so14.status!=='ACTIVE'||!Number.isInteger(revision)||revision<9||so14.completedAt) errors.push('SO-014 deve permanecer ACTIVE em Wave 09 ou progressao cumulativa posterior');
if(revision>=9&&so14?.path!==expectedPath) errors.push('SO-014 path nao acompanha a revisao cumulativa atual');
if(state.activeBite!=='SO-014 | Final Architecture Closeout'||state.activeBiteStatus!=='ACTIVE') errors.push('current-state perdeu SO-014 ACTIVE');
if(revision===9&&(state.lastBite!=='SO-014 | SharkOps Final State Consolidation'||state.nextBite!=='SO-014 | Final Regression Armor')) errors.push('current-state Wave 09 invalido');
if(canonical.activeBite?.id!=='SO-014'||canonical.activeBite?.status!=='ACTIVE'||canonical.activeBite?.revision!==revision||canonical.activeBite?.path!==so14?.path) errors.push('snapshot consolidado nao espelha ledger SO-014 atual');
if(canonical.lastBite!==state.lastBite||canonical.nextBite!==state.nextBite||canonical.phase!==state.phase) errors.push('snapshot consolidado nao espelha current-state atual');
if(canonical.currentWave!==revisionWave) errors.push('snapshot consolidado nao acompanha a wave cumulativa atual');
const expectedComplete=Array.from({length:13},(_,i)=>`SO-${String(i+1).padStart(3,'0')}`);
if(JSON.stringify(canonical.completedInitiatives)!==JSON.stringify(expectedComplete)) errors.push('snapshot consolidado perdeu SO-001..SO-013');
if(revision>9&&!canonical.completedSo014Waves?.includes('09')) errors.push('progressao posterior perdeu Wave 09 da lista de waves concluidas');

for(let n=1;n<=9;n++){
  const wave=String(n).padStart(2,'0');
  const rel=`.sharkops/bites/so-014-final-architecture-closeout-wave-${wave}/MANIFEST.json`;
  if(!exists(rel)){errors.push(`manifest Wave ${wave} ausente`); continue;}
  const m=json(rel);
  if(m.id!=='SO-014'||m.wave!==wave||m.runtimeChanges!==false) errors.push(`manifest Wave ${wave} inconsistente`);
  if(n>=2&&typeof m.gate!=='string') errors.push(`manifest Wave ${wave} sem gate`);
  if(n>=2){const script=`check:tdm:final-architecture:wave${wave}`; if(!pkg.scripts?.[script]) errors.push(`npm script Wave ${wave} ausente`);}
}

const matrix=json('docs/sharkops/SO-014-FINAL-GATE-MATRIX.json');
const sealing=matrix.groups?.find((g)=>g.id==='so014-sealing-waves');
for(let n=1;n<=9;n++){
  const wave=String(n).padStart(2,'0');
  const script=`check:tdm:final-architecture:wave${wave}`;
  if(!sealing?.gates?.some((g)=>g.id===`wave${wave}`&&g.script===script)) errors.push(`gate Wave ${wave} ausente da matriz consolidada`);
}
for(const script of ['shark','shark:status','shark:doctor','shark:verify','shark:new','shark:handoff']) if(!pkg.scripts?.[script]) errors.push(`SharkOps script ausente: ${script}`);
for(const rel of ['tools/sharkops/status.mjs','tools/sharkops/verify.mjs','docs/sharkops/HANDOFF.md','docs/sharkops/SO-014-WAVE-09-SHARKOPS-FINAL-STATE-CONSOLIDATION.md']) if(!exists(rel)) errors.push(`SharkOps artefato ausente: ${rel}`);
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 09')||!handoff.includes('SO-014-SHARKOPS-CONSOLIDATED-STATE.json')) errors.push('HANDOFF nao registra consolidacao Wave 09');

if(errors.length){console.error('\nSO-014 SHARKOPS FINAL STATE CONSOLIDATION: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1);}
console.log('PASS SO-014 Final Architecture Wave 09: SharkOps governance state remains consolidated at Wave 09 and through authorized cumulative SO-014 progression without closing SO-014 or changing runtime code.');
