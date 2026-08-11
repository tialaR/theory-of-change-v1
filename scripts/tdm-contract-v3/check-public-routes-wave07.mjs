#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

const required = [
  'docs/sharkops/SO-015-WAVE-07-PUBLIC-ROUTE-RESPONSIVE-MOTION-CONTRACTS.md',
  'docs/sharkops/SO-015-PUBLIC-RESPONSIVE-MOTION-CONTRACT.json',
  'scripts/tdm-contract-v3/check-public-routes-active.mjs',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-07/MANIFEST.json'
];
for (const file of required) if (!exists(file)) errors.push(`artefato obrigatorio ausente: ${file}`);

const contract = json('docs/sharkops/SO-015-PUBLIC-RESPONSIVE-MOTION-CONTRACT.json');
if (contract.principles?.sharedAndFeatureOwnedFollowSameResponsibilityRules !== true) errors.push('paridade de responsabilidade shared/feature-owned nao esta protegida');
if (contract.principles?.lineCountIsNotADecompositionCriterion !== true) errors.push('contrato nao rejeita falso positivo por contagem de linhas');
if (contract.principles?.reducedMotionIsMandatory !== true) errors.push('reduced motion nao esta marcado como obrigatorio');
if (contract.principles?.personalityPreserving !== true) errors.push('contrato nao preserva personalidade visual');

const provider = read('src/shared/motion/tdm-motion/tdm-motion-provider.tsx');
if (!provider.includes('reducedMotion="user"')) errors.push('MotionConfig nao respeita preferencia de reduced motion do usuario');
if (!provider.includes('TDM_MOTION_TRANSITIONS.control')) errors.push('MotionConfig nao usa transicao canonica compartilhada');

const tsReducedMotionFiles = [
  'src/shared/ui/tdm-public-layout/public-reveal.tsx',
  'src/shared/ui/tdm-public-layout/public-home-orb.tsx',
  'src/shared/ui/tdm-public-layout/public-timeline.tsx',
  'src/features/theory-of-change/components/public-pages/use-guided-story.ts',
  'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-edge-layer.tsx',
  'src/features/theory-of-change/components/public-pages/theory-flow-board/theory-flow-board-node-cards.tsx'
];
for (const file of tsReducedMotionFiles) {
  if (!read(file).includes('useReducedMotion')) errors.push(`superficie animada sem useReducedMotion: ${file}`);
}
for (const file of [
  'src/features/theory-of-change/components/public-pages/home-brand-logo/home-brand-logo.module.sass',
  'src/shared/ui/tdm-public-layout/tdm-public-layout.module.sass'
]) {
  if (!read(file).includes('@media (prefers-reduced-motion: reduce)')) errors.push(`stylesheet sem reduced-motion contract: ${file}`);
}
if (!read('src/features/theory-of-change/components/public-pages/home-onboarding-preview.module.sass').includes('.reducedMotion')) {
  errors.push('Guided Story perdeu classe feature-owned de reduced motion');
}

const breakpointChecks = [
  ['src/shared/ui/tdm-public-layout/tdm-public-layout.module.sass', ['48rem']],
  ['src/features/theory-of-change/components/public-pages/public-pages.module.sass', ['56rem', '48rem']],
  ['src/features/theory-of-change/components/public-pages/home-onboarding-preview.module.sass', ['72rem', '42rem']]
];
for (const [file, markers] of breakpointChecks) {
  const content = read(file);
  for (const marker of markers) if (!content.includes(`max-width: ${marker}`)) errors.push(`breakpoint evidence-backed ausente em ${file}: ${marker}`);
}

const pkg = json('package.json');
if (pkg.scripts?.['check:tdm:public-routes:wave07'] !== 'node scripts/tdm-contract-v3/check-public-routes-wave07.mjs') errors.push('npm script Wave 07 ausente');
if (pkg.scripts?.['check:tdm:public-routes:active'] !== 'node scripts/tdm-contract-v3/check-public-routes-active.mjs') errors.push('npm script public-routes:active ausente');

const policy = json('.sharkops/policy/gates.json');
for (const stage of ['pre-commit', 'pre-push']) {
  if (!policy.profiles?.[policy.activeProfile]?.mandatory?.[stage]?.includes('check:tdm:public-routes:active')) {
    errors.push(`gate ativo das rotas publicas nao e mandatory em ${stage}`);
  }
}
if (policy.classifications?.['check:tdm:public-routes:active'] !== 'MANDATORY') errors.push('classificacao mandatory do gate ativo das rotas publicas ausente');

const ledger = json('.sharkops/state/bite-ledger.json');
const state = json('.sharkops/state/current-state.json');
const so015 = ledger.bites.find((bite) => bite.id === 'SO-015');
if (!so015 || so015.status !== 'ACTIVE' || so015.revision < 7) errors.push('SO-015 deve estar ACTIVE na revisao 7 ou em progressao downstream autorizada');
if (so015?.revision === 7 && state.lastBite !== 'SO-015 | Public Route Responsive & Motion Contracts') errors.push('current-state da revisao 7 nao aponta para Wave 07');
if (state.goldenStateStatus !== 'COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
for (let id = 1; id <= 14; id += 1) {
  const biteId = `SO-${String(id).padStart(3, '0')}`;
  if (ledger.bites.find((bite) => bite.id === biteId)?.status !== 'COMPLETE') errors.push(`${biteId} deixou de estar COMPLETE`);
}

if (errors.length) {
  console.error('\nSO-015 PUBLIC ROUTES WAVE 07: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-015 Public Routes Wave 07: responsive and motion behavior remains personality-preserving and evidence-backed, reduced-motion support is mandatory, shared and feature-owned responsibility rules are equal, and the active SO-015 architecture gate is enforced automatically by SharkOps hooks.');
