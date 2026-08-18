#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};

const files = {
  route: 'src/app/cadastro/page.tsx',
  pageOwner: 'src/features/auth/registration-page.tsx',
  application: 'src/features/auth/application/attempt-user-registration.ts',
  action: 'src/features/auth/server/register.action.ts',
  form: 'src/features/auth/ui/register/register-form.tsx',
  page: 'src/features/auth/ui/register/register-page.tsx',
  e2e: 'src/features/auth/ui/register/register.e2e.ts',
  isolation: 'src/features/auth/infrastructure/msw/registration-isolation.test.ts',
  types: 'src/features/auth/domain/auth.types.ts',
  constants: 'src/features/auth/domain/auth.constants.ts',
  store: 'src/features/auth/infrastructure/msw/auth.mock-store.ts',
  handlers: 'src/features/auth/infrastructure/msw/auth.handlers.ts',
  http: 'src/features/auth/infrastructure/http/http-auth.repository.ts',
  publicRoutes: 'src/features/theory-of-change/public-routes.e2e.ts',
  publicRunner: 'scripts/playwright/run-public-routes-e2e.mjs'
};

for (const [label, file] of Object.entries(files)) {
  requireCondition(exists(file), `registration contract file missing (${label}): ${file}`);
}

if (failures.length === 0) {
  const types = read(files.types);
  const constants = read(files.constants);
  const store = read(files.store);
  const handlers = read(files.handlers);
  const http = read(files.http);
  const action = read(files.action);
  const publicRoutes = read(files.publicRoutes);
  const publicRunner = read(files.publicRunner);
  const e2e = read(files.e2e);

  requireCondition(types.includes('registerUser(credentials: AuthCredentials)'), 'AuthRepository does not own registration');
  requireCondition(constants.includes("AUTH_REGISTRATION_API_PATH = '/api/v1/auth/registrations'"), 'versioned registration endpoint missing');
  requireCondition(store.includes('registerUser(credentials: AuthCredentials)'), 'mock store does not own registered-user creation');
  requireCondition(store.includes('normalizedEmail'), 'registration does not normalize e-mail identity');
  requireCondition(handlers.includes('registrationEndpoint'), 'MSW registration handler missing');
  requireCondition(http.includes('AUTH_REGISTRATION_API_PATH'), 'HTTP repository bypasses versioned registration endpoint');
  requireCondition(action.includes('attemptUserRegistration'), 'server action bypasses application boundary');
  requireCondition(action.includes('writeAuthSessionCookie'), 'successful registration does not establish protected auth session');
  requireCondition(publicRoutes.includes("'/cadastro'"), '/cadastro is not protected as an explicit public route');
  requireCondition(publicRunner.includes('src/features/auth/ui/register/register.e2e.ts'), 'public harness does not include registration E2E');
  requireCondition(e2e.includes("toHaveURL(/\\/canvas$/)"), 'registration E2E does not prove protected Canvas entry');
  requireCondition(e2e.includes("async ({ browser })"), 'duplicate-email E2E does not isolate browser contexts');
  requireCondition(!e2e.includes("name: 'Sair'"), 'registration E2E is coupled to logout/user-menu behavior');
  requireCondition(!e2e.includes("getByRole('alert')"), 'registration E2E uses a broad alert selector that collides with Next route announcer');
  requireCondition(e2e.includes("Este e-mail já está cadastrado. Entre com sua conta existente."), 'duplicate-email E2E does not assert the product message directly');
  requireCondition(constants.includes('AUTH_SESSION_DURATION_SECONDS = 60 * 60 * 24'), 'registered session TTL diverged from 24h auth policy');

  const canvasRoot = path.join(root, 'src/features/theory-of-change/canvas');
  const forbidden = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const source = fs.readFileSync(absolute, 'utf8');
        if (/registerUser|AUTH_REGISTRATION_API_PATH|registration-page|\/cadastro/.test(source)) {
          forbidden.push(path.relative(root, absolute));
        }
      }
    }
  };
  walk(canvasRoot);

  requireCondition(forbidden.length === 0, `registration leaked into Canvas feature: ${forbidden.join(', ')}`);
}

if (failures.length) {
  console.error('\nTDM REGISTRATION CONTRACT: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}.`));
  process.exit(1);
}

console.log('PASS TDM Registration: /cadastro is public, registration stays inside auth/session/repository boundaries, successful signup creates its own authenticated owner and Canvas remains registration-agnostic.');
