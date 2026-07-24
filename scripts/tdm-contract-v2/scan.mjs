#!/usr/bin/env node

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  routeEntries,
  excludedRoots,
  protectedVisualFiles,
  canonicalComponentFamilies,
  legacyComponentFamilies,
  tokenDefinitionFiles,
  heavyDependencies,
  strictThresholds,
  TDM_CONTRACT_VERSION
} from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.env.TDM_PROJECT_ROOT
  ? path.resolve(process.env.TDM_PROJECT_ROOT)
  : path.resolve(__dirname, '../..');
const OUTPUT_ARG = process.argv.find((arg) => arg.startsWith('--output='));
const OUTPUT = OUTPUT_ARG
  ? path.resolve(ROOT, OUTPUT_ARG.slice('--output='.length))
  : path.join(ROOT, 'docs/design-system/generated/tdm-component-audit-v2.json');

const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.sass', '.scss', '.css']);
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.sass', '.scss', '.css'];
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'coverage', '__MACOSX', 'output']);
const TOKEN_FILES = new Set(tokenDefinitionFiles);
const PROTECTED_FILES = new Set(protectedVisualFiles);

function posix(value) {
  return value.split(path.sep).join('/');
}

function relative(absolutePath) {
  return posix(path.relative(ROOT, absolutePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function isExcluded(relativePath) {
  return excludedRoots.some((root) => relativePath === root || relativePath.startsWith(`${root}/`));
}

function walk(directory, output = []) {
  if (!fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, output);
      continue;
    }
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue;
    const rel = relative(absolute);
    if (isExcluded(rel)) continue;
    output.push(absolute);
  }
  return output;
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '');
}

function countMatches(source, regex) {
  return [...source.matchAll(regex)].length;
}

function countTernaries(source) {
  const cleaned = source
    .replace(/\?\./g, '')
    .replace(/\?\?/g, '')
    .replace(/https?:\/\/[^\s'"`]+/g, '');
  return countMatches(cleaned, /\?(?=[^?:\n]*:)/g);
}

function countNestedTernaries(source) {
  let count = 0;
  for (const line of source.split(/\r?\n/)) {
    const cleaned = line.replace(/\?\./g, '').replace(/\?\?/g, '');
    const matches = cleaned.match(/\?/g) ?? [];
    if (matches.length > 1 && cleaned.includes(':')) count += matches.length - 1;
  }
  return count;
}

function extractImports(source) {
  const imports = [];
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) imports.push(match[1]);
  }
  return [...new Set(imports)];
}

function resolveImport(fromRelativePath, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  const base = specifier.startsWith('@/')
    ? path.join(ROOT, 'src', specifier.slice(2))
    : path.resolve(ROOT, path.dirname(fromRelativePath), specifier);

  const candidates = [];
  if (path.extname(base)) candidates.push(base);
  else {
    for (const extension of RESOLVE_EXTENSIONS) candidates.push(`${base}${extension}`);
    for (const extension of RESOLVE_EXTENSIONS) candidates.push(path.join(base, `index${extension}`));
  }

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    const rel = relative(candidate);
    if (isExcluded(rel)) return null;
    return rel;
  }
  return null;
}

function featureFor(relativePath) {
  if (relativePath.startsWith('src/shared/')) return 'shared';
  if (relativePath.startsWith('src/app/')) return 'app-router';
  const featureMatch = relativePath.match(/^src\/features\/([^/]+)/);
  if (featureMatch) return featureMatch[1];
  if (relativePath.startsWith('scripts/')) return 'tooling';
  return 'root';
}

function familyFor(relativePath, source) {
  const value = `${relativePath} ${source.slice(0, 2500)}`.toLowerCase();
  if (/icon[-_ ]?button/.test(value)) return 'iconButton';
  if (/(^|[/_-])button([/_.-]|$)/.test(value)) return 'button';
  if (/tooltip/.test(value)) return 'tooltip';
  if (/dropdown|menu-item|\bmenu\b/.test(value)) return 'menu';
  if (/surface|glass-surface/.test(value)) return 'surface';
  if (/field|input|textarea/.test(value)) return 'field';
  if (/header/.test(value)) return 'header';
  if (/card/.test(value)) return 'card';
  if (/preview/.test(value)) return 'preview';
  if (/logo|brand/.test(value)) return 'brand';
  if (/loading|error|not-found|empty-state/.test(value)) return 'status';
  return 'other';
}

