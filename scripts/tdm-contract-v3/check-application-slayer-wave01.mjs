import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const applicationRoot = path.join(repo, 'src/features/theory-of-change/canvas/application');
const layoutPath = path.join(applicationRoot, 'canvas-layout.ts');
const fail = (message) => { console.error(`FAIL SO-010 Wave 01: ${message}`); process.exit(1); };

if (!fs.existsSync(layoutPath)) fail('missing canvas-layout.ts');

const forbiddenSegments = ['/ui/', '/react-flow/', '/infrastructure/', '/server/'];
const forbiddenPackages = ['react', 'next/', '@xyflow/react'];
const files = fs.readdirSync(applicationRoot)
  .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
  .map((name) => path.join(applicationRoot, name));

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const importPattern = /(?:from\s+|import\s*)['"]([^'"]+)['"]/g;
  let match;
  while ((match = importPattern.exec(source))) {
    const specifier = match[1];
    if (forbiddenSegments.some((segment) => specifier.includes(segment))) {
      fail(`${path.relative(repo, file)} imports forbidden adapter/UI boundary: ${specifier}`);
    }
    if (forbiddenPackages.some((pkg) => specifier === pkg || specifier.startsWith(pkg))) {
      fail(`${path.relative(repo, file)} imports forbidden framework package: ${specifier}`);
    }
  }
}

const layout = fs.readFileSync(layoutPath, 'utf8');
for (const token of ['CanvasLayoutNode', 'CanvasLayoutEdge', 'CanvasLayoutPosition']) {
  if (!layout.includes(`export type ${token}`)) fail(`neutral layout contract missing: ${token}`);
}
if (layout.includes('CanvasStageNode') || layout.includes('CanvasCausalEdge')) {
  fail('React Flow-owned types leaked back into application layout');
}

console.log('PASS SO-010 Application Slayer Wave 01: Application boundary is framework-neutral and React Flow imports are blocked.');
