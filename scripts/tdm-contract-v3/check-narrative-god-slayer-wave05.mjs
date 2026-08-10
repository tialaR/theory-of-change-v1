import fs from 'node:fs';
import path from 'node:path';
const repo=process.cwd();
const base='src/features/theory-of-change/components/result-view/result-theory-narrative';
const mapperPath=path.join(repo,base,'theory-narrative.mapper.ts');
const read=(p)=>fs.readFileSync(p,'utf8');
function resolveImport(from,spec){
  if(!spec.startsWith('.')) return null;
  const raw=path.resolve(path.dirname(from),spec);
  for(const candidate of [raw,`${raw}.ts`,`${raw}.tsx`,path.join(raw,'index.ts'),path.join(raw,'index.tsx')]) if(fs.existsSync(candidate)) return candidate;
  return null;
}
function reachable(entry,target){
  const wanted=path.resolve(target); const seen=new Set(); const queue=[path.resolve(entry)];
  while(queue.length){ const file=queue.shift(); if(file===wanted) return true; if(seen.has(file)||!fs.existsSync(file)) continue; seen.add(file);
    const source=read(file); const re=/(?:from\s+|import\s*)['"]([^'"]+)['"]/g; let match;
    while((match=re.exec(source))){ const next=resolveImport(file,match[1]); if(next&&!seen.has(next)) queue.push(next); }
  }
  return false;
}
function noScss(){
  const root=path.join(repo,'src/features/theory-of-change'); const found=[];
  const walk=(dir)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name); if(e.isDirectory()) walk(full); else if(e.name.endsWith('.scss')) found.push(path.relative(repo,full));}};
  walk(root); return found;
}
const owner=path.join(repo,base,'narrative-mapping/theory-delivery-result-builders.ts'); const fail=(m)=>{console.error(`FAIL SO-009 Wave 05: ${m}`);process.exit(1)};
if(!fs.existsSync(owner)) fail('delivery/result owner missing'); const mapper=read(mapperPath), source=read(owner);
if(mapper.includes('function narrateDeliveriesAndResult(')) fail('delivery/result assembly returned to mapper');
if(!source.includes('export function narrateDeliveriesAndResult(')) fail('owner contract missing');
for(const token of ['activityToProductParagraph','productToResultParagraph','branchParagraph','convergenceParagraph']) if(mapper.includes(token)) fail(`${token} leaked back into mapper`);
if(!source.includes('emitRiskConditions')||!source.includes('emitHypothesisConditions')) fail('condition collaborations missing from delivery/result owner');
if(!reachable(mapperPath,owner)) fail('delivery/result owner is not reachable from mapper facade');
if(mapper.split(/\r?\n/).length>120) fail('mapper exceeded current facade budget');
console.log('PASS SO-009 Narrative God Slayer Wave 05: deliveries and results ownership remains reachable and armored.');
