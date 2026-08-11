#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(v,m)=>{if(!v)errors.push(m)};
const audit=json('docs/sharkops/SO-020-APPLICATION-INFRASTRUCTURE-RUNTIME-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so20=(ledger.bites??[]).find(b=>b.id==='SO-020');
const runtime001=(audit.findings??[]).find(f=>f.id==='RUNTIME-001');
req((so20?.status==='ACTIVE' && (so20?.revision??0)>=2) || (so20?.status==='COMPLETE' && (so20?.revision??0)>=3),'SO-020 must be ACTIVE from revision 2 or COMPLETE at closeout');
req(String(runtime001?.status).startsWith('RESOLVED-'),'RUNTIME-001 must remain resolved');
req((so20?.status==='ACTIVE' && state.activeBite==='SO-020 | Application Infrastructure & Runtime Armor' && state.activeBiteStatus==='ACTIVE') || (so20?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state lost SO-020 ownership');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);return e.isDirectory()?walk(f):[f]})}
const source=walk(path.join(root,'src')).filter(f=>/\.(ts|tsx|js|mjs)$/.test(f));
const envFiles=source.filter(f=>fs.readFileSync(f,'utf8').includes('process.env')).map(f=>path.relative(root,f).split(path.sep).join('/')).sort();
const allowed=[
  'src/features/auth/server/auth-session.ts',
  'src/features/theory-of-change/runtime/report-invalid-connection-condition.ts',
  'src/instrumentation.ts'
].sort();
req(JSON.stringify(envFiles)===JSON.stringify(allowed),`authorized process.env surface changed: ${envFiles.join(', ')}`);
const domainEnv=source.filter(f=>path.relative(root,f).split(path.sep).join('/').includes('/domain/') && fs.readFileSync(f,'utf8').includes('process.env')).map(f=>path.relative(root,f));
req(domainEnv.length===0,`domain code reads process.env: ${domainEnv.join(', ')}`);
req(!read('src/features/theory-of-change/domain/tdm-connection-rules.ts').includes('reportInvalidConnectionCondition'),'runtime diagnostic must not live in domain rules');
req(read('src/features/theory-of-change/runtime/report-invalid-connection-condition.ts').includes("process.env.NODE_ENV === 'production'"),'feature runtime diagnostic lost NODE_ENV ownership');
req(read('src/features/theory-of-change/components/result-view/experience/result-experience-data.ts').includes("../../../runtime/report-invalid-connection-condition"),'result experience must consume feature runtime diagnostic adapter');
req((so20?.revision??0)===2 ? audit.nextBite?.id==='SO-020-CLOSEOUT-AUDIT' : ((so20?.revision??0)>=3 && audit.closeout?.status==='COMPLETE'),'Wave 02 must point to closeout or recognize SO-020 COMPLETE');
if(errors.length){console.error('\nSO-020 WAVE 02 RUNTIME ENVIRONMENT BOUNDARY: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1)}
console.log('PASS SO-020 Wave 02: process.env access is sealed to explicit server/runtime/bootstrap adapters, Theory of Change domain is environment-free, and no broad config abstraction is authorized.');
