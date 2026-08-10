#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const readJson=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const productionRoots=['src','public','scripts','tools'];
const suspiciousSuffix=/\.(?:bak|backup|orig|rej|old|tmp|disabled)$/i;
const editorArtifact=/(?:^|\/)(?:\.DS_Store|Thumbs\.db|[^/]+~)$/;

function walk(rel){
  const abs=path.join(root,rel);
  if(!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs,{withFileTypes:true}).flatMap((entry)=>{
    const child=path.join(rel,entry.name);
    return entry.isDirectory()?walk(child):[child];
  });
}

for(const base of productionRoots){
  for(const rel of walk(base)){
    const stat=fs.statSync(path.join(root,rel));
    if(stat.size===0) errors.push(`arquivo vazio em arvore ativa: ${rel}`);
    if(suspiciousSuffix.test(rel)||editorArtifact.test(rel)) errors.push(`residuo temporario/backup em arvore ativa: ${rel}`);
  }
}

// scripts/_legacy is retained only as quarantine/history. It must never regain an active execution edge.
const legacyRoot='scripts/_legacy';
if(!exists(legacyRoot)) errors.push('quarentena scripts/_legacy ausente');
const activeScanFiles=[
  'package.json',
  ...walk('scripts').filter((rel)=>!rel.startsWith('scripts/_legacy/')&&rel!=='scripts/tdm-contract-v3/check-final-architecture-wave06.mjs'),
  ...walk('tools'),
  ...walk('.github')
].filter(exists);
for(const rel of activeScanFiles){
  const src=read(rel);
  if(src.includes('scripts/_legacy')||src.includes('./_legacy')||src.includes('../_legacy')) errors.push(`quarentena legacy ganhou referencia ativa: ${rel}`);
}

// Names with v1 in the live sidebar are not dead residue: they are explicit compatibility/preserved seams with live consumers.
const liveCompatibilitySeams=[
  ['src/features/theory-of-change/components/sidebar/v1-preserved-sidebar-sections.tsx','src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-block-forms.tsx','../v1-preserved-sidebar-sections'],
  ['src/features/theory-of-change/components/sidebar/v1-preserved-sidebar-sections.tsx','src/features/theory-of-change/components/sidebar/tdm-sidebar/panels/sidebar-final-result-panel.tsx','../../v1-preserved-sidebar-sections'],
  ['src/features/theory-of-change/components/sidebar/v1-progress-and-stage-action.tsx','src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-progress.tsx','../v1-progress-and-stage-action'],
  ['src/features/theory-of-change/components/sidebar/v1-progress-and-stage-action.tsx','src/features/theory-of-change/components/sidebar/tdm-sidebar/panels/sidebar-stage-action-panel.tsx','../../v1-progress-and-stage-action']
];
for(const [owner,consumer,spec] of liveCompatibilitySeams){
  if(!exists(owner)) errors.push(`compatibility seam vivo ausente: ${owner}`);
  if(!exists(consumer)||!read(consumer).includes(spec)) errors.push(`compatibility seam perdeu consumidor vivo: ${consumer} -> ${spec}`);
}

// Explicit compatibility aliases remain allowed; the gate rejects silent legacy wrappers in the Canvas architecture itself.
for(const rel of walk('src/features/theory-of-change/canvas')){
  if(!/\.(?:ts|tsx)$/.test(rel)||/\.(?:test|spec)\.(?:ts|tsx)$/.test(rel)) continue;
  const base=path.basename(rel).toLowerCase();
  if(/(?:legacy|deprecated|backup|old|temp|tmp)/.test(base)) errors.push(`wrapper/residuo legado reapareceu no Canvas arquitetural: ${rel}`);
}

// Historical root .tdm-* artifacts remain outside runtime trees and are intentionally preserved until safe deletion is proven.

const predecessor=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave05.mjs'],{cwd:root,encoding:'utf8'});
if(predecessor.status!==0){process.stdout.write(predecessor.stdout||'');process.stderr.write(predecessor.stderr||'');errors.push('gate predecessor Wave 05 falhou');}
const infra=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-infrastructure-cleanup-closeout.mjs'],{cwd:root,encoding:'utf8'});
if(infra.status!==0){process.stdout.write(infra.stdout||'');process.stderr.write(infra.stderr||'');errors.push('SO-013 Infrastructure Cleanup closeout falhou');}

const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const so14=ledger.bites.find((bite)=>bite.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||so14.revision<6) errors.push('SO-014 Wave 06 state/ledger invalido');
const exactWave06=so14.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-06'&&state.lastBite==='SO-014 | Dead Path & Legacy Residue Verification'&&state.nextBite==='SO-014 | Documentation & ADR Consistency';
const registeredDownstream=Boolean(so14.revision>=7&&typeof so14.path==='string'&&so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')&&state.activeBite==='SO-014 | Final Architecture Closeout'&&state.activeBiteStatus==='ACTIVE'&&typeof state.lastBite==='string'&&state.lastBite.startsWith('SO-014 | ')&&typeof state.nextBite==='string'&&state.nextBite.startsWith('SO-014 | '));
if(!exactWave06&&!registeredDownstream) errors.push('Current State perdeu a Wave 06 ou uma progressao SO-014 downstream registrada');
if(!pkg.scripts?.['check:tdm:final-architecture:wave06']) errors.push('npm script Wave 06 ausente');
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 06')) errors.push('HANDOFF Wave 06 ausente');
for(const rel of ['docs/sharkops/SO-014-WAVE-06-DEAD-PATH-LEGACY-RESIDUE-VERIFICATION.md','.sharkops/bites/so-014-final-architecture-closeout-wave-06/MANIFEST.json']) if(!exists(rel)) errors.push(`artefato Wave 06 ausente: ${rel}`);

if(errors.length){
  console.error('\nSO-014 DEAD PATH & LEGACY RESIDUE VERIFICATION: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-014 Final Architecture Wave 06: dead paths and legacy residue remain quarantined or explicitly live, with no removable runtime residue proven and no runtime changes.');
