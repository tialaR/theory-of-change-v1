#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { collectTsxFiles, scanUiCopy } from './lib/ui-copy-scanner.mjs';

const root = process.cwd();
const outputPath = path.join(root, '.tdm/i18n-hardcoded-baseline.json');
const coreRoots = [
  'src/features/auth/ui',
  'src/features/theory-of-change/canvas/ui',
  'src/shared/ui/tdm-status-screen'
];
const files = collectTsxFiles(root).filter((file) => !coreRoots.some((coreRoot) => file.startsWith(coreRoot)));
const findings = scanUiCopy(root, files);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  schemaVersion: 1,
  policy: 'legacy-debt-may-only-decrease',
  findings: findings.map(({ key, file, line, kind, value }) => ({ key, file, line, kind, value }))
}, null, 2)}\n`);

console.log(`PASS: baseline i18n registrado com ${findings.length} ocorrências legadas fora do Canvas/Auth.`);
