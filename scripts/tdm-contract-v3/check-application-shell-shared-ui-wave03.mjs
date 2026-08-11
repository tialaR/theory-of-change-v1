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
const shell002=(audit.findings??[]).find((f)=>f.id==='SHELL-002');

req((so17?.status==='ACTIVE' && (so17?.revision??0)>=3) || (so17?.status==='COMPLETE' && (so17?.revision??0)>=5),'SO-017 deve estar ACTIVE apos a Wave 03 ou COMPLETE no closeout');
req(String(shell002?.status).startsWith('RESOLVED-'),'SHELL-002 deve permanecer resolvido');
req((so17?.revision??0)===3 ? audit.nextBite?.targetFinding==='SHELL-003' : (so17?.revision??0)>3,'Wave 03 deve apontar SHELL-003 na revisao 3 ou permitir progressao posterior versionada');
req((so17?.status==='ACTIVE' && state.activeBite==='SO-017 | Application Shell & Shared UI Armor' && state.activeBiteStatus==='ACTIVE') || (so17?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state perdeu ownership SO-017');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Canvas Golden State deixou de estar selado');

req(exists('src/shared/ui/tdm-field/index.ts'),'tdm-field deve possuir entrypoint publico');
req(exists('src/shared/ui/tooltip/index.ts'),'tooltip deve possuir entrypoint publico');
const fieldIndex=read('src/shared/ui/tdm-field/index.ts');
const tooltipIndex=read('src/shared/ui/tooltip/index.ts');
['TdmField','TdmInput','TdmTextarea'].forEach((name)=>req(fieldIndex.includes(name),`tdm-field/index.ts nao exporta ${name}`));
req(tooltipIndex.includes('TdmAnchoredTooltip'),'tooltip/index.ts nao exporta TdmAnchoredTooltip');

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap((ent)=>{const full=path.join(dir,ent.name); return ent.isDirectory()?walk(full):[full]});}
const sourceFiles=walk(path.join(root,'src')).filter((file)=>/\.(ts|tsx)$/.test(file));
const leaks=[];
for(const file of sourceFiles){
  const rel=path.relative(root,file); const text=fs.readFileSync(file,'utf8');
  if(!rel.startsWith('src/shared/ui/tdm-field/') && /@\/shared\/ui\/tdm-field\/tdm-field/.test(text)) leaks.push(rel);
  if(!rel.startsWith('src/shared/ui/tooltip/') && /@\/shared\/ui\/tooltip\/tdm-anchored-tooltip/.test(text)) leaks.push(rel);
}
req(leaks.length===0,`deep imports de shared UI implementation encontrados: ${[...new Set(leaks)].join(', ')}`);

const expectedFieldConsumers=["src/features/auth/ui/login/login-form.tsx", "src/features/theory-of-change/components/form-field/tdm-form-field.tsx", "src/features/theory-of-change/components/sidebar/theory-header-form.tsx", "src/features/theory-of-change/components/edge/tdm-edge-marker-editor.tsx", "src/features/theory-of-change/components/sidebar/tdm-connection-inspector/tdm-connection-inspector.tsx", "src/features/theory-of-change/components/canvas/tdm-canvas-node-form/tdm-canvas-node-form.tsx"];
const expectedTooltipConsumers=["src/features/theory-of-change/components/canvas/tdm-canvas-command-dock.tsx", "src/features/theory-of-change/components/sidebar/tdm-sidebar-primitives.tsx", "src/features/theory-of-change/components/canvas/tdm-canvas-process-dock/tdm-canvas-process-dock.tsx"];
expectedFieldConsumers.forEach((rel)=>req(read(rel).includes("from '@/shared/ui/tdm-field'"),`${rel} nao consome tdm-field pelo entrypoint`));
expectedTooltipConsumers.forEach((rel)=>req(read(rel).includes("from '@/shared/ui/tooltip'"),`${rel} nao consome tooltip pelo entrypoint`));

if(errors.length){console.error('\nSO-017 WAVE 03 SHARED UI PUBLIC ENTRYPOINTS: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);}
console.log('PASS SO-017 Wave 03: tdm-field and tooltip expose canonical public entrypoints, inventoried consumers use them, and deep implementation imports are forbidden.');
