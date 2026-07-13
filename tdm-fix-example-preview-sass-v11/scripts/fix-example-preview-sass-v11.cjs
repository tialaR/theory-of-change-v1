#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const target = path.join(
  process.cwd(),
  'src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass'
);

if (!fs.existsSync(target)) {
  console.error('[v11] File not found:', target);
  process.exit(1);
}

const original = fs.readFileSync(target, 'utf8');
const backup = `${target}.before-example-preview-sass-v11`;
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, original);
}

const lines = original.split(/\r?\n/);
const out = [];

const valueStart = /^(radial-gradient|linear-gradient|conic-gradient|repeating-linear-gradient|rgba\(|rgb\(|hsla\(|hsl\(|inset\b|0\b|var\(|url\(|#|calc\(|color-mix\()/;
const propertyStart = /^([a-zA-Z-]+):\s+/;
const selectorLike = /^(&|\.|#|@media|@supports|[a-zA-Z0-9_-]+\s*$)/;

function indentOf(line) {
  const m = line.match(/^\s*/);
  return m ? m[0].length : 0;
}

function isLikelyContinuation(line, baseIndent, previousEndedComma) {
  if (line === undefined) return false;
  const trimmed = line.trim();
  if (!trimmed) return false;
  const indent = indentOf(line);

  // If the previous value line ended with a comma, Sass expects another value.
  // Accept gradient/shadow/list continuation even if indentation was accidentally flattened.
  if (previousEndedComma && valueStart.test(trimmed)) return true;

  // Normal indented continuation used by .sass.
  if (indent > baseIndent && valueStart.test(trimmed)) return true;

  return false;
}

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const blankValue = line.match(/^(\s*)([a-zA-Z-]+):\s*$/);

  if (blankValue) {
    const indent = blankValue[1];
    const baseIndent = indent.length;
    const prop = blankValue[2];
    const parts = [];
    let j = i + 1;
    let prevComma = true;

    while (j < lines.length && isLikelyContinuation(lines[j], baseIndent, prevComma)) {
      const trimmed = lines[j].trim();
      parts.push(trimmed);
      prevComma = /,\s*$/.test(trimmed);
      j += 1;
      if (!prevComma) break;
    }

    if (parts.length > 0) {
      out.push(`${indent}${prop}: ${parts.join(' ')}`);
      i = j - 1;
      continue;
    }
  }

  const trailingCommaProp = line.match(/^(\s*)([a-zA-Z-]+):\s+(.+,\s*)$/);

  if (trailingCommaProp) {
    const indent = trailingCommaProp[1];
    const baseIndent = indent.length;
    const prop = trailingCommaProp[2];
    const firstValue = trailingCommaProp[3].trim();
    const parts = [firstValue];
    let j = i + 1;
    let prevComma = true;

    while (j < lines.length && isLikelyContinuation(lines[j], baseIndent, prevComma)) {
      const trimmed = lines[j].trim();
      parts.push(trimmed);
      prevComma = /,\s*$/.test(trimmed);
      j += 1;
      if (!prevComma) break;
    }

    if (parts.length > 1) {
      out.push(`${indent}${prop}: ${parts.join(' ')}`);
      i = j - 1;
      continue;
    }
  }

  out.push(line);
}

let fixed = out.join('\n');

// Targeted belt-and-suspenders cleanup for the known component.
fixed = fixed
  .replace(/background:\s*\n\s*(radial-gradient\([^\n]+\),)\s*\n\s*(linear-gradient\([^\n]+\),)\s*\n\s*(rgba\([^\n]+\)|#[0-9a-fA-F]+|var\([^\n]+\))/g, 'background: $1 $2 $3')
  .replace(/box-shadow:\s*\n\s*(inset [^\n]+,)\s*\n\s*(0 [^\n]+)/g, 'box-shadow: $1 $2')
  .replace(/box-shadow:\s*(inset [^\n]+,)\s*\n\s*(0 [^\n]+)/g, 'box-shadow: $1 $2')
  .replace(/background:\s*\n\s*(linear-gradient\([^\n]+\),)\s*\n\s*(radial-gradient\([^\n]+\),)\s*\n\s*(radial-gradient\([^\n]+\))/g, 'background: $1 $2 $3')
  .replace(/background:\s*\n\s*(radial-gradient\([^\n]+\),)\s*\n\s*(rgba\([^\n]+\))/g, 'background: $1 $2')
  .replace(/background:\s*\n\s*(radial-gradient\([^\n]+\),)\s*\n\s*(#[0-9a-fA-F]+)/g, 'background: $1 $2');

fs.writeFileSync(target, fixed);

console.log('[v11] Fixed Sass list syntax in:');
console.log(target);
console.log('[v11] Backup:');
console.log(backup);
