#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const stylesheet = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const absoluteStylesheet = join(root, stylesheet);
const failures = [];

if (!existsSync(absoluteStylesheet)) {
  failures.push(`arquivo ausente: ${stylesheet}`);
} else {
  const source = readFileSync(absoluteStylesheet, 'utf8');
  const required = [
    'Visual Foundation Wave 02',
    "&[data-selected='true']::after",
    '.node:hover > .nodeHandle',
    ".connectionGroup[data-selected='true'] path",
    '@media (prefers-reduced-motion: reduce)'
  ];

  for (const token of required) {
    if (!source.includes(token)) failures.push(`contrato visual ausente: ${token}`);
  }
}

function findScss(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findScss(path);
    return entry.name.endsWith('.scss') ? [path] : [];
  });
}

const scssFiles = findScss(join(root, 'src/features/theory-of-change/canvas'));
if (scssFiles.length > 0) failures.push(`SCSS proibido no Canvas: ${scssFiles.join(', ')}`);

const sassBinary = join(root, 'node_modules/.bin/sass');
if (existsSync(sassBinary) && existsSync(absoluteStylesheet)) {
  try {
    execFileSync(sassBinary, ['--no-source-map', absoluteStylesheet, '/tmp/tdm-canvas-wave02.css'], { stdio: 'pipe' });
  } catch (error) {
    failures.push(`Sass Module não compila: ${error.stderr?.toString().trim() || error.message}`);
  }
}

if (failures.length > 0) {
  console.error('\nTDM VISUAL FOUNDATION WAVE 02: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: seleção, handles, conexões e foco usam hierarquia visual stage-aware em Sass Module.');
