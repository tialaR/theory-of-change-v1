#!/usr/bin/env node
/*
  TDM surgical patch: Home guided preview refinement v1
  Scope: only the Home guided preview component and its Sass module.
  It searches for the current preview component by content markers, replaces that component file
  with a self-contained Motion implementation, and writes the matching .module.sass.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcRoot = path.join(root, 'src');

const MARKERS = [
  'PRÉVIA GUIADA',
  'PREVIA GUIADA',
  'Veja a teoria ganhar forma',
  'Comece pelas etapas',
  'O fluxo agora vira leitura',
  'Do rascunho à leitura final',
  'HomeOnboardingPreview',
  'HomeGuidedPreview',
  'guided preview',
  'onboarding'
];

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'tdm-backups', 'coverage', 'dist', 'build']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function scoreCandidate(file, text) {
  const normalized = file.split(path.sep).join('/').toLowerCase();
  let score = 0;
  for (const marker of MARKERS) {
    if (text.includes(marker)) score += marker.length > 18 ? 6 : 3;
  }
  if (normalized.includes('/home')) score += 6;
  if (normalized.includes('preview')) score += 8;
  if (normalized.includes('onboarding')) score += 8;
  if (normalized.includes('guided')) score += 5;
  if (normalized.endsWith('/page.tsx')) score -= 25;
  if (normalized.includes('/app/')) score -= 5;
  if (normalized.includes('/canvas')) score -= 100;
  if (normalized.includes('/exemplos')) score -= 40;
  if (normalized.includes('/guia')) score -= 40;
  if (normalized.includes('/result')) score -= 35;
  return score;
}

function findCandidate() {
  const files = walk(srcRoot);
  const candidates = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const score = scoreCandidate(file, text);
    if (score > 0) candidates.push({ file, score, text });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function findExportName(text, file) {
  const preferred = [
    /export\s+function\s+(Home[A-Za-z0-9_]*Preview[A-Za-z0-9_]*)\s*\(/,
    /export\s+const\s+(Home[A-Za-z0-9_]*Preview[A-Za-z0-9_]*)\s*[:=]/,
    /export\s+function\s+([A-Za-z0-9_]*Onboarding[A-Za-z0-9_]*)\s*\(/,
    /export\s+const\s+([A-Za-z0-9_]*Onboarding[A-Za-z0-9_]*)\s*[:=]/,
    /export\s+function\s+([A-Za-z0-9_]*Guided[A-Za-z0-9_]*)\s*\(/,
    /export\s+const\s+([A-Za-z0-9_]*Guided[A-Za-z0-9_]*)\s*[:=]/,
    /export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/
  ];
  for (const rx of preferred) {
    const match = text.match(rx);
    if (match) return { name: match[1], mode: 'named' };
  }
  if (/export\s+default\s+function/.test(text)) {
    const base = path.basename(file).replace(/\.(tsx|ts)$/, '');
    const name = base.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') || 'HomeGuidedPreview';
    return { name, mode: 'default-function' };
  }
  if (/export\s+default\s+/.test(text)) {
    return { name: 'HomeGuidedPreview', mode: 'default' };
  }
  return null;
}

function findStyleImport(text, file) {
  const match = text.match(/import\s+styles\s+from\s+['"]([^'"]+\.module\.(?:sass|scss|css))['"]/);
  if (match) return path.resolve(path.dirname(file), match[1]);
  const sassCandidate = file.replace(/\.tsx?$/, '.module.sass');
  return sassCandidate;
}

function assertSafeCandidate(candidate) {
  const rel = path.relative(root, candidate.file).split(path.sep).join('/');
  if (rel.includes('/canvas')) throw new Error('Candidate points to /canvas, aborting.');
  if (rel.endsWith('/page.tsx')) throw new Error('Candidate is a page file, aborting to avoid broad edits.');
  const exportCount = (candidate.text.match(/export\s+(function|const|default)/g) || []).length;
  if (exportCount > 3) {
    throw new Error(`Candidate has ${exportCount} exports (${rel}). Aborting to avoid replacing a multi-component module.`);
  }
}

function tsxContent(exportInfo, styleRel) {
  const declarationStart = exportInfo.mode === 'named'
    ? `export function ${exportInfo.name}(_props: Record<string, unknown>) {`
    : `function ${exportInfo.name}(_props: Record<string, unknown>) {`;
  const declarationEnd = exportInfo.mode === 'named'
    ? ''
    : `\nexport default ${exportInfo.name};\n`;

  return `'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from '${styleRel}';

type PreviewScene = 'intro' | 'flowCards' | 'flowEdges' | 'bridge' | 'resultColumns' | 'resultEdges' | 'final';
type StageKey = 'input' | 'activity' | 'output' | 'outcome';

type FlowCard = {
  id: string;
  stage: StageKey;
  row: number;
};

type FlowEdge = {
  id: string;
  from: string;
  to: string;
  d: string;
  stage: StageKey;
  badge?: 'R' | 'H';
};

const SCENE_DURATIONS: Record<PreviewScene, number> = {
  intro: 5200,
  flowCards: 13200,
  flowEdges: 10400,
  bridge: 5200,
  resultColumns: 10400,
  resultEdges: 6800,
  final: 5600,
};

const SCENES: PreviewScene[] = ['intro', 'flowCards', 'flowEdges', 'bridge', 'resultColumns', 'resultEdges', 'final'];

const CARD_ORDER = [
  'input-1',
  'input-2',
  'input-3',
  'activity-1',
  'activity-2',
  'output-1',
  'output-2',
  'outcome-1',
];

const FLOW_CARDS: FlowCard[] = [
  { id: 'input-1', stage: 'input', row: 0 },
  { id: 'input-2', stage: 'input', row: 1 },
  { id: 'input-3', stage: 'input', row: 2 },
  { id: 'activity-1', stage: 'activity', row: 0 },
  { id: 'activity-2', stage: 'activity', row: 1 },
  { id: 'output-1', stage: 'output', row: 0 },
  { id: 'output-2', stage: 'output', row: 1 },
  { id: 'outcome-1', stage: 'outcome', row: 1 },
];

const FLOW_EDGES: FlowEdge[] = [
  { id: 'edge-1', from: 'input-1', to: 'activity-1', stage: 'input', badge: 'R', d: 'M 188 104 C 235 104 246 104 294 104' },
  { id: 'edge-2', from: 'input-2', to: 'activity-1', stage: 'input', d: 'M 188 192 C 236 192 242 126 294 112' },
  { id: 'edge-3', from: 'input-3', to: 'activity-2', stage: 'input', d: 'M 188 280 C 236 280 242 208 294 198' },
  { id: 'edge-4', from: 'activity-1', to: 'output-1', stage: 'activity', badge: 'R', d: 'M 424 104 C 470 104 488 104 534 104' },
  { id: 'edge-5', from: 'activity-2', to: 'output-2', stage: 'activity', d: 'M 424 192 C 470 192 488 192 534 192' },
  { id: 'edge-6', from: 'output-1', to: 'outcome-1', stage: 'outcome', badge: 'H', d: 'M 664 104 C 716 104 714 178 770 182' },
  { id: 'edge-7', from: 'output-2', to: 'outcome-1', stage: 'outcome', d: 'M 664 192 C 716 192 724 192 770 192' },
];

const STAGE_LABELS: Record<StageKey, string> = {
  input: 'INSUMOS',
  activity: 'ATIVIDADES',
  output: 'PRODUTOS',
  outcome: 'RESULTADOS',
};

const STAGE_COLUMNS: StageKey[] = ['input', 'activity', 'output', 'outcome'];

const TEXT_SCENES: Record<Extract<PreviewScene, 'intro' | 'bridge' | 'final'>, { title: string; description: string }> = {
  intro: {
    title: 'Comece pelas etapas da teoria.',
    description: 'Insumos, atividades, produtos e resultados entram em ordem para revelar a lógica causal.',
  },
  bridge: {
    title: 'O fluxo agora vira leitura.',
    description: 'As conexões deixam de ser rascunho e passam a organizar a visão por etapa.',
  },
  final: {
    title: 'Do rascunho à leitura final.',
    description: 'A teoria mostra o caminho, os vínculos e o que sustenta cada resultado.',
  },
};

const ease = [0.22, 1, 0.36, 1] as const;

function getCardDelay(cardId: string): number {
  return CARD_ORDER.indexOf(cardId) * 0.78;
}

function isTextScene(scene: PreviewScene): scene is 'intro' | 'bridge' | 'final' {
  return scene === 'intro' || scene === 'bridge' || scene === 'final';
}

${declarationStart}
  const reduceMotion = useReducedMotion();
  const [scene, setScene] = useState<PreviewScene>(reduceMotion ? 'resultEdges' : 'intro');

  useEffect(() => {
    if (reduceMotion) {
      setScene('resultEdges');
      return undefined;
    }

    const timers: Array<ReturnType<typeof window.setTimeout>> = [];
    let elapsed = 0;

    SCENES.forEach((currentScene, index) => {
      timers.push(window.setTimeout(() => setScene(currentScene), elapsed));
      elapsed += SCENE_DURATIONS[currentScene];

      if (index === SCENES.length - 1) {
        timers.push(window.setTimeout(() => setScene('intro'), elapsed + 1800));
      }
    });

    const loopTimer = window.setInterval(() => {
      let nextElapsed = 0;
      SCENES.forEach((currentScene) => {
        timers.push(window.setTimeout(() => setScene(currentScene), nextElapsed));
        nextElapsed += SCENE_DURATIONS[currentScene];
      });
    }, elapsed + 1800);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(loopTimer);
    };
  }, [reduceMotion]);

  const visibleCards = scene === 'flowCards' || scene === 'flowEdges';
  const visibleEdges = scene === 'flowEdges';
  const visibleColumns = scene === 'resultColumns' || scene === 'resultEdges';
  const visibleColumnEdges = scene === 'resultEdges';

  const textScene = useMemo(() => (isTextScene(scene) ? TEXT_SCENES[scene] : null), [scene]);

  return (
    <section className={styles.previewShell} aria-label="Prévia guiada da teoria de mudança">
      <div className={styles.previewFrame}>
        <AnimatePresence mode="wait">
          {textScene ? (
            <motion.div
              key={scene}
              className={styles.textScene}
              initial={{ opacity: 0, y: '0.75rem', scale: 0.985, filter: 'blur(0.25rem)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0rem)' }}
              exit={{ opacity: 0, y: '-0.5rem', scale: 0.99, filter: 'blur(0.2rem)' }}
              transition={{ duration: 1.35, ease }}
            >
              <h3>{textScene.title}</h3>
              <p>{textScene.description}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {visibleCards ? (
            <motion.div
              key="flow-scene"
              className={styles.flowScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <motion.svg className={styles.edgeLayer} viewBox="0 0 960 380" aria-hidden="true">
                <defs>
                  <marker id="tdmPreviewArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                    <path d="M 0 0 L 10 5 L 0 10 z" className={styles.arrowHead} />
                  </marker>
                </defs>
                {visibleEdges
                  ? FLOW_EDGES.map((edge, index) => (
                      <g key={edge.id} className={styles[edge.stage]}>
                        <motion.path
                          d={edge.d}
                          className={styles.edgePath}
                          pathLength={1}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.28, delay: index * 0.54, ease }}
                          markerEnd="url(#tdmPreviewArrow)"
                        />
                        {edge.badge ? (
                          <motion.text
                            className={styles.edgeBadge}
                            x={index < 3 ? 242 : index < 5 ? 480 : 720}
                            y={index === 2 ? 236 : index > 4 ? 150 : 92 + (index % 2) * 42}
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.38, delay: index * 0.54 + 0.72, ease }}
                          >
                            {edge.badge}
                          </motion.text>
                        ) : null}
                      </g>
                    ))
                  : null}
              </motion.svg>

              <div className={styles.flowGrid}>
                {STAGE_COLUMNS.map((stage, stageIndex) => (
                  <div key={stage} className={`${styles.stageGroup} ${styles[stage]}`}>
                    <motion.span
                      className={styles.stageLabel}
                      initial={{ opacity: 0, y: '-0.35rem' }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: stageIndex * 1.9, ease }}
                    >
                      {STAGE_LABELS[stage]}
                    </motion.span>
                    <div className={styles.stageCards}>
                      {FLOW_CARDS.filter((card) => card.stage === stage).map((card) => (
                        <motion.div
                          key={card.id}
                          className={styles.miniCard}
                          initial={{ opacity: 0, y: '-0.75rem', scale: 0.985, filter: 'blur(0.25rem)' }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0rem)' }}
                          transition={{ duration: 0.95, delay: getCardDelay(card.id), ease }}
                        >
                          <span className={styles.cardGlyph} />
                          <span className={styles.cardLines}>
                            <i />
                            <i />
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {visibleColumns ? (
            <motion.div
              key="column-scene"
              className={styles.columnScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
            >
              <motion.svg className={styles.columnEdgeLayer} viewBox="0 0 960 380" aria-hidden="true">
                {visibleColumnEdges
                  ? [
                      'M 234 184 C 282 184 304 184 350 184',
                      'M 470 184 C 522 184 542 184 590 184',
                      'M 708 184 C 756 184 774 184 820 184',
                    ].map((d, index) => (
                      <motion.path
                        key={d}
                        d={d}
                        className={styles.columnEdgePath}
                        pathLength={1}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.15, delay: index * 0.48, ease }}
                      />
                    ))
                  : null}
              </motion.svg>
              <div className={styles.columnGrid}>
                {STAGE_COLUMNS.map((stage, stageIndex) => (
                  <motion.div
                    key={stage}
                    className={`${styles.resultColumn} ${styles[stage]}`}
                    initial={{ opacity: 0, x: '-0.75rem', filter: 'blur(0.25rem)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0rem)' }}
                    transition={{ duration: 0.95, delay: stageIndex * 1.08, ease }}
                  >
                    <span className={styles.columnLabel}>{STAGE_LABELS[stage]}</span>
                    {FLOW_CARDS.filter((card) => card.stage === stage).map((card, cardIndex) => (
                      <motion.span
                        key={card.id}
                        className={styles.columnCard}
                        initial={{ opacity: 0, y: '0.55rem' }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: stageIndex * 1.08 + cardIndex * 0.32 + 0.35, ease }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
${declarationEnd}`;
}

function sassContent() {
  return `.previewShell
  width: 100%

.previewFrame
  --tdm-input: 156, 124, 255
  --tdm-activity: 102, 181, 255
  --tdm-output: 255, 177, 86
  --tdm-outcome: 92, 235, 190
  --preview-card-width: 8.75rem
  --preview-card-height: 3.2rem
  --preview-stage-gap: clamp(1.2rem, 3vw, 3.2rem)
  position: relative
  min-height: clamp(23rem, 42vw, 32rem)
  overflow: hidden
  border: 1px solid rgba(255, 255, 255, 0.09)
  border-radius: clamp(1.4rem, 3vw, 2.4rem)
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.085), transparent 34%), linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)), rgba(3, 4, 6, 0.82)
  box-shadow: inset 0 0.0625rem 0 rgba(255, 255, 255, 0.08), 0 2rem 7rem rgba(0, 0, 0, 0.32)

.textScene
  position: absolute
  inset: 0
  z-index: 5
  display: grid
  place-content: center
  padding: 2rem
  text-align: center
  background: radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.055), transparent 38%), rgba(3, 4, 6, 0.72)

  h3
    margin: 0
    max-width: 42rem
    color: rgba(255, 255, 255, 0.92)
    font-size: clamp(1.35rem, 2.3vw, 2.25rem)
    font-weight: 580
    letter-spacing: -0.045em
    line-height: 1.04

  p
    margin: 1rem auto 0
    max-width: 38rem
    color: rgba(255, 255, 255, 0.58)
    font-size: clamp(0.92rem, 1.18vw, 1.15rem)
    line-height: 1.55

.flowScene,
.columnScene
  position: absolute
  inset: 0
  display: grid
  place-items: center
  padding: clamp(1.2rem, 3vw, 2.5rem)

.flowGrid
  position: relative
  z-index: 2
  display: grid
  grid-template-columns: repeat(4, minmax(7.5rem, 1fr))
  gap: var(--preview-stage-gap)
  width: min(58rem, 92%)
  min-height: min(23rem, 80%)
  align-items: center

.stageGroup
  display: grid
  align-content: center
  gap: 0.75rem
  min-height: 18rem

.stageLabel,
.columnLabel
  color: rgba(var(--stage-color), 0.95)
  font-size: 0.68rem
  font-weight: 700
  letter-spacing: 0.28em
  text-align: center

.stageCards
  display: grid
  gap: 0.8rem
  justify-content: center

.miniCard
  position: relative
  display: grid
  grid-template-columns: 1.05rem 1fr
  align-items: center
  gap: 0.6rem
  width: var(--preview-card-width)
  min-height: var(--preview-card-height)
  padding: 0.65rem 0.72rem
  border: 1px solid rgba(var(--stage-color), 0.34)
  border-left: 0.16rem solid rgba(var(--stage-color), 0.88)
  border-radius: 0.62rem
  background: radial-gradient(circle at 12% 18%, rgba(var(--stage-color), 0.18), transparent 42%), linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.018)), rgba(8, 9, 12, 0.72)
  box-shadow: inset 0 0.0625rem 0 rgba(255, 255, 255, 0.08), 0 1rem 2.2rem rgba(0, 0, 0, 0.28), 0 0 1.5rem rgba(var(--stage-color), 0.12)
  backdrop-filter: blur(0.75rem) saturate(130%)

.cardGlyph
  width: 1rem
  height: 1rem
  border-radius: 0.25rem
  background: rgba(var(--stage-color), 0.22)
  box-shadow: inset 0 0 0 1px rgba(var(--stage-color), 0.22)

.cardLines
  display: grid
  gap: 0.35rem

  i
    display: block
    height: 0.28rem
    border-radius: 999rem
    background: rgba(255, 255, 255, 0.14)

    &:first-child
      width: 72%

    &:last-child
      width: 52%

.edgeLayer,
.columnEdgeLayer
  position: absolute
  inset: 0
  z-index: 1
  width: 100%
  height: 100%
  pointer-events: none

.edgePath,
.columnEdgePath
  fill: none
  stroke: rgba(var(--stage-color), 0.76)
  stroke-width: 2
  stroke-linecap: round
  stroke-linejoin: round
  stroke-dasharray: 0.32rem 0.58rem
  filter: drop-shadow(0 0 0.55rem rgba(var(--stage-color), 0.32))

.columnEdgePath
  --stage-color: 255, 255, 255
  stroke: rgba(255, 255, 255, 0.42)

.arrowHead
  fill: rgba(255, 255, 255, 0.72)

.edgeBadge
  dominant-baseline: middle
  text-anchor: middle
  font-size: 0.78rem
  font-weight: 800
  fill: rgba(255, 255, 255, 0.9)
  paint-order: stroke
  stroke: rgba(3, 4, 6, 0.92)
  stroke-width: 0.32rem

.columnGrid
  position: relative
  z-index: 2
  display: grid
  grid-template-columns: repeat(4, minmax(7.5rem, 1fr))
  gap: clamp(1rem, 2.5vw, 2.2rem)
  width: min(56rem, 90%)
  min-height: 19rem
  align-items: center

.resultColumn
  display: grid
  align-content: start
  gap: 0.68rem
  min-height: 13rem
  padding: 1rem
  border: 1px solid rgba(var(--stage-color), 0.24)
  border-radius: 0.9rem
  background: radial-gradient(circle at 50% 0%, rgba(var(--stage-color), 0.1), transparent 46%), rgba(7, 8, 11, 0.44)
  backdrop-filter: blur(0.55rem) saturate(125%)

.columnCard
  min-height: 2.45rem
  border: 1px solid rgba(var(--stage-color), 0.38)
  border-radius: 0.55rem
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.012)), rgba(5, 6, 8, 0.62)
  box-shadow: 0 0 1.2rem rgba(var(--stage-color), 0.1)

.input
  --stage-color: var(--tdm-input)

.activity
  --stage-color: var(--tdm-activity)

.output
  --stage-color: var(--tdm-output)

.outcome
  --stage-color: var(--tdm-outcome)

@media (max-width: 52rem)
  .previewFrame
    min-height: 34rem

  .flowGrid,
  .columnGrid
    width: 100%
    gap: 0.85rem

  .miniCard
    --preview-card-width: 6.75rem

  .stageLabel,
  .columnLabel
    font-size: 0.56rem
`;
}

function writePatch() {
  if (!fs.existsSync(srcRoot)) {
    console.error('src/ not found. Run this script from the repo root.');
    process.exit(1);
  }

  const candidates = findCandidate();
  if (candidates.length === 0) {
    console.error('Could not find Home guided preview component. No files changed.');
    process.exit(1);
  }

  const candidate = candidates[0];
  assertSafeCandidate(candidate);

  const exportInfo = findExportName(candidate.text, candidate.file);
  if (!exportInfo) {
    console.error(`Could not identify exported component in ${path.relative(root, candidate.file)}. No files changed.`);
    process.exit(1);
  }

  const stylePath = findStyleImport(candidate.text, candidate.file);
  fs.mkdirSync(path.dirname(stylePath), { recursive: true });

  const styleRelForImport = './' + path.basename(stylePath);
  const backupDir = path.join(root, 'tdm-backups', `home-preview-refinement-v1-${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const tsBackup = path.join(backupDir, path.relative(root, candidate.file).replace(/[\\/]/g, '__'));
  fs.copyFileSync(candidate.file, tsBackup);
  if (fs.existsSync(stylePath)) {
    const sassBackup = path.join(backupDir, path.relative(root, stylePath).replace(/[\\/]/g, '__'));
    fs.copyFileSync(stylePath, sassBackup);
  }

  fs.writeFileSync(candidate.file, tsxContent(exportInfo, styleRelForImport));
  fs.writeFileSync(stylePath, sassContent());

  console.log('Home guided preview refinement applied.');
  console.log(`Component: ${path.relative(root, candidate.file)}`);
  console.log(`Styles:    ${path.relative(root, stylePath)}`);
  console.log(`Backup:    ${path.relative(root, backupDir)}`);
  console.log('Next: npm run build');
}

try {
  writePatch();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
