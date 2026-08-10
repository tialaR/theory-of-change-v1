import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const gates = Array.from({ length: 7 }, (_, index) => `scripts/tdm-contract-v3/check-god-hooks-slayer-wave${String(index + 1).padStart(2, '0')}.mjs`);
for (const gate of gates) {
  if (!fs.existsSync(path.join(root, gate))) throw new Error(`Missing SO-007 wave gate: ${gate}`);
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`SO-007 wave gate failed: ${gate}`);
  }
}

const budgets = {
  'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-composition.tsx': 40,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-node-crud-controller.ts': 80,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-navigation-controller.ts': 60,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-stage-guide-controller.ts': 70,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-interaction-controller.ts': 50,
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-marker-controller.ts': 50,
  'src/features/theory-of-change/canvas/ui/hooks/use-canvas-flow-controller.ts': 90
};

for (const [rel, maxLines] of Object.entries(budgets)) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) throw new Error(`Missing SO-007 protected facade: ${rel}`);
  const source = fs.readFileSync(absolute, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > maxLines) throw new Error(`${rel} exceeded closeout budget ${maxLines}: ${lines}`);
  if (/\.scss['"]/.test(source)) throw new Error(`${rel} introduced forbidden .scss import`);
}

const requiredOwners = [
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/node-crud',
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/navigation',
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/stage-guide',
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/interaction',
  'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/marker',
  'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-composition',
  'src/features/theory-of-change/canvas/ui/hooks/canvas-flow'
];
for (const owner of requiredOwners) {
  if (!fs.statSync(path.join(root, owner), { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`Missing SO-007 ownership boundary: ${owner}`);
  }
}

const forbiddenExtensions = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.scss')) forbiddenExtensions.push(path.relative(root, absolute));
  }
}
walk(path.join(root, 'src/features/theory-of-change'));
if (forbiddenExtensions.length) throw new Error(`Forbidden .scss files found:\n${forbiddenExtensions.join('\n')}`);

console.log('PASS SO-007 God Hooks Slayer Closeout: seven ownership waves remain active, bounded and regression-armored.');
