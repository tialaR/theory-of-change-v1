#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(v,m)=>{if(!v)errors.push(m)};

const audit=json('docs/sharkops/SO-021-APPLICATION-WIDE-REGRESSION-ARMOR-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so21=(ledger.bites??[]).find(b=>b.id==='SO-021');
const finding=(audit.findings??[]).find(f=>f.id==='REGRESSION-001');

req((so21?.status==='ACTIVE' && (so21?.revision??0)>=2) || (so21?.status==='COMPLETE' && (so21?.revision??0)>=3),'SO-021 must be ACTIVE from revision 2 or COMPLETE at closeout');
req(String(finding?.status).startsWith('RESOLVED-'),'REGRESSION-001 must remain resolved');
req(pkg.scripts?.['check:tdm:application-wide-regression']==='node scripts/sharkops/application-wide-regression.mjs','aggregate script wiring changed');
req((so21?.status==='ACTIVE' && state.activeBite==='SO-021 | Application-Wide Regression Armor' && state.activeBiteStatus==='ACTIVE') || (so21?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state lost SO-021 ownership');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State must remain sealed');
req((so21?.revision??0)===2 ? audit.nextBite?.id==='SO-021-CLOSEOUT-AUDIT' : ((so21?.revision??0)>=3 && audit.closeout?.status==='COMPLETE'),'Wave 02 must point to closeout or recognize SO-021 COMPLETE');

const orchestrator=read('scripts/sharkops/application-wide-regression.mjs');
const requiredScripts=["check:tdm:application-infrastructure-runtime:closeout", "check:tdm:golden-state", "typecheck", "lint:auth", "lint:canvas", "test:unit", "check:tdm:auth-rsc-boundary", "build", "shark:verify"];
for(const script of requiredScripts){
  req(orchestrator.includes(`script: "${script}"`) || orchestrator.includes(`script: '${script}'`),`aggregate contract lost ${script}`);
}
req(!orchestrator.includes('&& true'),'aggregate contract cannot swallow failures');
req(!orchestrator.includes('|| true'),'aggregate contract cannot swallow failures');

if(errors.length){
  console.error('\nSO-021 WAVE 02 APPLICATION-WIDE REGRESSION CONTRACT: FAIL\n');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
  process.exit(1);
}

console.log('PASS SO-021 Wave 02: one deterministic application-wide regression contract composes authoritative gates, the Auth RSC boundary and production build without duplicating or weakening them.');
