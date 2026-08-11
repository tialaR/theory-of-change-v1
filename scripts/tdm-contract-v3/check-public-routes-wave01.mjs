#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const required=[
  'docs/sharkops/SO-015-ROUTE-INVENTORY.json',
  'docs/sharkops/SO-015-WAVE-01-ROUTE-INVENTORY-RISK-MAP.md',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-01/MANIFEST.json',
  '.sharkops/snapshots/golden-state-v1/MANIFEST.json',
  'docs/sharkops/GOLDEN-STATE-SNAPSHOT.json'
];
for(const rel of required) if(!exists(rel)) errors.push('artefato obrigatorio ausente: '+rel);

const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const inventory=json('docs/sharkops/SO-015-ROUTE-INVENTORY.json');
const pkg=json('package.json');
const so15=ledger.bites.find(b=>b.id==='SO-015');
const predecessors=ledger.bites.filter(b=>/^SO-0(0[1-9]|1[0-4])$/.test(b.id));
if(predecessors.length!==14||predecessors.some(b=>b.status!=='COMPLETE')) errors.push('SO-001 a SO-014 devem permanecer COMPLETE');
if(!so15||so15.status!=='ACTIVE'||so15.revision<1) errors.push('SO-015 deve permanecer ACTIVE a partir da revisao 1');
if(state.activeBite!=='SO-015 | Public Routes & Application Surface Armor'||state.activeBiteStatus!=='ACTIVE') errors.push('current-state nao aponta para SO-015 ACTIVE');
if(so15?.revision===1 && state.lastBite!=='SO-015 | Route Inventory & Risk Map') errors.push('revision 1 deve apontar para Route Inventory & Risk Map');
if(state.goldenStateStatus!=='COMPLETE'||state.goldenStateId!=='GOLDEN-STATE-v1') errors.push('Golden State do Canvas deve permanecer preservado');
if(pkg.scripts?.['check:tdm:public-routes:wave01']!=='node scripts/tdm-contract-v3/check-public-routes-wave01.mjs') errors.push('npm script da Wave 01 ausente/invalido');

function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(full));
    else if(ent.name==='page.tsx') out.push(path.relative(root,full).split(path.sep).join('/'));
  }
  return out;
}
const actual=walk(path.join(root,'src/app')).sort();
const declared=inventory.routePages.filter(x=>x.class!=='RETIRED').map(x=>x.file).sort();
if(JSON.stringify(actual)!==JSON.stringify(declared)){
  const missing=actual.filter(x=>!declared.includes(x));
  const stale=declared.filter(x=>!actual.includes(x));
  if(missing.length) errors.push('rotas nao inventariadas: '+missing.join(', '));
  if(stale.length) errors.push('rotas inventariadas ausentes: '+stale.join(', '));
}
const routeMap=new Map(inventory.routePages.map(x=>[x.route,x]));
for(const route of ['/', '/login','/exemplos','/exemplos/resultado','/exemplos/resultado/interativo','/exemplos/visao-do-fluxo','/exemplos/visao-do-fluxo/interativo','/guia-de-aprendizado','/referencias','/canvas','/canvas/resultado','/canvas-legado']) if(!routeMap.has(route)) errors.push('rota canonica ausente do inventario: '+route);
if(routeMap.get('/canvas')?.class!=='PROTECTED_GOLDEN'||routeMap.get('/canvas/resultado')?.class!=='PROTECTED_GOLDEN') errors.push('rotas Canvas devem permanecer classificadas como PROTECTED_GOLDEN');
{ const legacy=routeMap.get('/canvas-legado'); const validLegacy=legacy?.class==='LEGACY'&&legacy?.risk==='HIGH'; const validRetired=legacy?.class==='RETIRED'&&legacy?.risk==='NONE'; if(!validLegacy&&!validRetired) errors.push('/canvas-legado deve permanecer LEGACY/HIGH ate decisao comprovada ou RETIRED/NONE apos lifecycle gate'); }
if(inventory.runtimeChanges!==false||inventory.goldenStateBaseline!=='GOLDEN-STATE-v1') errors.push('inventario deve ser audit-only sobre GOLDEN-STATE-v1');
const findings=new Set(inventory.findings.map(x=>x.id));
for(const id of ['PR-001','PR-002','PR-003','PR-004','PR-005']) if(!findings.has(id)) errors.push('finding obrigatorio ausente: '+id);
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-015 Public Routes & Application Surface Armor — Wave 01')||!handoff.includes('SO-015-ROUTE-INVENTORY.json')) errors.push('HANDOFF nao registra SO-015 Wave 01');

if(errors.length){
 console.error('\nSO-015 PUBLIC ROUTES WAVE 01: FAIL\n');
 errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
 process.exit(1);
}
console.log('PASS SO-015 Public Routes Wave 01: all App Router page entrypoints are inventoried and risk-classified, SO-001 through SO-014 remain COMPLETE, and the Canvas Golden State stays sealed without runtime changes.');
