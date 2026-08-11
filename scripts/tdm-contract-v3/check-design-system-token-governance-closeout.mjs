#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const exists=r=>fs.existsSync(path.join(root,r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-018-DESIGN-SYSTEM-TOKEN-GOVERNANCE-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so18=(ledger.bites??[]).find(b=>b.id==='SO-018');
const so19=(ledger.bites??[]).find(b=>b.id==='SO-019');
const byId=id=>(audit.findings??[]).find(f=>f.id===id);

['wave01','wave02','wave03','wave04'].forEach(wave=>{
  req(exists(`scripts/tdm-contract-v3/check-design-system-token-governance-${wave}.mjs`),`gate ${wave} ausente`);
});

req(so18?.status==='COMPLETE' && so18?.revision===5,'ledger deve manter SO-018 COMPLETE na revisao 5');
req(Boolean(so18?.completedAt),'SO-018 COMPLETE sem completedAt');
req(audit.mode==='closeout-audit' && audit.runtimeChanges===false,'closeout deve permanecer audit-only');
req(audit.closeout?.status==='COMPLETE','audit closeout nao esta COMPLETE');
req(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length===0,'closeout possui findings abertos');
['DS-001','DS-002','DS-003'].forEach(id=>req(String(byId(id)?.status).startsWith('RESOLVED-'),`${id} deixou de estar resolvido`));
req(byId('DS-004')?.status==='PRESERVED-CLOSEOUT','DS-004 deixou de estar explicitamente preservado');
req(audit.nextBite?.id==='SO-019' && audit.nextBite?.mode==='audit-first','audit nao preserva SO-019 como sucessor audit-first');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State deixou de estar selado');

const terminalState =
  state.activeBite===null &&
  state.activeBiteStatus==='NONE' &&
  state.lastBite==='SO-018 | Design System & Token Governance COMPLETE' &&
  state.nextBite==='SO-019 | Cross-Feature Boundaries Audit';

const legitimateSuccessorState =
  so19?.status==='ACTIVE' &&
  (so19?.revision??0)>=1 &&
  state.activeBite==='SO-019 | Cross-Feature Boundaries' &&
  state.activeBiteStatus==='ACTIVE' &&
  String(state.lastBite??'').startsWith('SO-019 | Cross-Feature Boundaries') &&
  String(state.nextBite??'').startsWith('SO-019 |');

req(terminalState || legitimateSuccessorState,
  'SO-018 closeout deve permanecer terminal ou permitir apenas SO-019 legitimamente ACTIVE como sucessor');

if(errors.length){
  console.error('\nSO-018 DESIGN SYSTEM & TOKEN GOVERNANCE CLOSEOUT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-018 Closeout: DS-001..003 remain resolved, DS-004 remains preserved, SO-018 stays COMPLETE, and either terminal state or the legitimate SO-019 successor may proceed while GOLDEN-STATE-v1 remains sealed.');
