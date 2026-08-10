import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const resultRoot = path.join(root, 'src/features/theory-of-change/components/result-view');
const files = {
  composition: path.join(resultRoot, 'result-view.tsx'),
  hero: path.join(resultRoot, 'result-view-hero/result-view-hero.tsx'),
  controller: path.join(resultRoot, 'result-view-hero/use-result-view-hero-controller.ts')
};

const fail = (message) => {
  console.error(`FAIL SO-008 Wave 05: ${message}`);
  process.exit(1);
};

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fail(`missing ${name}: ${path.relative(root, file)}`);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const lines = (file) => read(file).split(/\r?\n/).length;
const composition = read(files.composition);
const hero = read(files.hero);
const controller = read(files.controller);

if (lines(files.composition) > 430) fail(`result-view.tsx budget exceeded (${lines(files.composition)} > 430)`);
if (lines(files.hero) > 240) fail(`result-view hero budget exceeded (${lines(files.hero)} > 240)`);
if (lines(files.controller) > 60) fail(`hero controller budget exceeded (${lines(files.controller)} > 60)`);

for (const forbidden of ['buildTheoryStatusSummary', 'RESULT_VIEW_TITLE', 'ResultHeaderStats', '<motion.header', 'HERO_COMPACT_SCROLL_THRESHOLD']) {
  if (composition.includes(forbidden)) fail(`root composition regained hero ownership through ${forbidden}`);
}

for (const required of ['ResultViewHero', 'useResultViewHeroController']) {
  if (!composition.includes(required)) fail(`root composition must publish ${required}`);
}

for (const required of ['ResultViewExportMenu', 'ResultViewFlowInspector', 'ResultHeaderStats']) {
  if (!hero.includes(required)) fail(`hero owner is missing ${required}`);
}

if (!controller.includes('HERO_COMPACT_SCROLL_THRESHOLD')) fail('hero compact lifecycle is not owned by its controller');

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

console.log('PASS SO-008 Result View God Slayer Wave 05: hero presentation and compact-scroll ownership are split and armored.');
