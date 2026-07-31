#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const messagesPath = 'messages/pt-BR.json';
requireCondition(exists(messagesPath), 'catálogo pt-BR ausente');
const messages = exists(messagesPath) ? JSON.parse(read(messagesPath)) : {};
for (const namespace of ['Canvas', 'Auth', 'RouteState']) {
  requireCondition(Boolean(messages[namespace]), `namespace next-intl ausente: ${namespace}`);
}

const translatedFiles = [
  'src/features/auth/ui/login/login-page.tsx',
  'src/features/auth/ui/login/login-form.tsx',
  'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts',
  'src/features/theory-of-change/canvas/ui/components/canvas-header.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-stage-node.tsx',
  'src/features/theory-of-change/canvas/ui/components/canvas-inspector.tsx',
  'src/features/theory-of-change/canvas/ui/canvas-result/canvas-result-view.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-not-found.tsx',
  'src/shared/ui/tdm-status-screen/tdm-route-error.tsx'
];
for (const file of translatedFiles) {
  requireCondition(exists(file), `arquivo traduzido obrigatório ausente: ${file}`);
  if (exists(file)) {
    const source = read(file);
    requireCondition(
      source.includes('useTranslations') || source.includes('getTranslations') || source.includes('runtime.t'),
      `arquivo não consome next-intl/runtime traduzido: ${file}`
    );
  }
}

const forbiddenLegacyCopy = [
  'CANVAS_TOOLTIP_LABELS',
  'CANVAS_FIELD_PLACEHOLDERS',
  'CANVAS_CONNECTION_MESSAGES',
  'getCanvasStageMeta'
];
const roots = ['src/features/theory-of-change/canvas/ui', 'src/features/theory-of-change/canvas/domain'];
for (const sourceRoot of roots) {
  if (!exists(sourceRoot)) continue;
  const stack = [sourceRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
      const relative = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(relative);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name) || /\.(test|e2e)\./.test(entry.name)) continue;
      const source = read(relative);
      for (const forbidden of forbiddenLegacyCopy) {
        requireCondition(!source.includes(forbidden), `copy legado fora do next-intl em ${relative}: ${forbidden}`);
      }
    }
  }
}

if (exists('src/shared/ui/tdm-status-screen/tdm-route-not-found.tsx')) {
  const source = read('src/shared/ui/tdm-status-screen/tdm-route-not-found.tsx');
  requireCondition(source.includes('code="404"'), 'not-found não exibe o código 404 explicitamente');
}
if (exists('src/shared/ui/tdm-status-screen/tdm-route-error.tsx')) {
  const source = read('src/shared/ui/tdm-status-screen/tdm-route-error.tsx');
  requireCondition(!source.includes('code="404"'), 'estado de erro genérico está mascarado como 404');
}

if (errors.length) {
  console.error('\nTDM I18N + ROUTE STATES CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: next-intl no Canvas/Auth e estados 404/erro semanticamente distintos.');
