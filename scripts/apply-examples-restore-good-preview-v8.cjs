#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const stamp = 'before-examples-restore-good-preview-v8';

function file(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(file(rel));
}

function read(rel) {
  return fs.readFileSync(file(rel), 'utf8');
}

function write(rel, content) {
  fs.mkdirSync(path.dirname(file(rel)), { recursive: true });
  fs.writeFileSync(file(rel), content);
}

function backup(rel) {
  const src = file(rel);
  if (!fs.existsSync(src)) return;
  const dest = `${src}.${stamp}`;
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

function removeDir(rel) {
  const target = file(rel);
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

const previewDir = 'src/features/theory-of-change/components/resend-public/example-previews';
const previewTsx = `${previewDir}/example-previews-section.tsx`;
const previewSass = `${previewDir}/example-previews.module.sass`;
const previewIndex = `${previewDir}/index.ts`;
const publicPages = 'src/features/theory-of-change/components/public-pages/public-pages.tsx';
const publicIndex = 'src/features/theory-of-change/components/public-pages/index.ts';
const legacyExamples = 'src/features/theory-of-change/components/public-pages/examples';

if (!exists(previewTsx)) {
  console.error(`[tdm] Nao encontrei o componente novo: ${previewTsx}`);
  process.exit(1);
}

backup(previewTsx);
backup(previewSass);
backup(publicPages);
backup(publicIndex);

// Garante que /exemplos usa o componente novo e nao o legado.
if (exists(publicPages)) {
  let source = read(publicPages);

  source = source.replace(
    "import { ExamplesExperienceSection } from './examples/examples-experience-section';",
    "import { ExamplePreviewsSection } from '@/features/theory-of-change/components/resend-public/example-previews';"
  );

  if (!source.includes("ExamplePreviewsSection")) {
    const anchor = "import { TheoryFlowBoard } from './theory-flow-board';";
    if (source.includes(anchor)) {
      source = source.replace(anchor, "import { ExamplePreviewsSection } from '@/features/theory-of-change/components/resend-public/example-previews';\n" + anchor);
    }
  }

  const oldBlock = `      <div id="examples-experiences">\n        <PublicSection\n          compact\n          title="Escolha uma experiência"\n          description="Comece pela visão do fluxo ou abra o resultado completo da teoria."\n        >\n          <ExamplesExperienceSection />\n        </PublicSection>\n      </div>`;
  const newBlock = `      <div id="examples-experiences">\n        <ExamplePreviewsSection />\n      </div>`;

  if (source.includes(oldBlock)) {
    source = source.replace(oldBlock, newBlock);
  }

  source = source.replace(/<ExamplesExperienceSection\s*\/>/g, '<ExamplePreviewsSection />');
  source = source.replace(/import \{ ExamplePreviewsSection \} from '@\/features\/theory-of-change\/components\/resend-public\/example-previews';\nimport \{ ExamplePreviewsSection \} from '@\/features\/theory-of-change\/components\/resend-public\/example-previews';/g, "import { ExamplePreviewsSection } from '@/features/theory-of-change/components/resend-public/example-previews';");

  if (source.includes('ExamplesExperienceSection')) {
    console.error('[tdm] Ainda existe referencia ao legado ExamplesExperienceSection. Ajuste manual necessario.');
    process.exit(1);
  }

  write(publicPages, source);
}

if (exists(publicIndex)) {
  let index = read(publicIndex);
  index = index.replace(/\nexport \{ FluxoExperiencePage \} from '\.\/examples\/fluxo-experience-page';\n?/g, '\n');
  write(publicIndex, index.replace(/\n{3,}/g, '\n\n'));
}

// Nao apaga sem backup: tira o legado de src se ainda existir, para nao voltar por import acidental.
if (exists(legacyExamples)) {
  const backupDir = file(`tdm-backups/public-pages-examples.${stamp}`);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(path.dirname(backupDir), { recursive: true });
    fs.cpSync(file(legacyExamples), backupDir, { recursive: true });
  }
  removeDir(legacyExamples);
}

// Mantem o TSX atual do componente bom. Este patch e visual: volta a escala original e corrige somente a tipografia.
const sass = `$ease: cubic-bezier(0.22, 1, 0.36, 1)

.section
  width: min(100%, 92rem)
  margin: 0 auto
  padding: clamp(3rem, 6vw, 5.5rem) clamp(1rem, 3vw, 1.5rem)

.heading
  display: grid
  gap: clamp(0.72rem, 1.4vw, 1rem)
  margin-block-end: clamp(2rem, 4vw, 3rem)

  p
    margin: 0
    color: rgba(245, 245, 247, 0.62)
    font-size: 0.74rem
    font-weight: 720
    line-height: 1
    letter-spacing: 0.22em
    text-transform: uppercase

  h2
    max-inline-size: 10.8em
    margin: 0
    color: rgba(255, 255, 255, 0.98)
    font-size: clamp(3rem, 7vw, 6.85rem)
    font-weight: 650
    line-height: 0.88
    letter-spacing: -0.08em
    text-wrap: balance

  span
    max-inline-size: 58rem
    color: rgba(235, 236, 241, 0.58)
    font-size: clamp(1.05rem, 1.45vw, 1.26rem)
    line-height: 1.55

.grid
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: clamp(1.5rem, 2.5vw, 2rem)

.card
  position: relative
  overflow: hidden
  min-block-size: clamp(38rem, 46vw, 48rem)
  display: flex
  flex-direction: column
  gap: clamp(1.5rem, 2.5vw, 2.1rem)
  padding: clamp(2rem, 3vw, 2.65rem)
  border: 0.0625rem solid rgba(255, 255, 255, 0.13)
  border-radius: clamp(1.65rem, 2.2vw, 2.25rem)
  background: radial-gradient(ellipse 82% 42% at 50% 0%, rgba(255, 255, 255, 0.12), transparent 68%), linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.018)), rgba(8, 9, 11, 0.78)
  box-shadow: inset 0 0.0625rem 0 rgba(255, 255, 255, 0.12), 0 2.2rem 5rem rgba(0, 0, 0, 0.45)
  isolation: isolate

  &::before
    content: ''
    position: absolute
    inset: 0
    z-index: -1
    pointer-events: none
    background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.045) 0 0.0625rem, transparent 0.08rem), linear-gradient(rgba(255, 255, 255, 0.014) 0.0625rem, transparent 0.0625rem), linear-gradient(90deg, rgba(255, 255, 255, 0.014) 0.0625rem, transparent 0.0625rem)
    background-size: 2.7rem 2.7rem, 4rem 4rem, 4rem 4rem
    opacity: 0.74

  &::after
    content: ''
    position: absolute
    inset: 0
    pointer-events: none
    background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.09), transparent 36%), radial-gradient(circle at 18% 100%, rgba(255, 255, 255, 0.035), transparent 34%)
    opacity: 0.72

  &:hover .previewLineGroup path
    animation: previewLineDraw 1.12s $ease forwards

  &:hover .previewNode
    transform: translateY(-0.08rem)

.cardHeader
  position: relative
  z-index: 2
  display: grid
  grid-template-columns: auto minmax(0, 1fr)
  gap: clamp(1rem, 1.8vw, 1.35rem)
  align-items: flex-start

  h3
    margin: 0
    color: rgba(255, 255, 255, 0.98)
    font-size: clamp(1.85rem, 2.55vw, 2.4rem)
    font-weight: 650
    line-height: 1.02
    letter-spacing: -0.06em
    text-wrap: balance

  p
    max-inline-size: 39rem
    margin: 0.56rem 0 0
    color: rgba(235, 236, 241, 0.6)
    font-size: clamp(0.96rem, 1.18vw, 1.08rem)
    line-height: 1.5

.cardIcon
  display: grid
  place-items: center
  inline-size: clamp(4rem, 5.6vw, 5.2rem)
  block-size: clamp(4rem, 5.6vw, 5.2rem)
  border: 0.0625rem solid rgba(255, 255, 255, 0.14)
  border-radius: clamp(1rem, 1.5vw, 1.35rem)
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.16), transparent 58%), linear-gradient(180deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.025)), rgba(255, 255, 255, 0.035)
  box-shadow: inset 0 0.0625rem 0 rgba(255, 255, 255, 0.14), 0 1.2rem 2.2rem rgba(0, 0, 0, 0.3)

.cardIconSvg
  inline-size: clamp(1.35rem, 2vw, 1.65rem)
  block-size: clamp(1.35rem, 2vw, 1.65rem)
  fill: none
  stroke: rgba(245, 245, 247, 0.82)
  stroke-width: 1.6
  stroke-linecap: round
  stroke-linejoin: round

.previewCanvas
  position: relative
  z-index: 2
  flex: 1 1 auto
  min-block-size: clamp(22rem, 31vw, 29rem)
  overflow: hidden
  border: 0.0625rem solid rgba(255, 255, 255, 0.095)
  border-radius: clamp(1.35rem, 2vw, 1.75rem)
  background: radial-gradient(ellipse 80% 48% at 50% 0%, rgba(255, 255, 255, 0.07), transparent 70%), linear-gradient(180deg, rgba(255, 255, 255, 0.026), rgba(255, 255, 255, 0.006)), rgba(4, 5, 7, 0.56)
  box-shadow: inset 0 0.0625rem 0 rgba(255, 255, 255, 0.058), inset 0 -4rem 6rem rgba(0, 0, 0, 0.16)

.previewCanvasResult
  background: radial-gradient(ellipse 76% 46% at 50% 0%, rgba(255, 255, 255, 0.064), transparent 68%), linear-gradient(180deg, rgba(255, 255, 255, 0.024), rgba(255, 255, 255, 0.006)), rgba(4, 5, 7, 0.52)

.previewLines
  position: absolute
  inset: 0
  z-index: 1
  inline-size: 100%
  block-size: 100%
  pointer-events: none

  marker path
    fill: rgba(238, 241, 246, 0.52)

.previewLineGroup
  path
    fill: none
    stroke: rgba(238, 241, 246, 0.44)
    stroke-width: 1.3
    stroke-dasharray: 5 8
    stroke-linecap: round
    stroke-linejoin: round
    vector-effect: non-scaling-stroke
    opacity: 0.78
    filter: drop-shadow(0 0 0.45rem rgba(255, 255, 255, 0.08))

.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(1) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(2) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(3) path
  stroke: rgba(181, 151, 255, 0.5)

.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(4) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(5) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(6) path
  stroke: rgba(102, 181, 255, 0.46)

.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(7) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(8) path,
.previewCanvas:not(.previewCanvasResult) .previewLineGroup:nth-child(9) path
  stroke: rgba(91, 229, 178, 0.46)

.previewFlowGrid
  position: absolute
  inset: 0
  z-index: 2
  display: grid
  grid-template-columns: 1fr 1fr 1fr 0.9fr
  align-items: center
  gap: clamp(1.35rem, 3.1vw, 3.5rem)
  padding: clamp(1.8rem, 3.2vw, 3rem)

.previewStack,
.previewStackFinal
  display: grid
  gap: clamp(1.3rem, 2.2vw, 2.05rem)
  align-content: center
  min-inline-size: 0

.previewStackFinal
  justify-self: stretch

.previewResultGrid
  position: absolute
  inset: 0
  z-index: 2
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: clamp(1.1rem, 2.4vw, 2rem)
  padding: clamp(1.65rem, 2.8vw, 2.45rem)
  align-items: center

.previewResultColumn
  display: grid
  align-content: center
  gap: 0.85rem
  min-inline-size: 0
  min-block-size: 67%
  padding: 0.85rem
  border-radius: 1rem
  border: 0.0625rem solid color-mix(in srgb, var(--stage-color) 42%, rgba(255, 255, 255, 0.08))
  background: linear-gradient(180deg, color-mix(in srgb, var(--stage-color) 5%, transparent), rgba(255, 255, 255, 0.006))
  box-shadow: inset 0 0.0625rem 0 color-mix(in srgb, var(--stage-color) 18%, transparent)

  > span
    color: color-mix(in srgb, var(--stage-color) 74%, rgba(245, 245, 247, 0.5))
    font-size: clamp(0.54rem, 0.75vw, 0.68rem)
    font-weight: 780
    letter-spacing: 0.18em
    line-height: 1
    text-transform: uppercase

.previewResultList
  display: grid
  gap: clamp(0.75rem, 1.2vw, 1rem)

.previewNode
  --stage-color: rgba(255, 255, 255, 0.58)
  position: relative
  min-inline-size: 0
  block-size: clamp(4.2rem, 6.2vw, 5.35rem)
  border-radius: 0.72rem
  border: 0.0625rem solid color-mix(in srgb, var(--stage-color) 48%, rgba(255, 255, 255, 0.09))
  background: radial-gradient(circle at 18% 50%, color-mix(in srgb, var(--stage-color) 13%, transparent), transparent 42%), linear-gradient(180deg, rgba(255, 255, 255, 0.056), rgba(255, 255, 255, 0.016)), rgba(14, 16, 20, 0.68)
  box-shadow: inset 0.2rem 0 0 color-mix(in srgb, var(--stage-color) 62%, transparent), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.08), 0 1rem 2rem rgba(0, 0, 0, 0.22)
  transition: transform 0.28s $ease

  i
    position: absolute
    left: 0.9rem
    top: 50%
    inline-size: 2.15rem
    block-size: 2.15rem
    border-radius: 0.32rem
    transform: translateY(-50%)
    background: color-mix(in srgb, var(--stage-color) 16%, rgba(255, 255, 255, 0.08))

  b,
  em,
  small
    position: absolute
    left: 3.85rem
    display: block
    border-radius: 999rem
    background: rgba(214, 220, 232, 0.1)
    font-style: normal

  b
    top: 1.15rem
    inline-size: 38%
    block-size: 0.42rem

  em
    top: 2.1rem
    inline-size: 64%
    block-size: 0.42rem

  small
    top: 3.05rem
    inline-size: 52%
    block-size: 0.42rem

.previewNodeCompact
  block-size: clamp(3.8rem, 5.4vw, 4.75rem)

  i
    inline-size: 1.7rem
    block-size: 1.7rem

  b,
  em,
  small
    left: 3.2rem

.previewBadgeRisk,
.previewBadgeHypothesis,
.previewBadgeGhost
  fill: rgba(8, 9, 12, 0.78)
  stroke-width: 1
  vector-effect: non-scaling-stroke

.previewBadgeRisk
  stroke: rgba(255, 160, 94, 0.42)

.previewBadgeHypothesis
  stroke: rgba(91, 229, 178, 0.45)

.previewBadgeGhost
  stroke: rgba(245, 245, 247, 0.31)

.cardCta
  position: relative
  z-index: 3
  display: inline-flex
  align-items: center
  gap: 0.55rem
  align-self: flex-start
  margin-top: auto
  color: rgba(245, 245, 247, 0.92)
  text-decoration: none
  font-size: clamp(1rem, 1.25vw, 1.08rem)
  line-height: 1
  font-weight: 720

  span:last-child
    transition: transform 0.22s $ease

  &:hover span:last-child
    transform: translateX(0.24rem)

@keyframes previewLineDraw
  0%
    stroke-dasharray: 0 420
    stroke-dashoffset: 0
    opacity: 0
  12%
    opacity: 0.82
  100%
    stroke-dasharray: 5 8
    stroke-dashoffset: -34
    opacity: 0.9

@media (prefers-reduced-motion: reduce)
  .card:hover .previewLineGroup path
    animation: none

  .previewNode
    transition: none

@media (max-width: 76rem)
  .grid
    grid-template-columns: 1fr

  .card
    min-block-size: 38rem

@media (max-width: 42rem)
  .section
    padding-inline: 0.85rem

  .heading
    h2
      font-size: clamp(2.6rem, 17vw, 4.4rem)

  .card
    min-block-size: 35rem
    padding: 1.2rem

  .cardHeader
    grid-template-columns: 1fr

  .cardIcon
    inline-size: 3.65rem
    block-size: 3.65rem

  .previewFlowGrid,
  .previewResultGrid
    gap: 1rem
    padding: 1rem

  .previewResultColumn
    padding: 0.65rem

    > span
      font-size: 0.46rem

  .previewNode
    block-size: 3.45rem

    i
      inline-size: 1.55rem
      block-size: 1.55rem
      left: 0.58rem

    b,
    em,
    small
      left: 2.45rem
`;

write(previewSass, sass);

if (!exists(previewIndex)) {
  write(previewIndex, "export { ExamplePreviewsSection } from './example-previews-section';\n");
}

console.log('[tdm] /exemplos voltou para o preview bom.');
console.log('[tdm] Ajuste aplicado somente na tipografia/escala visual do componente novo.');
console.log('[tdm] Backups com sufixo .' + stamp);
console.log('[tdm] Rode: rm -rf .next && npm run build && npm run dev');
