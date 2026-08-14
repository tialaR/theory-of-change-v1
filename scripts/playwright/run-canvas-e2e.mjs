import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const canvasTest = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts';
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
const env = {
  ...process.env,
  TDM_PLAYWRIGHT_REUSE_EXISTING_SERVER: '0'
};

if (!existsSync(bundledChromium)) {
  const systemBrowser = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!systemBrowser) {
    console.error('FAIL: nenhum navegador compatível foi encontrado.');
    console.error('Instale Google Chrome/Chromium no sistema ou um browser suportado pelo Playwright.');
    process.exit(1);
  }
  browserMode = 'system-browser';
  env.TDM_PLAYWRIGHT_EXECUTABLE_PATH = systemBrowser;
}

console.log(`TDM CANVAS E2E PREFLIGHT: usando ${browserMode}; servidor próprio; workers=1.`);

const result = spawnSync(
  process.execPath,
  ['./node_modules/@playwright/test/cli.js', 'test', canvasTest, '--workers=1'],
  { cwd: process.cwd(), env, stdio: 'inherit' }
);

if (result.error) {
  console.error(`FAIL: não foi possível iniciar o Playwright: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
