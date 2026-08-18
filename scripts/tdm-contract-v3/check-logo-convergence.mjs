#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const requiredAssets = [
  'public/assets/brand/tdm-construtor-header-canonical.png',
  'public/assets/brand/tdm-construtor-guided-story-logo.png',
  'public/brand/tdm-construtor-header-canonical.webp'
];

const retiredAssets = [
  'public/assets/brand/tmd-construtor-header-canonical.png',
  'public/assets/brand/tmd-construtor-guided-story-logo.png',
  'public/brand/tmd-construtor-header-canonical.webp'
];

const files = [
  'src/shared/ui/tdm-public-layout/public-header/public-header-brand.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-header.tsx',
  'src/features/theory-of-change/components/public-pages/guided-story-data.ts',
  'src/features/theory-of-change/components/canvas/tdm-canvas-process-dock/process-dock-brand.module.sass'
];

const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const asset of requiredAssets) {
  requireCondition(fs.existsSync(path.join(root, asset)), `canonical TDM asset missing: ${asset}`);
}

for (const asset of retiredAssets) {
  requireCondition(!fs.existsSync(path.join(root, asset)), `legacy complete-logo asset still exists: ${asset}`);
}

const combined = files
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n');

requireCondition(
  !/tmd-construtor-(header-canonical|guided-story-logo)\.(png|webp)/.test(combined),
  'runtime still references legacy tmd-* complete-logo paths'
);

requireCondition(
  combined.includes('tdm-construtor-header-canonical.png'),
  'public header/process dock do not reference canonical TDM PNG'
);

requireCondition(
  combined.includes('tdm-construtor-header-canonical.webp'),
  'Canvas header does not reference canonical TDM WebP'
);

requireCondition(
  combined.includes('tdm-construtor-guided-story-logo.png'),
  'guided story does not reference canonical TDM opening logo'
);

let scaleMarkers = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith('.module.sass')) {
      const source = fs.readFileSync(absolute, 'utf8');
      if (source.includes('// TDM_PUBLIC_HEADER_LOGO_SCALE_START')) {
        scaleMarkers += 1;
        requireCondition(source.includes('transform: scale(1.3)'), 'public header scale is not 1.3');
      }
      if (source.includes('// TDM_CANVAS_HEADER_LOGO_SCALE_START')) {
        scaleMarkers += 1;
        requireCondition(source.includes('transform: scale(1.3)'), 'Canvas header scale is not 1.3');
      }
    }
  }
};

walk(path.join(root, 'src'));
requireCondition(scaleMarkers === 2, `expected exactly 2 canonical header scale markers, found ${scaleMarkers}`);

if (failures.length) {
  console.error('\nTDM LOGO CONVERGENCE CONTRACT: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}.`));
  process.exit(1);
}

console.log('PASS TDM Logo Convergence: Home and Canvas headers use a 30% visual scale without changing layout boxes, guided story uses the same cache-busted TDM brand family, and retired complete-logo assets cannot return.');
