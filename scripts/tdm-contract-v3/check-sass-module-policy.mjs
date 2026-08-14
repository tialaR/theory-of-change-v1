import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const srcRoot = join(root, 'src');
const violations = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    const rel = relative(root, absolute);
    if (entry.name.endsWith('.scss') || entry.name.endsWith('.module.scss')) {
      violations.push(`${rel}: SCSS proibido; use .module.sass.`);
    }
    if (entry.name.endsWith('.css') && !rel.endsWith('src/app/globals.css')) {
      const content = await readFile(absolute, 'utf8');
      if (content.trim()) violations.push(`${rel}: CSS local proibido; use .module.sass.`);
    }
  }
}

await walk(srcRoot);

if (violations.length) {
  console.error('\nTDM SASS MODULE POLICY: FAIL\n');
  violations.forEach((item, index) => console.error(`${index + 1}. ${item}`));
  process.exit(1);
}

console.log('PASS: estilos locais permanecem em .module.sass; nenhum SCSS foi introduzido.');
