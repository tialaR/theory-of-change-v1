import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mapperPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.mapper.ts');
const ownerPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/narrative-mapping/theory-resource-action-builders.ts');
const fail = (message) => { console.error(`FAIL SO-009 Wave 04: ${message}`); process.exit(1); };
if (!fs.existsSync(ownerPath)) fail('resource/action owner is missing');
const mapper = fs.readFileSync(mapperPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');
if (!mapper.includes("from './narrative-mapping/theory-resource-action-builders'")) fail('mapper does not delegate to resource/action owner');
if (mapper.includes('function narrateResourcesAndActions(')) fail('resource/action assembly returned to mapper');
if (!owner.includes('export function narrateResourcesAndActions(')) fail('owner contract is missing');
if (mapper.split(/\r?\n/).length > 700) fail('mapper exceeded 700-line Wave 04 budget');
if (owner.split(/\r?\n/).length > 190) fail('resource/action owner exceeded 190-line budget');
console.log('PASS SO-009 Narrative God Slayer Wave 04: resources and actions narrative ownership is split and armored.');
