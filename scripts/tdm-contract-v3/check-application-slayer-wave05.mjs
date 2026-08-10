import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  console.error(`FAIL SO-010 Application Slayer Wave 05: ${message}`);
  process.exit(1);
};

const applicationFile = 'src/features/theory-of-change/canvas/application/canvas-save-policy.ts';
const testFile = 'src/features/theory-of-change/canvas/application/canvas-save-policy.test.ts';
const hookFile = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-save-controller.ts';

for (const file of [applicationFile, testFile, hookFile]) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const application = read(applicationFile);
const test = read(testFile);
const hook = read(hookFile);

if (!application.includes('export function decideCanvasSaveState')) {
  fail('Application must own revision-to-save-state decisions.');
}
if (!application.includes('export async function saveCanvasUntilClean')) {
  fail('Application must own bounded save retry policy.');
}
if (!application.includes('MAX_NAVIGATION_SAVE_ATTEMPTS = 3')) {
  fail('Navigation retry limit must remain explicit and named.');
}
if (/from ['"].*(react|next|\/ui\/|\/react-flow\/|\/server\/|\/infrastructure\/)/.test(application)) {
  fail('Save policy must remain framework-neutral.');
}
if (!hook.includes('decideCanvasSaveState({') || !hook.includes('saveCanvasUntilClean({')) {
  fail('Save controller must delegate state and retry decisions to Application.');
}
if (/for\s*\([^)]*attempt[^)]*<\s*3/.test(hook)) {
  fail('UI must not own the navigation retry loop.');
}
if (!hook.includes("window.addEventListener('beforeunload'") || !hook.includes("document.addEventListener('visibilitychange'")) {
  fail('Browser lifecycle effects must remain in UI.');
}
if (!test.includes("status: 'exhausted'") || !test.includes('MAX_NAVIGATION_SAVE_ATTEMPTS')) {
  fail('Tests must protect bounded retry exhaustion.');
}

console.log('PASS SO-010 Application Slayer Wave 05: save state and bounded retry policies are owned by Application while browser effects remain in UI.');
