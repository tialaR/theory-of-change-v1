#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), errors=[]; const read=r=>fs.readFileSync(path.join(root,r),'utf8'); const json=r=>JSON.parse(read(r)); const req=(x,m)=>{if(!x)errors.push(m)};
const audit=json('docs/sharkops/SO-018-DESIGN-SYSTEM-TOKEN-GOVERNANCE-AUDIT.json'); const ledger=json('.sharkops/state/bite-ledger.json'); const state=json('.sharkops/state/current-state.json');
const so17=(ledger.bites??[]).find(b=>b.id==='SO-017'); const so18=(ledger.bites??[]).find(b=>b.id==='SO-018');
req(((so18?.revision??0)===1 && audit.mode==='audit-only') || ((so18?.revision??0)>1),'Wave 01 deve permanecer audit-only na revisao 1 e permitir progressao explicitamente versionada'); req(audit.runtimeChanges===false,'governanca SO-018 nao deve declarar runtime changes nesta fase');
req(so17?.status==='COMPLETE','SO-017 deve permanecer COMPLETE');
req((so18?.status==='ACTIVE' && (so18?.revision??0)>=1) || (so18?.status==='COMPLETE' && (so18?.revision??0)>=5),'SO-018 deve permanecer ACTIVE durante as waves ou COMPLETE no closeout');
req((so18?.status==='ACTIVE' && state.activeBite==='SO-018 | Design System & Token Governance' && state.activeBiteStatus==='ACTIVE') || (so18?.status==='COMPLETE' && state.activeBite===null && state.lastBite==='SO-018 | Design System & Token Governance COMPLETE'),'current-state perdeu ownership canonico SO-018');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State deixou de estar selado');
req(fs.existsSync(path.join(root,'src/shared/styles/tdm/tdm-tokens.sass')),'agregador canonico tdm-tokens ausente');
req(fs.existsSync(path.join(root,'src/shared/styles/tokens.sass')),'compatibilidade legacy tokens.sass ausente na auditoria');
const globals=read('src/app/globals.sass'); req(globals.includes("@use '../shared/styles/tdm/tdm-tokens'") && globals.includes("@use '../shared/styles/tokens' as *"),'globals deve preservar o consumidor legacy inventariado ate migracao explicita posterior');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=path.join(d,e.name); return e.isDirectory()?walk(f):[f]})}
const source=walk(path.join(root,'src')).filter(f=>/\.(sass|ts|tsx)$/.test(f));
const legacyConsumers=source.filter(f=>/shared\/styles\/tokens|styles\/tokens/.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(root,f));
req((so18?.revision??0)===1 ? legacyConsumers.length===39 : legacyConsumers.length<=39,`consumidores legacy nao podem crescer alem do baseline 39: encontrado ${legacyConsumers.length}`);
const f=(audit.findings??[]).find(x=>x.id==='DS-001'); req((so18?.revision??0)===1 ? f?.status==='OPEN' : String(f?.status).startsWith('RESOLVED-'),'DS-001 deve estar OPEN na auditoria e resolvido apos a Wave 01'); req((so18?.revision??0)===1 ? audit.nextBite?.targetFinding==='DS-001' : true,'menor proxima mordida da auditoria deve atacar DS-001');
if(errors.length){console.error('\nSO-018 DESIGN SYSTEM & TOKEN GOVERNANCE WAVE 01: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1)}
console.log('PASS SO-018 Wave 01: canonical TDM tokens and the 39-consumer legacy Sass compatibility layer are inventoried audit-only, DS-001 is frozen as the smallest next bite, and prior Golden State armor remains sealed.');
