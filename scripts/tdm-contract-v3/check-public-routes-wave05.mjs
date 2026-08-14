#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), errors=[]; const exists=r=>fs.existsSync(path.join(root,r)); const read=r=>fs.readFileSync(path.join(root,r),'utf8'); const json=r=>JSON.parse(read(r));
const required=[
'docs/sharkops/SO-015-PUBLIC-COMPOSITION-CONTRACT.json',
'docs/sharkops/SO-015-WAVE-05-SHARED-PUBLIC-PRIMITIVES-COMPOSITION-CONTRACTS.md',
'src/features/theory-of-change/components/public-pages/theory-flow-board/index.ts',
'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board.tsx',
'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-edge-layer.tsx',
'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-stage-labels.tsx',
'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-node-cards.tsx',
'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-utils.ts',
'.sharkops/bites/so-015-public-routes-application-surface-armor-wave-05/MANIFEST.json'];
for(const r of required) if(!exists(r)) errors.push('artefato obrigatorio ausente: '+r);
if(exists('src/features/theory-of-change/components/public-pages/theory-flow-board.tsx')) errors.push('antigo TheoryFlowBoard monolitico ainda existe');
const c=json('docs/sharkops/SO-015-PUBLIC-COMPOSITION-CONTRACT.json');
if(!c.rules?.some(r=>r.includes('one-off experience must still be decomposed'))) errors.push('regra anti God Component para experiencias unicas ausente');
const main=read('src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board.tsx');
for(const marker of ['TheoryFlowBoardEdgeLayer','TheoryFlowBoardStageLabels','TheoryFlowBoardNodeCards']) if(!main.includes(marker)) errors.push('composicao TheoryFlowBoard nao delega: '+marker);
const shared='src/shared/ui';
const walk=p=>{for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name); if(e.isDirectory()) walk(f); else if(/\.(ts|tsx)$/.test(e.name)){const s=fs.readFileSync(f,'utf8'); if(s.includes('/components/public-pages')) errors.push('shared UI depende da implementacao public-pages: '+path.relative(root,f));}}}; walk(path.join(root,shared));
const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json'), pkg=json('package.json'); const so=ledger.bites.find(b=>b.id==='SO-015');
if(!so||so.status!=='ACTIVE'||so.revision<5) errors.push('SO-015 deve estar ACTIVE na revisao 5 ou progressao cumulativa posterior');
if(so?.revision===5 && state.lastBite!=='SO-015 | Shared Public Primitives & Composition Contracts') errors.push('current-state invalido para Wave 05 exata');
if(state.goldenStateStatus!=='COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
if(pkg.scripts?.['check:tdm:public-routes:wave05']!=='node scripts/tdm-contract-v3/check-public-routes-wave05.mjs') errors.push('npm script Wave 05 ausente');
if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 05: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);} console.log('PASS SO-015 Public Routes Wave 05: unique public visual recipes remain feature-owned without God Component exemptions, TheoryFlowBoard is decomposed by responsibility, shared primitive promotion remains evidence-based, and the Canvas Golden State stays sealed.');
