import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rel = (value) => path.join(root, value);
const fail = [];
const shell = 'src/features/theory-of-change/components/sidebar/tdm-sidebar.tsx';
const feature = 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-feature.tsx';
const canvas = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const workspaceView = 'src/features/theory-of-change/components/canvas/tdm-canvas-workspace-view.tsx';

for (const file of [shell, feature, canvas]) {
  if (!fs.existsSync(rel(file))) fail.push(`ausente: ${file}`);
}

const read = (file) => fs.readFileSync(rel(file), 'utf8');
const lineCount = (file) => read(file).split(/\r?\n/).length;

if (fs.existsSync(rel(shell))) {
  const source = read(shell);
  if (lineCount(shell) > 30) fail.push(`TdmSidebar shell excede 30 linhas (${lineCount(shell)})`);
  for (const forbidden of [
    'TdmSidebarContent',
    'stageCreation',
    'stageCounts',
    'blockForms',
    'context',
    'onAdvance',
    'onViewResult',
    'switch (',
    'if ('
  ]) {
    if (source.includes(forbidden)) fail.push(`TdmSidebar shell conhece responsabilidade proibida: ${forbidden}`);
  }
  for (const required of ['isOpen: boolean', 'children: ReactNode', '<TdmSidebarShell isOpen={isOpen}>{children}</TdmSidebarShell>']) {
    if (!source.includes(required)) fail.push(`TdmSidebar shell perdeu contrato obrigatório: ${required}`);
  }
}

if (fs.existsSync(rel(feature))) {
  const source = read(feature);
  if (lineCount(feature) > 25) fail.push(`feature adapter excede 25 linhas (${lineCount(feature)})`);
  for (const required of ['TdmSidebarFeatureProps', 'TdmSidebarContent', 'TdmSidebarShell']) {
    if (!source.includes(required)) fail.push(`feature adapter perdeu ownership: ${required}`);
  }
}

if (fs.existsSync(rel(canvas))) {
  const source = read(canvas);
  const workspaceSource = fs.existsSync(rel(workspaceView)) ? read(workspaceView) : '';
  if (!source.includes('TdmSidebarFeature') && !workspaceSource.includes('TdmSidebarFeature')) {
    fail.push('Canvas não usa o adapter de feature da Sidebar');
  }
  if (source.includes('<TdmSidebar\n') || workspaceSource.includes('<TdmSidebar\n')) {
    fail.push('Canvas ainda injeta regra de negócio no shell TdmSidebar');
  }
}

if (fail.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 04: FAIL\n');
  fail.forEach((item, index) => console.error(`${index + 1}. ${item}`));
  process.exit(1);
}

console.log('PASS: TdmSidebar é shell puro de isOpen + children; regras e painéis pertencem ao feature adapter.');
