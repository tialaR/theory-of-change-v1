#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const exists=(p)=>fs.existsSync(path.join(root,p));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
for(const f of ['docs/sharkops/SO-015-WAVE-09-LEGACY-ROUTE-PUBLIC-EXPOSURE-DECISION.md','docs/sharkops/SO-015-LEGACY-ROUTE-LIFECYCLE.json','.sharkops/bites/so-015-public-routes-application-surface-armor-wave-09/MANIFEST.json']) if(!exists(f)) errors.push('artefato obrigatorio ausente: '+f);
for(const f of ['src/app/canvas-legado/page.tsx','src/app/canvas-legado/layout.tsx']) if(exists(f)) errors.push('rota legada reapareceu: '+f);
const lifecycle=json('docs/sharkops/SO-015-LEGACY-ROUTE-LIFECYCLE.json');
if(lifecycle.decision!=='RETIRED') errors.push('decisao de lifecycle nao e RETIRED');
for(const k of ['routeMustRemainAbsent','silentReintroductionForbidden','historicalDocumentationMayRemain','reintroductionRequiresNewExplicitSharkOpsInitiative','canvasGoldenStateRemainsSealed']) if(lifecycle.rules?.[k]!==true) errors.push('regra de lifecycle ausente: '+k);
const inventory=json('docs/sharkops/SO-015-ROUTE-INVENTORY.json'); const legacy=inventory.routePages.find(r=>r.route==='/canvas-legado');
if(!legacy||legacy.class!=='RETIRED'||legacy.risk!=='NONE') errors.push('inventario nao registra /canvas-legado como RETIRED/NONE');
const contract=json('.tdm/contract-v3.json'); if(contract.canvasTarget?.legacyRoute!==null||contract.canvasTarget?.retiredLegacyRoute!=='/canvas-legado') errors.push('contrato TDM nao registra aposentadoria da rota legada');
if(contract.protectedVisualPatterns?.includes('src/app/canvas-legado/**')) errors.push('rota aposentada continua como visual protegido vivo');
const cursor=read('.cursor/rules/tdm-canvas-lockdown.mdc'); if(!cursor.includes('/canvas-legado` was explicitly retired by SO-015 Wave 09')) errors.push('lockdown nao protege contra ressurreicao silenciosa');
for(const base of ['src','tests','e2e']) if(exists(base)) { const stack=[path.join(root,base)]; while(stack.length){const p=stack.pop(); const st=fs.statSync(p); if(st.isDirectory()){for(const n of fs.readdirSync(p)) stack.push(path.join(p,n));} else if(/\.(ts|tsx|js|jsx|mjs|json)$/.test(p) && read(path.relative(root,p)).includes('/canvas-legado')) errors.push('consumer runtime/teste da rota aposentada: '+path.relative(root,p)); }}
const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json'), so015=ledger.bites.find(b=>b.id==='SO-015'); if(!so015||so015.status!=='ACTIVE'||so015.revision<9) errors.push('SO-015 deve estar ACTIVE na revisao 9 ou progressao autorizada'); const active=read('scripts/tdm-contract-v3/check-public-routes-active.mjs'); if(so015?.revision===9&&!active.includes('./check-public-routes-wave09.mjs')) errors.push('gate ativo nao aponta para Wave 09 no estado exato da Wave 09'); if(so015?.revision>9&&!/check-public-routes-wave(10|1[1-9]|[2-9][0-9])\.mjs/.test(active)) errors.push('gate ativo nao aponta para progressao SO-015 posterior autorizada'); if(so015?.revision===9&&state.lastBite!=='SO-015 | Legacy Route & Public Exposure Decision') errors.push('current-state nao aponta para Wave 09'); if(state.goldenStateStatus!=='COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 09: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);} console.log('PASS SO-015 Public Routes Wave 09: /canvas-legado is explicitly retired after repository-wide consumer proof, silent reintroduction is blocked by executable contracts, historical records remain truthful, and the Canvas Golden State stays sealed.');
