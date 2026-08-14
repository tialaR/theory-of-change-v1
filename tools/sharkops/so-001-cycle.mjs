import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const biteDir = '.sharkops/bites/so-001-black-box';
const runtimeFile = '.sharkops/runtime/so-001-proof.json';
const manifestFile = `${biteDir}/MANIFEST.json`;

function run(script) {
  const result = spawnSync('sh', [`${biteDir}/${script}.sh`], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    console.error(`FAIL: SO-001 ${script}`);
    process.exit(result.status ?? 1);
  }

  console.log(`PASS  SO-001 ${script}`);
}

function updateManifest() {
  const manifest = JSON.parse(
    fs.readFileSync(manifestFile, 'utf8')
  );

  manifest.status = 'READY_TO_CLOSE';
  manifest.lifecycle = {
    apply: 'PASS',
    verify: 'PASS',
    rollback: 'PASS',
    reapply: 'PASS',
    finalVerify: 'PASS'
  };
  manifest.completionEvidence = runtimeFile;
  manifest.updatedAt = new Date().toISOString();

  fs.writeFileSync(
    manifestFile,
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

console.log('');
console.log('🦈 SHARKOPS SO-001  FULL BITE CYCLE');
console.log('');

run('apply');
run('verify');
run('rollback');

if (fs.existsSync(runtimeFile)) {
  console.error('FAIL: rollback left runtime evidence behind');
  process.exit(1);
}

console.log('PASS  rollback removed runtime evidence');

run('apply');
run('verify');

updateManifest();

console.log('');
console.log('VERDICT: SO-001 READY TO CLOSE');
