#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { collectTsxFiles, scanUiCopy } from './lib/ui-copy-scanner.mjs';

const root = process.cwd();
const errors = [];
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const baselinePath = path.join(root, '.tdm/i18n-hardcoded-baseline.json');
const coreRoots = [
  'src/features/auth/ui',
  'src/features/theory-of-change/canvas/ui',
  'src/shared/ui/tdm-status-screen'
];

const coreFiles = collectTsxFiles(root, coreRoots);
const coreFindings = scanUiCopy(root, coreFiles);
for (const finding of coreFindings) {
  errors.push(`copy de interface fora do next-intl em ${finding.location}: ${JSON.stringify(finding.value)}`);
}

requireCondition(fs.existsSync(baselinePath), 'baseline de dívida i18n ausente');
if (fs.existsSync(baselinePath)) {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const allowed = new Set((baseline.findings ?? []).map((finding) => finding.key));
  const legacyFiles = collectTsxFiles(root).filter((file) => !coreRoots.some((coreRoot) => file.startsWith(coreRoot)));
  const current = scanUiCopy(root, legacyFiles);
  for (const finding of current) {
    requireCondition(
      allowed.has(finding.key),
      `nova copy hardcoded fora do core em ${finding.location}: ${JSON.stringify(finding.value)}`
    );
  }
}

if (errors.length) {
  console.error('\nTDM I18N COPY CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: Canvas/Auth sem copy hardcoded e dívida legada de i18n não aumentou.');
