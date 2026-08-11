#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const required = [
  'docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave01.mjs',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave02.mjs',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave03.mjs',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave04.mjs',
  'scripts/tdm-contract-v3/check-auth-protected-surfaces-wave05.mjs'
];
required.forEach((rel) => requireCondition(exists(rel), `artefato obrigatorio ausente: ${rel}`));

if (!errors.length) {
  const audit = json('docs/sharkops/SO-016-AUTH-PROTECTED-SURFACE-AUDIT.json');
  const ledger = json('.sharkops/state/bite-ledger.json');
  const state = json('.sharkops/state/current-state.json');
  const so16 = (ledger.bites ?? []).find((item) => item.id === 'SO-016');
  const so17 = (ledger.bites ?? []).find((item) => item.id === 'SO-017');
  const findings = audit.findings ?? [];
  const ids = findings.map((item) => item.id).sort();

  requireCondition(JSON.stringify(ids) === JSON.stringify(['AUTH-001','AUTH-002','AUTH-003','AUTH-004','AUTH-005']), 'inventario canonico de findings SO-016 mudou');
  requireCondition(findings.every((item) => String(item.status).startsWith('RESOLVED-')), 'SO-016 possui finding nao resolvido');
  requireCondition(audit.closeout?.status === 'COMPLETE', 'audit closeout nao esta COMPLETE');
  requireCondition(Array.isArray(audit.closeout?.openFindings) && audit.closeout.openFindings.length === 0, 'closeout ainda possui findings abertos');
  requireCondition(so16?.status === 'COMPLETE' && so16?.revision === 6, 'ledger nao fecha SO-016 na revisao 6');
  requireCondition(Boolean(so16?.completedAt), 'SO-016 COMPLETE sem completedAt');
  const terminalState = state.lastBite === 'SO-016 | Authentication & Protected Surface Armor COMPLETE' && state.nextBite === 'SO-017 | Application Shell & Shared UI Armor Audit';
  const successorState = so17?.status === 'ACTIVE' && state.activeBite === 'SO-017 | Application Shell & Shared UI Armor';
  requireCondition(terminalState || successorState, 'current-state perdeu a progressao canonica SO-016 COMPLETE -> SO-017');
  requireCondition(state.goldenStateStatus === 'COMPLETE' && state.goldenStateId === 'GOLDEN-STATE-v1', 'Canvas Golden State deixou de estar selado');
  requireCondition(audit.nextBite?.id === 'SO-017', 'audit closeout nao aponta para SO-017');
}

if (errors.length) {
  console.error('\nSO-016 AUTHENTICATION & PROTECTED SURFACE CLOSEOUT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}
console.log('PASS SO-016 Closeout: AUTH-001..AUTH-005 are resolved, no open auth/protected-surface finding remains, SO-016 is COMPLETE, and GOLDEN-STATE-v1 remains sealed.');
