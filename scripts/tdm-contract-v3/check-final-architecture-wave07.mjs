#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const readJson=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(root,rel));

const adr008='docs/architecture/adr/ADR-008-final-canvas-architecture-constitution.md';
if(!exists(adr008)) errors.push('ADR-008 final architecture constitution ausente');
else {
  const src=read(adr008);
  for(const token of ['**Status:** Accepted','**Supersedes:** ADR-002, ADR-003, ADR-004, ADR-005','Application','Canvas Engine','React Flow','Infrastructure','Server','UI','Executable enforcement']) {
    if(!src.includes(token)) errors.push(`ADR-008 perdeu contrato documental: ${token}`);
  }
}

for(const n of ['002','003','004','005']){
  const rel=`docs/architecture/adr/ADR-${n}-${({'002':'canvas-architecture','003':'renderer-agnostic-canvas','004':'canvas-layout-engine','005':'persistence-pipeline'})[n]}.md`;
  const src=read(rel);
  if(!src.includes('**Status:** Superseded')||!src.includes('**Superseded by:** ADR-008')) errors.push(`ADR-${n} deixou de apontar para ADR-008`);
}

const index=read('docs/architecture/README.md');
for(const token of ['ADR-006 | Application Layer Ownership | Accepted','ADR-007 | React Flow Isolation | Accepted','ADR-008 | Final Canvas Architecture Constitution | Accepted','ADR-002 | Canvas Architecture Boundaries | Superseded by ADR-008']) if(!index.includes(token)) errors.push(`indice arquitetural inconsistente: ${token}`);

const active=read('docs/architecture/decisions/active.md');
for(const token of ['ADR-001','ADR-006','ADR-007','ADR-008']) if(!active.includes(token)) errors.push(`decisao ativa ausente: ${token}`);
const superseded=read('docs/architecture/decisions/deprecated.md');
for(const token of ['ADR-002','ADR-003','ADR-004','ADR-005','ADR-008']) if(!superseded.includes(token)) errors.push(`registro superseded incompleto: ${token}`);

const canvasV4=read('docs/architecture/canvas-v4.md');
if(!canvasV4.startsWith('# Historical status')||!canvasV4.includes('Current Canvas ownership is defined by ADR-008')) errors.push('canvas-v4.md nao esta explicitamente marcado como historico');

const frontend=read('docs/frontend-architecture-guidelines.md');
if(frontend.includes('Rota preservada (DS antigo)')||frontend.includes('Não alterar: React Flow principal')) errors.push('frontend guidelines ainda descrevem /canvas como arquitetura antiga congelada');
if(!frontend.includes('ADR-008')||!frontend.includes('Domain, Application, Engine, Infrastructure, Server e UI')) errors.push('frontend guidelines nao refletem ownership atual do Canvas');

const visual=read('docs/visual-experience-guidelines.md');
if(visual.includes('A rota `/canvas` permanece com o DS antigo')) errors.push('visual guidelines ainda chamam /canvas de DS antigo pendente');
if(!visual.includes('arquitetura interna já foi modularizada')||!visual.includes('ADR-008')) errors.push('visual guidelines nao distinguem experiencia homologada de arquitetura modular');

for(const rel of ['docs/architecture/adr/ADR-006-application-layer-ownership.md','docs/architecture/adr/ADR-007-react-flow-isolation.md']) if(!exists(rel)) errors.push(`ADR aceito ausente: ${rel}`);

const predecessor=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave06.mjs'],{cwd:root,encoding:'utf8'});
if(predecessor.status!==0){process.stdout.write(predecessor.stdout||'');process.stderr.write(predecessor.stderr||'');errors.push('gate predecessor Wave 06 falhou');}

const state=readJson('.sharkops/state/current-state.json');
const ledger=readJson('.sharkops/state/bite-ledger.json');
const pkg=readJson('package.json');
const so14=ledger.bites.find((bite)=>bite.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||so14.revision<7) errors.push('SO-014 Wave 07 state/ledger invalido');
const exactWave07=so14.path==='.sharkops/bites/so-014-final-architecture-closeout-wave-07'&&state.lastBite==='SO-014 | Documentation & ADR Consistency'&&state.nextBite==='SO-014 | Gate Matrix Consolidation';
const registeredDownstream=Boolean(so14.revision>=8&&typeof so14.path==='string'&&so14.path.startsWith('.sharkops/bites/so-014-final-architecture-closeout-wave-')&&state.activeBite==='SO-014 | Final Architecture Closeout'&&state.activeBiteStatus==='ACTIVE'&&typeof state.lastBite==='string'&&state.lastBite.startsWith('SO-014 | ')&&typeof state.nextBite==='string'&&state.nextBite.startsWith('SO-014 | '));
if(!exactWave07&&!registeredDownstream) errors.push('Current State perdeu a Wave 07 ou uma progressao SO-014 downstream registrada');
if(!pkg.scripts?.['check:tdm:final-architecture:wave07']) errors.push('npm script Wave 07 ausente');
const handoff=read('docs/sharkops/HANDOFF.md');
if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 07')) errors.push('HANDOFF Wave 07 ausente');
for(const rel of ['docs/sharkops/SO-014-WAVE-07-DOCUMENTATION-ADR-CONSISTENCY.md','.sharkops/bites/so-014-final-architecture-closeout-wave-07/MANIFEST.json']) if(!exists(rel)) errors.push(`artefato Wave 07 ausente: ${rel}`);

if(errors.length){
  console.error('\nSO-014 DOCUMENTATION & ADR CONSISTENCY: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-014 Final Architecture Wave 07: architecture documentation, ADR status, historical references and current Canvas ownership are consistent with the repository-backed final architecture without runtime changes.');
