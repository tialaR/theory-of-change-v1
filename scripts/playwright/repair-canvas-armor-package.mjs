import { readFile, writeFile } from 'node:fs/promises';

const packagePath = new URL('../../package.json', import.meta.url);
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'check:tdm:canvas-armor': 'node scripts/tdm-contract-v3/check-canvas-armor.mjs',
  'test:e2e:canvas': 'node scripts/playwright/run-canvas-e2e.mjs'
};

await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log('PASS: scripts Canvas Armor preservados sem substituir package.json.');
