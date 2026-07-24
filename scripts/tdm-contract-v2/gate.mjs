#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  canonicalComponentFamilies,
  activeDesignSystemDocs,
  strictThresholds,
  protectedVisualFiles
} from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const BASELINE_PATH = path.join(__dirname, 'baseline.json');
const CURRENT_PATH = path.join(ROOT, '.tdm-contract-v2-current.json');
const WRITE_BASELINE = process.argv.includes('--write-baseline');
const CHECK_PROTECTED = process.argv.includes('--check-protected');

function posix(value) {
  return value.split(path.sep).join('/');
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
    env: { ...process.env, ...options.env }
  });
}

function scan() {
  const result = run(process.execPath, [path.join(__dirname, 'scan.mjs'), `--output=${posix(path.relative(ROOT, CURRENT_PATH))}`]);
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || 'TDM scan failed.\n');
    process.exit(result.status || 1);
  }
  return JSON.parse(fs.readFileSync(CURRENT_PATH, 'utf8'));
}

function metricMap(report) {
  return new Map(report.files.map((file) => [file.path, file]));
}

function getChangedFiles() {
  const candidates = [
    process.env.TDM_BASE_REF,
    'origin/dev',
    'dev'
  ].filter(Boolean);
  let base = null;
  for (const candidate of candidates) {
    const test = run('git', ['rev-parse', '--verify', candidate]);
    if (test.status === 0) {
      base = candidate;
      break;
    }
  }
  if (!base) {
    const staged = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
    const unstaged = run('git', ['diff', '--name-only', '--diff-filter=ACMR']);
    return [...new Set(`${staged.stdout}\n${unstaged.stdout}`.split(/\r?\n/).filter(Boolean))].map(posix);
  }
  const mergeBase = run('git', ['merge-base', base, 'HEAD']);
  const from = mergeBase.status === 0 ? mergeBase.stdout.trim() : base;
  const diff = run('git', ['diff', '--name-only', '--diff-filter=ACMR', `${from}...HEAD`]);
  return diff.stdout.split(/\r?\n/).filter(Boolean).map(posix);
}

function isNewFile(pathname, baselineMap) {
  return !baselineMap.has(pathname);
}

function formatDelta(label, current, baseline) {
  return `${label}: ${baseline} -> ${current}`;
}

function checkDocs(errors) {
  const activeSet = new Set(activeDesignSystemDocs);
  const docsDir = path.join(ROOT, 'docs/design-system');
  if (!fs.existsSync(docsDir)) return;
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(md|html)$/.test(entry.name)) continue;
    const rel = `docs/design-system/${entry.name}`;
    if (entry.name === 'README.md') continue;
    if (!activeSet.has(rel)) {
      errors.push(`${rel}: documento ativo fora do manifesto V2. Mova para docs/design-system/_legacy ou extraia a decisão para o contrato canônico.`);
    }
  }
}

function checkCanonicalFamilies(current, errors) {
  const currentPaths = new Set(current.files.map((file) => file.path));
  for (const [family, paths] of Object.entries(canonicalComponentFamilies)) {
    for (const canonicalPath of paths) {
      if (!currentPaths.has(canonicalPath)) {
        errors.push(`Componente canônico ausente [${family}]: ${canonicalPath}`);
      }
    }
  }
}

function checkProtectedChanges(changedFiles, errors) {
  if (!CHECK_PROTECTED || process.env.TDM_ALLOW_PROTECTED === '1') return;
  const protectedSet = new Set(protectedVisualFiles);
  const touched = changedFiles.filter((file) => protectedSet.has(file));
  if (touched.length === 0) return;
  errors.push(
    `Zona visual protegida alterada sem TDM_ALLOW_PROTECTED=1:\n${touched.map((file) => `  - ${file}`).join('\n')}`
  );
}

const current = scan();

