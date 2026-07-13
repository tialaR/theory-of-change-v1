const fs = require('fs');
const path = require('path');

const root = process.cwd();
const patchRoot = path.resolve(__dirname, '..');
const backupSuffix = '.before-guide-premium-fine-v5';

const GUIDE_CARD_PATH = 'src/features/theory-of-change/components/resend-public/guide-stage-card/guide-stage-card.module.sass';
const PUBLIC_EXPERIENCE_PATH = 'src/features/theory-of-change/components/resend-public/public-experience.module.sass';
const markerStart = '// TDM_GUIDE_PREMIUM_FINE_V5_START';
const markerEnd = '// TDM_GUIDE_PREMIUM_FINE_V5_END';

const publicOverrides = `
${markerStart}
.guideTimelineSteps
  gap: clamp(3.25rem, 6.2vw, 6rem)

.guideTimelineRow
  align-items: center
  padding: clamp(1.55rem, 3.1vw, 2.65rem) 0

.guideTimelineCopy
  align-self: center

.guideStageCard
  width: 100%

.guideStageCardInner
  padding: clamp(2.35rem, 3.7vw, 3.85rem) clamp(2.45rem, 4.7vw, 4.9rem) clamp(2.35rem, 3.8vw, 4rem)
  min-block-size: 0

  h3
    margin: 0
    color: rgba(255, 255, 255, 0.965)
    font-size: clamp(1.42rem, 2.42vw, 2.05rem)
    font-weight: 520
    line-height: 1.16
    letter-spacing: -0.035em
    text-wrap: balance

.guideStepCardLead
  margin: clamp(1.2rem, 2vw, 1.55rem) 0 0
  max-inline-size: 44rem
  color: rgba(236, 237, 240, 0.58)
  font-size: clamp(1.03rem, 1.62vw, 1.34rem)
  font-weight: 400
  line-height: 1.52
  letter-spacing: -0.018em
  text-wrap: pretty

.guideStepCardMeta
  display: grid
  gap: clamp(1.2rem, 2.2vw, 1.72rem)
  margin-top: clamp(1.45rem, 2.6vw, 2.18rem)
  padding-top: clamp(1.32rem, 2.15vw, 1.7rem)
  border-top: 0.0625rem solid rgba(255, 255, 255, 0.075)

  > div
    display: grid
    gap: clamp(0.55rem, 0.92vw, 0.76rem)

  span
    color: color-mix(in srgb, var(--step-accent, rgba(232, 235, 242, 0.9)) 72%, rgba(242, 244, 248, 0.94))
    font-size: clamp(0.68rem, 0.95vw, 0.82rem)
    font-weight: 660
    letter-spacing: 0.17em
    line-height: 1.2
    text-transform: uppercase

  p
    margin: 0
    max-inline-size: 58rem
    color: rgba(238, 239, 242, 0.54)
    font-size: clamp(0.94rem, 1.42vw, 1.16rem)
    font-weight: 400
    line-height: 1.52
    letter-spacing: -0.012em
    text-wrap: pretty

.guideStageAccents
  gap: 0.48rem
  margin-bottom: clamp(1.25rem, 2vw, 1.55rem)

  span
    padding: 0.34rem 0.74rem
    border: 0.0625rem solid rgba(255, 255, 255, 0.1)
    border-radius: 999rem
    background: rgba(255, 255, 255, 0.04)
    color: var(--chip-color, rgba(255, 255, 255, 0.82))
    font-size: clamp(0.66rem, 0.92vw, 0.76rem)
    font-weight: 620
    letter-spacing: 0.085em

@media (max-width: 56rem)
  .guideTimelineSteps
    gap: clamp(2.4rem, 8vw, 3.5rem)

  .guideTimelineRow
    padding: clamp(1.1rem, 4vw, 1.75rem) 0

  .guideStageCardInner
    padding: clamp(1.75rem, 6.5vw, 2.55rem) clamp(1.35rem, 5vw, 1.9rem)

  .guideStepCardLead
    font-size: clamp(0.94rem, 4vw, 1.08rem)

  .guideStepCardMeta p
    font-size: clamp(0.86rem, 3.6vw, 0.98rem)
${markerEnd}
`;

function assertProjectRoot() {
  if (!fs.existsSync(path.join(root, 'package.json')) || !fs.existsSync(path.join(root, 'src'))) {
    throw new Error('Rode este script na raiz do projeto theory-of-change-v1.');
  }
}

function backupIfNeeded(target) {
  if (!fs.existsSync(target)) return;
  const backup = `${target}${backupSuffix}`;
  if (!fs.existsSync(backup)) fs.copyFileSync(target, backup);
}

function copyGuideCardModule() {
  const source = path.join(patchRoot, GUIDE_CARD_PATH);
  const target = path.join(root, GUIDE_CARD_PATH);
  if (!fs.existsSync(source)) throw new Error(`Arquivo do patch nao encontrado: ${GUIDE_CARD_PATH}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  backupIfNeeded(target);
  fs.copyFileSync(source, target);
  console.log(`aplicado: ${GUIDE_CARD_PATH}`);
}

function replaceMarkedBlock(source, start, end, block) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex >= 0 && endIndex >= startIndex) {
    return source.slice(0, startIndex).trimEnd() + '\n\n' + block.trim() + '\n' + source.slice(endIndex + end.length).trimStart();
  }
  return source.trimEnd() + '\n\n' + block.trim() + '\n';
}

function appendPublicOverrides() {
  const target = path.join(root, PUBLIC_EXPERIENCE_PATH);
  if (!fs.existsSync(target)) throw new Error(`Arquivo nao encontrado no projeto: ${PUBLIC_EXPERIENCE_PATH}`);
  backupIfNeeded(target);
  const before = fs.readFileSync(target, 'utf8');
  const after = replaceMarkedBlock(before, markerStart, markerEnd, publicOverrides);
  fs.writeFileSync(target, after);
  console.log(`ajustado: ${PUBLIC_EXPERIENCE_PATH}`);
}

function main() {
  assertProjectRoot();
  copyGuideCardModule();
  appendPublicOverrides();
  console.log('\nPatch fino aplicado. Backups criados com o sufixo: ' + backupSuffix);
  console.log('Rota para testar: /guia-de-aprendizado');
  console.log('Agora rode: rm -rf .next && npm run build && npm run dev');
}

main();
