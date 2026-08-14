import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJsonAtomic } from './core/io.mjs';
import { heading, row, ui } from './core/ui.mjs';

const args = process.argv.slice(2);

const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const id = value('--id');
const codename = value('--codename');
const purpose = value('--purpose');

if (!id || !codename || !purpose) {
  console.error(
    'Usage: npm run shark:new -- --id SO-001 --codename "Black Box" --purpose "Knowledge as Code"',
  );
  process.exit(1);
}

const slug = `${id}-${codename}`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const bitePath = path.join('.sharkops', 'bites', slug);
const ledgerPath = '.sharkops/state/bite-ledger.json';
const statePath = '.sharkops/state/current-state.json';

if (fs.existsSync(bitePath)) {
  console.error(`Bite already exists: ${bitePath}`);
  process.exit(1);
}

const previousLedger = readJson(ledgerPath);
const previousState = readJson(statePath);
const createdAt = new Date().toISOString();

const bite = {
  id,
  codename,
  purpose,
  status: 'DRAFT',
  revision: 1,
  path: bitePath,
  createdAt,
};

try {
  fs.mkdirSync(path.join(bitePath, 'payload'), { recursive: true });

  fs.writeFileSync(
    path.join(bitePath, 'MANIFEST.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        id,
        codename,
        purpose,
        status: 'DRAFT',
        revision: 1,
      },
      null,
      2,
    )}\n`,
  );

  fs.writeFileSync(
    path.join(bitePath, 'README.md'),
    `# ${id} | ${codename}\n\nPurpose: ${purpose}\n\nStatus: DRAFT\n`,
  );

  for (const name of ['apply', 'verify', 'rollback']) {
    fs.writeFileSync(
      path.join(bitePath, `${name}.sh`),
      `#!/usr/bin/env bash
set -euo pipefail
echo "BREACH: ${name}.sh is not implemented for ${id}." >&2
exit 1
`,
      { mode: 0o755 },
    );
  }

  writeJsonAtomic(ledgerPath, {
    ...previousLedger,
    schemaVersion: previousLedger.schemaVersion ?? 1,
    bites: [...(previousLedger.bites ?? []), bite],
  });

  writeJsonAtomic(statePath, {
    ...previousState,
    phase: 'Bite under construction',
    activeBite: `${id} | ${codename}`,
    activeBiteStatus: 'DRAFT',
    nextBite: `${id} | ${codename}`,
    updatedAt: createdAt,
  });
} catch (error) {
  fs.rmSync(bitePath, { recursive: true, force: true });
  writeJsonAtomic(ledgerPath, previousLedger);
  writeJsonAtomic(statePath, previousState);

  console.error('GATE BREACH: BITE CREATION ROLLED BACK');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

heading('🦈 NEW BITE', 'BITE QUED');
row('ID:', id);
row('Codename:', codename);
row('Purpose:', purpose);
row('Status:', 'DRAFT');
row('Path:', bitePath);

console.log(
  `\n${ui.yellow(
    'The bite is blocked until apply, verify and rollback are implemented.',
  )}\n`,
);
