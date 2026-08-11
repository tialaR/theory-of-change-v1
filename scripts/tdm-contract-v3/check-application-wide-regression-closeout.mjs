#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-021-APPLICATION-WIDE-REGRESSION-ARMOR-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so21=(ledger.bites??[]).find(b=>b.id==='SO-021');
const byId=id=>(audit.findings??[]).find(f=>f.id===id);

req(so21?.status==='COMPLETE' && so21?.revision===3,'SO-021 must close COMPLETE at revision 3');
req(Boolean(so21?.completedAt),'SO-021 COMPLETE without completedAt');
req(audit.mode==='closeout-audit' && audit.runtimeChanges===false,'closeout must remain audit-only');
req(audit.closeout?.status==='COMPLETE','audit closeout must be COMPLETE');
req(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length===0,'closeout must have zero open findings');
req(String(byId('REGRESSION-001')?.status).startsWith('RESOLVED-'),'REGRESSION-001 must remain resolved');
req(byId('REGRESSION-002')?.status==='PRESERVED-CLOSEOUT','REGRESSION-002 must remain explicitly preserved');
req(byId('REGRESSION-003')?.status==='PRESERVED-CLOSEOUT','REGRESSION-003 must remain explicitly preserved');
req(pkg.scripts?.['check:tdm:application-wide-regression']==='node scripts/sharkops/application-wide-regression.mjs','application-wide regression wiring changed');
const so22=(ledger.bites??[]).find(b=>b.id==='SO-022');

const terminalState=
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.lastBite==='SO-021 | Application-Wide Regression Armor COMPLETE' &&
  state.nextBite==='SO-022 | Final Application Architecture Closeout Audit';

const successorActiveState=
  so22?.status==='ACTIVE' &&
  state.activeBite==='SO-022 | Final Application Architecture Closeout' &&
  state.activeBiteStatus==='ACTIVE';

const successorCompleteState=
  so22?.status==='COMPLETE' &&
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.applicationGoldenStateId==='APPLICATION-GOLDEN-STATE-v1' &&
  state.applicationGoldenStateStatus==='COMPLETE';

req(
  terminalState || successorActiveState || successorCompleteState,
  'SO-021 closeout must remain terminal or allow legitimate SO-022 ACTIVE/COMPLETE successor states'
);
req(audit.nextBite?.id==='SO-022' && audit.nextBite?.mode==='audit-first','audit must point to SO-022 audit-first');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');

const orchestrator=read('scripts/sharkops/application-wide-regression.mjs');
for(const required of [
  'check:tdm:application-infrastructure-runtime:closeout',
  'check:tdm:golden-state',
  'typecheck',
  'lint:auth',
  'lint:canvas',
  'test:unit',
  'shark:verify'
]){
  req(orchestrator.includes(required),`aggregate regression contract lost ${required}`);
}
req(!orchestrator.includes('&& true'),'aggregate regression cannot swallow failures');
req(!orchestrator.includes('|| true'),'aggregate regression cannot swallow failures');

if(errors.length){
  console.error('\nSO-021 APPLICATION-WIDE REGRESSION ARMOR CLOSEOUT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-021 Closeout: REGRESSION-001 is resolved, REGRESSION-002..003 remain intentionally preserved, the application-wide contract remains fail-closed, SO-021 is COMPLETE, and GOLDEN-STATE-v1 remains sealed.');
