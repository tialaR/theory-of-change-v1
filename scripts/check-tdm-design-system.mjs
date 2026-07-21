#!/usr/bin/env node
/**
 * TDM Design System gate — Phase 4B
 * Detects visual/architectural regressions against the canonical TDM DS.
 * Node.js only. Read-only (except --write-baseline / self-test fixtures).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const BASELINE_PATH = path.join(ROOT, 'scripts/tdm-design-system-baseline.json');
const SELF_TEST_DIR = path.join(ROOT, 'scripts/.tdm-ds-self-test');

const SCAN_GLOBS = [
  'src/app',
  'src/shared/styles/tdm',
  'src/shared/ui',
  'src/shared/motion/tdm-motion',
  'src/features/theory-of-change/components'
];

const EXCLUDE_DIR_NAMES = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'public',
  'generated',
  '__MACOSX',
  '.git'
]);

const TEXT_EXTS = new Set(['.sass', '.scss', '.css', '.ts', '.tsx', '.mjs', '.js', '.jsx']);

/** Canonical token definition files — hardcodes here define --tdm-* truth. */
const TOKEN_DEFINITION_FILES = new Set([
  'src/shared/styles/tdm/_tdm-color.sass',
  'src/shared/styles/tdm/_tdm-tokens.sass',
  'src/shared/styles/tdm/_tdm-foreground.sass',
  'src/shared/styles/tdm/_tdm-surface.sass',
  'src/shared/styles/tdm/_tdm-shadow.sass',
  'src/shared/styles/tdm/_tdm-border.sass',
  'src/shared/styles/tdm/_tdm-cta.sass',
  'src/shared/styles/tdm/_tdm-focus.sass',
  'src/shared/styles/tdm/_tdm-radius.sass',
  'src/shared/styles/tdm/_tdm-motion.sass',
  'src/shared/styles/tdm/_tdm-icon.sass',
  'src/shared/styles/tdm/_tdm-spacing.sass',
  'src/shared/styles/tdm/_tdm-font.sass',
  'src/shared/styles/tdm/_tdm-measure.sass'
]);

const CANONICAL_UI_DIRS = new Set([
  'tdm-button',
  'tdm-icon-button',
  'tdm-field',
  'tdm-surface',
  'tdm-tooltip',
  'tdm-motion'
]);

