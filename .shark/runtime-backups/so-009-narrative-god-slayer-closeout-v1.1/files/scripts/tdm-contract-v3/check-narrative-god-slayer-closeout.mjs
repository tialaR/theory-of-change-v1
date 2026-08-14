import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const gates = Array.from({ length: 7 }, (_, index) =>
  `scripts/tdm-contract-v3/check-narrative-god-slayer-wave${String(index + 1).padStart(2, '0')}.mjs`
);
for (const gate of gates) {
  if (!fs.existsSync(path.join(root, gate))) throw new Error(`Missing SO-009 wave gate: ${gate}`);
  const result = spawnSync(process.execPath, [gate], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`SO-009 wave gate failed: ${gate}`);
  }
}

const narrativeRoot = 'src/features/theory-of-change/components/result-view/result-theory-narrative';
const mappingRoot = `${narrativeRoot}/narrative-mapping`;
const budgets = {
  [`${narrativeRoot}/theory-narrative.mapper.ts`]: 60,
  [`${mappingRoot}/theory-document-builders.ts`]: 220,
  [`${mappingRoot}/theory-figure-builders.ts`]: 260,
  [`${mappingRoot}/theory-graph-traversal.ts`]: 240,
  [`${mappingRoot}/theory-condition-builders.ts`]: 240,
  [`${mappingRoot}/theory-resource-action-builders.ts`]: 300,
  [`${mappingRoot}/theory-delivery-result-builders.ts`]: 340,
  [`${mappingRoot}/theory-page-builders.ts`]: 520,
  [`${mappingRoot}/theory-document-assembly.ts`]: 180
};
for (const [rel, maxLines] of Object.entries(budgets)) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) throw new Error(`Missing SO-009 protected owner: ${rel}`);
  const source = fs.readFileSync(absolute, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > maxLines) throw new Error(`${rel} exceeded closeout budget ${maxLines}: ${lines}`);
  if (/\.scss['"]/.test(source)) throw new Error(`${rel} introduced forbidden .scss import`);
}

const facade = fs.readFileSync(path.join(root, `${narrativeRoot}/theory-narrative.mapper.ts`), 'utf8');
for (const contract of ['buildTheoryNarrativeDocument', 'buildTheoryDocument', 'buildTheoryDocumentAssembly']) {
  if (!facade.includes(contract)) throw new Error(`Narrative facade lost published contract: ${contract}`);
}
for (const token of ['emitRiskConditions', 'emitHypothesisConditions', 'buildMacroPages', 'buildSelectedFlowPages', 'createFigure']) {
  if (facade.includes(token)) throw new Error(`Low-level narrative responsibility leaked into facade: ${token}`);
}

const requiredOwners = [
  'theory-document-builders.ts',
  'theory-figure-builders.ts',
  'theory-graph-traversal.ts',
  'theory-condition-builders.ts',
  'theory-resource-action-builders.ts',
  'theory-delivery-result-builders.ts',
  'theory-page-builders.ts',
  'theory-document-assembly.ts'
];
for (const owner of requiredOwners) {
  if (!fs.existsSync(path.join(root, mappingRoot, owner))) throw new Error(`Missing SO-009 ownership boundary: ${owner}`);
}

const forbiddenExtensions = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.scss')) forbiddenExtensions.push(path.relative(root, absolute));
  }
}
walk(path.join(root, narrativeRoot));
if (forbiddenExtensions.length) throw new Error(`Forbidden .scss files found:\n${forbiddenExtensions.join('\n')}`);

console.log('PASS SO-009 Narrative God Slayer Closeout: seven ownership waves remain active, bounded and regression-armored.');
