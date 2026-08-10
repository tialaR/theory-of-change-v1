import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function command(commandName, args) {
  const result = spawnSync(commandName, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? ''
  };
}

function runNpm(script) {
  return command('npm', ['run', script]);
}

const generatedAt = new Date().toISOString();
const gitStatus = command('git', ['status', '--short']);
const branch = command('git', ['branch', '--show-current']);
const head = command('git', ['rev-parse', '--short', 'HEAD']);

const checks = [
  ['TDM Contract V3', 'check:tdm:v3:quick'],
  ['React Flow', 'check:tdm:react-flow'],
  ['Ownership', 'check:tdm:ownership'],
  ['i18n and routes', 'check:tdm:i18n-routes'],
  ['Canvas continuity', 'check:tdm:canvas-continuity']
].map(([name, script]) => {
  const result = runNpm(script);

  return {
    name,
    script,
    status: result.status === 0 ? 'PASS' : 'ATTENTION',
    output: result.stdout || result.stderr
  };
});

const attention = checks.filter((check) => check.status !== 'PASS');

const report = [
  '# SharkOps Repository Scan',
  '',
  `Generated: ${generatedAt}`,
  `Branch: ${branch.stdout || 'unknown'}`,
  `Commit: ${head.stdout || 'unknown'}`,
  '',
  '## Executive result',
  '',
  attention.length === 0
    ? 'No client-gate attention points detected.'
    : `${attention.length} client-gate attention point(s) detected and classified as non-blocking during bootstrap recovery.`,
  '',
  '## Gate classification',
  '',
  ...checks.flatMap((check) => [
    `### ${check.name}`,
    '',
    `- Script: \`${check.script}\``,
    `- Result: **${check.status}**`,
    '',
    '```text',
    check.output || 'No output.',
    '```',
    ''
  ]),
  '## Working tree',
  '',
  '```text',
  gitStatus.stdout || 'Clean working tree.',
  '```',
  '',
  '## Product decision',
  '',
  'These findings do not automatically block SharkOps.',
  '',
  'They remain visible until a future bite repairs, reclassifies or retires them.',
  '',
  '## Recommended next attacks',
  '',
  '1. Repository intelligence and automatic ownership mapping.',
  '2. Attack planner with priority and risk scoring.',
  '3. Automated repair recipes for recognized architecture violations.',
  ''
].join('\n');

fs.mkdirSync('.sharkops/reports', { recursive: true });
fs.mkdirSync('docs/sharkops', { recursive: true });

fs.writeFileSync(
  '.sharkops/reports/repository-scan.md',
  report
);

fs.writeFileSync(
  'docs/sharkops/ATTENTION-POINTS.md',
  report
);

const debtsFile = '.sharkops/state/known-debts.json';
let debts = {};

try {
  debts = JSON.parse(fs.readFileSync(debtsFile, 'utf8'));
} catch {
  debts = {};
}

debts.schemaVersion = debts.schemaVersion ?? 1;
debts.updatedAt = generatedAt;
debts.source = 'sharkops-repository-scan';
debts.items = attention.map((check) => ({
  id: `CLIENT-GATE-${check.script.toUpperCase().replaceAll(':', '-').replaceAll('_', '-')}`,
  title: check.name,
  source: check.script,
  classification: 'LEGACY_ADVISORY',
  status: 'OPEN',
  blocking: false
}));

fs.writeFileSync(
  debtsFile,
  `${JSON.stringify(debts, null, 2)}\n`
);

console.log('');
console.log('🦈 SHARKOPS SCAN  HOUSE INSPECTION');
console.log('');
console.log(`Branch: ${branch.stdout || 'unknown'}`);
console.log(`Commit: ${head.stdout || 'unknown'}`);
console.log(`Attention points: ${attention.length}`);
console.log('');
console.log('PASS  docs/sharkops/ATTENTION-POINTS.md');
console.log('PASS  .sharkops/reports/repository-scan.md');
console.log('PASS  .sharkops/state/known-debts.json');
console.log('');
console.log('VERDICT: HOUSE MAPPED');
