#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const read=(r)=>fs.readFileSync(path.join(root,r),'utf8');
const json=(r)=>JSON.parse(read(r));
const exists=(r)=>fs.existsSync(path.join(root,r));
for(const r of ['scripts/tdm-contract-v3/check-public-routes-wave02.mjs','docs/sharkops/SO-015-WAVE-03-PUBLIC-ROUTE-RENDERING-LOADING-POLICY.md','.sharkops/bites/so-015-public-routes-application-surface-armor-wave-03/MANIFEST.json']) if(!exists(r)) errors.push('artefato obrigatorio ausente: '+r);
const routes=['src/app/exemplos/page.tsx','src/app/exemplos/resultado/page.tsx','src/app/exemplos/visao-do-fluxo/page.tsx','src/app/guia-de-aprendizado/page.tsx','src/app/referencias/page.tsx'];
for(const r of routes){const s=read(r); if(s.includes("force-dynamic")) errors.push(r+' ainda forca renderizacao dinamica'); if(s.includes('simulatePublicRouteDelay')) errors.push(r+' ainda simula latencia'); if(/export default async function/.test(s)) errors.push(r+' permanece async sem trabalho assinc real'); if(!s.includes("@/features/theory-of-change/public-routes")) errors.push(r+' perdeu a facade publica da Wave 02');}
if(exists('src/features/theory-of-change/components/public-pages/simulate-public-route-delay.ts')) errors.push('helper de latencia artificial ainda existe');
if(read('src/features/theory-of-change/public-routes.ts').includes('simulatePublicRouteDelay')) errors.push('facade publica ainda expoe latencia artificial');
for(const r of ['src/app/loading.tsx','src/app/exemplos/loading.tsx','src/app/exemplos/resultado/loading.tsx','src/app/exemplos/visao-do-fluxo/loading.tsx','src/app/guia-de-aprendizado/loading.tsx','src/app/referencias/loading.tsx']) if(!exists(r)) errors.push('loading boundary existente foi removida: '+r);
const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json'), pkg=json('package.json');
const old=ledger.bites.filter(b=>/^SO-0(0[1-9]|1[0-4])$/.test(b.id)); if(old.length!==14||old.some(b=>b.status!=='COMPLETE')) errors.push('SO-001 a SO-014 devem permanecer COMPLETE');
const so=ledger.bites.find(b=>b.id==='SO-015'); if(!so||so.status!=='ACTIVE'||so.revision<3) errors.push('SO-015 deve permanecer ACTIVE a partir da revisao 3');
if(state.goldenStateStatus!=='COMPLETE') errors.push('Golden State deve permanecer COMPLETE');
if(so?.revision===3 && state.lastBite!=='SO-015 | Public Route Rendering & Loading Policy') errors.push('current-state invalido para Wave 03');
if(pkg.scripts?.['check:tdm:public-routes:wave03']!=='node scripts/tdm-contract-v3/check-public-routes-wave03.mjs') errors.push('npm script Wave 03 ausente');
for(const r of ['src/app/canvas/page.tsx','src/app/canvas/resultado/page.tsx','src/app/canvas-legado/page.tsx','src/app/login/page.tsx']) if(exists(r) && read(r).includes('simulatePublicRouteDelay')) errors.push(r+' foi contaminada pelo escopo publico');
if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 03: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);}
console.log('PASS SO-015 Public Routes Wave 03: static public content routes no longer force dynamic rendering or artificial server latency, real loading boundaries remain available, and Canvas/auth/legacy boundaries stay sealed.');
