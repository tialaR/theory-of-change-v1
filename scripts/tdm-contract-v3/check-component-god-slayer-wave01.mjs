import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const rel='src/features/theory-of-change/components/sidebar/tdm-sidebar.tsx';
const file=fs.readFileSync(path.join(root,rel),'utf8');
const lines=file.split(/\r?\n/).length;
const required=[
 'src/features/theory-of-change/components/sidebar/tdm-sidebar.contract.ts',
 'src/features/theory-of-change/components/sidebar/tdm-sidebar-primitives.tsx',
 'src/features/theory-of-change/components/sidebar/quick-shortcuts-card.tsx'
];
const problems=[];
if(lines>800) problems.push(`tdm-sidebar.tsx excede budget de 800 linhas (${lines})`);
for(const item of required){if(!fs.existsSync(path.join(root,item))) problems.push(`ausente: ${item}`);}
for(const forbidden of ['function QuickShortcutsCard','function AccordionChevron','export type TdmSidebarContext =']){if(file.includes(forbidden)) problems.push(`responsabilidade ainda presa ao God Component: ${forbidden}`);}
if(problems.length){console.error('\nTDM COMPONENT GOD SLAYER WAVE 01: FAIL\n'); problems.forEach((p,i)=>console.error(`${i+1}. ${p}`)); process.exit(1);}
console.log('PASS: contrato, primitivas e atalhos foram extraídos; TdmSidebar ficou abaixo de 800 linhas.');
