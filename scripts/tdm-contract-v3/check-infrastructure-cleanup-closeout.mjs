#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertRegisteredProgression } from './state-progression.mjs';
const root=process.cwd(); const errors=[];
for (const gate of ['check-infrastructure-cleanup-wave01.mjs','check-infrastructure-cleanup-wave02.mjs','check-infrastructure-cleanup-wave02-hotfix.mjs','check-infrastructure-cleanup-wave03.mjs','check-infrastructure-cleanup-wave04.mjs','check-infrastructure-cleanup-wave05.mjs','check-infrastructure-cleanup-wave06.mjs']) {
 const r=spawnSync(process.execPath,[`scripts/tdm-contract-v3/${gate}`],{cwd:root,encoding:'utf8'}); if(r.status!==0){process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');errors.push(`gate falhou: ${gate}`);}
}
const handoffGate=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-infrastructure-cleanup-handoff-package.mjs'],{cwd:root,encoding:'utf8'}); if(handoffGate.status!==0){process.stdout.write(handoffGate.stdout||'');process.stderr.write(handoffGate.stderr||'');errors.push('gate falhou: check-infrastructure-cleanup-handoff-package.mjs');}
const state=JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/current-state.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'.sharkops/state/bite-ledger.json'),'utf8'));
const bite=ledger.bites.find(i=>i.id==='SO-013');
const exact=state.activeBite==='SO-013 | Infrastructure Cleanup'&&state.activeBiteStatus==='COMPLETE'&&state.lastBite==='SO-013 | Infrastructure Cleanup Closeout'&&state.nextBite==='SO-014 | Final Architecture Closeout';
const downstream=assertRegisteredProgression({state,ledger,minimumBite:14,completedBites:['SO-013']});
if(!bite||bite.status!=='COMPLETE'||!bite.completedAt||bite.revision<8)errors.push('SO-013 nao esta COMPLETE/revision >= 8');
if(!exact&&!downstream)errors.push('Current State perdeu closeout SO-013 ou progressao downstream registrada');
const handoff=fs.readFileSync(path.join(root,'docs/sharkops/HANDOFF.md'),'utf8');
if(!handoff.includes('SO-013 Infrastructure Cleanup Closeout'))errors.push('handoff sem closeout SO-013');
if(!handoff.includes('SO-014 Final Architecture Closeout'))errors.push('handoff sem proximo ataque SO-014');
if(errors.length){console.error('\nSO-013 INFRASTRUCTURE CLEANUP CLOSEOUT: FAIL\n');errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));process.exit(1)}
console.log('PASS SO-013 Infrastructure Cleanup Closeout: all cleanup waves, slim handoff packaging, cumulative gates, SharkOps completion and SO-014 handoff are regression-armored.');
