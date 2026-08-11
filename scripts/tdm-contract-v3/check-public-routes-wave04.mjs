#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), errors=[];
const read=(r)=>fs.readFileSync(path.join(root,r),'utf8');
const json=(r)=>JSON.parse(read(r));
const exists=(r)=>fs.existsSync(path.join(root,r));
const required=[
  'docs/sharkops/SO-015-PUBLIC-VISUAL-LANGUAGE.json',
  'docs/sharkops/SO-015-WAVE-04-PUBLIC-VISUAL-LANGUAGE-DESIGN-SYSTEM-FOUNDATIONS.md',
  'src/shared/styles/tdm/tdm-tokens.sass',
  'src/shared/ui/tdm-public-layout/tdm-public-layout.module.sass',
  'src/shared/motion/tdm-motion/index.ts',
  'src/features/theory-of-change/components/public-pages/public-pages.module.sass',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-04/MANIFEST.json'
];
for(const r of required) if(!exists(r)) errors.push('artefato obrigatorio ausente: '+r);
const c=json('docs/sharkops/SO-015-PUBLIC-VISUAL-LANGUAGE.json');
if(c.id!=='TDM-PUBLIC-VISUAL-LANGUAGE-v1'||c.status!=='ACTIVE') errors.push('contrato visual publico invalido');
if(c.principle!=='preserve personality while formalizing repeatable visual language') errors.push('principio de preservacao de personalidade ausente');
if(c.promotionPolicy?.minimumEvidence!=='repeated semantic role or cross-route behavior, not visual similarity alone') errors.push('politica de promocao por evidencia ausente');
const tokens=read('src/shared/styles/tdm/tdm-tokens.sass');
for(const module of ['tdm-color','tdm-surface','tdm-border','tdm-radius','tdm-shadow','tdm-focus','tdm-motion','tdm-font','tdm-spacing','tdm-measure','tdm-public-action','tdm-route']) if(!tokens.includes(`@use '${module}'`)) errors.push('fundacao canonica de token ausente: '+module);
const layout=read('src/shared/ui/tdm-public-layout/tdm-public-layout.module.sass');
for(const marker of ['.shell','.header','.navLink','.hero','prefers-reduced-motion']) if(!layout.includes(marker)) errors.push('contrato visual publico ausente no layout: '+marker);
const sharedRoots=['src/shared/ui/tdm-public-layout','src/shared/motion/tdm-motion'];
for(const dir of sharedRoots){
  const abs=path.join(root,dir);
  for(const entry of fs.readdirSync(abs,{recursive:true,withFileTypes:true})){
    if(!entry.isFile()) continue;
    const full=path.join(entry.parentPath||entry.path,entry.name);
    if(!/\.(ts|tsx|sass)$/.test(full)) continue;
    const s=fs.readFileSync(full,'utf8');
    if(s.includes('@/features/theory-of-change/canvas')||s.includes('/components/public-pages')) errors.push('shared public foundation depende de implementacao de feature: '+path.relative(root,full));
  }
}
const componentStyleRoots=['src/shared/ui/tdm-public-layout','src/shared/ui/tdm-public-feature-card','src/features/theory-of-change/components/public-pages'];
for(const dir of componentStyleRoots){
  const abs=path.join(root,dir);
  const walk=(p)=>{for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name); if(e.isDirectory()) walk(f); else if(/\.scss$/.test(e.name)||(/\.sass$/.test(e.name)&&!e.name.endsWith('.module.sass'))) { if(!f.includes('/shared/styles/')) errors.push('estilo de componente fora de .module.sass: '+path.relative(root,f)); }}};
  walk(abs);
}
const ledger=json('.sharkops/state/bite-ledger.json'), state=json('.sharkops/state/current-state.json'), pkg=json('package.json');
const old=ledger.bites.filter(b=>/^SO-0(0[1-9]|1[0-4])$/.test(b.id)); if(old.length!==14||old.some(b=>b.status!=='COMPLETE')) errors.push('SO-001 a SO-014 devem permanecer COMPLETE');
const so=ledger.bites.find(b=>b.id==='SO-015'); if(!so||so.status!=='ACTIVE'||so.revision<4) errors.push('SO-015 deve preservar a Wave 04 em progressao cumulativa');
if(state.goldenStateStatus!=='COMPLETE') errors.push('current-state perdeu Golden State durante progressao da Wave 04');
if(pkg.scripts?.['check:tdm:public-routes:wave04']!=='node scripts/tdm-contract-v3/check-public-routes-wave04.mjs') errors.push('npm script Wave 04 ausente');
if(errors.length){console.error('\nSO-015 PUBLIC ROUTES WAVE 04: FAIL\n'); errors.forEach((e,i)=>console.error(`${i+1}. ${e}.`)); process.exit(1);}
console.log('PASS SO-015 Public Routes Wave 04: the existing public visual language is formally governed as an independent Design System source of truth, promotion requires evidence, intentional route personality remains feature-owned, and the Canvas Golden State stays sealed without runtime changes.');
