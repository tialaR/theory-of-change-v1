import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

function findE2EFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...findE2EFiles(absolute));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.e2e.ts')) {
      files.push(relative(process.cwd(), absolute));
    }
  }
  return files.sort();
}

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
    console.error('FAIL: nenhum navegador compatível foi encontrado para o E2E completo.');
    console.error('Instale Google Chrome/Chromium no sistema ou um browser suportado pelo Playwright.');
    process.exit(1);
  }
  browserMode = 'system-browser';
  env.TDM_PLAYWRIGHT_EXECUTABLE_PATH = systemBrowser;
}

const e2eFiles = findE2EFiles(join(process.cwd(), 'src'));
if (e2eFiles.length === 0) {
  console.error('FAIL: nenhum arquivo *.e2e.ts foi encontrado em src/.');
  process.exit(1);
}

console.log(`TDM ALL E2E PREFLIGHT: usando ${browserMode}.`);
console.log(`TDM ALL E2E ISOLATION: ${e2eFiles.length} arquivo(s), servidor novo por arquivo, workers=1.`);

for (const file of e2eFiles) {
  console.log(`\nTDM E2E ISOLATED FILE: ${file}`);
  const result = spawnSync(
    process.execPath,
    ['./node_modules/@playwright/test/cli.js', 'test', file, '--workers=1'],
    { cwd: process.cwd(), env, stdio: 'inherit' }
  );

  if (result.error) {
    console.error(`FAIL: não foi possível iniciar Playwright para ${file}: ${result.error.message}`);
    process.exit(1);
  }
  if ((result.status ?? 1) !== 0) {
    console.error(`FAIL: E2E isolado falhou em ${file}.`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nPASS TDM ALL E2E: todos os arquivos passaram em processos/servidores isolados.');
