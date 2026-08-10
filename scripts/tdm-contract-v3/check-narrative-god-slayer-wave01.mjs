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
const primitives=path.join(repo,base,'narrative-mapping/theory-document-builders.ts');
const figures=path.join(repo,base,'narrative-mapping/theory-figure-builders.ts');
const fail=(m)=>{console.error(`FAIL SO-009 Wave 01: ${m}`);process.exit(1)};
for(const f of [mapperPath,primitives,figures]) if(!fs.existsSync(f)) fail(`missing ${path.relative(repo,f)}`);
const mapper=read(mapperPath);
if(mapper.split(/\r?\n/).length>120) fail('mapper exceeded current facade budget of 120 lines');
for(const token of ['function nextId(','function nodeRefs(','function paragraph(','function pushParagraph(','function buildOverviewFigure(','function buildResourcesFigure(','function buildConvergenceFigure(']) if(mapper.includes(token)) fail(`mapping ownership leaked back into mapper: ${token}`);
if(!reachable(mapperPath,primitives)) fail('document builder owner is not reachable from mapper facade');
if(!reachable(mapperPath,figures)) fail('figure builder owner is not reachable from mapper facade');
for(const token of ['nextId','nodeRefs','pushParagraph','numberSections']) if(!read(primitives).includes(token)) fail(`document builder lost ownership: ${token}`);
for(const token of ['buildOverviewFigure','buildResourcesFigure','buildConvergenceFigure','titlesByStage']) if(!read(figures).includes(token)) fail(`figure builder lost ownership: ${token}`);
const scss=noScss(); if(scss.length) fail(`.scss files are forbidden: ${scss.join(', ')}`);
console.log('PASS SO-009 Narrative God Slayer Wave 01: document primitives and figure mapping ownership remain reachable and armored.');
