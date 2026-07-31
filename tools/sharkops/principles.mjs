import fs from 'node:fs';

const failures = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
    return null;
  }
}

function requireFile(file) {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${file}`);
    return;
  }

  console.log(`PASS  ${file}`);
}

function requireTrue(value, label) {
  if (value !== true) {
    failures.push(`${label} must be true`);
    return;
  }

  console.log(`PASS  ${label}`);
}

console.log('');
console.log('🦈 SHARKOPS PRINCIPLES  CONSTITUTION INSPECTION');
console.log('');

[
  'docs/sharkops/MANIFESTO.md',
  'docs/sharkops/adr/ADR-0002-opinionated-governance.md',
  '.sharkops/policy/principles.json',
  '.sharkops/policy/gates.json',
  '.githooks/pre-commit',
  '.githooks/pre-push'
].forEach(requireFile);

const principles = readJson('.sharkops/policy/principles.json');
const gates = readJson('.sharkops/policy/gates.json');

if (principles) {
  requireTrue(
    principles.authority?.assumedOnInstall,
    'authority assumed on install'
  );

  requireTrue(
    principles.authority?.governsHooks,
    'SharkOps governs hooks'
  );

  requireTrue(
    principles.authority?.legacyIsNotSovereignByDefault,
    'legacy is not sovereign by default'
  );

  requireTrue(
    principles.authority?.userCanRollback,
    'user can rollback'
  );

  requireTrue(
    principles.nonNegotiables?.reduceHumanDecisionLoad,
    'human decision load reduced'
  );

  requireTrue(
    principles.nonNegotiables?.noSilentDeviation,
    'silent deviations forbidden'
  );

  requireTrue(
    principles.nonNegotiables?.rollbackRequired,
    'rollback required'
  );

  requireTrue(
    principles.nonNegotiables?.verificationRequired,
    'verification required'
  );
}

if (gates) {
  requireTrue(
    gates.policy?.sharkOpsIsSovereign,
    'SharkOps gate sovereignty'
  );

  requireTrue(
    gates.policy?.rollbackRequired,
    'gate rollback requirement'
  );

  if (gates.policy?.silentDeviationAllowed !== false) {
    failures.push('silentDeviationAllowed must be false');
  } else {
    console.log('PASS  silent deviations blocked');
  }
}

for (const hook of ['.githooks/pre-commit', '.githooks/pre-push']) {
  if (!fs.existsSync(hook)) {
    continue;
  }

  const source = fs.readFileSync(hook, 'utf8');

  if (!source.includes('shark:gate:')) {
    failures.push(`${hook} does not delegate to SharkOps`);
  } else {
    console.log(`PASS  ${hook} delegates to SharkOps`);
  }

  if (
    source.includes('check:tdm:') ||
    source.includes('validate:release')
  ) {
    failures.push(`${hook} invokes client gates directly`);
  } else {
    console.log(`PASS  ${hook} has no direct client gate`);
  }
}

if (failures.length > 0) {
  console.log('');

  for (const failure of failures) {
    console.error(`FAIL  ${failure}`);
  }

  console.error('');
  console.error('VERDICT: SHARKOPS CONSTITUTION BREACH');
  process.exit(1);
}

console.log('');
console.log('VERDICT: SHARKOPS IDENTITY PRESERVED');
