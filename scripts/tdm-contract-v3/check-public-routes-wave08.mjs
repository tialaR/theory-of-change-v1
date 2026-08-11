#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

const required = [
  'docs/sharkops/SO-015-WAVE-08-PUBLIC-ERROR-LOADING-STATUS-SURFACE-CONTRACTS.md',
  'docs/sharkops/SO-015-PUBLIC-ROUTE-STATE-CONTRACT.json',
  '.sharkops/bites/so-015-public-routes-application-surface-armor-wave-08/MANIFEST.json',
  'src/shared/ui/tdm-status-screen/tdm-status-screen.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-error.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-loading.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-not-found.tsx'
];
for (const file of required) if (!exists(file)) errors.push(`artefato obrigatorio ausente: ${file}`);

const contract = json('docs/sharkops/SO-015-PUBLIC-ROUTE-STATE-CONTRACT.json');
for (const key of [
  'routeBoundaryOwnsContextualCopy',
  'sharedStatusOwnsBehaviorAccessibilityAndVisualTreatment',
  'errorBoundariesUseCanonicalBoundaryProps',
  'loadingBoundariesMustNotManufactureLatency',
  'statusPrimitivesMustRemainFeatureAgnostic',
  'canvasGoldenStateRemainsSealed'
]) if (contract.principles?.[key] !== true) errors.push(`principio de route-state ausente: ${key}`);

const index = read('src/shared/ui/tdm-status-screen/index.ts');
if (!index.includes('TdmRouteErrorBoundaryProps')) errors.push('barrel de status nao exporta TdmRouteErrorBoundaryProps');
const errorPrimitive = read('src/shared/ui/tdm-status-screen/tdm-route-error.tsx');
if (!errorPrimitive.includes('export type TdmRouteErrorBoundaryProps')) errors.push('contrato canonico de error/reset ausente');
if (!errorPrimitive.includes('useEffect(() => console.error(error), [error])')) errors.push('observabilidade basica do route error foi removida');
if (!errorPrimitive.includes('onClick={reset}')) errors.push('acao de retry do route error foi removida');

for (const file of contract.publicErrorBoundaries) {
  const content = read(file);
  if (!content.startsWith("'use client';")) errors.push(`error boundary deixou de ser client boundary: ${file}`);
  if (!content.includes("from '@/shared/ui/tdm-status-screen'")) errors.push(`error boundary nao usa barrel compartilhado: ${file}`);
  if (!content.includes('TdmRouteErrorBoundaryProps')) errors.push(`error boundary repete ou perdeu contrato canonico: ${file}`);
  if (!content.includes('<TdmRouteError')) errors.push(`error boundary bypassa TdmRouteError: ${file}`);
  if (content.includes("tdm-status-screen/tdm-")) errors.push(`deep import de status proibido: ${file}`);
  if (/Error\s*&\s*\{\s*digest\?/.test(content)) errors.push(`shape inline de error/reset reapareceu: ${file}`);
}

for (const file of contract.publicLoadingBoundaries) {
  const content = read(file);
  if (!content.includes("from '@/shared/ui/tdm-status-screen'")) errors.push(`loading boundary nao usa barrel compartilhado: ${file}`);
  if (!content.includes('<TdmRouteLoading')) errors.push(`loading boundary bypassa TdmRouteLoading: ${file}`);
  if (/setTimeout|simulatePublicRouteDelay|force-dynamic/.test(content)) errors.push(`loading boundary manufatura latencia/renderizacao: ${file}`);
  if (content.includes("tdm-status-screen/tdm-")) errors.push(`deep import de status proibido: ${file}`);
}

const notFound = read(contract.notFoundBoundary);
if (!notFound.includes('<TdmRouteNotFound')) errors.push('not-found raiz bypassa TdmRouteNotFound');

const sharedFiles = fs.readdirSync(path.join(root, contract.sharedOwner)).filter((name) => /\.(ts|tsx)$/.test(name));
for (const name of sharedFiles) {
  const content = read(`${contract.sharedOwner}/${name}`);
  if (/features\/theory-of-change|app\/canvas|@\/features\//.test(content)) errors.push(`status shared ganhou dependencia de feature/canvas: ${name}`);
}

const pkg = json('package.json');
if (pkg.scripts?.['check:tdm:public-routes:wave08'] !== 'node scripts/tdm-contract-v3/check-public-routes-wave08.mjs') errors.push('npm script Wave 08 ausente');
if (pkg.scripts?.['check:tdm:public-routes:active'] !== 'node scripts/tdm-contract-v3/check-public-routes-active.mjs') errors.push('gate ativo SO-015 ausente');
const activeGate = read('scripts/tdm-contract-v3/check-public-routes-active.mjs');
const ledgerForActive = json('.sharkops/state/bite-ledger.json');
const so015ForActive = ledgerForActive.bites.find((bite) => bite.id === 'SO-015');
if (so015ForActive?.revision === 8 && !activeGate.includes("./check-public-routes-wave08.mjs")) errors.push('gate ativo da revisao 8 nao aponta para Wave 08');
if ((so015ForActive?.revision ?? 0) > 8 && !activeGate.includes('./check-public-routes-wave')) errors.push('gate ativo downstream SO-015 invalido');

const policy = json('.sharkops/policy/gates.json');
for (const stage of ['pre-commit', 'pre-push']) {
  if (!policy.profiles?.[policy.activeProfile]?.mandatory?.[stage]?.includes('check:tdm:public-routes:active')) errors.push(`gate ativo nao e mandatory em ${stage}`);
}

const ledger = json('.sharkops/state/bite-ledger.json');
const state = json('.sharkops/state/current-state.json');
const so015 = ledger.bites.find((bite) => bite.id === 'SO-015');
if (!so015 || so015.status !== 'ACTIVE' || so015.revision < 8) errors.push('SO-015 deve estar ACTIVE na revisao 8 ou progressao downstream autorizada');
if (so015?.revision === 8 && state.lastBite !== 'SO-015 | Public Error, Loading & Status Surface Contracts') errors.push('current-state da revisao 8 nao aponta para Wave 08');
if (state.goldenStateStatus !== 'COMPLETE') errors.push('Canvas Golden State deixou de estar COMPLETE');
for (let id = 1; id <= 14; id += 1) {
  const biteId = `SO-${String(id).padStart(3, '0')}`;
  if (ledger.bites.find((bite) => bite.id === biteId)?.status !== 'COMPLETE') errors.push(`${biteId} deixou de estar COMPLETE`);
}

if (errors.length) {
  console.error('\nSO-015 PUBLIC ROUTES WAVE 08: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-015 Public Routes Wave 08: public error, loading and not-found boundaries keep contextual copy at the route edge while shared status primitives own behavior, accessibility and visual treatment; canonical error contracts are reused and the Canvas Golden State stays sealed.');
