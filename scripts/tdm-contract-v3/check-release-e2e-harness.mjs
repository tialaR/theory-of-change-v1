import { readFileSync, existsSync } from 'node:fs';
import process from 'node:process';

const failures = [];
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const gates = JSON.parse(readFileSync('.sharkops/policy/gates.json', 'utf8'));
const config = readFileSync('playwright.config.ts', 'utf8');
const runnerPath = 'scripts/playwright/run-all-e2e.mjs';
const canvasRunnerPath = 'scripts/playwright/run-canvas-e2e.mjs';

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
  if (!runner.includes('findE2EFiles')) failures.push('runner completo deve descobrir arquivos E2E explicitamente.');
  if (!runner.includes("'--workers=1'")) failures.push('runner completo deve fixar workers=1 por arquivo.');
  if (!runner.includes("TDM_PLAYWRIGHT_REUSE_EXISTING_SERVER: '0'")) failures.push('runner completo deve exigir servidor próprio.');
  if (!runner.includes('for (const file of e2eFiles)')) failures.push('runner completo deve isolar cada arquivo em uma invocação Playwright própria.');
  if (!runner.includes("'test', file, '--workers=1'")) failures.push('runner completo deve executar exatamente um arquivo por processo Playwright.');
}

if (!existsSync(canvasRunnerPath)) {
  failures.push('runner isolado do Canvas ausente.');
} else {
  const canvasRunner = readFileSync(canvasRunnerPath, 'utf8');
  if (!canvasRunner.includes('TDM_PLAYWRIGHT_EXECUTABLE_PATH')) failures.push('runner Canvas deve usar a mesma estratégia executablePath do runner completo.');
  if (canvasRunner.includes("TDM_PLAYWRIGHT_BROWSER = 'system-chrome'")) failures.push('runner Canvas não deve divergir para fallback por channel.');
  if (!canvasRunner.includes("TDM_PLAYWRIGHT_REUSE_EXISTING_SERVER: '0'")) failures.push('runner Canvas deve exigir servidor próprio.');
  if (!canvasRunner.includes("'--workers=1'")) failures.push('runner Canvas deve fixar workers=1.');
}

if (!config.includes("const reuseExistingServer = process.env.TDM_PLAYWRIGHT_REUSE_EXISTING_SERVER === '1';")) {
  failures.push('playwright.config.ts deve tornar reuso de servidor opt-in explícito.');
}
if (!config.includes('reuseExistingServer,')) {
  failures.push('playwright.config.ts deve consumir a política explícita de server reuse.');
}
if (!config.includes('launchOptions: { executablePath }')) {
  failures.push('playwright.config.ts não aplica executablePath via launchOptions.');
}

const profile = gates.profiles?.[gates.activeProfile];
for (const stage of ['pre-commit', 'pre-push']) {
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

console.log('PASS TDM Release E2E Harness: release E2E discovers every file, runs each with workers=1 and a fresh owned server, uses one browser fallback strategy, and remains mandatory in SharkOps.');
