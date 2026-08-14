#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(value,message)=>{if(!value)errors.push(message)};

const audit=json('docs/sharkops/SO-022-FINAL-APPLICATION-ARCHITECTURE-AUDIT.json');
const candidate=json('docs/sharkops/APPLICATION-GOLDEN-STATE-v1-CANDIDATE.json');
const golden=json('docs/sharkops/APPLICATION-GOLDEN-STATE-v1.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so22=(ledger.bites??[]).find(b=>b.id==='SO-022');
const byFinding=id=>(audit.findings??[]).find(f=>f.id===id);

for(let i=1;i<=22;i++){
  const id=`SO-${String(i).padStart(3,'0')}`;
  const bite=(ledger.bites??[]).find(b=>b.id===id);
  req(bite?.status==='COMPLETE',`${id} must be COMPLETE`);
}

req(so22?.revision===3 && Boolean(so22?.completedAt),'SO-022 must close at revision 3 with completedAt');
req(audit.mode==='terminal-closeout' && audit.runtimeChanges===false,'SO-022 closeout must remain non-runtime terminal governance');
req(audit.closeout?.status==='COMPLETE' && audit.closeout?.openFindings?.length===0,'SO-022 closeout must have zero open findings');
req(byFinding('FINAL-001')?.status==='PROVEN','FINAL-001 predecessor proof changed');
req(byFinding('FINAL-002')?.status==='PROVEN','FINAL-002 terminal entrypoint proof changed');
req(byFinding('FINAL-003')?.status==='RESOLVED-CLOSEOUT','FINAL-003 must be resolved at closeout');

req(candidate.id==='APPLICATION-GOLDEN-STATE-v1-CANDIDATE' && candidate.status==='CANDIDATE','candidate identity changed');
req(golden.id==='APPLICATION-GOLDEN-STATE-v1' && golden.status==='COMPLETE','final Application Golden State identity changed');
req(golden.candidateId===candidate.id,'final golden state must seal the explicit candidate');
req(golden.canvasGoldenState?.id==='GOLDEN-STATE-v1' && golden.canvasGoldenState?.status==='COMPLETE','Canvas Golden State binding changed');
req(golden.regressionContract==='check:tdm:application-wide-regression','regression contract binding changed');
req(golden.sealPolicy?.immutableAfterSeal===true,'Application Golden State must be immutable after seal');

req(state.activeBite===null && state.activeBiteStatus==='NONE','terminal closeout must have no active bite');
req(state.lastBite==='SO-022 | Final Application Architecture Closeout COMPLETE','current-state must record SO-022 COMPLETE');
req(state.applicationGoldenStateId==='APPLICATION-GOLDEN-STATE-v1' && state.applicationGoldenStateStatus==='COMPLETE','current-state lost Application Golden State');
req(state.goldenStateId==='GOLDEN-STATE-v1' && state.goldenStateStatus==='COMPLETE','Canvas Golden State must remain independently sealed');
req(pkg.scripts?.['check:tdm:application-wide-regression']==='node scripts/sharkops/application-wide-regression.mjs','application-wide regression wiring changed');

const orchestrator=read('scripts/sharkops/application-wide-regression.mjs');
req(orchestrator.includes('check:tdm:auth-rsc-boundary'),'Application Golden State lost Auth RSC boundary verification');
req(orchestrator.includes('script: "build"') || orchestrator.includes("script: 'build'"),'Application Golden State lost production build verification');
req(!orchestrator.includes('&& true'),'application-wide regression cannot swallow failures');
req(!orchestrator.includes('|| true'),'application-wide regression cannot swallow failures');

if(errors.length){
  console.error('\nSO-022 FINAL APPLICATION ARCHITECTURE CLOSEOUT: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-022 Closeout: SO-001..SO-022 are COMPLETE, APPLICATION-GOLDEN-STATE-v1 is sealed, Canvas GOLDEN-STATE-v1 remains independently sealed, zero final findings remain open, the production build/RSC boundary are part of the seal, and future V1 work must proceed as explicit post-Golden successor initiatives.');
