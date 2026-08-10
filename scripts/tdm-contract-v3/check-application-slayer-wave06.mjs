import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const applicationDir = path.join(root, 'src/features/auth/application');
const attemptFile = path.join(applicationDir, 'attempt-user-login.ts');
const actionFile = path.join(root, 'src/features/auth/server/login.action.ts');
const stateFile = path.join(applicationDir, 'login-action-state.ts');

function fail(message) {
  console.error(`FAIL SO-010 Application Slayer Wave 06: ${message}`);
  process.exit(1);
}

for (const file of [attemptFile, actionFile, stateFile]) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
}

const attempt = fs.readFileSync(attemptFile, 'utf8');
const action = fs.readFileSync(actionFile, 'utf8');
const state = fs.readFileSync(stateFile, 'utf8');

for (const forbidden of ['react', 'next/', 'next-intl', 'FormData', "'use server'", "'use client'"]) {
  if (attempt.includes(forbidden)) fail(`Application login use case contains forbidden adapter dependency: ${forbidden}`);
}

if (!attempt.includes("status: 'invalid-fields'")) fail('missing invalid-fields result contract');
if (!attempt.includes("status: 'invalid-credentials'")) fail('missing invalid-credentials result contract');
if (!attempt.includes("status: 'authenticated'")) fail('missing authenticated result contract');
if (!attempt.includes('validateAuthCredentials')) fail('Application does not own login validation orchestration');
if (!attempt.includes('authenticateUser')) fail('Application does not own authentication orchestration');

if (!action.includes('attemptUserLogin')) fail('server action does not delegate to Application login use case');
if (action.includes('validateAuthCredentials(')) fail('server action still owns credential validation');
if (action.includes('authenticateUser(')) fail('server action still owns authentication orchestration');

for (const forbidden of ['next/', 'next-intl', 'FormData', "'use server'", "'use client'"]) {
  if (state.includes(forbidden)) fail(`login action state DTO contains forbidden adapter dependency: ${forbidden}`);
}

console.log('PASS SO-010 Application Slayer Wave 06: Auth validation and authentication outcomes are owned by Application while localization, cookies and redirects remain in the server adapter.');
