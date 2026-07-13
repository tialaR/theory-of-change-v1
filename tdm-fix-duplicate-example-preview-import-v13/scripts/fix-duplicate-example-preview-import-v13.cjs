#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const target = path.join(root, 'src/features/theory-of-change/components/resend-public/public-experience.tsx');

if (!fs.existsSync(target)) {
  console.error('[v13] Arquivo nao encontrado:', target);
  process.exit(1);
}

const original = fs.readFileSync(target, 'utf8');
const backup = `${target}.before-duplicate-example-preview-import-v13`;
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, original);
}

const lines = original.split(/\r?\n/);
let seenExampleImport = false;
let removed = 0;
const cleaned = [];

for (const line of lines) {
  const isExamplePreviewImport = /^import\s+\{\s*ExamplePreviewsSection\s*\}\s+from\s+['"]\.\/example-previews(?:\/example-previews-section)?['"];?\s*$/.test(line.trim());

  if (isExamplePreviewImport) {
    if (!seenExampleImport) {
      // Prefer the direct component import if it is the first one already in the file.
      cleaned.push(line);
      seenExampleImport = true;
    } else {
      removed += 1;
    }
    continue;
  }

  cleaned.push(line);
}

if (removed === 0) {
  console.log('[v13] Nenhum import duplicado de ExamplePreviewsSection encontrado. Nada alterado.');
  process.exit(0);
}

const next = cleaned.join('\n');
fs.writeFileSync(target, next);
console.log(`[v13] Corrigido: removido(s) ${removed} import(s) duplicado(s) de ExamplePreviewsSection.`);
console.log('[v13] Backup:', path.relative(root, backup));
console.log('[v13] Arquivo:', path.relative(root, target));
