import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rel = (value) => path.join(root, value);
const fail = [];
const content = 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-content.tsx';
const composer = 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-panels.tsx';
const panelDir = 'src/features/theory-of-change/components/sidebar/tdm-sidebar/panels';
const required = [
  'sidebar-progress-panel.tsx', 'sidebar-stage-action-panel.tsx', 'sidebar-block-forms-panel.tsx',
  'sidebar-context-panel.tsx', 'sidebar-organization-panel.tsx', 'sidebar-shortcuts-panel.tsx',
  'sidebar-final-result-panel.tsx'
];
for (const file of [content, composer, ...required.map((name) => `${panelDir}/${name}`)]) {
  if (!fs.existsSync(rel(file))) fail.push(`ausente: ${file}`);
}
const lines = (file) => fs.readFileSync(rel(file), 'utf8').split(/\r?\n/).length;
if (fs.existsSync(rel(content)) && lines(content) > 45) fail.push(`content excede 45 linhas (${lines(content)})`);
if (fs.existsSync(rel(composer)) && lines(composer) > 50) fail.push(`composer excede 50 linhas (${lines(composer)})`);
if (fs.existsSync(rel(content))) {
  const source = fs.readFileSync(rel(content), 'utf8');
  for (const forbidden of ['V1StageActionSection', 'QuickShortcutsCard', 'V1FinalResultCard', 'V1CanvasOrganizationAccordion']) {
    if (source.includes(forbidden)) fail.push(`content ainda conhece ${forbidden}`);
  }
}
if (fail.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 03: FAIL\n');
  fail.forEach((item, index) => console.error(`${index + 1}. ${item}`));
  process.exit(1);
}
console.log('PASS: Sidebar compõe painéis independentes; conteúdo não conhece detalhes de progresso, ação, formulário, contexto, organização, atalhos ou resultado.');
