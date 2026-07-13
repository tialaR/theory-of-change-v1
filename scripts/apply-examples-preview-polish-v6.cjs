const fs = require('fs');
const path = require('path');

const root = process.cwd();
const patchRoot = path.resolve(__dirname, '..');
const backupSuffix = '.before-examples-preview-polish-v6';

const copyTargets = [
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews-section.tsx',
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass'
];

const publicExperiencePath = 'src/features/theory-of-change/components/resend-public/public-experience.tsx';

function assertProjectRoot() {
  if (!fs.existsSync(path.join(root, 'package.json')) || !fs.existsSync(path.join(root, 'src'))) {
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

function patchExamplesHero() {
  const target = path.join(root, publicExperiencePath);
  if (!fs.existsSync(target)) {
    throw new Error(`Arquivo nao encontrado: ${publicExperiencePath}`);
  }

  backupIfNeeded(target);
  const source = fs.readFileSync(target, 'utf8');
  const nextBlock = `export function ExamplesExperiencePage() {
  return (
    <DsPageShell>
      <DsHeader />
      <DsHero
        compact
        kicker="Prévia das experiências"
        title="Escolha como visualizar a teoria."
        description="Dois caminhos visuais, o mesmo sistema: primeiro entenda o fluxo, depois leia o resultado conectado."
        actions={<DsButton href="#previews">Ver exemplos</DsButton>}
      />
      <div id="previews">
        <ExamplePreviewsSection />
      </div>
      <DsFooter />
    </DsPageShell>
  );
}
`;

  const pattern = /export function ExamplesExperiencePage\(\) \{[\s\S]*?\n\}\n\nexport function ReferencesExperiencePage\(\)/;
  if (!pattern.test(source)) {
    throw new Error('Nao encontrei o bloco ExamplesExperiencePage para substituir com seguranca.');
  }

  const updated = source.replace(pattern, `${nextBlock}\nexport function ReferencesExperiencePage()`);
  fs.writeFileSync(target, updated);
  console.log(`ajustado: ${publicExperiencePath}`);
}

function main() {
  assertProjectRoot();
  copyTargets.forEach(copyFile);
  patchExamplesHero();

  console.log('\nPatch aplicado. Backups criados com o sufixo: ' + backupSuffix);
  console.log('Rota para testar: /exemplos');
  console.log('\nAgora rode:');
  console.log('rm -rf .next && npm run build && npm run dev');
}

main();
