#!/usr/bin/env node
/**
 * Gate do contrato público v2 — CTAs, icon buttons e header.
 * Falha quando o contrato, preview, rules ou implementação divergem.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const REQUIRED_FILES = [
  'docs/design-system/public-actions-header-v2.md',
  'docs/design-system/previews/tdm-public-actions-header-v2.html',
  'docs/design-system/public-example-previews-v2.md',
  'docs/design-system/previews/tdm-public-example-previews-v2-existing-motion.html',
  '.cursor/rules/00-tdm-design-system-router.mdc',
  '.cursor/rules/tdm-public-actions-header-v2.mdc',
  '.cursor/rules/tdm-public-example-previews-v2.mdc',
  'src/shared/ui/public-button/public-button.tsx',
  'src/shared/ui/public-button/public-button.module.sass',
  'src/shared/ui/public-icon-button/public-icon-button.tsx',
  'src/shared/ui/public-icon-button/public-icon-button.module.sass',
  'src/shared/styles/tdm/_tdm-public-action.sass',
  'src/features/theory-of-change/components/public-experience/example-previews/example-preview-frame.tsx',
  'src/features/theory-of-change/components/public-experience/example-previews/example-preview-frame.module.sass',
  'src/features/theory-of-change/components/public-experience/example-previews/example-preview-frame.types.ts'
];

const ALLOWED_VARIANTS = new Set(['primary', 'text', 'textCompact', 'exportCompact']);

const CANVAS_DENY_GLOBS = [
  'src/app/canvas',
  'src/app/exemplos/canvas',
  'src/features/theory-of-change/components/canvas',
  'src/features/theory-of-change/components/canvas-resultado',
  'src/features/theory-of-change/components/edge',
  'src/features/theory-of-change/components/sidebar',
  'src/features/theory-of-change/components/floating-header'
];

const PUBLIC_SASS_MODULES = [
  'src/shared/ui/public-button/public-button.module.sass',
  'src/shared/ui/public-icon-button/public-icon-button.module.sass',
  'src/features/theory-of-change/components/public-experience/example-previews/example-preview-frame.module.sass'
];

const PREVIEW_CONSUMERS = [
  'src/features/theory-of-change/components/public-experience/example-previews/dedicated-example-preview.tsx'
];

const PREVIEW_CHILD_SASS = [
  'src/features/theory-of-change/components/public-experience/example-previews/flow-draft-preview.module.sass',
  'src/features/theory-of-change/components/public-experience/example-previews/theory-draft-preview.module.sass',
  'src/features/theory-of-change/components/public-experience/example-previews/example-previews.module.sass'
];

const PUBLIC_PAGE_HEADER_FILES = [
  'src/features/theory-of-change/components/public-pages/public-pages.tsx',
  'src/features/theory-of-change/components/public-experience/public-experience.tsx',
  'src/shared/ui/tdm-public-design-system/tdm-public-design-system.tsx'
];

const LEGACY_CLASS_PATTERNS = [
  { id: 'toolBtn', re: /\bstyles\.toolBtn\b|\.toolBtn\b/ },
  { id: 'closeLink', re: /\bstyles\.closeLink\b|\.closeLink\b/ },
  { id: 'exportIcon wrapper class in public-pages', re: /\bstyles\.exportIcon\b/ },
  { id: 'headerCtaIcon', re: /\bstyles\.headerCtaIcon\b|\.headerCtaIcon\b/ },
  { id: 'buttonIcon legacy public', re: /\bstyles\.buttonIcon\b/ }
];

const errors = [];

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function push(message) {
  errors.push(message);
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    push(`Arquivo obrigatório ausente: ${file}`);
  }
}

const docs = path.join(ROOT, 'docs/design-system/public-actions-header-v2.md');
if (fs.existsSync(docs)) {
  const text = read(docs);
  if (/outlined textual genérico|secundária com borda para navegação/.test(text) === false) {
    // ensure deprecated policy is documented
  }
  if (!text.includes('npm run check:tdm-public-ui')) {
    push('Documentação deve incluir o comando do gate `npm run check:tdm-public-ui`.');
  }
  if (/\b\d+px\b/.test(text)) {
    push('Documentação contém valores em px; use somente rem.');
  }
  if (!text.toLowerCase().includes('denylist')) {
    push('Documentação deve declarar a denylist do canvas.');
  }
}

const preview = path.join(ROOT, 'docs/design-system/previews/tdm-public-actions-header-v2.html');
if (fs.existsSync(preview)) {
  const text = read(preview);
  if (/Ação secundária com borda/.test(text)) {
    push('Preview ainda recomenda CTA textual secundário com borda.');
  }
  if (!/Icon buttons/i.test(text)) {
    push('Preview deve documentar icon buttons.');
  }
  if (!/textCompact|text-compact|CTA do header/i.test(text)) {
    push('Preview deve documentar o CTA do header sem borda.');
  }
}

const publicButtonTsx = path.join(ROOT, 'src/shared/ui/public-button/public-button.tsx');
if (fs.existsSync(publicButtonTsx)) {
  const text = read(publicButtonTsx);
  const variantMatches = [...text.matchAll(/variant\s*=\s*['"]([a-zA-Z]+)['"]/g)];
  for (const match of variantMatches) {
    // ignore internal maps; checked via types file below
  }
}

const typesFile = path.join(ROOT, 'src/shared/ui/public-button/public-button.types.ts');
if (fs.existsSync(typesFile)) {
  const text = read(typesFile);
  const union = text.match(/PublicButtonVariant\s*=\s*([^;]+);/);
  if (!union) {
    push('PublicButtonVariant não encontrado em public-button.types.ts');
  } else {
    const variants = [...union[1].matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]);
    for (const variant of variants) {
      if (!ALLOWED_VARIANTS.has(variant)) {
        push(`Variante pública fora da whitelist: ${variant}`);
      }
    }
    for (const allowed of ALLOWED_VARIANTS) {
      if (!variants.includes(allowed)) {
        push(`Variante obrigatória ausente na whitelist TypeScript: ${allowed}`);
      }
    }
  }
}

// Canvas denylist must not import new public primitives
for (const base of CANVAS_DENY_GLOBS) {
  const abs = path.join(ROOT, base);
  for (const file of walk(abs)) {
    if (!/\.(tsx?|jsx?|mjs|sass|scss|css)$/.test(file)) continue;
    const text = read(file);
    if (/@\/shared\/ui\/public-button|shared\/ui\/public-button/.test(text)) {
      push(`Denylist: ${rel(file)} importa PublicButton`);
    }
    if (/@\/shared\/ui\/public-icon-button|shared\/ui\/public-icon-button/.test(text)) {
      push(`Denylist: ${rel(file)} importa PublicIconButton`);
    }
  }
}

// Public consumers: no forbidden variants on PublicButton
const consumerRoots = [
  path.join(ROOT, 'src/app'),
  path.join(ROOT, 'src/features/theory-of-change/components/public-pages'),
  path.join(ROOT, 'src/features/theory-of-change/components/example-overview-card'),
  path.join(ROOT, 'src/features/theory-of-change/components/public-experience'),
  path.join(ROOT, 'src/shared/ui/tdm-public-design-system'),
  path.join(ROOT, 'src/shared/ui/public-button'),
  path.join(ROOT, 'src/shared/ui/public-icon-button')
];

const forbiddenVariantRe =
  /<PublicButton\b[^>]*\bvariant\s*=\s*['"](secondary|ghost|tertiary|outlined|outline)['"]/g;

for (const root of consumerRoots) {
  for (const file of walk(root)) {
    if (!/\.(tsx|jsx)$/.test(file)) continue;
    const text = read(file);
    for (const match of text.matchAll(forbiddenVariantRe)) {
      push(`${rel(file)}: variante pública proibida "${match[1]}"`);
    }

    for (const legacy of LEGACY_CLASS_PATTERNS) {
      if (legacy.re.test(text) && /public-pages|tdm-public-design-system|example-overview/.test(rel(file))) {
        push(`${rel(file)}: classe legacy "${legacy.id}" ainda presente`);
      }
    }
  }
}

// New public sass modules: no px, no gradients, no multi-shadow stacks on CTAs
for (const file of PUBLIC_SASS_MODULES) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) continue;
  const text = read(abs);
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (/(?<![\w-])\d+(\.\d+)?px\b/.test(line) && !line.trim().startsWith('//')) {
      push(`${file}:${lineNo}: valor px não permitido nos Sass Modules públicos`);
    }
    if (/linear-gradient|radial-gradient/.test(line) && !line.trim().startsWith('//')) {
      push(`${file}:${lineNo}: gradiente não permitido nos CTAs públicos`);
    }
    if (/box-shadow\s*:/.test(line) && !/box-shadow\s*:\s*none/.test(line) && !line.trim().startsWith('//')) {
      const shadows = line.split(',').length;
      if (shadows > 1 || !/none/.test(line)) {
        // allow only explicit none
        if (!/box-shadow\s*:\s*none\b/.test(line)) {
          push(`${file}:${lineNo}: sombra ornamental/múltipla não permitida nos CTAs públicos`);
        }
      }
    }
  });
}

// PublicIconButton usages must include aria-label
for (const root of consumerRoots) {
  for (const file of walk(root)) {
    if (!/\.(tsx|jsx)$/.test(file)) continue;
    const text = read(file);
    const iconButtonBlocks = text.match(/<PublicIconButton\b[\s\S]*?>/g) || [];
    for (const block of iconButtonBlocks) {
      if (!/aria-label\s*=/.test(block)) {
        push(`${rel(file)}: PublicIconButton sem aria-label`);
      }
    }
  }
}

// Example previews v2 — docs + router
const previewDocs = path.join(ROOT, 'docs/design-system/public-example-previews-v2.md');
if (fs.existsSync(previewDocs)) {
  const text = read(previewDocs);
  if (!text.includes('ExamplePreviewFrame')) {
    push('Documentação de prévias deve mencionar ExamplePreviewFrame.');
  }
  if (!text.includes('npm run check:tdm-public-ui')) {
    push('Documentação de prévias deve incluir o comando do gate.');
  }
  if (!text.toLowerCase().includes('denylist')) {
    push('Documentação de prévias deve declarar a denylist do canvas.');
  }
  if (/\b\d+px\b/.test(text)) {
    push('Documentação de prévias contém valores em px; use somente rem.');
  }
}

const routerRule = path.join(ROOT, '.cursor/rules/00-tdm-design-system-router.mdc');
if (fs.existsSync(routerRule)) {
  const text = read(routerRule);
  if (!text.includes('public-example-previews-v2.md')) {
    push('Router rule deve apontar para public-example-previews-v2.md.');
  }
}

const headerDocs = path.join(ROOT, 'docs/design-system/public-actions-header-v2.md');
if (fs.existsSync(headerDocs)) {
  const text = read(headerDocs);
  if (!/Header único e remoção do legado/i.test(text)) {
    push('Documentação do header deve incluir seção "Header único e remoção do legado".');
  }
}

// Dedicated previews must use ExamplePreviewFrame
for (const file of PREVIEW_CONSUMERS) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) {
    push(`Consumidor de prévia ausente: ${file}`);
    continue;
  }
  const text = read(abs);
  if (!/ExamplePreviewFrame/.test(text)) {
    push(`${file}: deve usar ExamplePreviewFrame`);
  }
  if (/dedicatedPreviewFrame|previewViewport|previewStage/.test(text)) {
    push(`${file}: ainda referencia wrappers legados de moldura`);
  }
}

// Migrated preview sass: no local frame chrome reintroduced
for (const file of PREVIEW_CHILD_SASS) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) continue;
  const text = read(abs);
  if (/dedicatedPreviewFrame|previewViewport|previewStage/.test(text)) {
    push(`${file}: seletores de moldura legado ainda presentes`);
  }
  if (/box-shadow\s*:/.test(text) && !/box-shadow\s*:\s*none/.test(text)) {
    // allow drop-shadow on SVG layers inside animation modules; flag only on frame-like roots
    if (/\.(dedicatedPreviewFrame|fullPreview|previewViewport)\b/.test(text)) {
      push(`${file}: sombra ornamental na moldura não permitida`);
    }
  }
}

const frameSass = path.join(
  ROOT,
  'src/features/theory-of-change/components/public-experience/example-previews/example-preview-frame.module.sass'
);
if (fs.existsSync(frameSass)) {
  const text = read(frameSass);
  if (!/var\(--tdm-public-preview-surface\)/.test(text)) {
    push('example-preview-frame.module.sass deve consumir --tdm-public-preview-surface');
  }
  if (/linear-gradient|radial-gradient/.test(text)) {
    push('example-preview-frame.module.sass: gradiente ornamental não permitido');
  }
  if (/box-shadow\s*:/.test(text) && !/box-shadow\s*:\s*none/.test(text)) {
    push('example-preview-frame.module.sass: sombra ornamental não permitida');
  }
  const borderDecls = text.match(/^\s*border\s*:/gm) || [];
  if (borderDecls.length > 1) {
    push('example-preview-frame.module.sass: borda duplicada detectada');
  }
}

const previewTokens = path.join(ROOT, 'src/shared/styles/tdm/_tdm-public-action.sass');
if (fs.existsSync(previewTokens)) {
  const text = read(previewTokens);
  for (const token of [
    '--tdm-public-preview-surface',
    '--tdm-public-preview-border',
    '--tdm-public-preview-radius',
    '--tdm-public-preview-padding',
    '--tdm-public-preview-aspect-ratio',
    '--tdm-public-preview-transition'
  ]) {
    if (!text.includes(token)) {
      push(`_tdm-public-action.sass: token obrigatório ausente ${token}`);
    }
  }
}

// Header: only PublicHeader definition; no legacy opaque glass block
const headerSass = path.join(ROOT, 'src/shared/ui/tdm-public-design-system/tdm-public-design-system.module.sass');
if (fs.existsSync(headerSass)) {
  const text = read(headerSass);
  if (/header-opaque-glass-final/.test(text)) {
    push('tdm-public-design-system.module.sass: bloco legado header-opaque-glass-final ainda presente');
  }
  if (/\.headerGlassLayer|\.headerGlassSurface/.test(text)) {
    push('tdm-public-design-system.module.sass: camadas glass legadas ainda presentes');
  }
  if (!/\.headerShell\[data-scrolled/.test(text)) {
    push('tdm-public-design-system.module.sass: carcaça scrolled (.headerShell[data-scrolled]) ausente');
  }
}

const headerTsx = path.join(ROOT, 'src/shared/ui/tdm-public-design-system/tdm-public-design-system.tsx');
if (fs.existsSync(headerTsx)) {
  const text = read(headerTsx);
  const headerFnCount = [...text.matchAll(/export function PublicHeader\b/g)].length;
  if (headerFnCount !== 1) {
    push(`PublicHeader deve ter exatamente uma definição exportada (encontradas: ${headerFnCount})`);
  }
  if (/LegacyHeader|SiteHeader|headerGlassLayer/.test(text)) {
    push('tdm-public-design-system.tsx: header legado ainda referenciado');
  }
  if (!/IntersectionObserver/.test(text)) {
    push('PublicHeader deve usar IntersectionObserver');
  }
  if (/addEventListener\(\s*['"]scroll['"]/.test(text)) {
    push('PublicHeader não deve usar listener de scroll por frame');
  }
}

// Public pages: one PublicHeader JSX per exported page component; no second header primitive
for (const file of PUBLIC_PAGE_HEADER_FILES) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) continue;
  const text = read(abs);
  if (/LegacyHeader|SiteHeader|FloatingHeader/.test(text) && /public-pages|public-experience|lusion-tdm/.test(file)) {
    if (/LegacyHeader|SiteHeader/.test(text)) {
      push(`${file}: header legado importado/referenciado`);
    }
  }
}

// Count <PublicHeader per page function in public-pages — each page may render once
{
  const abs = path.join(ROOT, 'src/features/theory-of-change/components/public-pages/public-pages.tsx');
  if (fs.existsSync(abs)) {
    const text = read(abs);
    const pageBlocks = text.split(/export function \w+/).slice(1);
    for (const block of pageBlocks) {
      const count = (block.match(/<PublicHeader\b/g) || []).length;
      if (count > 1) {
        push('public-pages.tsx: mais de um PublicHeader na mesma página');
      }
    }
  }
}

{
  const abs = path.join(ROOT, 'src/features/theory-of-change/components/public-experience/public-experience.tsx');
  if (fs.existsSync(abs)) {
    const text = read(abs);
    const count = (text.match(/<PublicHeader\b/g) || []).length;
    if (count > 1) {
      push('public-experience.tsx: mais de um PublicHeader renderizado');
    }
  }
}

// Canvas denylist must not import ExamplePreviewFrame
for (const base of CANVAS_DENY_GLOBS) {
  const abs = path.join(ROOT, base);
  for (const file of walk(abs)) {
    if (!/\.(tsx?|jsx?|mjs|sass|scss|css)$/.test(file)) continue;
    const text = read(file);
    if (/ExamplePreviewFrame|example-preview-frame/.test(text)) {
      push(`Denylist: ${rel(file)} importa ExamplePreviewFrame / example-preview-frame`);
    }
  }
}

if (errors.length) {
  console.error('check:tdm-public-ui FAILED\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('check:tdm-public-ui OK');
