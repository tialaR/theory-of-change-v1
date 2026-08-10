import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mainRel = 'src/features/theory-of-change/components/result-view/result-view.tsx';
const ownerRel = 'src/features/theory-of-change/components/result-view/result-view-export-menu/result-view-export-menu.tsx';
const main = fs.readFileSync(path.join(root, mainRel), 'utf8');
const owner = fs.readFileSync(path.join(root, ownerRel), 'utf8');
const lines = (value) => value.split(/\r?\n/).length;
const fail = (message) => { console.error(`FAIL SO-008 Wave 01: ${message}`); process.exitCode = 1; };

if (lines(main) > 1230) fail(`${mainRel} exceeded 1230 lines (${lines(main)}).`);
if (lines(owner) > 170) fail(`${ownerRel} exceeded 170 lines (${lines(owner)}).`);
if (!main.includes("./result-view-export-menu/result-view-export-menu")) fail('ResultView does not consume the export-menu owner.');
for (const forbidden of ['function ExportMenu(', 'function ExportFormatIcon(', 'EXPORT_FORMAT_OPTIONS', 'type ExportFormatOption']) {
  if (main.includes(forbidden)) fail(`ResultView reclaimed export ownership: ${forbidden}`);
}
for (const required of ['export function ResultViewExportMenu', 'EXPORT_FORMAT_OPTIONS', 'TdmGlassSurface', 'useEffect', 'useRef']) {
  if (!owner.includes(required)) fail(`Export-menu owner is missing contract token: ${required}`);
}
const featureRoot = path.join(root, 'src/features/theory-of-change');
const scss = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.scss')) scss.push(path.relative(root, absolute));
  }
};
walk(featureRoot);
if (scss.length) fail(`.scss is forbidden: ${scss.join(', ')}`);
if (!process.exitCode) console.log('PASS SO-008 Result View God Slayer Wave 01: export surface ownership is split and armored.');
