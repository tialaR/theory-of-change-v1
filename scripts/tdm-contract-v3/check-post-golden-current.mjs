#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const gates = readJson('.sharkops/policy/gates.json');
const pkg = readJson('package.json');
const active = gates.activeProfile;
const profile = gates.profiles?.[active];
requireCondition(active === 'post-golden-hardening', `perfil ativo não é post-golden-hardening: ${active}`);
requireCondition(Boolean(profile), 'perfil post-golden-hardening ausente');

const mandatoryCommit = profile?.mandatory?.['pre-commit'] ?? [];
const mandatoryPush = profile?.mandatory?.['pre-push'] ?? [];
const advisoryCommit = profile?.advisory?.['pre-commit'] ?? [];
const advisoryPush = profile?.advisory?.['pre-push'] ?? [];
const activeGates = [...mandatoryCommit, ...mandatoryPush, ...advisoryCommit, ...advisoryPush];

requireCondition(mandatoryPush.includes('validate:release'), 'validate:release não é obrigatório no pre-push');
requireCondition(mandatoryCommit.includes('check:tdm:post-golden-current'), 'contrato Post-Golden atual não é obrigatório no pre-commit');
requireCondition(!activeGates.some((name) => name.startsWith('check:tdm:v3:')), 'gate agregado TDM V3 legado ainda governa hook ativo');
requireCondition(advisoryCommit.length === 0 && advisoryPush.length === 0, 'perfil Post-Golden ainda possui gate advisory ativo');
requireCondition(gates.policy?.legacyFailureBlocks === true, 'falha legacy ainda pode ser tratada como não bloqueante');

for (const [name, classification] of Object.entries(gates.classifications ?? {})) {
  if (!activeGates.includes(name)) continue;
  requireCondition(!String(classification).includes('LEGACY'), `gate ativo ainda classificado como legacy: ${name}`);
}

const release = pkg.scripts?.['validate:release'] ?? '';
requireCondition(release.includes('check:tdm:post-golden-current'), 'validate:release não termina no contrato Post-Golden atual');
requireCondition(!release.includes('check:tdm:v3:full'), 'validate:release ainda depende do agregador V3 legado');

for (const script of [
  'check:tdm:sass-module-policy','typecheck','lint:canvas','lint:auth','test:unit','build','test:e2e',
  'check:tdm:react-flow','check:tdm:ownership','check:tdm:auth-msw','check:tdm:i18n-routes',
  'check:tdm:i18n-copy','check:tdm:canvas-continuity','check:tdm:architecture-naming','check:tdm:post-golden-current'
]) requireCondition(Boolean(pkg.scripts?.[script]), `prova de release atual ausente: ${script}`);

const workflowRoot = path.join(root, '.github/workflows');
if (fs.existsSync(workflowRoot)) {
  const workflowFiles = fs.readdirSync(workflowRoot).filter((name) => /\.ya?ml$/.test(name));
  for (const workflowFile of workflowFiles) {
    const relative = `.github/workflows/${workflowFile}`;
    const source = fs.readFileSync(path.join(workflowRoot, workflowFile), 'utf8');
    requireCondition(
      !source.includes('check:tdm:v2:') && !source.includes('check:tdm:v3:'),
      `workflow ativo ainda executa contrato agregado legado: ${relative}`
    );
  }

  const releaseWorkflow = '.github/workflows/tdm-contract-post-golden.yml';
  requireCondition(fs.existsSync(path.join(root, releaseWorkflow)), 'workflow Post-Golden de release ausente');

  if (fs.existsSync(path.join(root, releaseWorkflow))) {
    const source = fs.readFileSync(path.join(root, releaseWorkflow), 'utf8');
    requireCondition(source.includes('name: TDM Post-Golden Release'), 'workflow de release ainda possui identidade legada');
    requireCondition(source.includes('name: tdm-post-golden-release'), 'job de release ainda possui identidade legada');
    requireCondition(source.includes('node-version: 22'), 'workflow Post-Golden não fixa Node 22');
    requireCondition(source.includes('npx playwright install ffmpeg'), 'workflow Post-Golden não instala FFmpeg exigido pelos artefatos de vídeo do Playwright');
    requireCondition(source.includes('npm run check:tdm:post-golden-current'), 'CI não prova governança Post-Golden');
    requireCondition(source.includes('npm run validate:release'), 'CI não executa validate:release fail-closed');
    requireCondition(!source.includes('check:tdm:v2:all'), 'CI ainda chama check:tdm:v2:all');
  }

  requireCondition(
    !fs.existsSync(path.join(root, '.github/workflows/tdm-contract-v2.yml')),
    'workflow TDM Contract V2 legado ainda está ativo'
  );
}

if (errors.length) {
  console.error('\nTDM POST-GOLDEN CURRENT CONTRACT: FAIL\n');
  errors.forEach((error,i)=>console.error(`${i+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS Post-Golden Current: hooks e CI sem advisory/legacy ativo, dependências E2E explícitas, validate:release fail-closed e cadeia de provas atuais íntegra.');
