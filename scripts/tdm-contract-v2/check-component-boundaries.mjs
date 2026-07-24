import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const baselinePath = path.join(root, 'scripts/tdm-contract-v2/component-boundaries-baseline.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const sourceRoot = path.join(root, 'src');
const violations = [];
const improvements = [];

function getSourceKind(fileName) {
  if (fileName.endsWith('.tsx')) {
    return 'tsx';
  }

  if (fileName.endsWith('.ts')) {
    return 'ts';
  }

  return null;
}

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(absolutePath);
      continue;
    }

    const kind = getSourceKind(entry.name);
    if (!kind) {
      continue;
    }

    const relativePath = path.relative(root, absolutePath).split(path.sep).join('/');
    const lines = fs.readFileSync(absolutePath, 'utf8').split(/\r?\n/).length;
    const threshold = baseline.thresholds[kind];
    const previous = baseline.files[relativePath];

    if (lines <= threshold) {
      if (previous) {
        improvements.push(`${relativePath}: ${previous.lines} -> ${lines} linhas`);
      }
      continue;
    }

    if (!previous) {
      violations.push(`${relativePath}: ${lines} linhas, limite ${threshold}`);
      continue;
    }

    if (lines > previous.lines) {
      violations.push(`${relativePath}: cresceu de ${previous.lines} para ${lines} linhas`);
    }
  }
}

visit(sourceRoot);

console.log('TDM Component Boundaries');
console.log(`Limites: TSX ${baseline.thresholds.tsx}, TS ${baseline.thresholds.ts} linhas.`);

if (improvements.length > 0) {
  console.log('\nMelhorias detectadas:');
  for (const improvement of improvements) {
    console.log(`  PASS ${improvement}`);
  }
}

if (violations.length > 0) {
  console.error('\nFAIL: novo God Component ou dívida existente ampliada:');
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  process.exit(1);
}

const activeDebt = Object.entries(baseline.files)
  .filter(([relativePath]) => fs.existsSync(path.join(root, relativePath)))
  .length;
console.log(`\nPASS: nenhum novo God Component. Dívida congelada no baseline: ${activeDebt} arquivos.`);
