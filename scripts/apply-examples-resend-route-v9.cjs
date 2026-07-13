const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagePath = path.join(root, 'src/app/exemplos/page.tsx');
const backupsDir = path.join(root, 'tdm-backups');
const backupSuffix = '.before-examples-resend-route-v9';

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo nao encontrado: ${path.relative(root, filePath)}`);
  }
}

function backupFile(filePath) {
  assertExists(filePath);
  const backupPath = `${filePath}${backupSuffix}`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Aplicando patch v9 em /exemplos...');

backupFile(pagePath);

writeFile(pagePath, `import { ExamplesExperiencePage } from '@/features/theory-of-change/components/resend-public/public-experience';

export default function ExemplosPage() {
  return <ExamplesExperiencePage />;
}
`);

if (fs.existsSync(backupsDir)) {
  fs.rmSync(backupsDir, { recursive: true, force: true });
  console.log('Removido tdm-backups/ para nao entrar no typecheck do Next.');
}

console.log('OK: /exemplos agora usa ExamplesExperiencePage de resend-public.');
console.log('OK: /canvas nao foi tocado.');
console.log(`Backup do page.tsx: src/app/exemplos/page.tsx${backupSuffix}`);
