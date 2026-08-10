import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'src/features/theory-of-change/components/result-view/result-theory-narrative';
const mapperPath = path.join(root, base, 'theory-narrative.mapper.ts');
const ownerPath = path.join(root, base, 'narrative-mapping/theory-condition-builders.ts');

function fail(message) {
  console.error(`FAIL SO-009 Wave 03: ${message}`);
  process.exit(1);
}

for (const file of [mapperPath, ownerPath]) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
}

const mapper = fs.readFileSync(mapperPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');
const mapperLines = mapper.split(/\r?\n/).length;
const ownerLines = owner.split(/\r?\n/).length;

if (mapperLines > 835) fail(`mapper budget exceeded: ${mapperLines} > 835`);
if (ownerLines > 140) fail(`condition owner budget exceeded: ${ownerLines} > 140`);

for (const token of [
  'function emitRiskCallouts',
  'function emitHypothesisCallouts',
  'riskTransitionSentence(',
  'hypothesisTransitionSentence(',
  'NARRATIVE_LABELS.risk',
  'NARRATIVE_LABELS.hypothesis'
]) {
  if (mapper.includes(token)) fail(`mapper reclaimed condition responsibility ${token}`);
}

for (const token of [
  'export function emitRiskConditions',
  'export function emitHypothesisConditions',
  'appendMarkerCallout',
  "{ kind: 'edge', id: edgeId }"
]) {
  if (!owner.includes(token)) fail(`condition owner contract missing ${token}`);
}

if (!mapper.includes("from './narrative-mapping/theory-condition-builders'")) {
  fail('mapper must consume the condition owner');
}

const featureRoot = path.join(root, 'src/features/theory-of-change');
const scss = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.scss')) scss.push(path.relative(root, full));
  }
}
walk(featureRoot);
if (scss.length) fail(`.scss files are forbidden: ${scss.join(', ')}`);

console.log('PASS SO-009 Narrative God Slayer Wave 03: condition paragraphs, callouts, markers and references are split and armored.');
