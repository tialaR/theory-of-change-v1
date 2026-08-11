#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(); const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const req=(ok,msg)=>{if(!ok)errors.push(msg)};

const audit=json('docs/sharkops/SO-017-APPLICATION-SHELL-SHARED-UI-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so17=(ledger.bites??[]).find((b)=>b.id==='SO-017');
const shell001=(audit.findings??[]).find((f)=>f.id==='SHELL-001');

req((so17?.status==='ACTIVE' && (so17?.revision??0)>=2) || (so17?.status==='COMPLETE' && (so17?.revision??0)>=5),'SO-017 deve estar ACTIVE apos a Wave 02 ou COMPLETE no closeout');
req(String(shell001?.status).startsWith('RESOLVED-'),'SHELL-001 deve permanecer resolvido');
req((so17?.revision??0)===2 ? audit.nextBite?.targetFinding==='SHELL-002' : ((so17?.revision??0)>2 && String((audit.findings??[]).find((f)=>f.id==='SHELL-002')?.status).startsWith('RESOLVED-')),'Wave 02 deve apontar SHELL-002 na revisao 2 e reconhecer sua resolucao nas waves posteriores');
req((so17?.status==='ACTIVE' && state.activeBite==='SO-017 | Application Shell & Shared UI Armor') || (so17?.status==='COMPLETE' && state.activeBite===null),'current-state perdeu ownership SO-017');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Canvas Golden State deixou de estar selado');

req(!exists('src/shared/ui/tooltip/tdm-anchored-tooltip-surface.sass'),'plain Sass de componente nao pode existir em shared/ui/tooltip');
req(exists('src/shared/styles/tdm/tdm-anchored-tooltip-surface.sass'),'contrato Sass reutilizavel do tooltip deve viver em shared/styles/tdm');
req(read('src/shared/ui/tooltip/tdm-anchored-tooltip.module.sass').includes("@use '../../styles/tdm/tdm-anchored-tooltip-surface' as surface"),'TdmAnchoredTooltip deve consumir o surface pelo shared/styles');
req(read('src/features/theory-of-change/components/edge/tdm-theory-edge.module.sass').includes("@use '../../../../shared/styles/tdm/tdm-anchored-tooltip-surface' as tooltip-surface"),'edge tooltip deve consumir o surface pelo shared/styles');

const sharedUiRoot=path.join(root,'src/shared/ui');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap((ent)=>{const full=path.join(dir,ent.name); return ent.isDirectory()?walk(full):[full]});}
const plainSass=walk(sharedUiRoot).filter((file)=>file.endsWith('.sass') && !file.endsWith('.module.sass')).map((file)=>path.relative(root,file));
req(plainSass.length===0,`shared/ui contem plain .sass: ${plainSass.join(', ')}`);

const sourceFiles=walk(path.join(root,'src')).filter((file)=>/\.(ts|tsx)$/.test(file));
const deepStyleLeaks=[];
for(const file of sourceFiles){
  const rel=path.relative(root,file); const text=fs.readFileSync(file,'utf8');
  if(!rel.startsWith('src/shared/ui/') && /@\/shared\/ui\/[^'\"]+\.module\.sass/.test(text)) deepStyleLeaks.push(rel);
}
req(deepStyleLeaks.length===0,`feature/app code importa CSS Module interno de shared UI: ${deepStyleLeaks.join(', ')}`);

const tooltipConsumers=[
 'src/features/theory-of-change/components/canvas/tdm-canvas-command-dock.tsx',
 'src/features/theory-of-change/components/canvas/tdm-canvas-process-dock/tdm-canvas-process-dock.tsx',
 'src/features/theory-of-change/components/sidebar/tdm-sidebar-primitives.tsx'
];
req(tooltipConsumers.every((rel)=>read(rel).includes('TdmAnchoredTooltip')),'tooltip vivo perdeu um consumidor inventariado');

if(errors.length){console.error('\nSO-017 WAVE 02 SHARED UI STYLE OWNERSHIP: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);}
console.log('PASS SO-017 Wave 02: live tooltip styling keeps its reusable Sass contract in shared/styles, shared UI component styles remain .module.sass, and feature code cannot import internal shared UI CSS Modules.');
