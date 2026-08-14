#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const exists=(p)=>fs.existsSync(path.join(root,p));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const required=[
  'docs/sharkops/SO-015-PUBLIC-ROUTE-CLOSEOUT-MATRIX.json',
  'docs/sharkops/SO-015-WAVE-10-PUBLIC-ROUTE-REGRESSION-CLOSEOUT-MATRIX.md',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-10/MANIFEST.json'
];
for(const f of required) if(!exists(f)) errors.push('artefato obrigatorio ausente: '+f);
const matrix=json('docs/sharkops/SO-015-PUBLIC-ROUTE-CLOSEOUT-MATRIX.json');
if(matrix.initiative!=='SO-015'||matrix.revision<10) errors.push('matriz de closeout nao preserva SO-015 revision 10 ou progressao autorizada');
const downstream = matrix.revision > 10;
if(!downstream && matrix.closeoutReady!==false) errors.push('SO-015 nao pode ser marcado closeoutReady antes do E2E publico');
const pkg=json('package.json');
const gates=[...(matrix.architectureGates||[]),...(matrix.repositoryQualityGates||[])];
const seen=new Set();
for(const gate of gates){
  if(seen.has(gate)) errors.push('gate duplicado na matriz: '+gate); seen.add(gate);
  if(!pkg.scripts?.[gate]) errors.push('gate da matriz nao aponta para npm script vivo: '+gate);
}
for(const gate of ['check:tdm:public-routes:wave01','check:tdm:public-routes:wave09','check:tdm:public-routes:wave10','check:tdm:public-routes:active','shark:verify','check:tdm:golden-state']) if(!seen.has(gate)) errors.push('gate estrutural ausente da matriz: '+gate);
const publicE2e=matrix.behaviorGates?.publicRoutes;
if(!downstream){
  if(publicE2e?.status!=='HARNESS_GAP'||publicE2e?.closeoutBlocking!==true) errors.push('lacuna de E2E publico deve permanecer explicita e bloqueante na revision 10');
  if(publicE2e?.currentScript!=='test:e2e'||!pkg.scripts?.['test:e2e']) errors.push('matriz nao registra o test:e2e atual');
}else{
  if(publicE2e?.status!=='ARMORED'||publicE2e?.script!=='test:e2e:public-routes'||publicE2e?.closeoutBlocking!==false) errors.push('progressao downstream deve preservar a resolucao do E2E publico');
}
const runner=read('scripts/playwright/run-canvas-e2e.mjs');
if(!runner.includes("TDM_PLAYWRIGHT_BROWSER = 'system-chrome'")||!runner.includes('chromium.executablePath()')) errors.push('evidencia do fallback system Chrome do Canvas nao esta presente');
const config=read('playwright.config.ts');
if(!config.includes("process.env.TDM_PLAYWRIGHT_BROWSER === 'system-chrome'")) errors.push('Playwright config nao reconhece system-chrome');
if(exists('src/app/canvas-legado/page.tsx')||exists('src/app/canvas-legado/layout.tsx')) errors.push('/canvas-legado reapareceu antes do closeout');
const rules=matrix.rules||{};
for(const k of ['canvasGoldenStateMustRemainSealed','legacyCanvasRouteMustRemainRetired','activePublicRouteArchitectureGateMustRemainMandatory','closeoutCannotIgnoreKnownHarnessGap','toolingFailureMustNotBeMisreportedAsProductFailure','productFailureMustNotBeHiddenAsToolingFailure']) if(rules[k]!==true) errors.push('regra da matriz ausente: '+k);
const active=read('scripts/tdm-contract-v3/check-public-routes-active.mjs');
if(!downstream && !active.includes('./check-public-routes-wave10.mjs')) errors.push('gate ativo nao aponta para Wave 10');
if(downstream && !active.includes('./check-public-routes-wave11.mjs')) errors.push('gate ativo nao acompanha progressao autorizada');
const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json');
const so015=ledger.bites.find(b=>b.id==='SO-015');
if(!so015||so015.status!=='ACTIVE'||so015.revision<10) errors.push('SO-015 deve permanecer ACTIVE na revision 10 ou progressao autorizada');
if(so015?.revision===10&&state.lastBite!=='SO-015 | Public Route Regression & Closeout Matrix') errors.push('current-state nao aponta para Wave 10');
if(state.goldenStateStatus!=='COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 10: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);}
console.log('PASS SO-015 Public Routes Wave 10: the public-route closeout matrix is consolidated, all registered gates resolve to live repository scripts, the known public E2E browser-harness gap remains explicit and closeout-blocking, and the Canvas Golden State stays sealed without runtime changes.');
