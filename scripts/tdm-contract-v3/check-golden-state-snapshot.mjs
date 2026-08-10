#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const required=[
  '.sharkops/snapshots/golden-state-v1/MANIFEST.json',
  '.sharkops/state/so-014-wave-11-precloseout-proof.json',
  'docs/sharkops/GOLDEN-STATE-SNAPSHOT.json',
  'docs/sharkops/GOLDEN-STATE-HANDOFF.md',
  'docs/sharkops/SO-014-FINAL-ARCHITECTURE-CLOSEOUT.json',
  'docs/architecture/adr/ADR-008-final-canvas-architecture-constitution.md',
  'tools/sharkops/golden-state-pack.sh'
];
for(const rel of required) if(!exists(rel)) errors.push('artefato Golden State ausente: '+rel);

const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const pkg=json('package.json');
const so14=ledger.bites.find(b=>b.id==='SO-014');
const active=ledger.bites.filter(b=>b.status==='ACTIVE');
const complete=ledger.bites.filter(b=>b.status==='COMPLETE');
if(!so14||so14.status!=='COMPLETE'||so14.revision!==11||!so14.completedAt) errors.push('SO-014 deve permanecer COMPLETE na revisao 11');
if(active.length!==0) errors.push('Golden State deve preservar zero bites ACTIVE');
if(complete.length!==14) errors.push('Golden State exige SO-001 a SO-014 COMPLETE');
if(state.activeBite||state.activeBiteStatus) errors.push('current-state Golden State nao pode reabrir activeBite');
if(state.phase!=='Golden State Snapshot Complete'||state.goldenStateStatus!=='COMPLETE'||state.goldenStateId!=='GOLDEN-STATE-v1') errors.push('current-state nao registra Golden State terminal');
if(state.lastBite!=='SO-014 | Final Architecture Closeout') errors.push('Golden State nao pode substituir o ultimo bite de arquitetura');
if(state.nextBite!=='No active bite | Start a new scoped SharkOps initiative for future runtime work') errors.push('proxima acao terminal do Golden State invalida');

const snapshot=json('docs/sharkops/GOLDEN-STATE-SNAPSHOT.json');
if(snapshot.snapshotId!=='GOLDEN-STATE-v1'||snapshot.status!=='COMPLETE'||snapshot.runtimeChanges!==false) errors.push('snapshot canonico invalido');
if(snapshot.terminalGovernance?.completedInitiatives!==14||snapshot.terminalGovernance?.activeBites!==0||snapshot.terminalGovernance?.so014Status!=='COMPLETE') errors.push('governanca terminal do snapshot invalida');
if(snapshot.regressionProof?.status!=='PASS'||snapshot.regressionProof?.testFiles!==36||snapshot.regressionProof?.tests!==119||snapshot.regressionProof?.canvasE2E!==1||snapshot.regressionProof?.sharkops!=='NO REGRESSION DETECTED') errors.push('prova de regressao Golden State invalida');
if(snapshot.packaging?.command!=='npm run shark:golden'||snapshot.packaging?.checksum!=='SHA-256'||snapshot.packaging?.slim!==true) errors.push('contrato de empacotamento Golden State invalido');

const manifest=json('.sharkops/snapshots/golden-state-v1/MANIFEST.json');
if(manifest.status!=='COMPLETE'||manifest.sourceInitiative!=='SO-014'||manifest.sourceWave!=='11'||manifest.runtimeChanges!==false) errors.push('manifest Golden State inconsistente');
if(pkg.scripts?.['check:tdm:golden-state']!=='node scripts/tdm-contract-v3/check-golden-state-snapshot.mjs') errors.push('npm script check:tdm:golden-state ausente/invalido');
if(pkg.scripts?.['shark:golden']!=='bash tools/sharkops/golden-state-pack.sh') errors.push('npm script shark:golden ausente/invalido');

const wave11=read('scripts/tdm-contract-v3/check-final-architecture-wave11.mjs');
if(!wave11.includes("goldenStateStatus==='COMPLETE'")||!wave11.includes("Golden State Snapshot Complete")) errors.push('Wave 11 nao aceita progressao terminal para Golden State');
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('Golden State Snapshot v1')||!handoff.includes('npm run shark:golden')) errors.push('HANDOFF principal nao registra Golden State');

if(errors.length){
  console.error('\nTDM GOLDEN STATE SNAPSHOT: FAIL\n');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
  process.exit(1);
}
console.log('PASS TDM Golden State Snapshot v1: SO-001 through SO-014 remain COMPLETE, zero bites are active, final regression proof is sealed and portable Golden State packaging is executable without runtime changes.');
