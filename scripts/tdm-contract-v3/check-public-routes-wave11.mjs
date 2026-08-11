#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const exists=(p)=>fs.existsSync(path.join(root,p));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));

for(const f of [
  'scripts/playwright/run-public-routes-e2e.mjs',
  'src/features/theory-of-change/public-routes.e2e.ts',
  'docs/sharkops/SO-015-PUBLIC-ROUTE-CLOSEOUT-MATRIX.json',
  'docs/sharkops/SO-015-WAVE-11-PUBLIC-E2E-HARNESS-REGRESSION-ARMOR.md',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-11/MANIFEST.json'
]) if(!exists(f)) errors.push('artefato obrigatorio ausente: '+f);

const pkg=json('package.json');
if(pkg.scripts?.['test:e2e:public-routes']!=='node scripts/playwright/run-public-routes-e2e.mjs') errors.push('script público E2E não aponta para runner oficial');
if(pkg.scripts?.['check:tdm:public-routes:wave11']!=='node scripts/tdm-contract-v3/check-public-routes-wave11.mjs') errors.push('gate Wave 11 ausente');

const runner=read('scripts/playwright/run-public-routes-e2e.mjs');
for(const token of ['chromium.executablePath()','TDM_PLAYWRIGHT_EXECUTABLE_PATH','/usr/bin/chromium','Google Chrome.app']) if(!runner.includes(token)) errors.push('runner público sem preflight esperado: '+token);
for(const test of ['public-routes.e2e.ts','login.e2e.ts','tdm-status-screen.e2e.ts']) if(!runner.includes(test)) errors.push('runner público não cobre: '+test);

const config=read('playwright.config.ts');
if(!config.includes('TDM_PLAYWRIGHT_EXECUTABLE_PATH')||!config.includes('launchOptions: { executablePath }')) errors.push('Playwright config não injeta navegador de sistema via launchOptions.executablePath');
if(/use:\s*\{[\s\S]*?\bexecutablePath\s*[,}]/m.test(config) && !config.includes('launchOptions: { executablePath }')) errors.push('executablePath não pode ficar solto em project.use; use launchOptions');

const e2e=read('src/features/theory-of-change/public-routes.e2e.ts');
const inventory=json('docs/sharkops/SO-015-ROUTE-INVENTORY.json');
const publicRoutes=inventory.routePages.filter((r)=>['PUBLIC','PUBLIC_AUTH','PUBLIC_INTERACTIVE'].includes(r.class)).map((r)=>r.route);
for(const route of publicRoutes) if(!e2e.includes(`'${route}'`)) errors.push('E2E público não cobre rota inventariada: '+route);
if(!e2e.includes("'/canvas-legado'")) errors.push('E2E público não protege aposentadoria de /canvas-legado');

const matrix=json('docs/sharkops/SO-015-PUBLIC-ROUTE-CLOSEOUT-MATRIX.json');
if(matrix.revision!==11||matrix.closeoutReady!==true) errors.push('matriz deve estar revision 11 e closeoutReady');
const publicBehavior=matrix.behaviorGates?.publicRoutes;
if(publicBehavior?.script!=='test:e2e:public-routes'||publicBehavior?.status!=='ARMORED'||publicBehavior?.closeoutBlocking!==false) errors.push('matriz não registra E2E público como ARMORED');

const policy=json('.sharkops/policy/gates.json');
const prePush=policy.profiles?.['bootstrap-recovery']?.mandatory?.['pre-push']||[];
if(!prePush.includes('test:e2e:public-routes')) errors.push('E2E público não é obrigatório no pre-push SharkOps');
if(policy.classifications?.['test:e2e:public-routes']!=='MANDATORY_PRE_PUSH') errors.push('classificação SharkOps do E2E público inválida');

const active=read('scripts/tdm-contract-v3/check-public-routes-active.mjs');
if(!active.includes('./check-public-routes-wave11.mjs')) errors.push('gate ativo não aponta para Wave 11');
if(exists('src/app/canvas-legado/page.tsx')||exists('src/app/canvas-legado/layout.tsx')) errors.push('/canvas-legado reapareceu');

const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json');
const so015=ledger.bites.find((b)=>b.id==='SO-015');
if(!so015||so015.status!=='ACTIVE'||so015.revision<11) errors.push('SO-015 deve permanecer ACTIVE na revision 11 ou progressao autorizada');
if(so015?.revision===11&&state.lastBite!=='SO-015 | Public E2E Harness & Regression Armor') errors.push('current-state não aponta para Wave 11');
if(state.goldenStateStatus!=='COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');

if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 11: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1);}
console.log('PASS SO-015 Public Routes Wave 11: public-route behavior is protected by an environment-safe Playwright harness with system-browser fallback, route exposure and retired legacy behavior are covered, pre-push enforcement is mandatory, and the Canvas Golden State stays sealed.');
