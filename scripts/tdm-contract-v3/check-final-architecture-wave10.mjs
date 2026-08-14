#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd(); const errors=[];
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const json=(rel)=>JSON.parse(read(rel)); const exists=(rel)=>fs.existsSync(path.join(root,rel));
if(process.env.SO014_WAVE09_VERIFIED!=='1'){
 const p=spawnSync(process.execPath,['scripts/tdm-contract-v3/check-final-architecture-wave09.mjs'],{cwd:root,encoding:'utf8'});
 if(p.status!==0){process.stdout.write(p.stdout||'');process.stderr.write(p.stderr||'');errors.push('gate predecessor Wave 09 falhou');}
}
const state=json('.sharkops/state/current-state.json'); const ledger=json('.sharkops/state/bite-ledger.json'); const pkg=json('package.json');
const matrix=json('docs/sharkops/SO-014-FINAL-GATE-MATRIX.json'); const armor=json('docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json');
const so14=ledger.bites.find(b=>b.id==='SO-014');
if(!so14||so14.status!=='ACTIVE'||so14.revision!==10||so14.path!=='.sharkops/bites/so-014-final-architecture-closeout-wave-10'||so14.completedAt) errors.push('SO-014 ledger Wave 10 invalido ou fechado prematuramente');
if(state.activeBiteStatus!=='ACTIVE'||state.lastBite!=='SO-014 | Final Regression Armor'||state.nextBite!=='SO-014 | Final Architecture Closeout') errors.push('current-state Wave 10 invalido');
for(const rel of ['docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json','scripts/tdm-contract-v3/run-final-regression-armor.mjs','docs/sharkops/SO-014-WAVE-10-FINAL-REGRESSION-ARMOR.md']) if(!exists(rel)) errors.push('artefato Wave 10 ausente: '+rel);
for(const script of ['check:tdm:final-architecture:wave10','check:tdm:final-regression:armor']) if(!pkg.scripts?.[script]) errors.push('npm script Wave 10 ausente: '+script);
const groups=new Map(matrix.groups.map(g=>[g.id,g]));
for(const id of ['architecture-closeouts','so014-sealing-waves','repository-regression']) if(!groups.has(id)) errors.push('grupo obrigatorio ausente da matriz: '+id);
const sealing=groups.get('so014-sealing-waves');
if(!sealing?.gates?.some(g=>g.id==='wave09'&&g.script==='check:tdm:final-architecture:wave09')) errors.push('Wave 09 nao registrada na matriz final');
const repo=groups.get('repository-regression');
for(const expected of [['typecheck','typecheck'],['canvas-lint','lint:canvas'],['unit-tests','test:unit'],['canvas-e2e','test:e2e:canvas'],['sharkops','shark:verify']]) if(!repo?.gates?.some(g=>g.id===expected[0]&&g.script===expected[1])) errors.push('regression gate ausente: '+expected[0]);
const steps=new Map(armor.execution?.map(s=>[s.group,s])||[]);
if(steps.get('architecture-closeouts')?.strategy!=='all') errors.push('architecture closeouts devem executar todos os gates');
if(steps.get('so014-sealing-waves')?.strategy!=='latest-transitive'||steps.get('so014-sealing-waves')?.latest!=='wave09') errors.push('SO-014 sealing deve usar Wave 09 transitiva');
if(steps.get('repository-regression')?.strategy!=='all') errors.push('repository regression deve executar todos os gates');
const runner=read('scripts/tdm-contract-v3/run-final-regression-armor.mjs');
if(!runner.includes("spawnSync('npm',['run',script]")||!runner.includes("process.exit(r.status??1)")) errors.push('runner nao executa npm gates com fail-fast real');
if(!runner.includes("process.env.SO014_WAVE09_VERIFIED==='1'")) errors.push('runner nao reutiliza prova Wave 09 da mesma sessao');
const manifest=json('.sharkops/bites/so-014-final-architecture-closeout-wave-10/MANIFEST.json');
if(manifest.wave!=='10'||manifest.runtimeChanges!==false||manifest.regression!=='npm run check:tdm:final-regression:armor') errors.push('manifest Wave 10 inconsistente');
const consolidated=json('docs/sharkops/SO-014-SHARKOPS-CONSOLIDATED-STATE.json');
if(consolidated.currentWave!=='10'||consolidated.activeBite?.revision!==10||consolidated.finalRegressionArmor!=='docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json') errors.push('snapshot consolidado nao acompanha Wave 10');
const handoff=read('docs/sharkops/HANDOFF.md'); if(!handoff.includes('SO-014 Final Architecture Closeout — Wave 10')||!handoff.includes('check:tdm:final-regression:armor')) errors.push('HANDOFF nao registra Wave 10 e seu runner');
if(errors.length){console.error('\nSO-014 FINAL REGRESSION ARMOR: FAIL\n');errors.forEach((e,i)=>console.error((i+1)+'. '+e+'.'));process.exit(1);}
console.log('PASS SO-014 Final Architecture Wave 10: executable final regression armor is sealed across architecture closeouts, transitive SO-014 gates and repository behavior gates without runtime changes.');
