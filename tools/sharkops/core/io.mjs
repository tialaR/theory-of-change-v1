import fs from 'node:fs';
import path from 'node:path';

export function root() {
  return process.cwd();
}

export function resolvePath(relative) {
  return path.join(root(), relative);
}

export function readJson(relative) {
  return JSON.parse(fs.readFileSync(resolvePath(relative), 'utf8'));
}

export function writeJsonAtomic(relative, value) {
  const target = resolvePath(relative);
  const temporary = `${target}.tmp-${process.pid}`;

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, target);
}

export function exists(relative) {
  return fs.existsSync(resolvePath(relative));
}
