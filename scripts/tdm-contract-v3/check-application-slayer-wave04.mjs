import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  console.error(`FAIL SO-010 Application Slayer Wave 04: ${message}`);
  process.exit(1);
};

const applicationFile = 'src/features/theory-of-change/canvas/application/canvas-project-content.ts';
const testFile = 'src/features/theory-of-change/canvas/application/canvas-project-content.test.ts';
const hookFile = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-project-persistence.ts';

for (const file of [applicationFile, testFile, hookFile]) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const application = read(applicationFile);
const test = read(testFile);
const hook = read(hookFile);

if (!application.includes('export function assembleCanvasProjectContent')) {
  fail('Application must own persistence content assembly.');
}
if (!application.includes("Pick<CanvasProject, 'title' | 'nodes' | 'connections' | 'viewport'>")) {
  fail('Persistable content contract must remain explicit and bounded.');
}
if (/from ['"].*(react-flow|\/ui\/|\/server\/|\/infrastructure\/)/.test(application)) {
  fail('Persistence content assembly must remain framework-neutral.');
}
if (!hook.includes('assembleCanvasProjectContent({')) {
  fail('Persistence hook must delegate save content assembly to Application.');
}
if (/queue\.saveLatest\(\s*\{[\s\S]*?title:[\s\S]*?nodes:[\s\S]*?connections:/m.test(hook)) {
  fail('UI must not manually assemble the persistence payload.');
}
if (!test.includes("not.toHaveProperty('revision')") || !test.includes('not.toBe(viewport)')) {
  fail('Assembly tests must protect metadata exclusion and viewport snapshot ownership.');
}

console.log('PASS SO-010 Application Slayer Wave 04: persistence content assembly is owned by Application and UI only adapts the live graph.');
