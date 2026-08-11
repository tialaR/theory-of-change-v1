#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-019-CROSS-FEATURE-BOUNDARIES-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so19=(ledger.bites??[]).find(b=>b.id==='SO-019');
const finding=(audit.findings??[]).find(f=>f.id==='BOUNDARY-001');

req(so19?.status==='COMPLETE' && so19?.revision===3,'SO-019 must close COMPLETE at revision 3');
req(Boolean(so19?.completedAt),'SO-019 COMPLETE without completedAt');
req(audit.mode==='closeout-audit' && audit.runtimeChanges===false,'closeout must remain audit-only');
req(String(finding?.status).startsWith('RESOLVED-'),'BOUNDARY-001 must remain resolved');
req(audit.closeout?.status==='COMPLETE','audit closeout must be COMPLETE');
req(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length===0,'closeout must have zero open findings');
req(audit.classification?.pair==='theory-of-change -> auth','canonical classified pair changed');
req(audit.classification?.forbiddenDeepImportsAfterWave02===0,'forbidden deep import baseline changed');
const so20=(ledger.bites??[]).find(b=>b.id==='SO-020');
const terminalState=state.activeBite===null && state.activeBiteStatus==='NONE';
const successorState=so20?.status==='ACTIVE' && state.activeBite==='SO-020 | Application Infrastructure & Runtime Armor' && state.activeBiteStatus==='ACTIVE';
req(terminalState || successorState,'SO-019 closeout must remain terminal or allow legitimate SO-020 successor');
req((terminalState && state.lastBite==='SO-019 | Cross-Feature Boundaries COMPLETE') || successorState,'current-state must preserve SO-019 completion while successor proceeds');
req((terminalState && state.nextBite==='SO-020 | Application Infrastructure & Runtime Armor Audit') || successorState,'SO-019 closeout must point to or permit SO-020 audit successor');
req(audit.nextBite?.id==='SO-020' && audit.nextBite?.mode==='audit-first','audit must point to SO-020 audit-first');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');

if(errors.length){
  console.error('\nSO-019 CROSS-FEATURE BOUNDARIES CLOSEOUT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-019 Closeout: the only proven cross-feature pair is classified and sealed, BOUNDARY-001 remains resolved, zero findings remain open, SO-019 is COMPLETE, and GOLDEN-STATE-v1 remains sealed.');
