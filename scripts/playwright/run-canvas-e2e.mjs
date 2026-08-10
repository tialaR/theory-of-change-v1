import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const canvasTest = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.e2e.ts';
const bundledChromium = chromium.executablePath();
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const macUserChrome = `${process.env.HOME ?? ''}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`;

let browserMode = 'playwright-chromium';
const env = { ...process.env };

if (!existsSync(bundledChromium)) {
  if (existsSync(macChrome) || existsSync(macUserChrome)) {
    browserMode = 'system-chrome';
    env.TDM_PLAYWRIGHT_BROWSER = 'system-chrome';
  } else {
    console.error('FAIL: nenhum navegador compatível foi encontrado.');
    console.error('Instale o Chromium com: npx playwright install chromium');
    console.error('Ou instale o Google Chrome no macOS.');
    process.exit(1);
  }
}

console.log(`TDM E2E PREFLIGHT: usando ${browserMode}.`);

const result = spawnSync(
  process.execPath,
  ['./node_modules/@playwright/test/cli.js', 'test', canvasTest],
  { cwd: process.cwd(), env, stdio: 'inherit' }
);

if (result.error) {
  console.error(`FAIL: não foi possível iniciar o Playwright: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
