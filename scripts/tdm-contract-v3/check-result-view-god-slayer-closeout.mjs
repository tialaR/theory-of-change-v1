import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const gates = Array.from({ length: 7 }, (_, index) =>
  `scripts/tdm-contract-v3/check-result-view-god-slayer-wave${String(index + 1).padStart(2, '0')}.mjs`
);
for (const gate of gates) {
  if (!fs.existsSync(path.join(root, gate))) throw new Error(`Missing SO-008 wave gate: ${gate}`);
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`SO-008 wave gate failed: ${gate}`);
  }
}

const resultRoot = 'src/features/theory-of-change/components/result-view';
const budgets = {
  [`${resultRoot}/result-view.tsx`]: 170,
  [`${resultRoot}/result-view-export-menu/result-view-export-menu.tsx`]: 220,
  [`${resultRoot}/result-reading-card/result-reading-card.tsx`]: 220,
  [`${resultRoot}/result-flow-visualization/result-flow-visualization.tsx`]: 480,
  [`${resultRoot}/result-view-focus-controller/use-result-view-focus-controller.ts`]: 220,
  [`${resultRoot}/result-view-hero/result-view-hero.tsx`]: 260,
  [`${resultRoot}/result-view-hero/use-result-view-hero-controller.ts`]: 160,
  [`${resultRoot}/result-theory-flow/result-theory-flow.tsx`]: 260,
  [`${resultRoot}/result-view-export-controller/use-result-view-export-controller.ts`]: 220
};
for (const [rel, maxLines] of Object.entries(budgets)) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) throw new Error(`Missing SO-008 protected owner: ${rel}`);
  const source = fs.readFileSync(absolute, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > maxLines) throw new Error(`${rel} exceeded closeout budget ${maxLines}: ${lines}`);
  if (/\.scss['"]/.test(source)) throw new Error(`${rel} introduced forbidden .scss import`);
}

const facade = fs.readFileSync(path.join(root, `${resultRoot}/result-view.tsx`), 'utf8');
const requiredContracts = [
  'ResultViewHero',
  'ResultTheoryFlow',
  'useResultViewFocusController',
  'useResultViewExportController'
];
for (const contract of requiredContracts) {
  if (!facade.includes(contract)) throw new Error(`ResultView facade lost published contract: ${contract}`);
}
const forbiddenFacadeTokens = [
  'exportTheoryPng',
  'exportTheorySvg',
  'exportTheoryPdf',
  'exportTheoryDocx',
  'ResizeObserver',
  'requestAnimationFrame',
  'addEventListener(\'scroll\'',
  'ResultLiquidCard'
];
for (const token of forbiddenFacadeTokens) {
  if (facade.includes(token)) throw new Error(`Low-level responsibility leaked back into ResultView facade: ${token}`);
}

const requiredOwners = [
  `${resultRoot}/result-view-export-menu`,
  `${resultRoot}/result-reading-card`,
  `${resultRoot}/result-flow-visualization`,
  `${resultRoot}/result-view-focus-controller`,
  `${resultRoot}/result-view-hero`,
  `${resultRoot}/result-theory-flow`,
  `${resultRoot}/result-view-export-controller`
];
for (const owner of requiredOwners) {
  if (!fs.statSync(path.join(root, owner), { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`Missing SO-008 ownership boundary: ${owner}`);
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
walk(path.join(root, resultRoot));
if (forbiddenExtensions.length) throw new Error(`Forbidden .scss files found:\n${forbiddenExtensions.join('\n')}`);

console.log('PASS SO-008 Result View God Slayer Closeout: seven ownership waves remain active, bounded and regression-armored.');
