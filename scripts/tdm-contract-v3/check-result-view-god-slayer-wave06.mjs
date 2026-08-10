import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const resultRoot = path.join(root, 'src/features/theory-of-change/components/result-view');
const files = {
  composition: path.join(resultRoot, 'result-view.tsx'),
  flow: path.join(resultRoot, 'result-theory-flow/result-theory-flow.tsx')
};

const fail = (message) => {
  console.error(`FAIL SO-008 Wave 06: ${message}`);
  process.exit(1);
};

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fail(`missing ${name}: ${path.relative(root, file)}`);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const lines = (file) => read(file).split(/\r?\n/).length;
const composition = read(files.composition);
const flow = read(files.flow);

if (lines(files.composition) > 260) fail(`result-view.tsx budget exceeded (${lines(files.composition)} > 260)`);
if (lines(files.flow) > 260) fail(`result theory flow budget exceeded (${lines(files.flow)} > 260)`);

for (const forbidden of [
  'TDM_STAGE_ORDER',
  'RESULT_FLOW_BRIDGES',
  'buildConnectionCountMap',
  'getCardHighlightState',
  'getColumnHeaderState',
  'FlowCausalOverlay',
  'ResultFlowBridge',
  'ResultReadingCard',
  'ResultLiquidColumn'
]) {
  if (composition.includes(forbidden)) fail(`root composition regained flow ownership through ${forbidden}`);
}

if (!composition.includes('ResultTheoryFlow')) fail('root composition must publish ResultTheoryFlow');

for (const required of [
  'TDM_STAGE_ORDER',
  'RESULT_FLOW_BRIDGES',
  'FlowCausalOverlay',
  'ResultFlowBridge',
  'ResultReadingCard',
  'ResultLiquidColumn',
  'registerColumnViewportRef'
]) {
  if (!flow.includes(required)) fail(`flow owner is missing ${required}`);
}

const scss = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.scss')) scss.push(path.relative(root, target));
  }
};
walk(resultRoot);
if (scss.length) fail(`forbidden .scss files: ${scss.join(', ')}`);

console.log('PASS SO-008 Result View God Slayer Wave 06: theory flow composition ownership is split and armored.');
