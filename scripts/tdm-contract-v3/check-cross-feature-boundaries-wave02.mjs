#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-019-CROSS-FEATURE-BOUNDARIES-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so19=(ledger.bites??[]).find(b=>b.id==='SO-019');
const finding=(audit.findings??[]).find(f=>f.id==='BOUNDARY-001');

req((so19?.status==='ACTIVE' && (so19?.revision??0)>=2) || (so19?.status==='COMPLETE' && (so19?.revision??0)>=3),'SO-019 must be ACTIVE from revision 2 or COMPLETE at closeout');
req(String(finding?.status).startsWith('RESOLVED-'),'BOUNDARY-001 must remain resolved');
req(audit.classification?.pair==='theory-of-change -> auth','canonical pair classification changed');
req(audit.classification?.publicFacadeImports===6,'six root Auth facade imports must remain classified');
req(audit.classification?.serverFacadeImports===1,'one server Auth facade import must remain classified');
req((so19?.status==='ACTIVE' && state.activeBite==='SO-019 | Cross-Feature Boundaries' && state.activeBiteStatus==='ACTIVE') || (so19?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state lost SO-019 ownership');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');

const authIndex=read('src/features/auth/index.ts');
const serverIndex=read('src/features/auth/server/index.ts');
req(authIndex.includes('AuthUser') && authIndex.includes('UserMenu'),'root Auth facade lost client/domain-safe exports');
req(serverIndex.includes('requireAuthenticatedSession'),'Auth server facade must export requireAuthenticatedSession');

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>{
    const full=path.join(dir,ent.name);
    return ent.isDirectory()?walk(full):[full];
  });
}

const files=walk(path.join(root,'src/features/theory-of-change')).filter(file=>/\.(ts|tsx)$/.test(file));
const forbidden=[];
let rootFacade=0, serverFacade=0;

for(const file of files){
  const rel=path.relative(root,file);
  const text=fs.readFileSync(file,'utf8');
  const specs=[...text.matchAll(/(?:from\s+|import\s*\()\s*['"](@\/features\/auth[^'"]*)['"]/g)].map(m=>m[1]);

  for(const spec of specs){
    if(spec==='@/features/auth'){
      rootFacade+=1;
      continue;
    }
    if(spec==='@/features/auth/server'){
      serverFacade+=1;
      if(!rel.includes('/server/') && !rel.endsWith('.action.ts')){
        forbidden.push(`${rel}: server facade outside server boundary`);
      }
      continue;
    }
    forbidden.push(`${rel}: ${spec}`);
  }
}

req(rootFacade===6,`expected 6 root Auth facade imports, found ${rootFacade}`);
req(serverFacade===1,`expected 1 Auth server facade import, found ${serverFacade}`);
req(forbidden.length===0,`forbidden cross-feature Auth deep imports: ${forbidden.join(', ')}`);
req(read('src/features/theory-of-change/canvas/server/save-canvas-project.action.ts').includes("from '@/features/auth/server'"),'Canvas save action must consume explicit Auth server facade');
req((so19?.revision??0)===2 ? audit.nextBite?.id==='SO-019-CLOSEOUT-AUDIT' : ((so19?.revision??0)>=3 && audit.closeout?.status==='COMPLETE'),'Wave 02 must point to closeout or recognize SO-019 COMPLETE');

if(errors.length){
  console.error('\nSO-019 WAVE 02 AUTH BOUNDARY CONTRACT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-019 Wave 02: theory-of-change consumes Auth through explicit root/server facades, deep cross-feature Auth imports are forbidden, Auth remains feature-owned, and no broader refactor is authorized.');
