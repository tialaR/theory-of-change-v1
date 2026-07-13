#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const target = path.join(
  root,
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass'
);

if (!fs.existsSync(target)) {
  console.error(`Arquivo não encontrado: ${target}`);
  process.exit(1);
}

const source = fs.readFileSync(target, 'utf8');
const backup = `${target}.before-sass-gradient-fix`;
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, source);
}

const propertiesToFlatten = new Set([
  'background',
  'background-image',
  'box-shadow',
  'filter',
  'mask-image',
  '-webkit-mask-image',
]);

function leadingSpaces(line) {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

function isValueContinuation(line, baseIndent) {
  if (!line.trim()) return true;
  const indent = leadingSpaces(line);
  if (indent <= baseIndent) return false;

  const trimmed = line.trim();

  // These are value fragments commonly used in multiline gradients/shadows.
  if (/^(radial-gradient|linear-gradient|conic-gradient|rgba|hsla|rgb|hsl|color-mix|var|inset\b|0\b|-?\d|transparent\b|#[0-9a-fA-F])/.test(trimmed)) {
    return true;
  }

  // A nested Sass selector/property should not be consumed.
  if (/^[.&:#@>+~]/.test(trimmed)) return false;
  if (/^[a-zA-Z-]+\s*:/.test(trimmed)) return false;

  return false;
}

function flattenMultilineSassValues(input) {
  const lines = input.split(/\r?\n/);
  const out = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const propMatch = line.match(/^(\s*)([a-zA-Z-]+):\s*$/);

    if (!propMatch || !propertiesToFlatten.has(propMatch[2])) {
      out.push(line);
      continue;
    }

    const baseIndent = propMatch[1].length;
    const values = [];
    let j = i + 1;

    while (j < lines.length && isValueContinuation(lines[j], baseIndent)) {
      const trimmed = lines[j].trim();
      if (trimmed) values.push(trimmed);
      j += 1;
    }

    if (values.length === 0) {
      out.push(line);
      continue;
    }

    out.push(`${propMatch[1]}${propMatch[2]}: ${values.join(' ')}`);
    i = j - 1;
  }

  return out.join('\n');
}

const fixed = flattenMultilineSassValues(source);

if (fixed === source) {
  console.log('Nenhuma declaração multiline problemática encontrada. Arquivo preservado.');
} else {
  fs.writeFileSync(target, fixed);
  console.log(`Sass corrigido: ${path.relative(root, target)}`);
  console.log(`Backup criado: ${path.relative(root, backup)}`);
}
