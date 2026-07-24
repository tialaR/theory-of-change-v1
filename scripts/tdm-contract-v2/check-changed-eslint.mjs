#!/usr/bin/env node

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
}

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

function isLintable(file) {
  if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) return false;
  if (!fs.existsSync(file)) return false;
  return fs.statSync(file).isFile();
}

function addFiles(target, rawFiles) {
  for (const file of rawFiles) {
    if (isLintable(file)) target.add(file);
  }
}

const files = new Set();
const candidates = [process.env.TDM_BASE_REF, 'origin/dev', 'dev'].filter(Boolean);
let base = null;

for (const candidate of candidates) {
  if (run('git', ['rev-parse', '--verify', candidate]).status === 0) {
    base = candidate;
    break;
  }
}

if (base) {
  const mergeBase = run('git', ['merge-base', base, 'HEAD']);
  const from = mergeBase.status === 0 ? mergeBase.stdout.trim() : base;
  const committed = run('git', ['diff', '--name-only', '--diff-filter=ACMR', `${from}...HEAD`]);
  addFiles(files, splitLines(committed.stdout));
}

const staged = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
const unstaged = run('git', ['diff', '--name-only', '--diff-filter=ACMR']);
const untracked = run('git', ['ls-files', '--others', '--exclude-standard']);

addFiles(files, splitLines(staged.stdout));
addFiles(files, splitLines(unstaged.stdout));
addFiles(files, splitLines(untracked.stdout));

const lintTargets = [...files].sort();

if (lintTargets.length === 0) {
  console.log('TDM changed lint: no existing changed JS/TS files.');
  process.exit(0);
}

console.log(`TDM changed lint: ${lintTargets.length} arquivo(s) existente(s).`);
const result = spawnSync(
  'npx',
  ['--no-install', 'eslint', '--no-error-on-unmatched-pattern', '--no-warn-ignored', ...lintTargets],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

process.exit(result.status ?? 1);
