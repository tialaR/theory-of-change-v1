import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mainRel = 'src/features/theory-of-change/components/result-view/result-view.tsx';
const ownerRel = 'src/features/theory-of-change/components/result-view/result-reading-card/result-reading-card.tsx';
const main = fs.readFileSync(path.join(root, mainRel), 'utf8');
const owner = fs.readFileSync(path.join(root, ownerRel), 'utf8');
const lines = (value) => value.split(/\r?\n/).length;
const fail = (message) => { console.error(`FAIL SO-008 Wave 02: ${message}`); process.exitCode = 1; };

if (lines(main) > 1110) fail(`${mainRel} exceeded 1110 lines (${lines(main)}).`);
if (lines(owner) > 150) fail(`${ownerRel} exceeded 150 lines (${lines(owner)}).`);
if (!main.includes("./result-reading-card/result-reading-card")) fail('ResultView does not consume the reading-card owner.');
for (const forbidden of ['type RipplePoint', 'function ResultReadingCard(', 'CARD_FLOAT_Y', 'RIPPLE_TRANSITION']) {
  if (main.includes(forbidden)) fail(`ResultView reclaimed reading-card ownership: ${forbidden}`);
}
for (const required of ['export function ResultReadingCard', 'ResultLiquidCard', 'getLiquidGlassStageTheme', 'handleActivate', 'AnimatePresence']) {
  if (!owner.includes(required)) fail(`Reading-card owner is missing contract token: ${required}`);
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
if (!process.exitCode) console.log('PASS SO-008 Result View God Slayer Wave 02: reading-card interaction ownership is split and armored.');
