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
    "hash": "80720c8808874a4817a41860d88dd94e969d783a7e46f42ceefa5eae29f2adf5"
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
    "hash": "ca81d6ff74cf1ffe989077a57d99505e655d0ab66e4dd17ff7d0af220e45c95b"
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
    "hash": "a7e0efe85cd77faa2e3e64693e251bcdf48a4976b2a78032bdaf9a6ba168e2cc"
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
