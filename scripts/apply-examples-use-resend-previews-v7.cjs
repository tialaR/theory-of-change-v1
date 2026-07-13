#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const stamp = 'before-examples-use-resend-previews-v7';

function file(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(file(rel));
}

function backup(rel) {
  const src = file(rel);
  if (!fs.existsSync(src)) return;
  const dest = `${src}.${stamp}`;
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

function backupDir(rel) {
  const src = file(rel);
  if (!fs.existsSync(src)) return null;
  const dest = file(`tdm-backups/${rel.replace(/^src\//, '').replace(/[\\/]/g, '__')}.${stamp}`);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
  return dest;
}

function rmDir(rel) {
  const target = file(rel);
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function write(rel, content) {
  fs.writeFileSync(file(rel), content);
}

function read(rel) {
  return fs.readFileSync(file(rel), 'utf8');
}

const publicPagesRel = 'src/features/theory-of-change/components/public-pages/public-pages.tsx';
const publicIndexRel = 'src/features/theory-of-change/components/public-pages/index.ts';
const legacyExamplesRel = 'src/features/theory-of-change/components/public-pages/examples';
const newPreviewRel = 'src/features/theory-of-change/components/resend-public/example-previews/example-previews-section.tsx';
const newPreviewIndexRel = 'src/features/theory-of-change/components/resend-public/example-previews/index.ts';

if (!exists(publicPagesRel)) {
  console.error(`[tdm] Arquivo nao encontrado: ${publicPagesRel}`);
  process.exit(1);
}

if (!exists(newPreviewRel) || !exists(newPreviewIndexRel)) {
  console.error('[tdm] O componente novo de previews nao foi encontrado em resend-public/example-previews.');
  console.error(`[tdm] Esperado: ${newPreviewRel}`);
  process.exit(1);
}

backup(publicPagesRel);
backup(publicIndexRel);

let publicPages = read(publicPagesRel);

publicPages = publicPages.replace(
  "import { ExamplesExperienceSection } from './examples/examples-experience-section';",
  "import { ExamplePreviewsSection } from '@/features/theory-of-change/components/resend-public/example-previews';"
);

if (!publicPages.includes("ExamplePreviewsSection")) {
  const importAnchor = "import { TheoryFlowBoard } from './theory-flow-board';";
  publicPages = publicPages.replace(
    importAnchor,
    "import { ExamplePreviewsSection } from '@/features/theory-of-change/components/resend-public/example-previews';\n" + importAnchor
  );
}

const oldBlock = `      <div id="examples-experiences">\n        <PublicSection\n          compact\n          title="Escolha uma experiência"\n          description="Comece pela visão do fluxo ou abra o resultado completo da teoria."\n        >\n          <ExamplesExperienceSection />\n        </PublicSection>\n      </div>`;
const newBlock = `      <div id="examples-experiences">\n        <ExamplePreviewsSection />\n      </div>`;

if (publicPages.includes(oldBlock)) {
  publicPages = publicPages.replace(oldBlock, newBlock);
} else {
  publicPages = publicPages.replace(/<ExamplesExperienceSection\s*\/>/g, '<ExamplePreviewsSection />');
}

if (publicPages.includes('ExamplesExperienceSection')) {
  console.error('[tdm] Ainda existe referencia ao componente legado ExamplesExperienceSection em public-pages.tsx.');
  process.exit(1);
}

write(publicPagesRel, publicPages);

if (exists(publicIndexRel)) {
  let index = read(publicIndexRel);
  index = index.replace(/\nexport \{ FluxoExperiencePage \} from '\.\/examples\/fluxo-experience-page';\n?/g, '\n');
  write(publicIndexRel, index.replace(/\n{3,}/g, '\n\n'));
}

// Tira o componente legado do build, mas deixa copia recuperavel em tdm-backups.
if (exists(legacyExamplesRel)) {
  const backupPath = backupDir(legacyExamplesRel);
  rmDir(legacyExamplesRel);
  console.log(`[tdm] Legado removido de src e salvo em: ${path.relative(root, backupPath)}`);
}

console.log('[tdm] /exemplos agora usa ExamplePreviewsSection de resend-public/example-previews.');
console.log('[tdm] Backups criados com sufixo .' + stamp);
console.log('[tdm] Rode: rm -rf .next && npm run build && npm run dev');
