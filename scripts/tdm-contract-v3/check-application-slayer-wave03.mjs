import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const applicationFile = path.join(root, 'src/features/theory-of-change/canvas/application/canvas-relation-actions.ts');
const hookFile = path.join(root, 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-relation-actions.ts');
const testFile = path.join(root, 'src/features/theory-of-change/canvas/application/canvas-relation-actions.test.ts');

for (const file of [applicationFile, hookFile, testFile]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required Wave 03 file: ${path.relative(root, file)}`);
}

const application = fs.readFileSync(applicationFile, 'utf8');
const hook = fs.readFileSync(hookFile, 'utf8');

for (const token of ['prepareCanvasRelationSave', 'prepareCanvasRelationRemoval', 'prepareCanvasConnectionDeletion']) {
  if (!application.includes(`export function ${token}`)) throw new Error(`Application relation contract missing: ${token}`);
  if (!hook.includes(token)) throw new Error(`UI hook is not delegating to Application: ${token}`);
}

if (/from ['"].*(ui|react-flow|infrastructure|server)/.test(application)) {
  throw new Error('Application relation actions must remain framework and adapter neutral.');
}

if (hook.includes('relationDraft.description.trim()')) {
  throw new Error('Relation description validation leaked back into the UI hook.');
}

if (!application.includes("status: 'description-required'") || !application.includes("status: 'not-available'")) {
  throw new Error('Application relation decisions must be explicit result contracts.');
}

console.log('PASS SO-010 Application Slayer Wave 03: relation decisions are owned by Application while translated effects remain in UI.');
