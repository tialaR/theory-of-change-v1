import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'src/features/theory-of-change/components/result-view/result-theory-narrative';
const mapperPath = path.join(root, base, 'theory-narrative.mapper.ts');
const documentAssemblyPath = path.join(root, base, 'narrative-mapping/theory-document-assembly.ts');
const ownerPath = path.join(root, base, 'narrative-mapping/theory-page-builders.ts');
const fail = (message) => { console.error(`FAIL SO-009 Wave 06: ${message}`); process.exit(1); };

for (const file of [mapperPath, documentAssemblyPath, ownerPath]) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
}
const mapper = fs.readFileSync(mapperPath, 'utf8');
const documentAssembly = fs.readFileSync(documentAssemblyPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');

if (!mapper.includes("from './narrative-mapping/theory-document-assembly'")) {
  fail('mapper must delegate through document assembly');
}
if (!documentAssembly.includes("from './theory-page-builders'")) {
  fail('document assembly must delegate to page assembly owner');
}
if (!documentAssembly.includes('buildMacroPages(') || !documentAssembly.includes('buildScopedPages(')) {
  fail('document assembly does not consume both page assembly contracts');
}
for (const token of ['function buildMacroPages(', 'function buildScopedPages(', 'function narrateDisconnected(']) {
  if (mapper.includes(token) || documentAssembly.includes(token)) fail(`${token} escaped the page assembly owner`);
}
for (const token of ['export function buildMacroPages(', 'export function buildScopedPages(', 'function narrateDisconnected(']) {
  if (!owner.includes(token)) fail(`${token} is missing from page assembly owner`);
}
for (const token of ['page-overview', 'page-resources', 'page-analysis', 'page-scoped-overview', 'page-scoped-narrative']) {
  if (mapper.includes(token) || documentAssembly.includes(token)) fail(`${token} leaked outside page assembly owner`);
}
if (mapper.split(/\r?\n/).length > 55) fail('mapper exceeded 55-line facade budget');
if (documentAssembly.split(/\r?\n/).length > 115) fail('document assembly exceeded 115-line budget');
if (owner.split(/\r?\n/).length > 430) fail('page assembly owner exceeded 430-line budget');
if ([mapper, documentAssembly, owner].some((source) => source.includes('.scss'))) fail('scss import detected');

console.log('PASS SO-009 Narrative God Slayer Wave 06: page assembly remains transitively reachable and armored through document assembly.');
