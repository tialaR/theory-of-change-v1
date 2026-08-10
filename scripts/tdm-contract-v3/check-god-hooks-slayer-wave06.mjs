import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'src/features/theory-of-change/components/canvas';
const files = {
  composition: `${base}/tdm-canvas-workspace-composition.tsx`,
  foundation: `${base}/tdm-canvas-workspace-composition/use-canvas-workspace-foundation.ts`,
  actions: `${base}/tdm-canvas-workspace-composition/use-canvas-workspace-actions.ts`,
  presentation: `${base}/tdm-canvas-workspace-composition/use-canvas-workspace-presentation.ts`,
  renderer: `${base}/tdm-canvas-workspace-composition/tdm-canvas-workspace-renderer.tsx`
};

for (const [owner, rel] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing ${owner} owner: ${rel}`);
}

const lineBudget = { composition: 40, foundation: 170, actions: 170, presentation: 100, renderer: 190 };
for (const [owner, rel] of Object.entries(files)) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > lineBudget[owner]) throw new Error(`${owner} exceeded ${lineBudget[owner]} lines: ${lines}`);
  if (/\.scss['"]/.test(source)) throw new Error(`${owner} introduced forbidden .scss import`);
}

const composition = fs.readFileSync(path.join(root, files.composition), 'utf8');
if (composition.includes('tdm-canvas-controllers/')) {
  throw new Error('Workspace composition may not import low-level controllers directly');
}
for (const owner of ['useCanvasWorkspaceFoundation', 'useCanvasWorkspaceActions', 'useCanvasWorkspacePresentation', 'TdmCanvasWorkspaceRenderer']) {
  if (!composition.includes(owner)) throw new Error(`Workspace composition is missing ${owner}`);
}
if ((composition.match(/= useCanvasWorkspace/g) || []).length > 3) {
  throw new Error('Workspace composition may orchestrate only the three published workspace contracts');
}

console.log('PASS SO-007 God Hooks Slayer Wave 06: workspace composition contracts are split and armored.');
