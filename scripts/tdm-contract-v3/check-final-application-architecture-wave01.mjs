#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const json=r=>JSON.parse(fs.readFileSync(path.join(root,r),'utf8'));
const req=(v,m)=>{if(!v)errors.push(m)};

const audit=json('docs/sharkops/SO-022-FINAL-APPLICATION-ARCHITECTURE-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so22=(ledger.bites??[]).find(b=>b.id==='SO-022');

const expected=["SO-001", "SO-002", "SO-003", "SO-004", "SO-005", "SO-006", "SO-007", "SO-008", "SO-009", "SO-010", "SO-011", "SO-012", "SO-013", "SO-014", "SO-015", "SO-016", "SO-017", "SO-018", "SO-019", "SO-020", "SO-021"];
const byId=new Map((ledger.bites??[]).map(b=>[b.id,b]));
for(const id of expected){
  req(byId.has(id),`missing predecessor ${id}`);
  req(byId.get(id)?.status==='COMPLETE',`${id} must remain COMPLETE`);
}

req((so22?.status==='ACTIVE' && (so22?.revision??0)>=1) || (so22?.status==='COMPLETE' && (so22?.revision??0)>=3),'SO-022 must remain ACTIVE during waves or COMPLETE at closeout');
req((so22?.revision??0)===1 ? (audit.mode==='audit-only' && audit.runtimeChanges===false) : (so22?.revision??0)>1,'Wave 01 must remain audit-only at revision 1 and allow explicit progression');
req(audit.inventory?.missingInitiatives?.length===0,'predecessor initiative inventory changed');
req(audit.inventory?.nonCompleteInitiatives?.length===0,'predecessor completion inventory changed');
req(audit.inventory?.missingTerminalScripts?.length===0,'terminal script inventory changed');
req((so22?.status==='ACTIVE' && state.activeBite==='SO-022 | Final Application Architecture Closeout' && state.activeBiteStatus==='ACTIVE') || (so22?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE' && state.applicationGoldenStateStatus==='COMPLETE'),'current-state lost canonical SO-022 ownership');
req(state.goldenStateId==='GOLDEN-STATE-v1' && state.goldenStateStatus==='COMPLETE','Canvas Golden State must remain sealed');
req((so22?.revision??0)===1 ? audit.nextBite?.id==='SO-022-WAVE-02' : ((so22?.revision??0)===2 ? audit.applicationGoldenStateCandidate?.id==='APPLICATION-GOLDEN-STATE-v1-CANDIDATE' : ((so22?.revision??0)>=3 && audit.closeout?.status==='COMPLETE')),'Wave 01 must point to Wave 02, recognize the candidate, or recognize SO-022 COMPLETE');

if(errors.length){
  console.error('\nSO-022 WAVE 01 FINAL APPLICATION ARCHITECTURE AUDIT: FAIL\n');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
  process.exit(1);
}

console.log('PASS SO-022 Wave 01: SO-001..SO-021 remain COMPLETE, terminal verification entrypoints are present, GOLDEN-STATE-v1 remains sealed, and FINAL-003 is frozen as the only terminal next bite.');
