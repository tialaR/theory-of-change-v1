#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const sha=r=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r))).digest('hex');
const req=(value,message)=>{if(!value)errors.push(message)};

const candidate=json('docs/sharkops/APPLICATION-GOLDEN-STATE-v1-CANDIDATE.json');
const audit=json('docs/sharkops/SO-022-FINAL-APPLICATION-ARCHITECTURE-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so22=(ledger.bites??[]).find(b=>b.id==='SO-022');

req((so22?.status==='ACTIVE' && (so22?.revision??0)>=2) || (so22?.status==='COMPLETE' && (so22?.revision??0)>=3),'SO-022 must remain ACTIVE from revision 2 or COMPLETE at closeout');
req(candidate.id==='APPLICATION-GOLDEN-STATE-v1-CANDIDATE' && candidate.status==='CANDIDATE','candidate identity/status changed');
req(candidate.sealPolicy?.candidateIsNotFinal===true,'candidate must never self-promote to final');
req(candidate.sealPolicy?.requiresApplicationWideRegressionGreen===true,'candidate must require application-wide regression');
req(candidate.sealPolicy?.requiresSO022FinalCloseout===true,'candidate must require SO-022 closeout');
req(candidate.canvasGoldenState?.id==='GOLDEN-STATE-v1' && candidate.canvasGoldenState?.status==='COMPLETE','Canvas Golden State binding changed');

for(let i=1;i<=21;i++){
  const id=`SO-${String(i).padStart(3,'0')}`;
  const bite=(ledger.bites??[]).find(b=>b.id===id);
  req(bite?.status==='COMPLETE',`${id} must remain COMPLETE`);
}

req(pkg.scripts?.['check:tdm:application-wide-regression']==='node scripts/sharkops/application-wide-regression.mjs','application-wide regression wiring changed');
req((so22?.status==='ACTIVE' && state.activeBite==='SO-022 | Final Application Architecture Closeout' && state.activeBiteStatus==='ACTIVE') || (so22?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state lost SO-022 ownership');
req(state.goldenStateId==='GOLDEN-STATE-v1' && state.goldenStateStatus==='COMPLETE','Canvas Golden State must remain sealed');
req(audit.applicationGoldenStateCandidate?.id===candidate.id,'audit lost candidate binding');
req((so22?.revision??0)===2 ? audit.nextBite?.id==='SO-022-CLOSEOUT' : ((so22?.revision??0)>=3 && audit.closeout?.status==='COMPLETE'),'Wave 02 must point to closeout or recognize SO-022 COMPLETE');

const pkgBaseline=json('docs/sharkops/APPLICATION-GOLDEN-STATE-v1-CANDIDATE-PACKAGE-BASELINE.json');
req(candidate.evidenceHashes?.['package.json']===pkgBaseline.sha256,'candidate package baseline hash changed');
req(candidate.evidenceHashes?.['.sharkops/state/bite-ledger.json']!==undefined,'candidate ledger evidence hash missing');
req(candidate.evidenceHashes?.['docs/sharkops/SO-022-FINAL-APPLICATION-ARCHITECTURE-AUDIT.json']!==undefined,'candidate audit evidence hash missing');

if(errors.length){
  console.error('\nSO-022 WAVE 02 APPLICATION GOLDEN STATE CANDIDATE: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-022 Wave 02: APPLICATION-GOLDEN-STATE-v1-CANDIDATE is explicit, non-final, bound to SO-001..SO-021 completion, Canvas GOLDEN-STATE-v1 and the fail-closed application-wide regression contract.');
