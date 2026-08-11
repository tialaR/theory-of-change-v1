import { readFileSync, existsSync } from 'node:fs';
import process from 'node:process';

const failures = [];
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const gates = JSON.parse(readFileSync('.sharkops/policy/gates.json', 'utf8'));
const config = readFileSync('playwright.config.ts', 'utf8');
const runnerPath = 'scripts/playwright/run-all-e2e.mjs';

if (pkg.scripts?.['test:e2e'] !== 'node scripts/playwright/run-all-e2e.mjs') {
  failures.push('test:e2e deve usar o runner environment-safe completo.');
}
if (!pkg.scripts?.['validate:release']?.includes('npm run test:e2e')) {
  failures.push('validate:release deve continuar provando o E2E completo via test:e2e.');
}
if (pkg.scripts?.['check:tdm:release-e2e-harness'] !== 'node scripts/tdm-contract-v3/check-release-e2e-harness.mjs') {
  failures.push('script do gate release-e2e-harness ausente ou divergente.');
}
if (!existsSync(runnerPath)) {
  failures.push('runner completo de Playwright ausente.');
} else {
  const runner = readFileSync(runnerPath, 'utf8');
  if (!runner.includes('TDM_PLAYWRIGHT_EXECUTABLE_PATH')) failures.push('runner não injeta executable path do browser do sistema.');
  if (!runner.includes("'./node_modules/@playwright/test/cli.js', 'test'")) failures.push('runner não executa a suíte Playwright completa.');
}
if (!config.includes('launchOptions: { executablePath }')) {
  failures.push('playwright.config.ts não aplica executablePath via launchOptions.');
}
const profile = gates.profiles?.[gates.activeProfile];
for (const stage of ['pre-commit','pre-push']) {
  if (!profile?.mandatory?.[stage]?.includes('check:tdm:release-e2e-harness')) {
    failures.push(`release-e2e-harness deve ser mandatory em ${stage}.`);
  }
}
if (gates.classifications?.['check:tdm:release-e2e-harness'] !== 'MANDATORY') {
  failures.push('release-e2e-harness deve ser classificado como MANDATORY.');
}

if (failures.length) {
  console.error('\nTDM RELEASE E2E HARNESS: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS TDM Release E2E Harness: the full Playwright suite uses an environment-safe browser preflight, validate:release preserves full E2E proof, and SharkOps blocks regression to raw browser-dependent execution.');
