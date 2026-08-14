import fs from 'node:fs';

const applicationPath = 'src/features/theory-of-change/canvas/application/canvas-node-actions.ts';
const hookPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-node-actions.ts';
const application = fs.readFileSync(applicationPath, 'utf8');
const hook = fs.readFileSync(hookPath, 'utf8');

const failures = [];

if (!application.includes('export type CanvasEditableNodeField')) {
  failures.push('Application must own an explicit CanvasEditableNodeField contract.');
}
if (!application.includes("'title' | 'description' | 'advancedDetails'")) {
  failures.push('Editable field contract must remain limited to content fields.');
}
if (!application.includes('field: CanvasEditableNodeField')) {
  failures.push('updateSelectedCanvasNode must consume the editable field contract.');
}
if (!hook.includes("import type { CanvasEditableNodeField }")) {
  failures.push('UI hook must consume the Application editable field contract.');
}
if (!hook.includes('field: CanvasEditableNodeField')) {
  failures.push('UI hook must not widen editable fields to all React Flow node data keys.');
}
if (hook.includes('field: keyof CanvasNodeData')) {
  failures.push('Technical node metadata such as order must not leak into editable commands.');
}

if (failures.length > 0) {
  console.error('FAIL SO-010 Application Slayer Wave 02 hotfix:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('PASS SO-010 Application Slayer Wave 02 hotfix: editable content fields are explicit and technical order metadata is excluded.');
