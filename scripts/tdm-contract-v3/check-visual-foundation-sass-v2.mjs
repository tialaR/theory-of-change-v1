import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const target = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const source = fs.readFileSync(target, 'utf8');
const forbidden = /^\s+(background|background-image):\s*$\n\s+(linear-gradient|radial-gradient)\(/m;

if (forbidden.test(source)) {
  console.error('TDM VISUAL FOUNDATION SASS V2: FAIL');
  console.error('1. background complexo multilinha voltou ao módulo .sass.');
  process.exit(1);
}

const sassBin = process.platform === 'win32' ? 'node_modules/.bin/sass.cmd' : './node_modules/.bin/sass';
if (!fs.existsSync(sassBin)) {
  console.error('TDM VISUAL FOUNDATION SASS V2: FAIL');
  console.error('1. compilador Sass local não encontrado. Execute npm install antes do verify.');
  process.exit(1);
}

const result = spawnSync(sassBin, [target, '/tmp/tdm-canvas-workspace.css', '--no-source-map'], {
  stdio: 'inherit'
});
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('PASS: canvas-workspace.module.sass compila e não contém backgrounds complexos multilinha.');
