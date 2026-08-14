import { existsSync, readFileSync, readdirSync } from 'node:fs';

const canvasDir = 'src/features/theory-of-change/canvas/ui/canvas-workspace';
const sidebarDir = 'src/features/theory-of-change/components/sidebar';
const canvasRoot = `${canvasDir}/canvas-workspace.module.sass`;
const sidebarRoot = `${sidebarDir}/tdm-sidebar.module.sass`;
const required = [
  `${canvasDir}/canvas-header-toolbar.module.sass`,
  `${canvasDir}/canvas-stage-guides.module.sass`,
  `${canvasDir}/canvas-stage-node-creator.module.sass`,
  `${canvasDir}/canvas-inspector-relations.module.sass`,
  `${canvasDir}/canvas-interaction-contract.module.sass`,
  `${canvasDir}/canvas-visual-foundation.module.sass`,
  `${sidebarDir}/sidebar-shell-hero.module.sass`,
  `${sidebarDir}/sidebar-progress.module.sass`,
  `${sidebarDir}/sidebar-stage-timeline.module.sass`,
  `${sidebarDir}/sidebar-stage-editor.module.sass`,
  `${sidebarDir}/sidebar-final-result.module.sass`,
  `${sidebarDir}/sidebar-stage-tools.module.sass`,
  `${sidebarDir}/sidebar-shell-refinements.module.sass`,
  `${sidebarDir}/sidebar-visual-surgery.module.sass`
];
const failures = [];
for (const file of required) if (!existsSync(file)) failures.push(`módulo de ownership ausente: ${file}`);
for (const file of [canvasRoot, sidebarRoot]) if (!existsSync(file)) failures.push(`entrypoint Sass ausente: ${file}`);

if (failures.length === 0) {
  const canvas = readFileSync(canvasRoot, 'utf8');
  const sidebar = readFileSync(sidebarRoot, 'utf8');
  const allSass = [...readdirSync(canvasDir), ...readdirSync(sidebarDir)]
    .filter((name) => name.endsWith('.module.sass'));
  if (canvas.split('\n').length > 60) failures.push('canvas-workspace.module.sass ainda excede 60 linhas; deve ser somente entrypoint e fundação da página.');
  if (sidebar.split('\n').length > 30) failures.push('tdm-sidebar.module.sass ainda excede 30 linhas; deve ser somente entrypoint.');
  if (!canvas.includes("@use 'sass:meta'")) failures.push('entrypoint do Canvas não usa sass:meta.');
  if (!sidebar.includes("@use 'sass:meta'")) failures.push('entrypoint da Sidebar não usa sass:meta.');
  if (canvas.includes('@import') || sidebar.includes('@import')) failures.push('@import depreciado permanece nos entrypoints.');
  if (allSass.some((name) => name.endsWith('.module.scss'))) failures.push('SCSS detectado no escopo da mordida.');
  const canvasModules = readdirSync(canvasDir)
    .filter((name) => name.endsWith('.module.sass'))
    .map((name) => readFileSync(`${canvasDir}/${name}`, 'utf8'))
    .join('\n');
  const sidebarModules = readdirSync(sidebarDir)
    .filter((name) => name.endsWith('.module.sass'))
    .map((name) => readFileSync(`${sidebarDir}/${name}`, 'utf8'))
    .join('\n');
  for (const token of ['.topbar', '.node', '.inspector', 'Visual Foundation Wave 04']) {
    if (!canvasModules.includes(token)) failures.push(`ownership Canvas perdeu contrato: ${token}`);
  }
  for (const token of ['.heroCard', '.stageAccordion', '.finalResultScene', '.canvasOrganizationCard', 'BEGIN CANVAS SIDEBAR VISUAL SURGERY']) {
    if (!sidebarModules.includes(token)) failures.push(`ownership Sidebar perdeu contrato: ${token}`);
  }
}

if (failures.length) {
  console.error('\nTDM SASS GOD SPLIT WAVE 02: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('PASS: Canvas e Sidebar foram reduzidos a entrypoints e divididos por componente, regra visual e responsabilidade.');