/** Legacy shared UI families removed/deprecated in Phase 4A. */
const LEGACY_IMPORT_PATTERNS = [
  {
    id: 'resend-ds',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/resend-ds(?:\/|['"])/,
    hint: 'Use lusion-resend-ds or tdm-* primitives.'
  },
  {
    id: 'resend-experience',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/resend-experience(?:\/|['"])/,
    hint: 'Use lusion-resend-ds or feature public-pages.'
  },
  {
    id: 'experience',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/experience(?:\/|['"])/,
    hint: 'Use lusion-resend-ds or tdm-* primitives.'
  },
  {
    id: 'icon-button',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/icon-button(?:\/|['"])/,
    hint: 'Use @/shared/ui/tdm-icon-button.'
  },
  {
    id: 'surface',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/surface(?:\/|['"])/,
    hint: 'Use @/shared/ui/tdm-surface.'
  },
  {
    id: 'glass-surface',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/glass-surface(?:\/|['"])/,
    hint: 'Use @/shared/ui/tdm-surface or feature-local glass if domain-specific.'
  },
  {
    id: 'tooltip-legacy',
    re: /(?:from|import)\s+['"][^'"]*shared\/ui\/tooltip(?:\/|['"])/,
    hint: 'Prefer @/shared/ui/tdm-tooltip; migrate TdmAnchoredTooltip consumers.'
  }
];

const PARALLEL_DIR_NAMES = new Set([
  'button',
  'icon-button',
  'field',
  'input',
  'textarea',
  'surface',
  'tooltip',
  'motion-provider',
  'motionprovider'
]);

const PARALLEL_EXPORT_RE =
  /\bexport\s+(?:default\s+)?(?:function|const|class)\s+(Button|IconButton|Field|Input|Textarea|Surface|Tooltip|MotionProvider)\b/;

const RULE_MESSAGES = {
  'TDM-DS-001': {
    title: '!important não é permitido.',
    fix: 'Remova !important e aumente especificidade com tokens/classes canônicas.'
  },
  'TDM-DS-002': {
    title: 'transition: all não é permitida.',
    fix: 'Use propriedades explícitas e tokens --tdm-motion-*.'
  },
  'TDM-DS-003': {
    title: 'Hardcode de cor detectado.',
    fix: 'Use tokens --tdm-* (ex.: var(--tdm-fg-primary)).'
  },
  'TDM-DS-004': {
    title: 'font-size em px não é permitido em UI funcional.',
    fix: 'Use a escala rem canônica (ex.: 0.875rem).'
  },
  'TDM-DS-005': {
    title: 'font-size com vw fora do padrão clamp(rem, vw, rem) não é permitido.',
    fix: 'Use clamp(min rem, fluid, max rem) com token canônico ou escala rem.'
  },
  'TDM-DS-006': {
    title: 'Texto funcional abaixo de 0.75rem não é permitido.',
    fix: 'Use no mínimo 0.75rem (12px equivalent) na escala tipográfica TDM.'
  },
  'TDM-DS-007': {
    title: 'font-weight acima de 600 não é permitido.',
    fix: 'Use font-weight 400–600 conforme tokens tipográficos TDM.'
  },
  'TDM-DS-008': {
    title: 'Arquivo .scss não é permitido nas áreas canônicas/migradas.',
    fix: 'Use .sass (ou .module.sass) alinhado ao DS TDM.'
  },
  'TDM-DS-009': {
    title: 'Import de Design System legado.',
    fix: 'Importe primitivos canônicos tdm-* ou lusion-resend-ds.'
  },
  'TDM-DS-010': {
    title: 'Primitivo paralelo ao Design System canônico.',
    fix: 'Reutilize tdm-button, tdm-icon-button, tdm-field, tdm-surface, tdm-tooltip ou tdm-motion.'
  },
  'TDM-DS-011': {
    title: 'Loop de animação decorativa detectado.',
    fix: 'Remova loops infinitos decorativos; permita só loading/spinner/logo autorizados.'
  },
  'TDM-DS-012': {
    title: 'Token local paralelo a categoria canônica --tdm-*.',
    fix: 'Use ou alias direto para var(--tdm-*); não recrie escalas locais.'
  },
  'TDM-DS-013': {
    title: 'Arquivo/caminho canônico ignorado pelo Git.',
    fix: 'Ajuste .gitignore para versionar primitivos e tokens TDM.'
  },
  'TDM-DS-014': {
    title: 'Import direto entre features irmãs.',
    fix: 'Mova o contrato compartilhado para src/shared ou importe dentro da mesma feature.'
  },
  'TDM-DS-015': {
    title: 'Inline style com decisão visual estática.',
    fix: 'Mova cor/spacing/font/radius/shadow/transition para tokens ou classes .module.sass.'
  }
};

const args = new Set(process.argv.slice(2));
const WRITE_BASELINE = args.has('--write-baseline');
const SELF_TEST = args.has('--self-test');
const QUIET = args.has('--quiet');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function rel(p) {
  return toPosix(path.relative(ROOT, p));
}

function isExcludedPath(relPath) {
  const parts = relPath.split('/');
  if (parts.some((p) => EXCLUDE_DIR_NAMES.has(p))) return true;
  if (/\.(png|jpe?g|gif|webp|avif|ico|svg|mp4|webm|pdf|zip|woff2?|ttf|otf|eot)$/i.test(relPath)) {
    return true;
  }
  // Export artifacts / mappers with embedded document colors
  if (/\/export\//.test(relPath) || /\.export\./.test(relPath)) return true;
  if (/fixtures?\//.test(relPath) || /__snapshots__\//.test(relPath)) return true;
  if (/\.snap$/.test(relPath)) return true;
  return false;
}

function walkFiles(absDir, out = []) {
  if (!fs.existsSync(absDir)) return out;
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(absDir, ent.name);
    const r = rel(abs);
    if (ent.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(ent.name)) continue;
      if (isExcludedPath(r)) continue;
      walkFiles(abs, out);
      continue;
    }
    if (isExcludedPath(r)) continue;
    if (!TEXT_EXTS.has(path.extname(ent.name))) continue;
    out.push(abs);
  }
  return out;
}

function collectScanFiles() {
  const files = [];
  for (const root of SCAN_GLOBS) {
    walkFiles(path.join(ROOT, root), files);
  }
  // shared/ui is scanned, but only text sources under known packages
  return [...new Set(files)].sort();
}

function stripLineComment(line, ext) {
  if (ext === '.sass' || ext === '.scss' || ext === '.css') {
    const idx = line.indexOf('//');
    if (idx >= 0) return line.slice(0, idx);
    return line;
  }
  // TS/JS: naive // strip outside strings is enough for gate heuristics
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = line[i - 1];
    if (!inDouble && !inTemplate && ch === "'" && prev !== '\\') inSingle = !inSingle;
    else if (!inSingle && !inTemplate && ch === '"' && prev !== '\\') inDouble = !inDouble;
    else if (!inSingle && !inDouble && ch === '`' && prev !== '\\') inTemplate = !inTemplate;
    else if (!inSingle && !inDouble && !inTemplate && ch === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

function stripBlockComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

function isStyleFile(relPath) {
  return /\.(sass|scss|css)$/.test(relPath);
}

function isCodeFile(relPath) {
  return /\.(ts|tsx|js|jsx|mjs)$/.test(relPath);
}

function isCanonicalTokenFile(relPath) {
  return TOKEN_DEFINITION_FILES.has(relPath);
}

function isUnderSharedUi(relPath) {
  return /(?:^|\/)src\/shared\/ui\//.test(relPath);
}

function sharedUiPackageName(relPath) {
  const m = relPath.match(/(?:^|\/)src\/shared\/ui\/([^/]+)/);
  return m ? m[1] : null;
}

function colorLiteralMatches(line) {
  const matches = [];
  const patterns = [
    /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    /\brgba?\(\s*[^)]+\)/gi,
    /\bhsla?\(\s*[^)]+\)/gi
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(line)) !== null) {
      const value = m[0];
      if (/^(transparent|currentColor|inherit|none)$/i.test(value)) continue;
      // Technical mask / SVG zero-alpha shortcuts
      if (/^#0000$/i.test(value) || /^#fff$/i.test(value) && /mask/i.test(line)) continue;
      matches.push(value);
    }
  }
  return matches;
}

function parseRemFontSize(line) {
  const m = line.match(/font-size\s*:\s*([0-9]*\.?[0-9]+)\s*rem\b/i);
  if (!m) return null;
  return Number(m[1]);
}

function isAllowedVwClamp(line) {
  // clamp(min rem, *vw*, max rem) — min/max in rem
  const m = line.match(
    /font-size\s*:\s*clamp\(\s*([0-9]*\.?[0-9]+)\s*rem\s*,\s*[^,)]*\bvw\b[^,)]*,\s*([0-9]*\.?[0-9]+)\s*rem\s*\)/i
  );
  return Boolean(m);
}

function isLikelyAllowedInlineStyle(snippet) {
  const s = snippet.toLowerCase();
  if (/transform|translate|scale|rotate|x:|y:|width|height|left|top|right|bottom|zindex|z-index/.test(s)) {
    // still flag if also sets visual tokens
    if (!/\b(color|background|border|font|padding|margin|gap|radius|shadow|transition|letterspacing|opacity)\b/.test(s)) {
      return true;
    }
  }
  // CSS custom properties for stage / dynamic theme
  if (/['"]--[a-z0-9-]+['"]\s*:/.test(snippet) || /\[`--/.test(snippet)) return true;
  if (/stage|accent|--tdm-/.test(s) && /--/.test(snippet)) return true;
  return false;
}

function hasVisualInlineDecision(snippet) {
  return /\b(color|background|backgroundColor|borderColor|borderRadius|boxShadow|fontSize|fontWeight|padding|margin|gap|transition|letterSpacing)\b/.test(
    snippet
  );
}

/**
 * @typedef {{ rule: string, path: string, line?: number, message: string, fix: string, sample?: string }} Violation
 */

/** @returns {Violation[]} */
function scanFile(absPath) {
  const relPath = rel(absPath);
  const ext = path.extname(relPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const content = stripBlockComments(raw);
  const lines = content.split(/\r?\n/);
  /** @type {Violation[]} */
  const violations = [];

  const push = (rule, line, sample = '') => {
    const meta = RULE_MESSAGES[rule];
    violations.push({
      rule,
      path: relPath,
      line,
      message: meta.title,
      fix: meta.fix,
      sample: sample.trim().slice(0, 160)
    });
  };

  // TDM-DS-008 — .scss in scanned trees
  if (ext === '.scss') {
    push('TDM-DS-008', 1, relPath);
  }

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = stripLineComment(rawLine, ext);
    if (!line.trim()) return;

    // TDM-DS-001
    if ((isStyleFile(relPath) || isCodeFile(relPath)) && /!important\b/.test(line)) {
      push('TDM-DS-001', lineNo, line);
    }

    // TDM-DS-002
    if (isStyleFile(relPath) && /transition\s*:\s*all\b/i.test(line)) {
      push('TDM-DS-002', lineNo, line);
    }

    // TDM-DS-003 — colors (skip token definition files)
    if (!isCanonicalTokenFile(relPath) && (isStyleFile(relPath) || isCodeFile(relPath))) {
      // Skip pure var(--tdm-*) assignments and documentation
      if (!/var\(\s*--tdm-/.test(line) || colorLiteralMatches(line).length) {
        const colors = colorLiteralMatches(line);
        // Ignore when the only colors are inside var() fallbacks already tokenized? still flag fallbacks
        for (const color of colors) {
          // Allow setting --tdm-* in non-token files? rare; still OK if defining --tdm-
          if (/--tdm-[a-z0-9-]+\s*:/.test(line) && relPath.startsWith('src/shared/styles/tdm/')) {
            continue;
          }
          push('TDM-DS-003', lineNo, `${color} ← ${line.trim()}`);
          break; // one report per line
        }
      }
    }

    // TDM-DS-004 font-size px
    if (isStyleFile(relPath) && /font-size\s*:\s*0+\s*px\b/i.test(line)) {
      // allow 0
    } else if (isStyleFile(relPath) && /font-size\s*:\s*[0-9]+(?:\.[0-9]+)?px\b/i.test(line)) {
      push('TDM-DS-004', lineNo, line);
    }

    // TDM-DS-005 font-size vw
    if (isStyleFile(relPath) && /font-size\s*:[^;\n]*\bvw\b/i.test(line)) {
      if (!isAllowedVwClamp(line)) {
        push('TDM-DS-005', lineNo, line);
      }
    }

    // TDM-DS-006 text < 0.75rem (static only)
    if (isStyleFile(relPath) && /font-size\s*:/i.test(line) && !/clamp\s*\(/i.test(line)) {
      const rem = parseRemFontSize(line);
      if (rem !== null && rem < 0.75) {
        push('TDM-DS-006', lineNo, line);
      }
    }

    // TDM-DS-007 weight > 600
    if ((isStyleFile(relPath) || isCodeFile(relPath)) && /font-weight\s*[:=]\s*['"]?(6[1-9]\d|[7-9]\d{2})['"]?\b/.test(line)) {
      push('TDM-DS-007', lineNo, line);
    }

    // TDM-DS-009 legacy imports
    if (isCodeFile(relPath)) {
      for (const legacy of LEGACY_IMPORT_PATTERNS) {
        if (legacy.re.test(line)) {
          push('TDM-DS-009', lineNo, `${legacy.id}: ${line.trim()}`);
        }
      }
    }

    // TDM-DS-011 decorative loops
    if (/repeat\s*:\s*Infinity\b/.test(line)) {
      push('TDM-DS-011', lineNo, line);
    }
    if (isStyleFile(relPath) && /animation-iteration-count\s*:\s*infinite\b/i.test(line)) {
      push('TDM-DS-011', lineNo, line);
    }
    if (isStyleFile(relPath) && /animation\s*:[^;\n]*\binfinite\b/i.test(line)) {
      push('TDM-DS-011', lineNo, line);
    }

    // TDM-DS-012 parallel local tokens (non-alias)
    if (isStyleFile(relPath)) {
      const localToken = line.match(
        /(--(?:foreground|fg|spacing|space|radius|shadow|border|motion|cta|icon-size|icon)[a-z0-9-]*)\s*:\s*([^;]+)/i
      );
      const sassToken = line.match(
        /(\$(?:foreground|spacing|space|radius|shadow|border|motion|cta|icon-size)[a-z0-9-]*)\s*:\s*(.+)$/i
      );
      const hit = localToken || sassToken;
      if (hit) {
        const value = hit[2].trim();
        const isAlias = /^var\(\s*--tdm-/i.test(value) || /^\$tdm-/i.test(value);
        const isGeometry =
          /header-h|public-header|stage|column|panel|node-|sidebar-|dock-|canvas-/i.test(hit[1]) ||
          /header-h|public-header/.test(line);
        if (!isAlias && !isGeometry && !isCanonicalTokenFile(relPath)) {
          // allow --border as alias already handled; hardcoded border colors flagged
          push('TDM-DS-012', lineNo, line);
        }
      }
    }

    // TDM-DS-014 cross-feature imports (directed; only sister features)
    if (isCodeFile(relPath)) {
      const fromFeature = relPath.match(/^src\/features\/([^/]+)\//);
      const importFeature = line.match(/(?:from|import)\s+['"]@?\/?features\/([^/'"]+)\//);
      const importAlias = line.match(/(?:from|import)\s+['"]@\/features\/([^/'"]+)\//);
      const target = importFeature?.[1] || importAlias?.[1];
      if (fromFeature && target && fromFeature[1] !== target) {
        push('TDM-DS-014', lineNo, line);
      }
    }

    // TDM-DS-015 inline visual styles
    if (isCodeFile(relPath) && /style=\{\{/.test(line)) {
      // single-line style
      const m = line.match(/style=\{\{([\s\S]*?)\}\}/);
      const snippet = m ? m[1] : line;
      if (hasVisualInlineDecision(snippet) && !isLikelyAllowedInlineStyle(snippet)) {
        push('TDM-DS-015', lineNo, line);
      }
    }
  });

  // Multi-line style={{ ... }} heuristic
  if (isCodeFile(relPath) && /style=\{\{/.test(content)) {
    const re = /style=\{\{([\s\S]*?)\}\}/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const snippet = m[1];
      if (!hasVisualInlineDecision(snippet) || isLikelyAllowedInlineStyle(snippet)) continue;
      // find line of match start
      const before = content.slice(0, m.index);
      const lineNo = before.split(/\r?\n/).length;
      // avoid duplicate if already captured on that line
      if (!violations.some((v) => v.rule === 'TDM-DS-015' && v.path === relPath && v.line === lineNo)) {
        push('TDM-DS-015', lineNo, snippet.split('\n')[0]);
      }
    }
  }

  // TDM-DS-010 parallel primitives in shared/ui
  if (isUnderSharedUi(relPath)) {
    const pkg = sharedUiPackageName(relPath);
    if (
      pkg &&
      PARALLEL_DIR_NAMES.has(pkg.toLowerCase()) &&
      !CANONICAL_UI_DIRS.has(pkg) &&
      /\.(ts|tsx|sass|scss|css)$/.test(relPath)
    ) {
      push('TDM-DS-010', 1, `shared/ui/${pkg} é paralelo aos primitivos canônicos tdm-*`);
    } else if (
      PARALLEL_EXPORT_RE.test(content) &&
      pkg &&
      !pkg.startsWith('tdm-') &&
      pkg !== 'lusion-resend-ds'
    ) {
      const lineNo = content.split(/\r?\n/).findIndex((l) => PARALLEL_EXPORT_RE.test(l)) + 1;
      push('TDM-DS-010', lineNo || 1, 'exported parallel primitive name');
    }
  }

  return violations;
}

function checkGitTraceability() {
  /** @type {Violation[]} */
  const violations = [];
  const targets = [
    'src/shared/styles/tdm',
    'src/shared/motion/tdm-motion'
  ];

  // Expand tdm-* UI packages
  const uiRoot = path.join(ROOT, 'src/shared/ui');
  if (fs.existsSync(uiRoot)) {
    for (const name of fs.readdirSync(uiRoot)) {
      if (name.startsWith('tdm-')) targets.push(`src/shared/ui/${name}`);
    }
  }

  for (const target of targets) {
    const abs = path.join(ROOT, target);
    if (!fs.existsSync(abs)) continue;
    const probeFiles = [];
    if (fs.statSync(abs).isDirectory()) {
      walkFiles(abs, probeFiles);
    } else {
      probeFiles.push(abs);
    }
    for (const file of probeFiles.slice(0, 40)) {
      const r = rel(file);
      const result = spawnSync('git', ['check-ignore', '-v', r], {
        cwd: ROOT,
        encoding: 'utf8'
      });
      if (result.status === 0 && result.stdout.trim()) {
        violations.push({
          rule: 'TDM-DS-013',
          path: r,
          line: undefined,
          message: RULE_MESSAGES['TDM-DS-013'].title,
          fix: RULE_MESSAGES['TDM-DS-013'].fix,
          sample: result.stdout.trim()
        });
      }
    }
  }
  return violations;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    return { version: 1, entries: [] };
  }
  const raw = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  if (!raw || !Array.isArray(raw.entries)) {
    throw new Error(`Baseline inválida: ${rel(BASELINE_PATH)}`);
  }
  return raw;
}

function keyOf(rule, filePath) {
  return `${rule}::${filePath}`;
}

function applyBaseline(violations, baseline) {
  /** @type {Map<string, { entry: any, used: number }>} */
  const budgets = new Map();
  /** @type {Map<string, Set<number>>} */
  const lineAllows = new Map();

  for (const entry of baseline.entries) {
    if (!entry.rule || !entry.path || !entry.reason) {
      throw new Error(`Entrada de baseline incompleta: ${JSON.stringify(entry)}`);
    }
    if (/\*$/.test(entry.path) || entry.path.endsWith('/')) {
      throw new Error(`Baseline não pode usar wildcard/pasta: ${entry.path}`);
    }
    const k = keyOf(entry.rule, entry.path);
    if (typeof entry.line === 'number') {
      if (!lineAllows.has(k)) lineAllows.set(k, new Set());
      lineAllows.get(k).add(entry.line);
    } else {
      const allow = typeof entry.allowCount === 'number' ? entry.allowCount : 1;
      budgets.set(k, { entry, used: 0, allow });
    }
  }

  /** @type {Violation[]} */
  const failing = [];
  /** @type {Violation[]} */
  const baselined = [];

  for (const v of violations) {
    const k = keyOf(v.rule, v.path);
    const lines = lineAllows.get(k);
    if (lines && typeof v.line === 'number' && lines.has(v.line)) {
      baselined.push(v);
      continue;
    }
    const budget = budgets.get(k);
    if (budget && budget.used < budget.allow) {
      budget.used += 1;
      baselined.push(v);
      continue;
    }
    failing.push(v);
  }

  /** stale budget / unused line entries */
  const stale = [];
  for (const [k, budget] of budgets) {
    if (budget.used === 0) {
      stale.push({
        rule: budget.entry.rule,
        path: budget.entry.path,
        reason: budget.entry.reason,
        kind: 'unused-budget'
      });
    } else if (budget.used < budget.allow) {
      stale.push({
        rule: budget.entry.rule,
        path: budget.entry.path,
        reason: budget.entry.reason,
        kind: 'tightenable',
        used: budget.used,
        allow: budget.allow
      });
    }
  }
  for (const [k, lines] of lineAllows) {
    const [rule, filePath] = k.split('::');
    for (const line of lines) {
      const used = baselined.some((v) => v.rule === rule && v.path === filePath && v.line === line);
      if (!used) {
        stale.push({ rule, path: filePath, line, kind: 'unused-line' });
      }
    }
  }

  return { failing, baselined, stale };
}

function formatViolation(v) {
  const loc = typeof v.line === 'number' ? `${v.path}:${v.line}` : v.path;
  const sample = v.sample ? `\n  ↳ ${v.sample}` : '';
  return `[${v.rule}] ${loc}\n${v.message}\n${v.fix}${sample}`;
}

function buildBaselineFromViolations(violations) {
  /** @type {Map<string, { rule: string, path: string, count: number }>} */
  const groups = new Map();
  for (const v of violations) {
    const k = keyOf(v.rule, v.path);
    if (!groups.has(k)) groups.set(k, { rule: v.rule, path: v.path, count: 0 });
    groups.get(k).count += 1;
  }

  const reasonByRule = {
    'TDM-DS-001': 'Débito pré-existente de especificidade; limpeza em fase de hardening visual.',
    'TDM-DS-002': 'Débito pré-existente de transition; migrar para --tdm-motion-*.',
    'TDM-DS-003': 'Hardcodes pré-existentes em superfície migrada parcialmente; trocar por --tdm-* na fase de tokens de produto.',
    'TDM-DS-004': 'font-size px legado em módulo ainda ativo; migrar para rem.',
    'TDM-DS-005': 'font-size vw legado fora do clamp canônico; migrar para escala rem/token.',
    'TDM-DS-006': 'Texto < 0.75rem legado; elevar para escala tipográfica TDM.',
    'TDM-DS-007': 'Peso > 600 legado; reduzir para ≤ 600.',
    'TDM-DS-008': 'Arquivo .scss legado ainda referenciado; converter para .sass.',
    'TDM-DS-009': 'Import legado ainda ancorado; migrar consumidores para tdm-* / lusion-resend-ds.',
    'TDM-DS-010': 'Primitivo paralelo ainda ativo; consolidar no pacote canônico.',
    'TDM-DS-011': 'Loop decorativo pré-autorizado (escultura/logo/backdrop); remover ou justificar na fase motion.',
    'TDM-DS-012': 'Alias/token local pré-existente; apontar só para --tdm-* e remover escala paralela.',
    'TDM-DS-013': 'Caminho canônico ignorado — corrigir .gitignore imediatamente.',
    'TDM-DS-014': 'Acoplamento entre features; extrair para shared.',
    'TDM-DS-015': 'Inline style visual legado; mover para tokens/classes.'
  };

  const removeInByRule = {
    'TDM-DS-001': 'Fase 5 — hardening CSS',
    'TDM-DS-003': 'Fase 5 — tokens de produto',
    'TDM-DS-006': 'Fase 5 — tipografia',
    'TDM-DS-007': 'Fase 5 — tipografia',
    'TDM-DS-009': 'Fase 4C/5 — remoção de âncoras legadas',
    'TDM-DS-010': 'Fase 4C — consolidar tooltip ancorado',
    'TDM-DS-011': 'Fase 5 — motion decorativo',
    'TDM-DS-012': 'Fase 5 — aliases públicos',
    'TDM-DS-015': 'Fase 5 — inline styles'
  };

  const entries = [...groups.values()]
    .sort((a, b) => a.rule.localeCompare(b.rule) || a.path.localeCompare(b.path))
    .map((g) => ({
      rule: g.rule,
      path: g.path,
      allowCount: g.count,
      reason: reasonByRule[g.rule] || 'Débito pré-existente autorizado na Fase 4B.',
      removeIn: removeInByRule[g.rule] || 'Fase 5 — cleanup DS'
    }));

  return {
    version: 1,
    generatedBy: 'scripts/check-tdm-design-system.mjs --write-baseline',
    note: 'Baseline congelada. Novas violações não entram automaticamente. Preferir reduzir allowCount quando o arquivo for limpo.',
    entries
  };
}

function printSummary({ scanned, violations, failing, baselined, stale }) {
  console.log('');
  console.log('══ TDM Design System Gate ══');
  console.log(`Arquivos escaneados: ${scanned}`);
  console.log(`Violações encontradas: ${violations}`);
  console.log(`Cobertas pela baseline: ${baselined}`);
  console.log(`Novas (falha): ${failing}`);
  if (stale.length) {
    console.log(`Baseline obsoleta/apertável: ${stale.length}`);
  }
}

function runSelfTest() {
  console.log('Running gate self-test…');
  fs.rmSync(SELF_TEST_DIR, { recursive: true, force: true });
  const badDir = path.join(SELF_TEST_DIR, 'src/shared/ui/button');
  const goodDir = path.join(SELF_TEST_DIR, 'src/shared/ui/tdm-button');
  fs.mkdirSync(badDir, { recursive: true });
  fs.mkdirSync(goodDir, { recursive: true });
  fs.mkdirSync(path.join(SELF_TEST_DIR, 'src/shared/styles/tdm'), { recursive: true });
  fs.mkdirSync(path.join(SELF_TEST_DIR, 'src/features/theory-of-change/components/demo'), {
    recursive: true
  });

  const cases = [
    {
      file: 'src/features/theory-of-change/components/demo/bad.module.sass',
      body: `.x\n  color: #ff0000\n  transition: all 0.2s\n  font-size: 11px\n  font-weight: 700\n  animation: spin 1s infinite\n  margin: 0 !important\n`,
      expect: ['TDM-DS-001', 'TDM-DS-002', 'TDM-DS-003', 'TDM-DS-004', 'TDM-DS-007', 'TDM-DS-011']
    },
    {
      file: 'src/features/theory-of-change/components/demo/bad-import.tsx',
      body: `import { X } from '@/shared/ui/resend-ds'\nexport function Demo(){ return <div style={{ color: '#fff', padding: 8 }} /> }\n`,
      expect: ['TDM-DS-009', 'TDM-DS-015']
    },
    {
      file: 'src/features/theory-of-change/components/demo/bad-motion.tsx',
      body: `export const loop = { repeat: Infinity }\n`,
      expect: ['TDM-DS-011']
    },
    {
      file: 'src/shared/ui/button/button.tsx',
      body: `export function Button(){ return null }\n`,
      expect: ['TDM-DS-010']
    },
    {
      file: 'src/shared/ui/tdm-button/ok.module.sass',
      body: `.ok\n  color: var(--tdm-fg-primary)\n  font-size: 0.875rem\n  font-weight: 600\n  --stage-accent: var(--tdm-stage-outcome)\n`,
      expect: []
    }
  ];

  for (const c of cases) {
    const abs = path.join(SELF_TEST_DIR, c.file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, c.body, 'utf8');
  }

  // Temporarily scan only self-test tree by monkeypatching ROOT usage via chdir copies:
  // Instead, invoke scanFile directly on fixtures.
  let failed = false;
  for (const c of cases) {
    const abs = path.join(SELF_TEST_DIR, c.file);
    const found = new Set(scanFile(abs).map((v) => v.rule));
    for (const rule of c.expect) {
      if (!found.has(rule)) {
        console.error(`SELF-TEST FAIL: ${c.file} missing ${rule}. Found: ${[...found].join(', ')}`);
        failed = true;
      }
    }
    if (c.expect.length === 0 && found.size > 0) {
      console.error(`SELF-TEST FAIL: ${c.file} expected clean, got ${[...found].join(', ')}`);
      failed = true;
    } else if (c.expect.length === 0) {
      console.log(`SELF-TEST OK (accept): ${c.file}`);
    } else {
      console.log(`SELF-TEST OK (reject): ${c.file} → ${c.expect.join(', ')}`);
    }
  }

  fs.rmSync(SELF_TEST_DIR, { recursive: true, force: true });
  if (failed) {
    console.error('Self-test failed.');
    process.exit(1);
  }
  console.log('Self-test passed.');
  process.exit(0);
}

function main() {
  if (SELF_TEST) {
    runSelfTest();
    return;
  }

  const files = collectScanFiles();
  /** @type {Violation[]} */
  let violations = [];
  for (const file of files) {
    violations = violations.concat(scanFile(file));
  }
  violations = violations.concat(checkGitTraceability());

  if (WRITE_BASELINE) {
    const baseline = buildBaselineFromViolations(violations);
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
    console.log(`Baseline escrita: ${rel(BASELINE_PATH)} (${baseline.entries.length} entradas)`);
    printSummary({
      scanned: files.length,
      violations: violations.length,
      failing: 0,
      baselined: violations.length,
      stale: []
    });
    process.exit(0);
  }

  const baseline = loadBaseline();
  const { failing, baselined, stale } = applyBaseline(violations, baseline);

  if (!QUIET) {
    for (const v of failing) {
      console.error(formatViolation(v));
      console.error('');
    }
    for (const s of stale) {
      if (s.kind === 'tightenable') {
        console.warn(
          `[baseline] apertável: ${s.rule} ${s.path} (usado ${s.used}/${s.allow}) — reduza allowCount.`
        );
      } else if (s.kind === 'unused-budget' || s.kind === 'unused-line') {
        console.warn(
          `[baseline] obsoleta: ${s.rule} ${s.path}${s.line ? `:${s.line}` : ''} — remova a entrada.`
        );
      }
    }
  }

  printSummary({
    scanned: files.length,
    violations: violations.length,
    failing: failing.length,
    baselined: baselined.length,
    stale: stale.length
  });

  if (failing.length > 0) {
    console.error(`\nGate falhou: ${failing.length} nova(s) violação(ões).`);
    process.exit(1);
  }

  console.log('\nGate OK: sem novas violações do Design System.');
  process.exit(0);
}

main();
