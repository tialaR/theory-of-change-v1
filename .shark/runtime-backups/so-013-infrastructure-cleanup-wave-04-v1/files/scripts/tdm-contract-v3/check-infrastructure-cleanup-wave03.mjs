#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const removedAliases = [
  'src/features/theory-of-change/components/public-pages/home-onboarding-preview.tsx',
  'src/features/theory-of-change/components/result-view/experience/result-experience-page.tsx',
];

for (const relative of removedAliases) {
  if (fs.existsSync(path.join(root, relative))) {
    errors.push(`alias legado reapareceu: ${relative}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) ? [absolute] : [];
  });
}

for (const scanRoot of ['src', 'scripts', 'tools']) {
  for (const file of walk(path.join(root, scanRoot))) {
    const relative = path.relative(root, file);
    if (relative.endsWith('check-infrastructure-cleanup-wave03.mjs')) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes("./home-onboarding-preview'") || source.includes("./home-onboarding-preview\"") || source.includes("/home-onboarding-preview'") || source.includes("/home-onboarding-preview\"")) {
      errors.push(`referencia residual ao alias home-onboarding-preview: ${relative}`);
    }
    if (source.includes('ResultExperiencePage') || source.includes('result-experience-page')) {
      errors.push(`referencia residual ao alias ResultExperiencePage: ${relative}`);
    }
  }
}

const homePage = fs.readFileSync(path.join(root, 'src/features/theory-of-change/components/public-pages/home-page.tsx'), 'utf8');
if (!homePage.includes("import { HomeOnboardingPreview } from './guided-story';")) {
  errors.push('HomePage nao consome mais diretamente a implementacao canonica guided-story');
}

const guidedStory = fs.readFileSync(path.join(root, 'src/features/theory-of-change/components/public-pages/guided-story.tsx'), 'utf8');
if (!guidedStory.includes('export function HomeOnboardingPreview')) {
  errors.push('implementacao canonica HomeOnboardingPreview ausente em guided-story.tsx');
}

const predecessor = spawnSync(process.execPath, ['scripts/tdm-contract-v3/check-infrastructure-cleanup-wave02-hotfix.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (predecessor.status !== 0) {
  process.stdout.write(predecessor.stdout || '');
  process.stderr.write(predecessor.stderr || '');
  errors.push('gate anterior falhou: SO-013 Infrastructure Cleanup Wave 02 v1.1 Hotfix');
}

const state = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/current-state.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, '.sharkops/state/bite-ledger.json'), 'utf8'));
const bite = ledger.bites.find((item) => item.id === 'SO-013');
if (!bite || bite.status !== 'ACTIVE' || bite.revision < 4) {
  errors.push('SO-013 Wave 03 nao esta ACTIVE/revision >= 4 no Bite Ledger');
}
if (!String(state.lastBite || '').startsWith('SO-013 | Infrastructure Cleanup Wave 03')) {
  errors.push('Current State nao registra a Wave 03 do SO-013');
}
if (state.activeBite !== 'SO-013 | Infrastructure Cleanup' || state.activeBiteStatus !== 'ACTIVE') {
  errors.push('Current State nao registra SO-013 Infrastructure Cleanup como ACTIVE');
}

if (errors.length) {
  console.error('\nSO-013 INFRASTRUCTURE CLEANUP WAVE 03: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-013 Infrastructure Cleanup Wave 03: legacy alias wrappers removed, live consumer migrated to the canonical guided-story module, and predecessor gates remain green.');
