#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

const serverRepositoryPath = 'src/features/auth/server/auth-server.repository.ts';
const serverRepositoryTestPath = 'src/features/auth/server/auth-server.repository.test.ts';

requireCondition(exists(serverRepositoryPath), `server auth repository ausente: ${serverRepositoryPath}`);
requireCondition(exists(serverRepositoryTestPath), `teste da fronteira server auth ausente: ${serverRepositoryTestPath}`);

if (exists(serverRepositoryPath)) {
  const source = read(serverRepositoryPath);
  requireCondition(
    source.includes("from '../infrastructure/http/http-auth.repository'"),
    'server auth repository não depende da infraestrutura HTTP oficial'
  );
  requireCondition(
    source.includes('createHttpAuthRepository({ baseUrl: TDM_MOCK_API_ORIGIN })'),
    'server auth repository não usa a origem mock canônica através do repository HTTP'
  );
  requireCondition(
    !source.includes('auth.mock-store') && !source.includes('authMockStore'),
    'server auth repository voltou a acessar o mock store diretamente'
  );
}

if (exists(serverRepositoryTestPath)) {
  const source = read(serverRepositoryTestPath);
  requireCondition(source.includes('createServerAuthRepository'), 'teste não exercita a factory server oficial');
  requireCondition(source.includes('createHttpAuthRepositoryMock'), 'teste não prova a composição do repository HTTP oficial');
  requireCondition(source.includes('TDM_MOCK_API_ORIGIN'), 'teste não congela a origem mock canônica');
  requireCondition(source.includes('toHaveBeenCalledExactlyOnceWith'), 'teste não verifica a composição exata da fronteira server');
}


if (exists('src/features/auth/server')) {
  const stack = ['src/features/auth/server'];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(path.join(root, current), { withFileTypes: true })) {
      const relative = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(relative);
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      if (relative.endsWith('.test.ts') || relative.endsWith('.test.tsx')) continue;
      const source = read(relative);
      requireCondition(
        !source.includes('infrastructure/msw/auth.mock-store') && !source.includes('authMockStore'),
        `fronteira server auth acessa store MSW diretamente: ${relative}`
      );
    }
  }
}

if (errors.length) {
  console.error('\nSO-016 WAVE 02 AUTH SERVER REPOSITORY BOUNDARY: FAIL\n');
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}.`));
  process.exit(1);
}

console.log('PASS SO-016 Wave 02: server Auth repository crosses the canonical HTTP/MSW boundary and direct mock-store access is forbidden in server runtime code.');
