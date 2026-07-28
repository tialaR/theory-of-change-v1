#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const requiredFiles = [
  'src/instrumentation.ts',
  'src/mocks/handlers.ts',
  'src/mocks/server.ts',
  'src/mocks/browser.ts',
  'src/features/auth/index.ts',
  'src/features/auth/auth-page.tsx',
  'src/features/auth/server/login.action.ts',
  'src/features/auth/application/login-action-state.ts',
  'src/features/auth/server/auth-session.ts',
  'src/features/auth/infrastructure/msw/auth.mock-store.ts',
  'src/features/auth/infrastructure/msw/auth.handlers.ts',
  'src/features/auth/infrastructure/http/http-auth.repository.ts',
  'src/features/auth/ui/login/login-page.tsx',
  'src/features/auth/ui/login/login-form.tsx',
  'src/features/theory-of-change/canvas/server/save-canvas-project.action.ts',
  'src/features/theory-of-change/canvas/server/get-current-canvas-project.ts',
  'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.mock-store.ts',
  'src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.ts',
  'src/features/theory-of-change/canvas/infrastructure/http/http-canvas-project.repository.ts'
];
requiredFiles.forEach((file) => requireCondition(exists(file), `arquivo auth/MSW obrigatório ausente: ${file}`));

if (exists('src/features/auth/server/login.action.ts')) {
  const source = read('src/features/auth/server/login.action.ts');
  requireCondition(source.startsWith("'use server';"), 'login.action.ts não declara fronteira use server');
  requireCondition(!/export\s+(?:const|let|var|class|type|interface)\s+/.test(source), 'arquivo use server exporta estado, constante, classe ou tipo síncrono');
  requireCondition(source.includes('export async function loginAction'), 'login.action.ts não exporta Server Action assíncrona');
  requireCondition(!source.includes('INITIAL_LOGIN_ACTION_STATE'), 'estado inicial do login vazou para a fronteira use server');
}

if (exists('src/features/auth/application/login-action-state.ts')) {
  const source = read('src/features/auth/application/login-action-state.ts');
  requireCondition(source.includes('export type LoginActionState'), 'contrato de estado do login ausente na camada application');
  requireCondition(source.includes('export const INITIAL_LOGIN_ACTION_STATE'), 'estado inicial do login ausente na camada application');
}

if (exists('src/features/auth/ui/login/login-form.tsx')) {
  const source = read('src/features/auth/ui/login/login-form.tsx');
  requireCondition(source.includes("from '../../application/login-action-state'"), 'LoginForm não consome o estado pela camada application');
  requireCondition(source.includes('state ?? INITIAL_LOGIN_ACTION_STATE'), 'LoginForm não possui fallback defensivo para o estado da action');
}

if (exists('src/instrumentation.ts')) {
  const source = read('src/instrumentation.ts');
  requireCondition(source.includes("process.env.NEXT_RUNTIME !== 'nodejs'"), 'instrumentation não limita MSW ao runtime Node');
  requireCondition(source.includes("import('./mocks/server')"), 'instrumentation não inicializa o MSW Node dinamicamente');
}

if (exists('src/mocks/server.ts')) {
  const source = read('src/mocks/server.ts');
  requireCondition(source.includes('setupServer'), 'MSW Node não usa setupServer');
  requireCondition(source.includes('Symbol.for'), 'MSW Node não possui trava idempotente por processo');
}

if (exists('src/mocks/browser.ts')) {
  requireCondition(read('src/mocks/browser.ts').includes('setupWorker'), 'MSW browser não usa setupWorker');
}

if (exists('src/mocks/handlers.ts')) {
  const source = read('src/mocks/handlers.ts');
  requireCondition(source.includes('authHandlers'), 'handlers globais não incluem autenticação');
  requireCondition(source.includes('canvasProjectHandlers'), 'handlers globais não incluem projetos Canvas');
}

if (exists('src/features/auth/infrastructure/msw/auth.mock-store.ts')) {
  const source = read('src/features/auth/infrastructure/msw/auth.mock-store.ts');
  for (const value of [
    'Tiala Rocha',
    'tialarocha@tdmconstrutor.com.br',
    'Rodger Rocha',
    'rodgerrocha@tdmconstrutor.com.br',
    'tdm123456',
    'Symbol.for(\'tdm.mock.auth.sessions\')'
  ]) requireCondition(source.includes(value), `persona ou store auth ausente: ${value}`);
}

if (exists('src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.mock-store.ts')) {
  const source = read('src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.mock-store.ts');
  requireCondition(source.includes("Symbol.for('tdm.mock.canvas.projects-by-owner')"), 'Canvas store não usa chave global estável por processo');
  requireCondition(source.includes('Map<string, Map<string, CanvasProject>>'), 'Canvas não está particionado por ownerId e projectId');
  for (const method of ['list(', 'read(', 'create(', 'replace(', 'patch(', 'delete(']) {
    requireCondition(source.includes(method), `store Canvas sem operação ${method}`);
  }
}

if (exists('src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.ts')) {
  const source = read('src/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers.ts');
  for (const method of ['http.get(', 'http.post(', 'http.put(', 'http.patch(', 'http.delete(']) {
    requireCondition(source.includes(method), `API mock Canvas sem método ${method}`);
  }
  requireCondition(source.includes(':ownerId'), 'API mock Canvas não possui ownerId na rota');
  requireCondition(source.includes(':projectId'), 'API mock Canvas não possui projectId na rota');
}

if (exists('src/features/auth/server/auth-session.ts')) {
  const source = read('src/features/auth/server/auth-session.ts');
  requireCondition(source.includes('httpOnly: true'), 'cookie de sessão não é httpOnly');
  requireCondition(source.includes("sameSite: 'lax'"), 'cookie de sessão não define sameSite');
  requireCondition(source.includes('redirect(`/login?returnTo='), 'Canvas não redireciona server-side para login');
}

if (exists('src/features/theory-of-change/canvas/ui/hooks/use-canvas-project-persistence.ts')) {
  const source = read('src/features/theory-of-change/canvas/ui/hooks/use-canvas-project-persistence.ts');
  requireCondition(source.includes('saveCanvasProjectAction'), 'persistência oficial do Canvas não usa Server Action');
  requireCondition(!source.includes('createHttpCanvasProjectRepository'), 'client do Canvas chama repository HTTP diretamente');
}

for (const file of [
  'src/features/auth',
  'src/features/theory-of-change/canvas',
  'src/app/login',
  'src/app/canvas'
]) {
  if (!exists(file)) continue;
  const stack = [file];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
      const relative = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(relative);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = read(relative);
      for (const forbidden of ['localStorage', 'sessionStorage']) {
        requireCondition(!source.includes(forbidden), `persistência browser proibida em ${relative}: ${forbidden}`);
      }
    }
  }
}

if (errors.length) {
  console.error('\nTDM AUTH + MSW CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS: autenticação, personas, MSW Node/browser e Canvas por usuário íntegros.');
