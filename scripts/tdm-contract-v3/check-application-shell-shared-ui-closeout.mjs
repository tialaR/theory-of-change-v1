#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(x,m)=>{if(!x)errors.push(m)};
const exists=r=>fs.existsSync(path.join(root,r));

const audit=json('docs/sharkops/SO-017-APPLICATION-SHELL-SHARED-UI-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so17=(ledger.bites??[]).find(b=>b.id==='SO-017');
const byId=id=>(audit.findings??[]).find(f=>f.id===id);

['wave01','wave02','wave03','wave04'].forEach(w=>req(exists(`scripts/tdm-contract-v3/check-application-shell-shared-ui-${w}.mjs`),`gate ${w} ausente`));
req(so17?.status==='COMPLETE' && so17?.revision===5,'ledger deve fechar SO-017 COMPLETE na revisao 5');
req(Boolean(so17?.completedAt),'SO-017 COMPLETE sem completedAt');
req(audit.mode==='closeout-audit' && audit.runtimeChanges===false,'closeout deve permanecer audit-only');
req(audit.closeout?.status==='COMPLETE','audit closeout nao esta COMPLETE');
req(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length===0,'closeout possui findings abertos');
['SHELL-001','SHELL-002','SHELL-003'].forEach(id=>req(String(byId(id)?.status).startsWith('RESOLVED-'),`${id} deixou de estar resolvido`));
['SHELL-004','SHELL-005'].forEach(id=>req(String(byId(id)?.status)==='PRESERVED-CLOSEOUT',`${id} deixou de estar explicitamente preservado`));
req((state.activeBite===null && state.activeBiteStatus==='NONE') || (state.activeBite==='SO-018 | Design System & Token Governance' && state.activeBiteStatus==='ACTIVE'),'SO-017 closeout deve permanecer terminal ou permitir sucessor SO-018 explicitamente ativo');
req(state.lastBite==='SO-017 | Application Shell & Shared UI Armor COMPLETE' || (state.activeBite==='SO-018 | Design System & Token Governance' && state.lastBite==='SO-018 | Design System & Token Governance Audit'),'current-state perdeu o marco de SO-017 COMPLETE ou o inicio auditado da SO-018');
req(state.nextBite==='SO-018 | Design System & Token Governance Audit' || (state.activeBite==='SO-018 | Design System & Token Governance' && state.nextBite==='SO-018 | Legacy Token Compatibility Boundary'),'sequencia canonica perdeu SO-018 audit-first ou sua primeira mordida provada');
req(audit.nextBite?.id==='SO-018' && audit.nextBite?.mode==='audit-first','audit nao aponta SO-018 audit-first');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State deixou de estar selado');

if(errors.length){console.error('\nSO-017 APPLICATION SHELL & SHARED UI CLOSEOUT: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1)}
console.log('PASS SO-017 Closeout: SHELL-001..003 are resolved, SHELL-004..005 are intentionally preserved, zero findings remain open, SO-017 is COMPLETE, and GOLDEN-STATE-v1 remains sealed.');
