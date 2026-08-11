#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const req=(ok,msg)=>{if(!ok)errors.push(msg)};

const required=[
  'docs/sharkops/SO-017-APPLICATION-SHELL-SHARED-UI-AUDIT.json',
  'docs/sharkops/SO-017-WAVE-01-APPLICATION-SHELL-SHARED-UI-AUDIT.md',
  '.sharkops/bites/so-017-application-shell-shared-ui-armor-wave-01/MANIFEST.json'
];
required.forEach((rel)=>req(exists(rel),`artefato obrigatorio ausente: ${rel}`));

if(!errors.length){
  const audit=json('docs/sharkops/SO-017-APPLICATION-SHELL-SHARED-UI-AUDIT.json');
  const state=json('.sharkops/state/current-state.json');
  const ledger=json('.sharkops/state/bite-ledger.json');
  const so16=(ledger.bites??[]).find((b)=>b.id==='SO-016');
  const so17=(ledger.bites??[]).find((b)=>b.id==='SO-017');
  const ids=(audit.findings??[]).map((f)=>f.id).sort();

  req(((so17?.revision??0)===1 && audit.mode==='audit-only' && audit.runtimeChanges===false) || ((so17?.revision??0)>1),'Wave 01 deve permanecer audit-only na revisao 1 e permitir progressao SO-017 explicitamente versionada');
  req(JSON.stringify(ids)===JSON.stringify(['SHELL-001','SHELL-002','SHELL-003','SHELL-004','SHELL-005']),'inventario canonico de findings SO-017 mudou');
  req((so17?.revision??0)===1 ? audit.nextBite?.targetFinding==='SHELL-001' : (audit.findings??[]).some((f)=>f.id==='SHELL-001' && String(f.status).startsWith('RESOLVED-')),'SHELL-001 deve ser o primeiro alvo e permanecer resolvido apos a Wave 01');
  req(so16?.status==='COMPLETE','SO-016 deve permanecer COMPLETE');
  req(((so17?.status==='ACTIVE' && (so17?.revision??0)>=1) || (so17?.status==='COMPLETE' && (so17?.revision??0)>=5)),'SO-017 deve permanecer ACTIVE durante as waves ou COMPLETE no closeout');
  req((so17?.status==='ACTIVE' && state.activeBite==='SO-017 | Application Shell & Shared UI Armor' && state.activeBiteStatus==='ACTIVE') || (so17?.status==='COMPLETE' && state.activeBite===null && state.lastBite==='SO-017 | Application Shell & Shared UI Armor COMPLETE'),'current-state perdeu ownership canonico da SO-017');
  req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Canvas Golden State deixou de estar selado');

  req((so17?.revision??0)===1 ? exists('src/shared/ui/tooltip/tdm-anchored-tooltip-surface.sass') : !exists('src/shared/ui/tooltip/tdm-anchored-tooltip-surface.sass'),'SHELL-001 deve preservar evidencia na Wave 01 e remover o plain Sass de shared/ui nas waves posteriores');
  const deepCssImports=[
    'src/features/theory-of-change/components/sidebar/tdm-sidebar-primitives.tsx',
    'src/features/theory-of-change/components/sidebar/v1-preserved-sidebar-icons.tsx'
  ].filter((rel)=>read(rel).includes("@/shared/ui/tdm-button/tdm-button.module.sass"));
  req((so17?.revision??0)===1 ? deepCssImports.length===2 : deepCssImports.length===0,'SHELL-001 deve preservar dois leaks na Wave 01 e zero leaks apos a remediacao');
  req((so17?.revision??0)<3 ? !exists('src/shared/ui/tdm-field/index.ts') : exists('src/shared/ui/tdm-field/index.ts'),'SHELL-002 deve preservar ausencia de facade antes da Wave 03 e possuir facade a partir dela');
  req((so17?.revision??0)<3 ? !exists('src/shared/ui/tooltip/index.ts') : exists('src/shared/ui/tooltip/index.ts'),'SHELL-002 deve preservar ausencia de facade antes da Wave 03 e possuir facade a partir dela');
}

if(errors.length){
  console.error('\nSO-017 APPLICATION SHELL & SHARED UI WAVE 01: FAIL\n');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`));
  process.exit(1);
}
console.log('PASS SO-017 Wave 01: application shell/shared UI are inventoried audit-only, predecessor armor and GOLDEN-STATE-v1 remain sealed, and SHELL-001 is frozen as the smallest proven next bite.');
