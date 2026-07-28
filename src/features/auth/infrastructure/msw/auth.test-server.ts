import { setupServer } from 'msw/node';
import { authHandlers } from './auth.handlers';

export const authTestServer = setupServer(...authHandlers);
