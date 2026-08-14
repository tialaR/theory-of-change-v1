import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const bites=ledger.bites ?? ledger.items ?? ledger.entries ?? [];
const errors=[];
for(let i=1;i<=13;i++){
  const id=`SO-${String(i).padStart(3,'0')}`;
  const bite=bites.find((item)=>item.id===id);
  if(!bite) errors.push(`${id} ausente do Bite Ledger`);
  else if(bite.status!=='COMPLETE') errors.push(`${id} nao esta COMPLETE`);
}
const so14=bites.find((item)=>item.id==='SO-014');
if(!so14) errors.push('SO-014 ausente do Bite Ledger');
else if(so14.status!=='ACTIVE') errors.push('SO-014 deve permanecer ACTIVE durante as waves de closeout');
if(state.activeBite!=='SO-014 | Final Architecture Closeout') errors.push('activeBite nao aponta para SO-014');
if(state.activeBiteStatus!=='ACTIVE') errors.push('SO-014 deve estar ACTIVE');
const exactWave01=state.lastBite==='SO-014 | Final Architecture Audit & Gate Matrix'
  && state.nextBite==='SO-014 | Final Architecture Closeout';
const registeredDownstreamWave=Boolean(
  so14
  && Number(so14.revision)>=2
  && typeof so14.path==='string'
  && so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')
  && typeof state.lastBite==='string'
  && state.lastBite.startsWith('SO-014 | ')
  && typeof state.nextBite==='string'
  && state.nextBite.startsWith('SO-014 | ')
);
if(!exactWave01&&!registeredDownstreamWave) errors.push('Current State perdeu a Wave 01 ou uma progressao SO-014 registrada');
const mandatory=[
  'check:tdm:god-hooks-slayer:closeout',
  'check:tdm:result-view-god-slayer:closeout',
  'check:tdm:narrative-god-slayer:closeout',
  'check:tdm:application-slayer:closeout',
  'check:tdm:react-flow-isolation:closeout',
  'check:tdm:canvas-engine:closeout',
  'check:tdm:infrastructure-cleanup:closeout',
  'check:tdm:final-architecture:wave01',
  'shark:verify'
];
for(const script of mandatory){ if(!pkg.scripts?.[script]) errors.push(`script obrigatorio ausente: ${script}`); }
const audit='docs/sharkops/SO-014-FINAL-ARCHITECTURE-AUDIT.md';
if(!fs.existsSync(path.join(root,audit))) errors.push('audit final ausente');
const waveManifest='.sharkops/bites/so-014-final-architecture-closeout-wave-01/MANIFEST.json';
if(!fs.existsSync(path.join(root,waveManifest))) errors.push('manifest da Wave 01 ausente');
const handoff=fs.readFileSync(path.join(root,'docs/sharkops/HANDOFF.md'),'utf8');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 01')) errors.push('HANDOFF sem Wave 01 do SO-014');
if(errors.length){ console.error('FAIL SO-014 Final Architecture Wave 01'); for(const e of errors) console.error(`- ${e}`); process.exit(1); }
console.log('PASS SO-014 Final Architecture Wave 01: SO-001 through SO-013 remain complete, the final gate matrix remains registered, and cumulative SO-014 progression is protected without runtime changes.');
