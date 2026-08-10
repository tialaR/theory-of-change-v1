import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mapperPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.mapper.ts');
const ownerPath = path.join(root, 'src/features/theory-of-change/components/result-view/result-theory-narrative/narrative-mapping/theory-delivery-result-builders.ts');
const fail = (message) => { console.error(`FAIL SO-009 Wave 05: ${message}`); process.exit(1); };
if (!fs.existsSync(ownerPath)) fail('delivery/result owner is missing');
const mapper = fs.readFileSync(mapperPath, 'utf8');
const owner = fs.readFileSync(ownerPath, 'utf8');
if (!mapper.includes("from './narrative-mapping/theory-delivery-result-builders'")) fail('mapper does not delegate to delivery/result owner');
if (mapper.includes('function narrateDeliveriesAndResult(')) fail('delivery/result assembly returned to mapper');
if (!owner.includes('export function narrateDeliveriesAndResult(')) fail('owner contract is missing');
for (const token of ['activityToProductParagraph', 'productToResultParagraph', 'branchParagraph', 'convergenceParagraph']) {
  if (mapper.includes(token)) fail(`${token} leaked back into mapper`);
}
if (!owner.includes('emitRiskConditions')) fail('delivery risk contract is missing');
if (!owner.includes('emitHypothesisConditions')) fail('result hypothesis contract is missing');
if (mapper.split(/\r?\n/).length > 500) fail('mapper exceeded 500-line Wave 05 budget');
if (owner.split(/\r?\n/).length > 260) fail('delivery/result owner exceeded 260-line budget');
console.log('PASS SO-009 Narrative God Slayer Wave 05: deliveries and results narrative ownership is split and armored.');
