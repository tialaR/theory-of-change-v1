import { spawnSync } from 'node:child_process';
import { readJson } from './core/io.mjs';
import { heading, pass, fail, row, ui } from './core/ui.mjs';

const stageArgument = process.argv.find((argument) =>
  argument.startsWith('--stage='),
);

const stage = stageArgument?.split('=')[1] ?? 'pre-commit';

if (!['pre-commit', 'pre-push'].includes(stage)) {
  console.error(`Unsupported SharkOps gate stage: ${stage}`);
  process.exit(1);
}

const policy = readJson('.sharkops/policy/gates.json');
const profileName = policy.activeProfile;
const profile = policy.profiles?.[profileName];

if (!profile) {
  console.error(`GATE BREACH: active profile not found: ${profileName}`);
  process.exit(1);
}

const mandatory = profile.mandatory?.[stage] ?? [];
const advisory = profile.advisory?.[stage] ?? [];

heading('🦈 SHARKOPS GATE', stage.toUpperCase());
row('Profile:', profileName);
row('Authority:', 'SharkOps');
row('Legacy policy:', policy.policy?.legacyFailureBlocks ? 'blocking' : 'advisory');

function runScript(script, blocking) {
  console.log(`\n${ui.bold(`${blocking ? 'MANDATORY' : 'ADVISORY'}: ${script}`)}`);

  const result = spawnSync('npm', ['run', script], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  if (result.status === 0) {
    pass(script);
    return true;
  }

  if (blocking) {
    fail(`${script} blocked ${stage}`);
    return false;
  }

  console.log(
    ui.yellow(
      `DEBT DETECTED: ${script} failed but is classified as LEGACY_ADVISORY.`,
    ),
  );

  return true;
}

let safe = true;

for (const script of mandatory) {
  safe = runScript(script, true) && safe;
}

for (const script of advisory) {
  runScript(script, false);
}

console.log();

if (!safe) {
  console.error(ui.red('ATTACK RESULT: BLOCKED'));
  process.exit(1);
}

console.log(ui.green('ATTACK RESULT: CLEARED BY SHARKOPS'));
