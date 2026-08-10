import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mainRel = 'src/features/theory-of-change/components/result-view/result-view.tsx';
const ownerRel = 'src/features/theory-of-change/components/result-view/result-flow-visualization/result-flow-visualization.tsx';
const main = fs.readFileSync(path.join(root, mainRel), 'utf8');
const owner = fs.readFileSync(path.join(root, ownerRel), 'utf8');
const lines = (value) => value.split(/\r?\n/).length;
const fail = (message) => { console.error(`FAIL SO-008 Wave 03: ${message}`); process.exitCode = 1; };

if (lines(main) > 730) fail(`${mainRel} exceeded 730 lines (${lines(main)}).`);
if (lines(owner) > 420) fail(`${ownerRel} exceeded 420 lines (${lines(owner)}).`);
const flowRel = 'src/features/theory-of-change/components/result-view/result-theory-flow/result-theory-flow.tsx';
const flow = fs.readFileSync(path.join(root, flowRel), 'utf8');
if (!flow.includes('../result-flow-visualization/result-flow-visualization')) fail('ResultTheoryFlow does not consume the flow visualization owner.');
for (const forbidden of ['function ResultFlowBridge(', 'function FlowCausalOverlay(', 'function viewRefForScroll(', 'buildFlowPathDescriptors', 'getMarkerHighlightState']) {
  if (main.includes(forbidden)) fail(`ResultView reclaimed flow visualization ownership: ${forbidden}`);
}
for (const required of ['export function ResultFlowBridge', 'export function FlowCausalOverlay', 'buildFlowPathDescriptors', 'ResizeObserver', 'ResultBridgeKind']) {
  if (!owner.includes(required)) fail(`Flow visualization owner is missing contract token: ${required}`);
}
const featureRoot = path.join(root, 'src/features/theory-of-change');
const scss = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.scss')) scss.push(path.relative(root, absolute));
  }
};
walk(featureRoot);
if (scss.length) fail(`.scss is forbidden: ${scss.join(', ')}`);
if (!process.exitCode) console.log('PASS SO-008 Result View God Slayer Wave 03: causal flow visualization ownership is split and armored.');
