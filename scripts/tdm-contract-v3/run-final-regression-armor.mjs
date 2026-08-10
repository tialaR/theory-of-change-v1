#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd();
const readJson=(rel)=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const matrix=readJson('docs/sharkops/SO-014-FINAL-GATE-MATRIX.json');
const armor=readJson('docs/sharkops/SO-014-FINAL-REGRESSION-ARMOR.json');
const pkg=readJson('package.json');
const byId=new Map(matrix.groups.map(g=>[g.id,g]));
const run=(script)=>{
  if(!pkg.scripts?.[script]){console.error('FAIL missing npm script: '+script);process.exit(1);}
  console.log('\n[FINAL REGRESSION] '+script);
  const r=spawnSync('npm',['run',script],{cwd:root,stdio:'inherit',env:process.env});
  if(r.status!==0) process.exit(r.status??1);
};
for(const step of armor.execution){
  const group=byId.get(step.group);
  if(!group){console.error('FAIL missing matrix group: '+step.group);process.exit(1);}
  if(step.strategy==='all'){ for(const gate of group.gates) run(gate.script); continue; }
  if(step.strategy==='latest-transitive'){
    const gate=group.gates.find(g=>g.id===step.latest);
    if(!gate){console.error('FAIL missing latest transitive gate: '+step.latest);process.exit(1);}
    if(step.latest==='wave09' && process.env.SO014_WAVE09_VERIFIED==='1'){ console.log('\n[FINAL REGRESSION] reused same-session proof: '+gate.script); continue; }
    run(gate.script); continue;
  }
  console.error('FAIL unsupported regression strategy: '+step.strategy); process.exit(1);
}
console.log('\nPASS SO-014 Final Regression Armor: all configured architecture and repository regression gates passed.');
