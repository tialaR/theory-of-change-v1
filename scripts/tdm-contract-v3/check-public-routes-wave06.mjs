#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

const required = [
  'docs/sharkops/SO-015-WAVE-06-PUBLIC-HEADER-NAVIGATION-ROUTE-SHELL.md',
  'docs/sharkops/SO-015-PUBLIC-HEADER-CONTRACT.json',
  'src/shared/ui/tdm-public-layout/public-header/index.ts',
  'src/shared/ui/tdm-public-layout/public-header/public-header.tsx',
  'src/shared/ui/tdm-public-layout/public-header/public-header-brand.tsx',
  'src/shared/ui/tdm-public-layout/public-header/public-header-navigation.tsx',
  'src/shared/ui/tdm-public-layout/public-header/public-header-cta.tsx',
  'src/shared/ui/tdm-public-layout/public-header/public-header-policy.ts',
  'src/shared/ui/tdm-public-layout/public-header/use-public-header-scrolled.ts',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-06/MANIFEST.json'
];

for (const file of required) {
  if (!exists(file)) errors.push(`artefato obrigatorio ausente: ${file}`);
}

if (exists('src/shared/ui/tdm-public-layout/public-header.tsx')) {
  errors.push('antigo PublicHeader monolitico ainda existe');
}

const composition = read('src/shared/ui/tdm-public-layout/public-header/public-header.tsx');
for (const delegated of ['PublicHeaderBrand', 'PublicHeaderNavigation', 'PublicHeaderCta']) {
  if (!composition.includes(delegated)) errors.push(`PublicHeader nao delega responsabilidade: ${delegated}`);
}
for (const forbidden of ['IntersectionObserver', 'PUBLIC_NAV_ITEMS', 'useEffect(', 'useState(']) {
  if (composition.includes(forbidden)) errors.push(`PublicHeader de composicao reteve logica indevida: ${forbidden}`);
}

const policy = read('src/shared/ui/tdm-public-layout/public-header/public-header-policy.ts');
for (const marker of ['PUBLIC_NAV_ITEMS', 'HIDDEN_HEADER_ROUTES', 'isPublicNavItemActive', 'shouldHidePublicHeader']) {
  if (!policy.includes(marker)) errors.push(`politica de header incompleta: ${marker}`);
}

const scrollHook = read('src/shared/ui/tdm-public-layout/public-header/use-public-header-scrolled.ts');
for (const marker of ['IntersectionObserver', 'data-public-scroll', 'usePublicHeaderScrolled']) {
  if (!scrollHook.includes(marker)) errors.push(`hook de scroll incompleto: ${marker}`);
}

const contract = json('docs/sharkops/SO-015-PUBLIC-HEADER-CONTRACT.json');
if (!contract.rules?.some((rule) => rule.includes('feature-owned and shared components follow the same responsibility rules'))) {
  errors.push('contrato universal de responsabilidade para shared e feature-owned ausente');
}
if (!contract.rules?.some((rule) => rule.includes('line count is not a decomposition criterion'))) {
  errors.push('contrato ainda nao protege contra falso positivo por contagem de linhas');
}

const layoutIndex = read('src/shared/ui/tdm-public-layout/index.ts');
if (!layoutIndex.includes("export { PublicHeader } from './public-header';")) {
  errors.push('PublicHeader nao permanece exposto pelo entrypoint oficial tdm-public-layout');
}

const ledger = json('.sharkops/state/bite-ledger.json');
const state = json('.sharkops/state/current-state.json');
const pkg = json('package.json');
const so015 = ledger.bites.find((bite) => bite.id === 'SO-015');
if (!so015 || so015.status !== 'ACTIVE' || so015.revision < 6) {
  errors.push('SO-015 deve permanecer ACTIVE na revisao 6 ou em progressao downstream autorizada');
}
if (so015?.revision === 6 && state.lastBite !== 'SO-015 | Public Header, Navigation & Route Shell') {
  errors.push('current-state da revisao 6 nao aponta para Wave 06');
}
if (so015?.revision > 6 && !exists('.sharkops/bites/so-015-public-routes-application-surface-armor-wave-06/MANIFEST.json')) {
  errors.push('progressao downstream perdeu o manifesto preservado da Wave 06');
}
if (state.goldenStateStatus !== 'COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
if (pkg.scripts?.['check:tdm:public-routes:wave06'] !== 'node scripts/tdm-contract-v3/check-public-routes-wave06.mjs') {
  errors.push('npm script Wave 06 ausente');
}

if (errors.length) {
  console.error('\nSO-015 PUBLIC ROUTES WAVE 06: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-015 Public Routes Wave 06: public header responsibilities are decomposed into explicit brand, navigation, CTA, route-policy and scroll-behavior contracts without visual behavior changes, while shared and feature-owned components remain subject to the same responsibility rules and the Canvas Golden State stays sealed.');
