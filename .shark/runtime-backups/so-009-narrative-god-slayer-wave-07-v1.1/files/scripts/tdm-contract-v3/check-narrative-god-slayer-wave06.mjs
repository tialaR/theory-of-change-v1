import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'src/features/theory-of-change/components/result-view/result-theory-narrative';
const mapperPath = path.join(root, base, 'theory-narrative.mapper.ts');
const ownerPath = path.join(root, base, 'narrative-mapping/theory-page-builders.ts');
const fail = (message) => { console.error(`FAIL SO-009 Wave 06: ${message}`); process.exit(1); };

if (!fs.existsSync(ownerPath)) fail('page assembly owner is missing');
const mapper = fs.readFileSync(mapperPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');

if (!mapper.includes("from './narrative-mapping/theory-page-builders'")) fail('mapper does not delegate to page assembly owner');
if (!mapper.includes('buildMacroPages(') || !mapper.includes('buildScopedPages(')) fail('mapper does not consume both page assembly contracts');
for (const token of ['function buildMacroPages(', 'function buildScopedPages(', 'function narrateDisconnected(']) {
  if (mapper.includes(token)) fail(`${token} returned to mapper`);
}
for (const token of ['export function buildMacroPages(', 'export function buildScopedPages(', 'function narrateDisconnected(']) {
  if (!owner.includes(token)) fail(`${token} is missing from page assembly owner`);
}
for (const token of ['page-overview', 'page-resources', 'page-analysis', 'page-scoped-overview', 'page-scoped-narrative']) {
  if (mapper.includes(token)) fail(`${token} leaked back into mapper`);
}
if (mapper.split(/\r?\n/).length > 120) fail('mapper exceeded 120-line Wave 06 budget');
if (owner.split(/\r?\n/).length > 430) fail('page assembly owner exceeded 430-line budget');
if ([mapper, owner].some((source) => source.includes('.scss'))) fail('scss import detected');

console.log('PASS SO-009 Narrative God Slayer Wave 06: macro and scoped page assembly ownership is split and armored.');
