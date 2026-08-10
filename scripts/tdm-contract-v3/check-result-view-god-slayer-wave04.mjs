import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mainRel = 'src/features/theory-of-change/components/result-view/result-view.tsx';
const ownerRel = 'src/features/theory-of-change/components/result-view/result-view-focus-controller/use-result-view-focus-controller.ts';
const main = fs.readFileSync(path.join(root, mainRel), 'utf8');
const owner = fs.readFileSync(path.join(root, ownerRel), 'utf8');
const lines = (value) => value.split(/\r?\n/).length;
const fail = (message) => { console.error(`FAIL SO-008 Wave 04: ${message}`); process.exitCode = 1; };

if (lines(main) > 590) fail(`${mainRel} exceeded 590 lines (${lines(main)}).`);
if (lines(owner) > 210) fail(`${ownerRel} exceeded 210 lines (${lines(owner)}).`);
if (!main.includes("./result-view-focus-controller/use-result-view-focus-controller")) fail('ResultView does not consume the focus controller owner.');
for (const forbidden of [
  'const [focusedNodeId, setFocusedNodeId]',
  'const [focusedEdgeId, setFocusedEdgeId]',
  'const focusRelatedConnectionForNode',
  'const focusRelatedConnectionForEdge',
  'const scrollFocusTargetIntoView',
  'buildFlowReportContentForEdge('
]) {
  if (main.includes(forbidden)) fail(`ResultView reclaimed focus ownership: ${forbidden}`);
}
for (const required of [
  'export function useResultViewFocusController',
  'const registerCardRef = useCallback',
  'const handleSelectNode = useCallback',
  'const handleSelectEdge = useCallback',
  'const flowInspectorContent = useMemo',
  'const edgeEndpointIds = useMemo'
]) {
  if (!owner.includes(required)) fail(`Focus controller owner is missing contract token: ${required}`);
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
if (!process.exitCode) console.log('PASS SO-008 Result View God Slayer Wave 04: causal focus and inspector ownership are split and armored.');
