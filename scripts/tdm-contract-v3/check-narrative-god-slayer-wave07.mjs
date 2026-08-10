import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const narrativeRoot = path.join(
  root,
  'src/features/theory-of-change/components/result-view/result-theory-narrative'
);
const mapperPath = path.join(narrativeRoot, 'theory-narrative.mapper.ts');
const assemblyPath = path.join(narrativeRoot, 'narrative-mapping/theory-document-assembly.ts');

function fail(message) {
  console.error(`FAIL SO-009 Wave 07: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
}

const mapper = read(mapperPath);
const assembly = read(assemblyPath);
const mapperLines = mapper.split(/\r?\n/).length;
const assemblyLines = assembly.split(/\r?\n/).length;

if (mapperLines > 55) fail(`mapper facade exceeds 55 lines (${mapperLines})`);
if (assemblyLines > 115) fail(`document assembly owner exceeds 115 lines (${assemblyLines})`);
if (!mapper.includes("from './narrative-mapping/theory-document-assembly'")) {
  fail('mapper must consume the document assembly owner');
}
if (!mapper.includes('prepareNarrativeGraph')) fail('mapper must prepare the narrative graph');
if (!mapper.includes('assembleTheoryDocument')) fail('mapper must delegate final assembly');
if (mapper.includes('countStagesByType') || mapper.includes('countValidConditions')) {
  fail('mapper must not calculate document metadata');
}
if (mapper.includes('buildMacroPages') || mapper.includes('buildScopedPages')) {
  fail('mapper must not assemble pages directly');
}
if (mapper.includes('NARRATIVE_TITLES')) fail('mapper must not own document titles');
if (!assembly.includes('countStagesByType')) fail('assembly owner must calculate stage metadata');
if (!assembly.includes('countValidConditions')) fail('assembly owner must calculate condition metadata');
if (!assembly.includes('countNarrativePaths')) fail('assembly owner must calculate path metadata');
if (!assembly.includes('buildMacroPages') || !assembly.includes('buildScopedPages')) {
  fail('assembly owner must delegate macro and scoped page construction');
}
if (!assembly.includes('markerIds')) fail('assembly owner must publish marker identifiers');

const scssFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.scss')) scssFiles.push(path.relative(root, full));
  }
}
walk(narrativeRoot);
if (scssFiles.length) fail(`.scss files are forbidden: ${scssFiles.join(', ')}`);

console.log('PASS SO-009 Narrative God Slayer Wave 07: public mapper facade and document assembly contract are split and armored.');
