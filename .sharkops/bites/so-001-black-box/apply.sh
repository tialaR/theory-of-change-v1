#!/bin/sh
set -eu

mkdir -p .sharkops/runtime

node <<'NODE'
const fs = require('node:fs');

const evidence = {
  biteId: 'SO-001',
  title: 'Black Box',
  appliedAt: new Date().toISOString(),
  governance: 'SharkOps',
  reversible: true
};

fs.writeFileSync(
  '.sharkops/runtime/so-001-proof.json',
  `${JSON.stringify(evidence, null, 2)}\n`
);
NODE

echo "PASS: SO-001 applied."
