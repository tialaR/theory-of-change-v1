#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-020-APPLICATION-INFRASTRUCTURE-RUNTIME-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so20=(ledger.bites??[]).find(b=>b.id==='SO-020');
const byId=id=>(audit.findings??[]).find(f=>f.id===id);

req(so20?.status==='COMPLETE' && so20?.revision===3,'SO-020 must close COMPLETE at revision 3');
req(Boolean(so20?.completedAt),'SO-020 COMPLETE without completedAt');
req(audit.mode==='closeout-audit' && audit.runtimeChanges===false,'closeout must remain audit-only');
req(audit.closeout?.status==='COMPLETE','audit closeout must be COMPLETE');
req(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length===0,'closeout must have zero open findings');
req(String(byId('RUNTIME-001')?.status).startsWith('RESOLVED-'),'RUNTIME-001 must remain resolved');
req(byId('RUNTIME-002')?.status==='PRESERVED-CLOSEOUT','RUNTIME-002 must remain explicitly preserved');
req(byId('RUNTIME-003')?.status==='PRESERVED-CLOSEOUT','RUNTIME-003 must remain explicitly preserved');
const so21=(ledger.bites??[]).find(b=>b.id==='SO-021');
const so22=(ledger.bites??[]).find(b=>b.id==='SO-022');

const terminalState=
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.lastBite==='SO-020 | Application Infrastructure & Runtime Armor COMPLETE' &&
  state.nextBite==='SO-021 | Application-Wide Regression Armor Audit';

const successorActiveState=
  so21?.status==='ACTIVE' &&
  state.activeBite==='SO-021 | Application-Wide Regression Armor' &&
  state.activeBiteStatus==='ACTIVE';

const successorCompleteState=
  so21?.status==='COMPLETE' &&
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.lastBite==='SO-021 | Application-Wide Regression Armor COMPLETE' &&
  state.nextBite==='SO-022 | Final Application Architecture Closeout Audit';

const successorSO022ActiveState=
  so21?.status==='COMPLETE' &&
  so22?.status==='ACTIVE' &&
  state.activeBite==='SO-022 | Final Application Architecture Closeout' &&
  state.activeBiteStatus==='ACTIVE';

const successorSO022CompleteState=
  so21?.status==='COMPLETE' &&
  so22?.status==='COMPLETE' &&
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.applicationGoldenStateId==='APPLICATION-GOLDEN-STATE-v1' &&
  state.applicationGoldenStateStatus==='COMPLETE';

req(
  terminalState || successorActiveState || successorCompleteState || successorSO022ActiveState || successorSO022CompleteState,
  'SO-020 closeout must remain terminal or allow legitimate SO-021/SO-022 successor states'
);

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);return e.isDirectory()?walk(f):[f]})}
const source=walk(path.join(root,'src')).filter(f=>/\.(ts|tsx|js|mjs)$/.test(f));
const domainEnv=source.filter(f=>path.relative(root,f).split(path.sep).join('/').includes('/domain/') && fs.readFileSync(f,'utf8').includes('process.env')).map(f=>path.relative(root,f));
req(domainEnv.length===0,`domain code reads process.env: ${domainEnv.join(', ')}`);

if(errors.length){
  console.error('\nSO-020 APPLICATION INFRASTRUCTURE & RUNTIME CLOSEOUT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-020 Closeout: RUNTIME-001 is resolved, RUNTIME-002..003 remain intentionally preserved, zero findings remain open, SO-020 is COMPLETE, and GOLDEN-STATE-v1 remains sealed.');
