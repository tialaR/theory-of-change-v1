import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (message) => { console.error(`FAIL ${message}`); process.exit(1); };

const kernelPath = 'src/features/theory-of-change/canvas/engine/canvas-engine-persistence.ts';
const appPath = 'src/features/theory-of-change/canvas/application/canvas-project-content.ts';
const queuePath = 'src/features/theory-of-change/canvas/application/canvas-save-queue.ts';

for (const file of [kernelPath, appPath, queuePath]) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const kernel = read(kernelPath);
const app = read(appPath);
const queue = read(queuePath);

for (const forbidden of ['react', '@xyflow/react', 'repository', 'fetch(', 'saveCanvasProjectAction']) {
  if (kernel.toLowerCase().includes(forbidden.toLowerCase())) fail(`persistence kernel contains forbidden dependency: ${forbidden}`);
}

if (!kernel.includes('createCanvasEnginePersistenceSnapshot')) fail('snapshot kernel missing');
if (!kernel.includes('createCanvasEnginePersistenceSignature')) fail('signature kernel missing');
if (!app.includes("../engine/canvas-engine")) fail('application does not delegate persistence content to engine');
if (!queue.includes('createCanvasEnginePersistenceSnapshot')) fail('save queue does not use engine snapshot isolation');
if (queue.includes('function snapshotContent')) fail('legacy application snapshot helper still exists');

console.log('PASS SO-012 Canvas Engine Wave 06 Persistence Boundary');
