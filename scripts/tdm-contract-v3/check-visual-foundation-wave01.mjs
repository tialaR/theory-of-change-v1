import fs from 'node:fs';

const stylePath = 'src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass';
const source = fs.readFileSync(stylePath, 'utf8');
const failures = [];
const required = [
  '--canvas-grid-major',
  '--canvas-grid-minor',
  '--canvas-glow',
  '--canvas-panel',
  'background-size: 6rem 6rem, 6rem 6rem, 1.5rem 1.5rem',
  'backdrop-filter: blur(1.5rem) saturate(1.08)',
  'linear-gradient(180deg, color-mix(in srgb, var(--stage-color) 3.5%, transparent)',
  'box-shadow: 0 0 0.75rem color-mix(in srgb, var(--stage-color) 22%, transparent)'
];
for (const marker of required) {
  if (!source.includes(marker)) failures.push(`fundação visual ausente: ${marker}`);
}
if (failures.length) {
  console.error('\nTDM VISUAL FOUNDATION WAVE 01: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('PASS: grid, profundidade, superfícies e cartões do Canvas usam a fundação visual oficial.');
