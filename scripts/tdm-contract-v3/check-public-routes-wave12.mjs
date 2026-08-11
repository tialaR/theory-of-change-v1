#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const exists=(p)=>fs.existsSync(path.join(root,p));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
for(const f of [
  'docs/sharkops/SO-015-FINAL-PUBLIC-ROUTES-CLOSEOUT.json',
  'docs/sharkops/SO-015-WAVE-12-FINAL-PUBLIC-ROUTES-CLOSEOUT.md',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-12/MANIFEST.json',
  'scripts/tdm-contract-v3/check-public-routes-wave11.mjs',
  'scripts/playwright/run-public-routes-e2e.mjs',
  'src/features/theory-of-change/public-routes.e2e.ts'
]) if(!exists(f)) errors.push('artefato obrigatorio ausente: '+f);
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so015=ledger.bites.find((b)=>b.id==='SO-015');
if(!so015||so015.status!=='COMPLETE'||so015.revision!==12) errors.push('SO-015 deve estar COMPLETE na revision 12');
if(!so015?.completedAt) errors.push('SO-015 closeout sem completedAt');
if(state.activeBite!==null||state.activeBiteStatus!==null) errors.push('estado terminal nao pode manter bite ativo');
if(state.phase!=='Application Surface Armor Complete') errors.push('fase terminal da SO-015 invalida');
if(state.lastBite!=='SO-015 | Final Public Routes Closeout') errors.push('lastBite terminal invalido');
if(state.goldenStateStatus!=='COMPLETE'||state.goldenStateId!=='GOLDEN-STATE-v1') errors.push('Canvas Golden State deixou de estar selado');
const active=ledger.bites.filter((b)=>b.status==='ACTIVE');
if(active.length!==0) errors.push('ledger terminal nao pode conter bites ACTIVE');
for(const id of Array.from({length:15},(_,i)=>`SO-${String(i+1).padStart(3,'0')}`)){
 const b=ledger.bites.find((x)=>x.id===id); if(!b||b.status!=='COMPLETE') errors.push(id+' deve permanecer COMPLETE');
}
if(exists('src/app/canvas-legado/page.tsx')||exists('src/app/canvas-legado/layout.tsx')) errors.push('/canvas-legado reapareceu');
const policy=json('.sharkops/policy/gates.json');
const preCommit=policy.profiles?.['bootstrap-recovery']?.mandatory?.['pre-commit']||[];
const prePush=policy.profiles?.['bootstrap-recovery']?.mandatory?.['pre-push']||[];
if(!preCommit.includes('check:tdm:public-routes:active')) errors.push('gate publico ativo deixou pre-commit');
if(!prePush.includes('check:tdm:public-routes:active')) errors.push('gate publico ativo deixou pre-push');
if(!prePush.includes('test:e2e:public-routes')) errors.push('E2E publico deixou de ser mandatory pre-push');
const activeGate=read('scripts/tdm-contract-v3/check-public-routes-active.mjs');
if(!activeGate.includes('./check-public-routes-wave12.mjs')) errors.push('gate publico permanente nao aponta para Wave 12 terminal');
const closeout=json('docs/sharkops/SO-015-FINAL-PUBLIC-ROUTES-CLOSEOUT.json');
if(closeout.status!=='COMPLETE'||closeout.revision!==12||closeout.publicE2E!=='ARMORED') errors.push('closeout final invalido');
if(errors.length){console.error('\nSO-015 FINAL PUBLIC ROUTES CLOSEOUT: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1);}
console.log('PASS SO-015 Final Public Routes Closeout: SO-015 is COMPLETE, zero bites are active, public-route architecture and E2E armor remain mandatory, /canvas-legado stays retired, and the Canvas Golden State remains sealed.');
