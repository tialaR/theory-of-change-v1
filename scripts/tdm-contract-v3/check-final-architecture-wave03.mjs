#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const canvasRoot=path.join(root,'src/features/theory-of-change/canvas');
const layers=['domain','application','engine','react-flow','infrastructure','server','ui'];
const forbiddenByLayer={
  domain:new Set(['application','engine','react-flow','infrastructure','server','ui']),
  engine:new Set(['application','react-flow','infrastructure','server','ui']),
  application:new Set(['react-flow','infrastructure','server','ui']),
  'react-flow':new Set(['application','engine','infrastructure','server','ui']),
  infrastructure:new Set(['application','engine','react-flow','server','ui']),
  server:new Set(['engine','react-flow','ui']),
  ui:new Set(),
};
const frameworkNeutral=new Set(['domain','engine','application']);
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{
    const absolute=path.join(dir,entry.name);
    if(entry.isDirectory()) return walk(absolute);
    if(!/\.(ts|tsx)$/.test(entry.name)) return [];
    if(/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) return [];
    return [absolute];
  });
}
function resolveCanvasTarget(file,spec){
  let absolute=null;
  if(spec.startsWith('.')) absolute=path.resolve(path.dirname(file),spec);
  else if(spec.startsWith('@/')) absolute=path.join(root,'src',spec.slice(2));
  if(!absolute) return null;
  const relative=path.relative(canvasRoot,absolute).split(path.sep);
  return layers.includes(relative[0])?relative[0]:null;
}
const importPattern=/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g;
for(const layer of layers){
  const dir=path.join(canvasRoot,layer);
  if(!fs.existsSync(dir)){ errors.push(`owner ausente: ${path.relative(root,dir)}`); continue; }
  for(const file of walk(dir)){
    const source=fs.readFileSync(file,'utf8');
    let match;
    while((match=importPattern.exec(source))){
      const spec=match[1];
      const target=resolveCanvasTarget(file,spec);
      if(target && forbiddenByLayer[layer].has(target)) errors.push(`direcao proibida ${layer} -> ${target}: ${path.relative(root,file)} importa ${spec}`);
      if(frameworkNeutral.has(layer) && (/^(react(?:\/|$)|next(?:\/|$)|@xyflow\/react(?:\/|$))/.test(spec))) errors.push(`framework vazou para ${layer}: ${path.relative(root,file)} importa ${spec}`);
    }
  }
}
const predecessor='scripts/tdm-contract-v3/check-final-architecture-wave02.mjs';
const result=spawnSync(process.execPath,[predecessor],{cwd:root,encoding:'utf8'});
if(result.status!==0){ process.stdout.write(result.stdout||''); process.stderr.write(result.stderr||''); errors.push('gate predecessor Wave 02 falhou'); }
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const so14=(ledger.bites??[]).find((bite)=>bite.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||Number(so14.revision)<3) errors.push('SO-014 nao esta ACTIVE revision >= 3');
const exactWave03=so14?.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-03' && state.lastBite==='SO-014 | Dependency Direction Verification' && state.nextBite==='SO-014 | Public API & Contract Verification';
const registeredDownstream=Boolean(so14 && Number(so14.revision)>=4 && typeof so14.path==='string' && so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-') && state.activeBite==='SO-014 | Final Architecture Closeout' && state.activeBiteStatus==='ACTIVE' && typeof state.lastBite==='string' && state.lastBite.startsWith('SO-014 | ') && typeof state.nextBite==='string' && state.nextBite.startsWith('SO-014 | '));
if(!exactWave03&&!registeredDownstream) errors.push('Current State perdeu a Wave 03 ou uma progressao SO-014 downstream registrada');
if(!pkg.scripts?.['check:tdm:final-architecture:wave03']) errors.push('script npm da Wave 03 ausente');
for(const rel of ['docs/sharkops/SO-014-WAVE-03-DEPENDENCY-DIRECTION-VERIFICATION.md','.sharkops/bites/so-014-final-architecture-closeout-wave-03/MANIFEST.json']) if(!fs.existsSync(path.join(root,rel))) errors.push(`artefato Wave 03 ausente: ${rel}`);
if(errors.length){ console.error('\nSO-014 DEPENDENCY DIRECTION VERIFICATION: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1); }
console.log('PASS SO-014 Final Architecture Wave 03: runtime dependency direction is sealed across Domain, Application, Engine, React Flow, Infrastructure, Server and UI without runtime changes.');
