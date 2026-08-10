import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mapperPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.mapper.ts');
const ownerPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/narrative-mapping/theory-graph-traversal.ts');

function fail(message) {
  console.error(`FAIL SO-009 Wave 02: ${message}`);
  process.exit(1);
}

for (const file of [mapperPath, ownerPath]) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
}

const mapper = fs.readFileSync(mapperPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');
const mapperLines = mapper.split(/\r?\n/).length;
const ownerLines = owner.split(/\r?\n/).length;

if (mapperLines > 910) fail(`mapper budget exceeded: ${mapperLines} > 910`);
if (ownerLines > 130) fail(`graph traversal owner budget exceeded: ${ownerLines} > 130`);

const forbiddenMapperTokens = [
  'buildNarrativeGraph(',
  'resolveScopedFlow(',
  'enumerateLinearPaths(',
  'findWeaklyConnectedComponents('
];
for (const token of forbiddenMapperTokens) {
  if (mapper.includes(token)) fail(`mapper reclaimed traversal primitive ${token}`);
}

const requiredOwnerExports = [
  'export function prepareNarrativeGraph',
  'export function resolveNarrativeEndpoints',
  'export function countNarrativePaths',
  'export function findDisconnectedNarrativeNodes'
];
for (const token of requiredOwnerExports) {
  if (!owner.includes(token)) fail(`owner contract missing ${token}`);
}

if (!mapper.includes("from './narrative-mapping/theory-graph-traversal'")) {
  fail('mapper must consume the graph traversal owner');
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

console.log('PASS SO-009 Narrative God Slayer Wave 02: graph traversal ownership is split and armored.');
