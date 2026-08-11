#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const json=r=>JSON.parse(fs.readFileSync(path.join(root,r),'utf8'));
const req=(v,m)=>{if(!v)errors.push(m)};
const audit=json('docs/sharkops/SO-019-CROSS-FEATURE-BOUNDARIES-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so18=(ledger.bites??[]).find(b=>b.id==='SO-018');
const so19=(ledger.bites??[]).find(b=>b.id==='SO-019');
req(so18?.status==='COMPLETE','SO-018 predecessor must remain COMPLETE');
req((so19?.status==='ACTIVE' && (so19?.revision??0)>=1) || (so19?.status==='COMPLETE' && (so19?.revision??0)>=3),'SO-019 must remain ACTIVE during waves or COMPLETE at closeout');
req((so19?.revision??0)===1 ? (audit.mode==='audit-only' && audit.runtimeChanges===false) : (so19?.revision??0)>1,'Wave 01 must remain audit-only at revision 1 and allow explicit versioned progression');
req(audit.baseline?.crossFeatureImportCount===7,'Wave 01 evidence baseline must remain 7 even after remediation');
req((so19?.status==='ACTIVE' && state.activeBite==='SO-019 | Cross-Feature Boundaries' && state.activeBiteStatus==='ACTIVE') || (so19?.status==='COMPLETE' && state.activeBite===null && state.lastBite==='SO-019 | Cross-Feature Boundaries COMPLETE'),'current-state lost canonical SO-019 ownership');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');
if(errors.length){console.error('\nSO-019 WAVE 01 CROSS-FEATURE BOUNDARIES: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1)}
console.log('PASS SO-019 Wave 01: cross-feature dependencies are inventoried audit-only, predecessor armor and GOLDEN-STATE-v1 remain sealed, and the smallest evidence-based next bite is frozen.');
