import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  publicEntry: 'src/features/theory-of-change/components/sidebar/tdm-sidebar.tsx',
  shell: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-shell.tsx',
  content: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-content.tsx',
  hero: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-hero.tsx',
  progress: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-progress.tsx',
  forms: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-block-forms.tsx',
  context: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/tdm-sidebar-context-panel.tsx',
  heroState: 'src/features/theory-of-change/components/sidebar/tdm-sidebar/use-sidebar-hero-state.ts'
};
const budgets = { publicEntry: 40, shell: 35, content: 80, hero: 90, progress: 210, forms: 150, context: 50, heroState: 90 };
const problems = [];

for (const [name, rel] of Object.entries(files)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    problems.push(`ausente: ${rel}`);
    continue;
  }
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/).length;
  if (lines > budgets[name]) problems.push(`${rel} excede budget (${lines}/${budgets[name]})`);
}

const entry = fs.readFileSync(path.join(root, files.publicEntry), 'utf8');
const shell = fs.readFileSync(path.join(root, files.shell), 'utf8');
for (const forbidden of ['useState', 'useEffect', 'useMemo', 'STAGE_GUIDE', 'TdmConnectionInspector', 'TdmBlockFormFields']) {
  if (entry.includes(forbidden)) problems.push(`entrypoint ainda concentra responsabilidade: ${forbidden}`);
  if (shell.includes(forbidden)) problems.push(`shell ainda concentra responsabilidade: ${forbidden}`);
}

const legacyComposition = entry.includes('<TdmSidebarShell') && entry.includes('<TdmSidebarContent');
const pureShellComposition =
  entry.includes('<TdmSidebarShell') &&
  entry.includes('{children}') &&
  entry.includes('children: ReactNode') &&
  !entry.includes('<TdmSidebarContent');

if (!legacyComposition && !pureShellComposition) {
  problems.push('TdmSidebar não está reduzida a shell de composição compatível com a evolução arquitetural');
}

if (problems.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 02: FAIL\n');
  problems.forEach((problem, index) => console.error(`${index + 1}. ${problem}`));
  process.exit(1);
}
console.log('PASS: TdmSidebar permanece uma casca de composição; a evolução para shell puro preserva o contrato da Wave 02.');
