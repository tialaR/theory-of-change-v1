#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const canvasRoot=path.join(root,'src/features/theory-of-change/canvas');
const productionExt=/\.(ts|tsx)$/;
const testExt=/\.(test|spec|e2e)\.(ts|tsx)$/;
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{
    const absolute=path.join(dir,entry.name);
    if(entry.isDirectory()) return walk(absolute);
    return productionExt.test(entry.name)&&!testExt.test(entry.name)?[absolute]:[];
  });
}
const importPattern=/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g;
const coreLayers=['domain','application','engine'];
for(const layer of coreLayers){
  for(const file of walk(path.join(canvasRoot,layer))){
    const source=fs.readFileSync(file,'utf8');
    let match;
    while((match=importPattern.exec(source))){
      const spec=match[1];
      if(/^(next(?:\/|$)|next-intl(?:\/|$)|@xyflow\/react(?:\/|$)|msw(?:\/|$)|node:)/.test(spec)) errors.push(`runtime/framework import vazou para ${layer}: ${path.relative(root,file)} -> ${spec}`);
    }
    if(/\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source)) errors.push(`browser global vazou para ${layer}: ${path.relative(root,file)}`);
  }
}
for(const file of walk(path.join(canvasRoot,'server'))){
  const source=fs.readFileSync(file,'utf8');
  let match;
  while((match=importPattern.exec(source))){
    const spec=match[1];
    if(/@xyflow\/react/.test(spec)||/^react(?:\/|$)/.test(spec)||/infrastructure\/msw/.test(spec)) errors.push(`server runtime boundary violada: ${path.relative(root,file)} -> ${spec}`);
  }
  if(/\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source)) errors.push(`browser global vazou para server: ${path.relative(root,file)}`);
}
for(const file of walk(path.join(canvasRoot,'infrastructure'))){
  const source=fs.readFileSync(file,'utf8');
  let match;
  while((match=importPattern.exec(source))){
    const spec=match[1];
    if(/^(next(?:\/|$)|next-intl(?:\/|$)|@xyflow\/react(?:\/|$)|react(?:\/|$))/.test(spec)) errors.push(`framework/server import vazou para infrastructure: ${path.relative(root,file)} -> ${spec}`);
  }
  if(/\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source)) errors.push(`browser global vazou para infrastructure: ${path.relative(root,file)}`);
}
const serverRepo='src/features/theory-of-change/canvas/server/canvas-server.repository.ts';
const neutralStore='src/features/theory-of-change/canvas/infrastructure/memory/canvas-project.mock-store.ts';
const mswStore='src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.mock-store.ts';
if(fs.existsSync(path.join(root,mswStore))) errors.push('store compartilhado reapareceu dentro de infrastructure/msw');
if(!fs.existsSync(path.join(root,neutralStore))) errors.push('store in-memory neutro ausente');
if(fs.existsSync(path.join(root,serverRepo))&&!fs.readFileSync(path.join(root,serverRepo),'utf8').includes('../infrastructure/memory/canvas-project.mock-store')) errors.push('server repository deixou de usar infrastructure/memory neutra');
const predecessor=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave04.mjs'],{cwd:root,encoding:'utf8'});
if(predecessor.status!==0){process.stdout.write(predecessor.stdout||'');process.stderr.write(predecessor.stderr||'');errors.push('gate predecessor Wave 04 falhou');}
const infra=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-infrastructure-cleanup-closeout.mjs'],{cwd:root,encoding:'utf8'});
if(infra.status!==0){process.stdout.write(infra.stdout||'');process.stderr.write(infra.stderr||'');errors.push('SO-013 Infrastructure Cleanup closeout falhou');}
const readJson=(r)=>JSON.parse(fs.readFileSync(path.join(root,r),'utf8'));
const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const so14=ledger.bites.find(x=>x.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||so14.revision<5) errors.push('SO-014 Wave 05 state/ledger invalido');
const exactWave05=so14.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-05'&&state.lastBite==='SO-014 | Runtime / Infrastructure Separation Verification'&&state.nextBite==='SO-014 | Dead Path & Legacy Residue Verification';
const registeredDownstream=Boolean(so14.revision>=6&&typeof so14.path==='string'&&so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')&&state.activeBite==='SO-014 | Final Architecture Closeout'&&state.activeBiteStatus==='ACTIVE'&&typeof state.lastBite==='string'&&state.lastBite.startsWith('SO-014 | ')&&typeof state.nextBite==='string'&&state.nextBite.startsWith('SO-014 | '));
if(!exactWave05&&!registeredDownstream) errors.push('Current State perdeu a Wave 05 ou uma progressao SO-014 downstream registrada');
if(!pkg.scripts?.['check:tdm:final-architecture:wave05']) errors.push('npm script Wave 05 ausente');
const handoff=fs.readFileSync(path.join(root,'docs/sharkops/HANDOFF.md'),'utf8');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 05')) errors.push('HANDOFF Wave 05 ausente');
for(const rel of ['docs/sharkops/SO-014-WAVE-05-RUNTIME-INFRASTRUCTURE-SEPARATION-VERIFICATION.md','.sharkops/bites/so-014-final-architecture-closeout-wave-05/MANIFEST.json']) if(!fs.existsSync(path.join(root,rel))) errors.push(`artefato Wave 05 ausente: ${rel}`);
if(errors.length){console.error('\nSO-014 RUNTIME / INFRASTRUCTURE SEPARATION VERIFICATION: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1);}
console.log('PASS SO-014 Final Architecture Wave 05: runtime and infrastructure separation remains sealed across core, adapters, server and UI/browser boundaries without runtime changes.');
