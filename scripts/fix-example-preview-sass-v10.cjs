const fs = require('fs');
const path = require('path');

const root = process.cwd();
const target = path.join(
  root,
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass'
);

if (!fs.existsSync(target)) {
  console.error('[v10] Arquivo nao encontrado:', target);
  process.exit(1);
}

const source = fs.readFileSync(target, 'utf8');
const backup = `${target}.before-example-preview-sass-v10`;
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, source);
}

const lines = source.split('\n');
const out = [];
let changed = false;

const listProps = new Set([
  'background',
  'background-image',
  'box-shadow',
  'filter'
]);

function leadingSpaces(value) {
  const match = value.match(/^\s*/);
  return match ? match[0].length : 0;
}

function isListValue(trimmed) {
  return (
    trimmed.startsWith('radial-gradient(') ||
    trimmed.startsWith('linear-gradient(') ||
    trimmed.startsWith('conic-gradient(') ||
    trimmed.startsWith('url(') ||
    trimmed.startsWith('drop-shadow(') ||
    trimmed.startsWith('blur(') ||
    trimmed.startsWith('saturate(') ||
    trimmed.startsWith('brightness(') ||
    trimmed.startsWith('var(') ||
    trimmed.startsWith('rgba(') ||
    trimmed.startsWith('rgb(') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('inset ')
  );
}

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const propMatch = line.match(/^(\s*)([a-z-]+):\s*$/);

  if (!propMatch || !listProps.has(propMatch[2])) {
    out.push(line);
    continue;
  }

  const baseIndent = propMatch[1];
  const propName = propMatch[2];
  const baseIndentSize = baseIndent.length;
  const values = [];
  let j = i + 1;

  while (j < lines.length) {
    const nextLine = lines[j];
    const trimmed = nextLine.trim();
    const nextIndent = leadingSpaces(nextLine);

    if (!trimmed) {
      break;
    }

    if (nextIndent <= baseIndentSize) {
      break;
    }

    if (!isListValue(trimmed)) {
      break;
    }

    values.push(trimmed);
    j += 1;
  }

  if (values.length > 0) {
    out.push(`${baseIndent}${propName}: ${values.join(' ')}`);
    i = j - 1;
    changed = true;
  } else {
    out.push(line);
  }
}

const result = out.join('\n');

if (!changed) {
  console.log('[v10] Nenhuma mudanca necessaria. O Sass ja parece corrigido.');
  process.exit(0);
}

fs.writeFileSync(target, result);
console.log('[v10] Corrigido:', path.relative(root, target));
console.log('[v10] Backup:', path.relative(root, backup));
