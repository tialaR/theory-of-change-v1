#!/bin/sh
set -eu

test -f .sharkops/runtime/so-001-proof.json
test -f docs/sharkops/MANIFESTO.md
test -f docs/sharkops/ATTENTION-POINTS.md
test -f .sharkops/policy/principles.json
test -f .sharkops/state/known-debts.json

node --check tools/sharkops/gate.mjs
node --check tools/sharkops/principles.mjs
node --check tools/sharkops/scan.mjs
node --check tools/sharkops/so-001-cycle.mjs

npm run shark:principles

echo "PASS: SO-001 verified."
