#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

const root = process.cwd();
const failures = [];

const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};

const forbiddenBackupRoots = [
  '.shark',
  '.patch-backups',
  '.tdm-backups',
  '.tdm-patches',
  '.tdm-integration',
];

for (const rel of forbiddenBackupRoots) {
  requireCondition(
    !fs.existsSync(path.join(root, rel)),
    `historical/local backup root exists: ${rel}`
  );
}

requireCondition(
  fs.existsSync(path.join(root, '.sharkops')),
  '.sharkops governance is missing'
);

const requiredIgnoreRules = [
  '.shark/',
  '.patch-backups/',
  '.tdm-backups/',
  '.tdm-patches/',
  '.tdm-integration/',
  'playwright-report/',
  'test-results/',
  'coverage/',
  'blob-report/',
  '.DS_Store',
  '._*',
];

const gitignore = fs
  .readFileSync(path.join(root, '.gitignore'), 'utf8')
  .split(/\r?\n/);

for (const rule of requiredIgnoreRules) {
  requireCondition(gitignore.includes(rule), `.gitignore missing ${rule}`);
}

const tracked = childProcess
  .execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

const forbiddenTrackedPatterns = [
  /^\.shark\//,
  /^\.patch-backups\//,
  /^\.tdm-backups\//,
  /^\.tdm-patches\//,
  /^\.tdm-integration\//,
  /(^|\/)playwright-report\//,
  /(^|\/)test-results\//,
  /(^|\/)coverage\//,
  /(^|\/)blob-report\//,
  /(^|\/)\.DS_Store$/,
  /(^|\/)\._[^/]+$/,
];

for (const file of tracked) {
  if (forbiddenTrackedPatterns.some((pattern) => pattern.test(file))) {
    failures.push(`tracked repository debris: ${file}`);
  }
}

if (failures.length) {
  console.error('\nTDM REPOSITORY HYGIENE CONTRACT: FAIL\n');
  failures.forEach((failure, index) =>
    console.error(`${index + 1}. ${failure}.`)
  );
  process.exit(1);
}

console.log(
  'PASS TDM Repository Hygiene: active SharkOps governance is preserved; historical backup roots are retired; generated reports may exist locally but remain ignored and untracked.'
);
