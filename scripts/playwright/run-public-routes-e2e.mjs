import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const publicRouteTests = [
  'src/features/theory-of-change/public-routes.e2e.ts',
  'src/features/auth/ui/login/login.e2e.ts',
  'src/shared/ui/tdm-status-screen/tdm-status-screen.e2e.ts'
];

const bundledChromium = chromium.executablePath();
const candidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  `${process.env.HOME ?? ''}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
];

let browserMode = 'playwright-chromium';
const env = { ...process.env };

if (!existsSync(bundledChromium)) {
  const systemBrowser = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!systemBrowser) {
    console.error('FAIL: nenhum navegador compatível foi encontrado para o E2E público.');
    console.error('Instale Google Chrome/Chromium no sistema ou um browser suportado pelo Playwright.');
    process.exit(1);
  }

  browserMode = 'system-browser';
  env.TDM_PLAYWRIGHT_EXECUTABLE_PATH = systemBrowser;
}

console.log(`TDM PUBLIC E2E PREFLIGHT: usando ${browserMode}.`);

const result = spawnSync(
  process.execPath,
  ['./node_modules/@playwright/test/cli.js', 'test', ...publicRouteTests],
  { cwd: process.cwd(), env, stdio: 'inherit' }
);

if (result.error) {
  console.error(`FAIL: não foi possível iniciar o Playwright público: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
