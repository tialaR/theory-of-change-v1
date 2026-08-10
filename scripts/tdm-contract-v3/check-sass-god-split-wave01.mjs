import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const files = {
  canvasRoot: 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass',
  canvasVisual: 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace-visual-overrides.module.sass',
  sidebarRoot: 'src/features/theory-of-change/components/sidebar/tdm-sidebar.module.sass',
  sidebarVisual: 'src/features/theory-of-change/components/sidebar/tdm-sidebar-visual-surgery.module.sass'
};

const failures = [];
for (const [label, path] of Object.entries(files)) {
  if (!existsSync(path)) failures.push(`${label} ausente: ${path}`);
}

if (failures.length === 0) {
  const canvasRoot = readFileSync(files.canvasRoot, 'utf8');
  const canvasVisual = readFileSync(files.canvasVisual, 'utf8');
  const sidebarRoot = readFileSync(files.sidebarRoot, 'utf8');
  const sidebarVisual = readFileSync(files.sidebarVisual, 'utf8');

  if (!canvasRoot.includes("@import './canvas-workspace-visual-overrides.module'")) {
    failures.push('canvas workspace não importa o módulo visual extraído.');
  }
  if (!sidebarRoot.includes("@import './tdm-sidebar-visual-surgery.module'")) {
    failures.push('sidebar não importa o módulo de cirurgia visual extraído.');
  }
  if (canvasRoot.split('\n').length > 3350) failures.push('canvas workspace excede budget Wave 01 de 3350 linhas.');
  if (sidebarRoot.split('\n').length > 4550) failures.push('sidebar root excede budget Wave 01 de 4550 linhas.');
  if (canvasVisual.split('\n').length < 90) failures.push('extração visual do Canvas ficou pequena demais para representar a Wave 01.');
  if (sidebarVisual.split('\n').length < 1800) failures.push('extração visual da Sidebar ficou pequena demais para representar a Wave 01.');
  if (!canvasVisual.includes('Visual Foundation Wave 02')) failures.push('módulo visual do Canvas perdeu o marco homologado da Wave 02.');
  if (!sidebarVisual.includes('BEGIN CANVAS FORM SHORTCUTS MICROFIX 05')) failures.push('módulo visual da Sidebar perdeu o início da cirurgia homologada.');
  if (!sidebarVisual.includes('END CANVAS SIDEBAR VISUAL SURGERY')) failures.push('módulo visual da Sidebar perdeu o fechamento da cirurgia homologada.');

  const canvasReconstructed = canvasRoot.replace("\n@import './canvas-workspace-visual-overrides.module'\n", '') + canvasVisual;
  const sidebarReconstructed = sidebarRoot.replace("\n@import './tdm-sidebar-visual-surgery.module'\n", '') + sidebarVisual;
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  if (hash(canvasReconstructed) !== '57dc8e7053b133c6eb9d6ed99def60c520b98a570e7c963a3adcb2610a6b179c') {
    failures.push('split do Canvas alterou o conteúdo visual homologado.');
  }
  if (hash(sidebarReconstructed) !== '7f92a6ad13cda976f0aea4937be71ae18f1c5fe9445681d51dd4a72d57cb6c12') {
    failures.push('split da Sidebar alterou o conteúdo visual homologado.');
  }
}

if (failures.length > 0) {
  console.error('\nTDM SASS GOD SPLIT WAVE 01: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: Canvas e Sidebar Gods iniciaram split por ownership sem SCSS e sem alteração visual.');
