import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const specs = {
  "canvas-interaction-contract.module.sass": {
    "base": "src/features/theory-of-change/canvas/ui/canvas-workspace",
    "parts": [
      "canvas-editor-tooltips",
      "canvas-relations-advanced",
      "canvas-creator-rail-handles",
      "canvas-relation-toolbar",
      "canvas-header-focus-mode",
      "canvas-affordance-fields",
      "canvas-inspector-clear-actions",
      "canvas-react-flow-renderer",
      "canvas-overlay-convergence",
      "canvas-interaction-polish"
    ],
    "hash": "80d3d691eaff43f32a4d0304498cb932a1a04ea4dc6ea9816f7ec8bbf4078acd"
  },
  "sidebar-visual-surgery.module.sass": {
    "base": "src/features/theory-of-change/components/sidebar",
    "parts": [
      "sidebar-form-shortcuts-polish",
      "sidebar-hero-shortcuts-polish",
      "sidebar-accordion-parity",
      "sidebar-header-parity",
      "sidebar-shell-surgery",
      "sidebar-cognitive-cost-foundation",
      "sidebar-cognitive-cost-accordions",
      "sidebar-divider-final-surgery"
    ],
    "hash": "4924af32d1e9189b4f9f37c07332fe488ee905d8134cd07c596b2d646e36360d"
  },
  "sidebar-shell-refinements.module.sass": {
    "base": "src/features/theory-of-change/components/sidebar",
    "parts": [
      "sidebar-shell-progress-refinements",
      "sidebar-coach-inspector-atoms",
      "sidebar-form-shortcut-refinements",
      "sidebar-canvas-skin",
      "sidebar-surgery-reference-spacing",
      "sidebar-surgery-route-corrections"
    ],
    "hash": "8e18b1c82440649e98a7f0c401d1181e5b09f1ba106295246461f6e6a53303e5"
  }
};
const failures = [];
for (const [entry, spec] of Object.entries(specs)) {
  const entryPath = path.join(spec.base, entry);
  const entryText = fs.readFileSync(entryPath, 'utf8');
  if (entryText.split(/\r?\n/).length > 40) failures.push(`${entry} excede 40 linhas`);
  if (entryText.includes('@import')) failures.push(`${entry} usa @import depreciado`);
  let joined = '';
  for (const part of spec.parts) {
    const partPath = path.join(spec.base, `${part}.module.sass`);
    if (!fs.existsSync(partPath)) { failures.push(`ausente: ${partPath}`); continue; }
    const text = fs.readFileSync(partPath, 'utf8');
    const lines = text.split(/\r?\n/).length;
    if (lines > 430) failures.push(`${partPath} excede 430 linhas (${lines})`);
    if (text.includes('@import')) failures.push(`${partPath} usa @import depreciado`);
    if (!entryText.includes(`meta.load-css('./${part}.module')`)) failures.push(`${entry} nao carrega ${part}`);
    joined += text;
  }
  const actual = crypto.createHash('sha256').update(joined).digest('hex');
  if (actual !== spec.hash) failures.push(`${entry} perdeu a cascata homologada`);
}
if (failures.length) { console.error('\nTDM SASS GOD SPLIT WAVE 03: FAIL\n'); failures.forEach((f,i)=>console.error(`${i+1}. ${f}`)); process.exit(1); }
console.log('PASS: interaction contract e cirurgias da Sidebar foram divididos por ownership com cascata preservada.');
