import fs from 'node:fs';
const root='src/features/theory-of-change/components/result-view';
const facade=`${root}/result-view.tsx`;
const owner=`${root}/result-view-export-controller/use-result-view-export-controller.ts`;
const fail=(m)=>{console.error(`FAIL ${m}`);process.exit(1)};
if(!fs.existsSync(owner)) fail('export controller owner missing');
const facadeSource=fs.readFileSync(facade,'utf8');
const ownerSource=fs.readFileSync(owner,'utf8');
const facadeLines=facadeSource.split(/\r?\n/).length;
if(facadeLines>170) fail(`result-view facade budget exceeded: ${facadeLines} > 170`);
for(const token of ['exportTheoryPng','exportTheorySvg','exportTheoryPdf','exportTheoryDocx','buildTheoryExportModel']) {
  if(facadeSource.includes(token)) fail(`export implementation leaked back into facade: ${token}`);
  if(!ownerSource.includes(token)) fail(`export controller lost ownership: ${token}`);
}
if(!facadeSource.includes('useResultViewExportController')) fail('facade must consume export controller contract');
if([...fs.readdirSync(root,{recursive:true})].some((p)=>String(p).endsWith('.scss'))) fail('.scss is forbidden in result-view');
console.log('PASS SO-008 Result View God Slayer Wave 07: export lifecycle ownership is split and armored.');
