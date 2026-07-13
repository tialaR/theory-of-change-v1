#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicExperiencePath = path.join(root, 'src/features/theory-of-change/components/resend-public/public-experience.tsx');
const componentDir = path.join(root, 'src/features/theory-of-change/components/resend-public/example-previews');

function log(message) {
  console.log(`[tdm-example-previews] ${message}`);
}

function fail(message) {
  console.error(`[tdm-example-previews] ${message}`);
  process.exit(1);
}

function findSectionBounds(source, needle) {
  const needleIndex = source.indexOf(needle);
  if (needleIndex < 0) return null;
  const start = source.lastIndexOf('<section', needleIndex);
  if (start < 0) return null;

  const tagRegex = /<\/?section\b[^>]*>/g;
  tagRegex.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tagRegex.exec(source))) {
    const tag = match[0];
    if (tag.startsWith('</section')) {
      depth -= 1;
      if (depth === 0) {
        return { start, end: tagRegex.lastIndex };
      }
    } else {
      depth += 1;
    }
  }
  return null;
}

if (!fs.existsSync(publicExperiencePath)) {
  fail(`Nao encontrei ${path.relative(root, publicExperiencePath)}. Rode este script na raiz do projeto.`);
}

if (!fs.existsSync(componentDir)) {
  fail(`Nao encontrei ${path.relative(root, componentDir)}. Primeiro copie/descompacte o zip na raiz do projeto.`);
}

let source = fs.readFileSync(publicExperiencePath, 'utf8');
const backupPath = `${publicExperiencePath}.before-example-previews`;
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, source);
  log(`Backup criado: ${path.relative(root, backupPath)}`);
}

if (!source.includes("from './example-previews'")) {
  const importLine = "import { ExamplePreviewsSection } from './example-previews';\n";
  const lastImport = [...source.matchAll(/^import .*?;\n/gm)].pop();
  if (!lastImport) fail('Nao encontrei imports para inserir ExamplePreviewsSection.');
  source = `${source.slice(0, lastImport.index + lastImport[0].length)}${importLine}${source.slice(lastImport.index + lastImport[0].length)}`;
  log('Import inserido em public-experience.tsx');
}

const alreadyMounted = source.includes('<ExamplePreviewsSection />');
if (!alreadyMounted) {
  const bounds = findSectionBounds(source, 'Rotas principais') || findSectionBounds(source, 'Cada card tem uma função clara no produto');
  if (!bounds) {
    fail('Nao consegui localizar a section antiga de cards por "Rotas principais". Nenhum patch destrutivo foi feito. Importe e renderize <ExamplePreviewsSection /> manualmente no lugar dessa section.');
  }
  source = `${source.slice(0, bounds.start)}<ExamplePreviewsSection />${source.slice(bounds.end)}`;
  log('Section antiga de cards substituida por <ExamplePreviewsSection />');
} else {
  log('ExamplePreviewsSection ja estava montado. Mantive sem duplicar.');
}

fs.writeFileSync(publicExperiencePath, source);
log('Aplicado. Agora rode: npm run build');
