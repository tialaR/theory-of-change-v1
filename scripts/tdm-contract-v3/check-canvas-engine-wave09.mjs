import fs from 'node:fs';
import path from 'node:path';

const facadePath = 'src/features/theory-of-change/canvas/engine/canvas-engine.ts';
const testPath = 'src/features/theory-of-change/canvas/engine/canvas-engine.test.ts';
for (const file of [facadePath, testPath]) {
  if (!fs.existsSync(file)) throw new Error(`Wave 09 missing required file: ${file}`);
}
const facade = fs.readFileSync(facadePath, 'utf8');
for (const moduleName of ['contracts','state','commands','history','layout','persistence','selection','interaction']) {
  const expected = moduleName === 'contracts' ? "./canvas-engine.contracts" : `./canvas-engine-${moduleName}`;
  if (!facade.includes(expected)) throw new Error(`Facade does not export ${expected}.`);
}
if (/@xyflow\/react|from ['"]react['"]|next\//.test(facade)) {
  throw new Error('Engine facade must remain framework-neutral.');
}
const roots = [
  'src/features/theory-of-change/canvas/ui',
  'src/features/theory-of-change/canvas/application',
];
const deepImport = /from ['"][^'"]*\/engine\/canvas-engine(?:\.contracts|-(?:state|commands|history|layout|persistence|selection|interaction))['"]/;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const source = fs.readFileSync(target, 'utf8');
      if (deepImport.test(source)) throw new Error(`External deep Engine import detected: ${target}`);
    }
  }
}
for (const root of roots) walk(root);
console.log('PASS SO-012 Canvas Engine Wave 09 Engine Facade');
