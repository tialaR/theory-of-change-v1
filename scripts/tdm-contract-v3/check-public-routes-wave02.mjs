#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const required=[
  'src/features/theory-of-change/public-routes.ts',
  'src/features/theory-of-change/components/public-pages/example-result-interactive-page.tsx',
  'src/features/theory-of-change/components/public-pages/example-flow-interactive-page.tsx',
  'docs/sharkops/SO-015-WAVE-02-PUBLIC-ROUTES-BOUNDARY-COMPOSITION.md',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-02/MANIFEST.json'
];
for(const rel of required) if(!exists(rel)) errors.push('artefato obrigatorio ausente: '+rel);

const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so15=ledger.bites.find(b=>b.id==='SO-015');
const predecessors=ledger.bites.filter(b=>/^SO-0(0[1-9]|1[0-4])$/.test(b.id));
if(predecessors.length!==14||predecessors.some(b=>b.status!=='COMPLETE')) errors.push('SO-001 a SO-014 devem permanecer COMPLETE');
if(!so15||so15.status!=='ACTIVE'||so15.revision<2) errors.push('SO-015 deve permanecer ACTIVE a partir da revisao 2');
if(so15?.revision===2 && so15?.path!=='.sharkops/bites/so-015-public-routes-application-surface-armor-wave-02') errors.push('ledger da revisao 2 nao aponta para manifest da Wave 02');
if(state.activeBite!=='SO-015 | Public Routes & Application Surface Armor') errors.push('current-state perdeu a iniciativa SO-015 ativa');
if(so15?.revision===2 && state.lastBite!=='SO-015 | Public Routes Boundary & Composition') errors.push('current-state da revisao 2 nao aponta para Wave 02');
if(state.goldenStateStatus!=='COMPLETE'||state.goldenStateId!=='GOLDEN-STATE-v1') errors.push('Golden State do Canvas deve permanecer preservado');
if(pkg.scripts?.['check:tdm:public-routes:wave02']!=='node scripts/tdm-contract-v3/check-public-routes-wave02.mjs') errors.push('npm script da Wave 02 ausente/invalido');

const facade='@/features/theory-of-change/public-routes';
const routeFiles=[
  'src/app/page.tsx',
  'src/app/exemplos/page.tsx',
  'src/app/exemplos/resultado/page.tsx',
  'src/app/exemplos/resultado/interativo/page.tsx',
  'src/app/exemplos/visao-do-fluxo/page.tsx',
  'src/app/exemplos/visao-do-fluxo/interativo/page.tsx',
  'src/app/guia-de-aprendizado/page.tsx',
  'src/app/referencias/page.tsx'
];
for(const rel of routeFiles){
  const source=read(rel);
  if(!source.includes(facade)) errors.push(rel+' deve compor a feature somente pela facade public-routes');
  const featureImports=[...source.matchAll(/from\s+['\"](@\/features\/theory-of-change\/[^'\"]+)['\"]/g)].map(m=>m[1]);
  for(const imp of featureImports) if(imp!==facade) errors.push(rel+' possui deep import proibido: '+imp);
}

const locked=[
  ['src/app/canvas/page.tsx', "@/features/theory-of-change/canvas"],
  ['src/app/canvas/resultado/page.tsx', "@/features/theory-of-change/canvas"],
  ...(fs.existsSync(path.join(root, 'src/app/canvas-legado/page.tsx')) ? [['src/app/canvas-legado/page.tsx', "@/features/theory-of-change"]] : []),
  ['src/app/login/page.tsx', "@/features/auth"]
];
for(const [rel,expected] of locked){
  const source=read(rel);
  if(!source.includes(expected)) errors.push(rel+' teve sua fronteira alterada fora do escopo da Wave 02');
  if(source.includes(facade)) errors.push(rel+' nao pertence a facade publica da SO-015 Wave 02');
}

const facadeSource=read('src/features/theory-of-change/public-routes.ts');
for(const symbol of ['HomePage','ExamplesPage','FlowPage','ResultPage','ReferencesPage','GuideExperiencePage','ExampleResultInteractivePage','ExampleFlowInteractivePage']){
  if(!facadeSource.includes(symbol)) errors.push('facade public-routes nao exporta '+symbol);
}

const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-015 Public Routes & Application Surface Armor — Wave 02')) errors.push('HANDOFF nao registra SO-015 Wave 02');

if(errors.length){
  console.error('\nSO-015 PUBLIC ROUTES WAVE 02: FAIL\n');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
  process.exit(1);
}
console.log('PASS SO-015 Public Routes Wave 02: public App Router composition now crosses the theory-of-change feature through one deliberate public-routes facade while Canvas, auth and legacy boundaries remain unchanged.');