function appRouterRole(relativePath, useClient) {
  if (!relativePath.startsWith('src/app/')) return useClient ? 'client-component' : 'component';
  const name = path.basename(relativePath);
  const special = ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx', 'global-error.tsx', 'not-found.tsx'];
  if (!special.includes(name)) return useClient ? 'route-colocated-client' : 'route-colocated';
  return `${name.replace('.tsx', '')}:${useClient ? 'client' : 'server-default'}`;
}

function extractExportNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g)) {
    names.add(match[1]);
  }
  return [...names];
}

function hardcodedStrings(source) {
  const jsxText = countMatches(source, />\s*[A-Za-zÀ-ÿ][^<{\n]{2,}\s*</g);
  const userFacingProps = countMatches(source, /\b(?:title|label|description|tooltip|aria-label|placeholder)\s*=\s*['"][^'"]+['"]/g);
  return jsxText + userFacingProps;
}

function fileMetrics(relativePath) {
  const source = read(relativePath);
  const clean = stripComments(source);
  const extension = path.extname(relativePath);
  const isCode = CODE_EXTENSIONS.includes(extension);
  const isTsx = extension === '.tsx';
  const isStyle = ['.sass', '.scss', '.css'].includes(extension);
  const imports = isCode ? extractImports(clean) : [];
  const resolvedImports = imports.map((specifier) => resolveImport(relativePath, specifier)).filter(Boolean);
  const useClient = /^\s*['"]use client['"];?/m.test(source.slice(0, 300));
  const useServer = /^\s*['"]use server['"];?/m.test(source.slice(0, 300));
  const lines = source.split(/\r?\n/).length;
  const states = countMatches(clean, /\buseState\s*\(/g);
  const effects = countMatches(clean, /\buseEffect\s*\(/g);
  const callbacks = countMatches(clean, /\buseCallback\s*\(/g);
  const memos = countMatches(clean, /\buseMemo\s*\(/g);
  const reducers = countMatches(clean, /\buseReducer\s*\(/g);
  const transitions = countMatches(clean, /\buseTransition\s*\(/g);
  const refs = countMatches(clean, /\buseRef\s*\(/g);
  const hooks = states + effects + callbacks + memos + reducers + transitions + refs;
  const ternaries = isCode ? countTernaries(clean) : 0;
  const nestedTernaries = isCode ? countNestedTernaries(clean) : 0;
  const ifs = isCode ? countMatches(clean, /\bif\s*\(/g) : 0;
  const important = countMatches(clean, /!important\b/g);
  const hardcodedColors = TOKEN_FILES.has(relativePath)
    ? 0
    : countMatches(clean, /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/g);
  const staticInlineStyles = isTsx
    ? countMatches(clean, /\bstyle\s*=\s*\{\s*\{/g) + countMatches(clean, /\bstyle\s*=\s*\{\s*[^}\n]+\}/g)
    : 0;
  const sassModuleImports = imports.filter((specifier) => /\.module\.(sass|scss|css)$/.test(specifier));
  const nonModuleStyleImports = imports.filter((specifier) => /\.(sass|scss|css)$/.test(specifier) && !/\.module\./.test(specifier));
  const isApprovedLegacyBridge = relativePath === 'src/features/theory-of-change/components/public-pages/public-page-dependencies.ts';
  const legacyNameCount = isApprovedLegacyBridge
    ? 0
    : countMatches(clean, /\b(?:resend|lusion)\b/gi) + countMatches(relativePath, /(?:resend|lusion)/gi);
  const heavyImports = heavyDependencies.filter((dependency) => imports.some((specifier) => specifier === dependency || specifier.startsWith(`${dependency}/`)));
  const family = familyFor(relativePath, clean);
  const protectedVisual = PROTECTED_FILES.has(relativePath);
  const isCanonical = Object.values(canonicalComponentFamilies).flat().includes(relativePath);
  const isLegacy = Object.values(legacyComponentFamilies).flat().includes(relativePath);
  const warnings = [];

  if (isTsx && lines > strictThresholds.componentLines) warnings.push('component-large');
  if (isStyle && lines > strictThresholds.styleLines) warnings.push('style-large');
  if (hooks > strictThresholds.hooks) warnings.push('too-many-hooks');
  if (states > strictThresholds.states) warnings.push('too-many-states');
  if (callbacks > strictThresholds.callbacks) warnings.push('too-many-callbacks');
  if (nestedTernaries > 0) warnings.push('nested-ternary');
  if (important > 0) warnings.push('important');
  if (hardcodedColors > 0) warnings.push('hardcoded-color');
  if (staticInlineStyles > 0) warnings.push('inline-style');
  if (isTsx && nonModuleStyleImports.length > 0) warnings.push('non-module-style');
  if (useClient && relativePath.startsWith('src/app/') && /\/(page|layout)\.tsx$/.test(relativePath)) warnings.push('client-route-boundary');
  if (legacyNameCount > 0 && relativePath.startsWith('src/')) warnings.push('reference-name-in-product-code');
  if (effects > 4) warnings.push('effect-heavy');
  if (isLegacy) warnings.push('legacy-candidate');
  if (protectedVisual) warnings.push('protected-visual-zone');

  let health = 'good';
  if (warnings.some((warning) => ['component-large', 'style-large', 'too-many-hooks', 'too-many-states', 'important'].includes(warning))) health = 'critical';
  else if (warnings.length > 0) health = 'attention';

  return {
    path: relativePath,
    contentHash: crypto.createHash('sha256').update(source).digest('hex'),
    extension,
    lines,
    feature: featureFor(relativePath),
    family,
    role: appRouterRole(relativePath, useClient),
    typeScript: ['.ts', '.tsx'].includes(extension),
    useClient,
    useServer,
    imports,
    resolvedImports,
    exports: isCode ? extractExportNames(clean) : [],
    states,
    effects,
    callbacks,
    memos,
    reducers,
    transitions,
    refs,
    hooks,
    ternaries,
    nestedTernaries,
    ifs,
    important,
    hardcodedColors,
    hardcodedStrings: isTsx ? hardcodedStrings(clean) : 0,
    staticInlineStyles,
    sassModuleImports,
    nonModuleStyleImports,
    legacyNameCount,
    heavyImports,
    protectedVisual,
    isCanonical,
    isLegacy,
    warnings,
    health
  };
}

function routeGraph(metricsByPath) {
  return routeEntries.map((route) => {
    const visited = new Set();
    const queue = exists(route.entry) ? [route.entry] : [];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const metrics = metricsByPath.get(current);
      if (!metrics) continue;
      for (const dependency of metrics.resolvedImports) {
        if (!visited.has(dependency) && metricsByPath.has(dependency)) queue.push(dependency);
      }
    }
    const files = [...visited];
    const clientFiles = files.filter((file) => metricsByPath.get(file)?.useClient);
    const heavy = [...new Set(files.flatMap((file) => metricsByPath.get(file)?.heavyImports ?? []))];
    return {
      ...route,
      exists: exists(route.entry),
      files,
      componentCount: files.filter((file) => file.endsWith('.tsx')).length,
      clientFileCount: clientFiles.length,
      clientFiles,
      heavyDependencies: heavy,
      hasLoading: exists(path.join(path.dirname(route.entry), 'loading.tsx')),
      hasError: exists(path.join(path.dirname(route.entry), 'error.tsx')),
      hasNotFound: exists(path.join(path.dirname(route.entry), 'not-found.tsx')) || exists('src/app/not-found.tsx')
    };
  });
}

function parseTokens() {
  const tokens = [];
  for (const file of tokenDefinitionFiles) {
    if (!exists(file)) continue;
    const lines = read(file).split(/\r?\n/);
    lines.forEach((line, index) => {
      const match = line.match(/(--tdm-[a-zA-Z0-9-]+)\s*:\s*(.+)$/);
      if (!match) return;
      tokens.push({ name: match[1], value: match[2].trim(), file, line: index + 1 });
    });
  }
  const duplicateNames = [];
  const byName = new Map();
  for (const token of tokens) {
    const items = byName.get(token.name) ?? [];
    items.push(token);
    byName.set(token.name, items);
  }
  for (const [name, items] of byName.entries()) {
    if (items.length > 1) duplicateNames.push({ name, definitions: items });
  }
  const valueGroups = new Map();
  for (const token of tokens) {
    const items = valueGroups.get(token.value) ?? [];
    items.push(token.name);
    valueGroups.set(token.value, items);
  }
  const duplicateValues = [...valueGroups.entries()]
    .filter(([, names]) => names.length > 2)
    .map(([value, names]) => ({ value, names }))
    .sort((a, b) => b.names.length - a.names.length);
  return { tokens, duplicateNames, duplicateValues };
}

function duplicateFamilies(metrics) {
  const groups = {};
  for (const item of metrics.filter((metric) => metric.path.endsWith('.tsx'))) {
    if (item.family === 'other') continue;
    groups[item.family] ??= [];
    groups[item.family].push(item.path);
  }
  return Object.entries(groups)
    .map(([family, files]) => ({
      family,
      files: files.sort(),
      canonical: canonicalComponentFamilies[family] ?? [],
      legacy: legacyComponentFamilies[family] ?? [],
      duplicated: files.length > 1
    }))
    .sort((a, b) => b.files.length - a.files.length);
}

const allFiles = [
  ...walk(path.join(ROOT, 'src')),
  ...walk(path.join(ROOT, 'scripts'))
].map(relative);

const metrics = allFiles.map(fileMetrics).sort((a, b) => a.path.localeCompare(b.path));
const metricsByPath = new Map(metrics.map((metric) => [metric.path, metric]));
const routes = routeGraph(metricsByPath);
const tokenAudit = parseTokens();
const duplicates = duplicateFamilies(metrics);

const summary = {
  files: metrics.length,
  components: metrics.filter((metric) => metric.path.endsWith('.tsx')).length,
  clientComponents: metrics.filter((metric) => metric.path.endsWith('.tsx') && metric.useClient).length,
  critical: metrics.filter((metric) => metric.health === 'critical').length,
  attention: metrics.filter((metric) => metric.health === 'attention').length,
  protectedVisualFiles: metrics.filter((metric) => metric.protectedVisual).length,
  hardcodedColors: metrics.reduce((sum, metric) => sum + metric.hardcodedColors, 0),
  important: metrics.reduce((sum, metric) => sum + metric.important, 0),
  ternaries: metrics.reduce((sum, metric) => sum + metric.ternaries, 0),
  nestedTernaries: metrics.reduce((sum, metric) => sum + metric.nestedTernaries, 0),
  staticInlineStyles: metrics.reduce((sum, metric) => sum + metric.staticInlineStyles, 0),
  tokens: tokenAudit.tokens.length,
  duplicateTokenNames: tokenAudit.duplicateNames.length,
  duplicateFamilies: duplicates.filter((group) => group.duplicated).length,
  routes: routes.length,
  routesWithoutLoading: routes.filter((route) => !route.hasLoading).length,
  routesWithoutError: routes.filter((route) => !route.hasError).length
};

const report = {
  generatedAt: new Date().toISOString(),
  contractVersion: TDM_CONTRACT_VERSION,
  summary,
  routes,
  components: metrics.filter((metric) => metric.path.endsWith('.tsx')),
  styles: metrics.filter((metric) => ['.sass', '.scss', '.css'].includes(metric.extension)),
  files: metrics,
  duplicateFamilies: duplicates,
  tokenAudit,
  configuration: {
    routeEntries,
    excludedRoots,
    protectedVisualFiles,
    canonicalComponentFamilies,
    legacyComponentFamilies,
    strictThresholds
  }
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(`TDM audit written to ${posix(path.relative(ROOT, OUTPUT))}`);
console.log(JSON.stringify(summary, null, 2));
