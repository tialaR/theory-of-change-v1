const fs = require('fs');
const path = require('path');

const root = process.cwd();
const patchRoot = path.resolve(__dirname, '..');
const backupSuffix = '.before-tdm-components-v4';

const files = [
  'src/features/theory-of-change/components/resend-public/public-experience.tsx',
  'src/features/theory-of-change/components/resend-public/public-experience.module.sass',
  'src/features/theory-of-change/components/resend-public/guide-stage-card/guide-stage-card.tsx',
  'src/features/theory-of-change/components/resend-public/guide-stage-card/guide-stage-card.module.sass',
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews-section.tsx',
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass',
  'src/features/theory-of-change/components/result-view/liquid-glass/resource-card.tsx',
  'src/features/theory-of-change/components/result-view/liquid-glass/resource-card.module.sass',
  'src/features/theory-of-change/components/result-view/liquid-glass/resources-panel.tsx',
  'src/features/theory-of-change/components/result-view/liquid-glass/resources-panel.module.sass',
  'src/features/theory-of-change/components/result-view/liquid-glass/index.ts',
  'src/features/theory-of-change/components/result-view/experience/result-diagram.tsx',
  'src/features/theory-of-change/components/result-view/experience/result-experience.module.sass'
];

function assertProjectRoot() {
  const pkg = path.join(root, 'package.json');
  const src = path.join(root, 'src');
  if (!fs.existsSync(pkg) || !fs.existsSync(src)) {
    throw new Error('Rode este script na raiz do projeto theory-of-change-v1.');
  }
}

function backupIfNeeded(target) {
  if (!fs.existsSync(target)) return;
  const backup = `${target}${backupSuffix}`;
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(target, backup);
  }
}

function copyFile(relativePath) {
  const source = path.join(patchRoot, relativePath);
  const target = path.join(root, relativePath);
  if (!fs.existsSync(source)) {
    throw new Error(`Arquivo do patch nao encontrado: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  backupIfNeeded(target);
  fs.copyFileSync(source, target);
  console.log(`aplicado: ${relativePath}`);
}

function main() {
  assertProjectRoot();
  files.forEach(copyFile);

  console.log('\nPatch aplicado. Backups criados com o sufixo: ' + backupSuffix);
  console.log('Rotas para testar:');
  console.log('- /guia-de-aprendizado');
  console.log('- /exemplos');
  console.log('- /exemplos/resultado');
  console.log('- /exemplos/resultado/interativo');
  console.log('\nAgora rode:');
  console.log('rm -rf .next && npm run build');
}

main();