if (WRITE_BASELINE) {
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(current, null, 2)}\n`);
  fs.rmSync(CURRENT_PATH, { force: true });
  console.log(`Baseline V2 written to ${posix(path.relative(ROOT, BASELINE_PATH))}`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE_PATH)) {
  console.error('Missing scripts/tdm-contract-v2/baseline.json. Run npm run audit:tdm:v2:baseline once on the approved snapshot.');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
const baselineMap = metricMap(baseline);
const currentMap = metricMap(current);
const gitChangedFiles = getChangedFiles();
const contentChangedFiles = current.files
  .filter((file) => {
    const previous = baselineMap.get(file.path);
    return !previous || previous.contentHash !== file.contentHash;
  })
  .map((file) => file.path);
const changedFiles = [...new Set([...gitChangedFiles, ...contentChangedFiles])];
const changedSet = new Set(changedFiles);
const errors = [];
const warnings = [];

const guardedMetrics = [
  ['important', strictThresholds.important],
  ['hardcodedColors', strictThresholds.hardcodedColors],
  ['nestedTernaries', strictThresholds.nestedTernaries],
  ['staticInlineStyles', strictThresholds.staticInlineStyles],
  ['legacyNameCount', 0]
];

for (const [pathname, file] of currentMap.entries()) {
  const previous = baselineMap.get(pathname);
  const fresh = isNewFile(pathname, baselineMap);
  const changed = changedSet.has(pathname) || fresh;
  if (!changed) continue;

  for (const [metric, strictLimit] of guardedMetrics) {
    const currentValue = file[metric] ?? 0;
    const previousValue = previous?.[metric] ?? strictLimit;
    if (fresh && currentValue > strictLimit) {
      errors.push(`${pathname}: novo arquivo viola ${metric} (${currentValue}; limite ${strictLimit}).`);
    } else if (!fresh && currentValue > previousValue) {
      errors.push(`${pathname}: dívida aumentou, ${formatDelta(metric, currentValue, previousValue)}.`);
    }
  }

  if (file.path.endsWith('.tsx')) {
    if (fresh && file.lines > strictThresholds.componentLines) {
      errors.push(`${pathname}: novo componente tem ${file.lines} linhas; limite ${strictThresholds.componentLines}.`);
    }
    if (!fresh && previous && previous.lines > strictThresholds.componentLines && file.lines > previous.lines) {
      errors.push(`${pathname}: God Component cresceu, ${formatDelta('linhas', file.lines, previous.lines)}.`);
    }
    if (fresh && file.hooks > strictThresholds.hooks) {
      errors.push(`${pathname}: novo componente tem ${file.hooks} hooks; limite ${strictThresholds.hooks}.`);
    }
    if (fresh && file.states > strictThresholds.states) {
      errors.push(`${pathname}: novo componente tem ${file.states} estados; limite ${strictThresholds.states}.`);
    }
    if (fresh && file.nonModuleStyleImports.length > 0) {
      errors.push(`${pathname}: novo componente importa estilo não modular: ${file.nonModuleStyleImports.join(', ')}.`);
    }
    if (fresh && file.useClient && pathname.startsWith('src/app/') && /\/(page|layout)\.tsx$/.test(pathname)) {
      errors.push(`${pathname}: page/layout novo não pode nascer como Client Component sem ADR explícita.`);
    }
  }

  if (/\.(sass|scss|css)$/.test(pathname)) {
    if (fresh && !pathname.endsWith('.module.sass') && !pathname.startsWith('src/shared/styles/tdm/')) {
      errors.push(`${pathname}: estilo novo de componente deve usar .module.sass.`);
    }
    if (fresh && file.lines > strictThresholds.styleLines) {
      errors.push(`${pathname}: novo módulo de estilo tem ${file.lines} linhas; limite ${strictThresholds.styleLines}.`);
    }
    if (!fresh && previous && previous.lines > strictThresholds.styleLines && file.lines > previous.lines) {
      errors.push(`${pathname}: módulo Sass legado cresceu, ${formatDelta('linhas', file.lines, previous.lines)}.`);
    }
  }
}

for (const [pathname] of baselineMap.entries()) {
  if (!currentMap.has(pathname) && changedSet.has(pathname)) {
    warnings.push(`${pathname}: arquivo removido. Confirme zero consumidores e paridade funcional no relatório do PR.`);
  }
}

if (current.summary.duplicateFamilies > baseline.summary.duplicateFamilies) {
  errors.push(formatDelta('famílias duplicadas', current.summary.duplicateFamilies, baseline.summary.duplicateFamilies));
}
if (current.summary.duplicateTokenNames > baseline.summary.duplicateTokenNames) {
  errors.push(formatDelta('tokens definidos mais de uma vez', current.summary.duplicateTokenNames, baseline.summary.duplicateTokenNames));
}

checkCanonicalFamilies(current, errors);
checkProtectedChanges(changedFiles, errors);
checkDocs(errors);

fs.rmSync(CURRENT_PATH, { force: true });

console.log(`TDM Contract V2 | ${current.summary.files} arquivos | ${current.summary.components} componentes | ${changedFiles.length} alterados`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length > 0) {
  console.error('\nTDM CONTRACT V2: PORTA FECHADA\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  console.error('\nCorrija a violação ou reduza a dívida. Não aumente o baseline.');
  process.exit(1);
}

console.log('TDM CONTRACT V2: PASS');
