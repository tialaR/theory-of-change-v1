#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), errors=[];
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const json=r=>JSON.parse(read(r));
const req=(x,m)=>{if(!x)errors.push(m)};
const audit=json('docs/sharkops/SO-018-DESIGN-SYSTEM-TOKEN-GOVERNANCE-AUDIT.json');
const ledger=json('.sharkops/state/bite-ledger.json');
const state=json('.sharkops/state/current-state.json');
const so18=(ledger.bites??[]).find(b=>b.id==='SO-018');
const ds001=(audit.findings??[]).find(f=>f.id==='DS-001');
req((so18?.status==='ACTIVE' && (so18?.revision??0)>=2) || (so18?.status==='COMPLETE' && (so18?.revision??0)>=5),'SO-018 deve estar ACTIVE apos a Wave 02 ou COMPLETE no closeout');
req(String(ds001?.status).startsWith('RESOLVED-'),'DS-001 deve permanecer resolvido');
req((so18?.status==='ACTIVE' && state.activeBite==='SO-018 | Design System & Token Governance' && state.activeBiteStatus==='ACTIVE') || (so18?.status==='COMPLETE' && state.activeBite===null && state.activeBiteStatus==='NONE'),'current-state perdeu ownership SO-018');
req(state.goldenStateStatus==='COMPLETE' && state.goldenStateId==='GOLDEN-STATE-v1','Golden State deixou de estar selado');
const legacy=read('src/shared/styles/tokens.sass');
req(legacy.includes('TDM LEGACY TOKEN COMPATIBILITY BOUNDARY'),'tokens.sass perdeu o contrato de compatibility boundary');
req(legacy.includes('new consumers are forbidden; the consumer count may only decrease'),'tokens.sass perdeu regra non-growing');
req(!/^:root\b/m.test(legacy),'legacy tokens.sass nao pode emitir :root top-level');
req(!/^(html|body|\*|\.[A-Za-z_-]|#[A-Za-z_-])[^{=]*$/m.test(legacy),'legacy tokens.sass nao pode ganhar seletor CSS top-level');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=path.join(d,e.name); return e.isDirectory()?walk(f):[f]})}
const tdmFiles=walk(path.join(root,'src/shared/styles/tdm')).filter(f=>f.endsWith('.sass'));
const canonicalBackDeps=tdmFiles.filter(f=>/shared\/styles\/tokens|\.\.\/tokens/.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(root,f));
req(canonicalBackDeps.length===0,`canonical tdm modules dependem do legacy: ${canonicalBackDeps.join(', ')}`);
const source=walk(path.join(root,'src')).filter(f=>/\.(sass|ts|tsx)$/.test(f));
const consumers=source.filter(f=>/shared\/styles\/tokens|styles\/tokens/.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(root,f));
req(consumers.length<=39,`legacy compatibility layer ganhou consumidores: ${consumers.length} > 39`);
const ds=(legacy.match(/^\$ds-[\w-]+:/gm)||[]).length;
const noir=(legacy.match(/^\$noir-[\w-]+:/gm)||[]).length;
const stage=(legacy.match(/^\$stage-[\w-]+:/gm)||[]).length;
req(ds<=33,`familia $ds-* expandiu: ${ds} > 33`); req(noir<=74,`familia $noir-* expandiu: ${noir} > 74`); req(stage<=25,`familia $stage-* expandiu: ${stage} > 25`);
req((so18?.revision??0)===2 ? audit.nextBite?.targetFinding==='DS-002' : ((so18?.revision??0)>2 && String((audit.findings??[]).find(f=>f.id==='DS-002')?.status).startsWith('RESOLVED-')),'Wave 02 deve apontar DS-002 ou reconhecer sua resolucao em progressao posterior');
if(errors.length){console.error('\nSO-018 WAVE 02 LEGACY TOKEN COMPATIBILITY BOUNDARY: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1)}
console.log('PASS SO-018 Wave 02: tokens.sass is sealed as a non-growing Sass compatibility boundary, canonical tdm modules cannot depend on it, global selector emission is forbidden, and legacy DS/noir/stage families may only shrink.');
