#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const files = {
  types: 'src/features/auth/domain/auth.types.ts',
  constants: 'src/features/auth/domain/auth.constants.ts',
  store: 'src/features/auth/infrastructure/msw/auth.mock-store.ts',
  handlers: 'src/features/auth/infrastructure/msw/auth.handlers.ts',
  http: 'src/features/auth/infrastructure/http/http-auth.repository.ts',
  action: 'src/features/auth/server/demo-login.action.ts',
  login: 'src/features/auth/ui/login/login-page.tsx',
  badge: 'src/features/auth/ui/demo-mode-badge/demo-mode-badge.tsx',
  isolationTest: 'src/features/auth/infrastructure/msw/demo-session-isolation.test.ts'
};

for (const [label, file] of Object.entries(files)) {
  requireCondition(fs.existsSync(path.join(root, file)), `demo contract file missing (${label}): ${file}`);
}

if (errors.length === 0) {
  const types = read(files.types);
  const constants = read(files.constants);
  const store = read(files.store);
  const handlers = read(files.handlers);
  const action = read(files.action);
  const login = read(files.login);
  const badge = read(files.badge);
  const isolationTest = read(files.isolationTest);

  requireCondition(types.includes("accessMode?: 'standard' | 'demo'"), 'AuthUser does not model demo access mode');
  requireCondition(types.includes('createDemoSession(): Promise<AuthenticatedSession>'), 'AuthRepository lacks createDemoSession');
  requireCondition(constants.includes("AUTH_SESSION_DURATION_SECONDS = 60 * 60 * 24"), '24h session TTL changed');
  requireCondition(constants.includes("AUTH_DEMO_API_PATH = '/api/v1/auth/demo-sessions'"), 'versioned demo endpoint missing');
  requireCondition(store.includes('demo-user-${identity}'), 'demo owner is not unique per visitor');
  requireCondition(store.includes("accessMode: 'demo'"), 'demo identity marker missing');
  requireCondition(store.includes('removeDemoUser'), 'expired/deleted demo users are not cleaned up');
  requireCondition(handlers.includes('demoCollectionEndpoint'), 'MSW demo handler missing');
  requireCondition(action.includes('createDemoSession()'), 'demo server action bypasses repository boundary');
  requireCondition(action.includes('writeAuthSessionCookie'), 'demo server action does not establish protected session');
  requireCondition(login.includes("t('demo.submit')"), 'one-click demo CTA missing from login');
  requireCondition(badge.includes("user.accessMode !== 'demo'"), 'demo mode badge is not derived from authenticated user');
  requireCondition(isolationTest.includes('not.toBe(demoB.user.id)'), 'A/B demo identity regression assertion missing');
  requireCondition(isolationTest.includes('Canvas A'), 'A/B Canvas ownership regression assertion missing');

  const canvasRoot = path.join(root, 'src/features/theory-of-change/canvas');
  const forbidden = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const source = fs.readFileSync(full, 'utf8');
        if (/accessMode\s*===\s*['"]demo['"]|demo-user-|createDemoSession/.test(source)) {
          forbidden.push(path.relative(root, full));
        }
      }
    }
  };
  walk(canvasRoot);
  requireCondition(forbidden.length === 0, `demo branching leaked into Canvas feature: ${forbidden.join(', ')}`);
}

if (errors.length) {
  console.error('\nTDM DEMO ACCESS CONTRACT: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS TDM Demo Access: Canvas remains protected, demo identity is isolated per visitor, TTL stays 24h, auth/session owns demo behavior and Canvas has no demo branching.');
