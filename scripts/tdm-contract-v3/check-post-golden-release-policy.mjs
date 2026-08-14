#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const failures = [];
const fail = (condition, message) => { if (!condition) failures.push(message); };
const gates = JSON.parse(readFileSync('.sharkops/policy/gates.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const active = gates.activeProfile;
const profile = gates.profiles?.[active];
const historical = gates.profiles?.['bootstrap-recovery'];

fail(active === 'post-golden-hardening', `active SharkOps profile must be post-golden-hardening, got ${active}`);
fail(Boolean(profile), 'post-golden-hardening profile is missing');
fail(profile?.mandatory?.['pre-push']?.includes('validate:release'), 'validate:release must be mandatory at pre-push');
fail(!profile?.advisory?.['pre-push']?.includes('validate:release'), 'validate:release must never be advisory at post-Golden pre-push');
fail(gates.classifications?.['validate:release'] === 'MANDATORY_RELEASE_PROOF', 'validate:release classification must be MANDATORY_RELEASE_PROOF');
fail(profile?.mandatory?.['pre-commit']?.includes('check:tdm:post-golden-release-policy'), 'post-Golden release policy contract must protect pre-commit');
fail(profile?.mandatory?.['pre-push']?.includes('check:tdm:post-golden-release-policy'), 'post-Golden release policy contract must protect pre-push');
fail(gates.classifications?.['check:tdm:post-golden-release-policy'] === 'MANDATORY', 'post-Golden release policy contract must be classified MANDATORY');
fail(pkg.scripts?.['check:tdm:post-golden-release-policy'] === 'node scripts/tdm-contract-v3/check-post-golden-release-policy.mjs', 'package script for post-Golden release policy contract is missing or divergent');

// Historical evidence is intentionally preserved. The bootstrap profile may remain advisory,
// but it must not be the active governance profile after the Golden State.
fail(Boolean(historical), 'historical bootstrap-recovery profile must remain available as governance evidence');
fail(historical?.advisory?.['pre-push']?.includes('validate:release'), 'historical bootstrap-recovery evidence unexpectedly changed');

if (failures.length) {
  console.error('\nPOST-GOLDEN RELEASE POLICY: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS Post-Golden Release Policy: active governance is post-golden-hardening, validate:release is fail-closed at pre-push, historical bootstrap evidence is preserved, and regression protection is mandatory.');
