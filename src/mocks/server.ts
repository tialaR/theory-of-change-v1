import { setupServer } from 'msw/node';
import { mockApiHandlers } from './handlers';

const SERVER_STARTED_KEY = Symbol.for('tdm.mock.server.started');
type MockGlobal = typeof globalThis & { [SERVER_STARTED_KEY]?: boolean };

export const mockApiServer = setupServer(...mockApiHandlers);

export function startMockApiServer() {
  const mockGlobal = globalThis as MockGlobal;
  if (mockGlobal[SERVER_STARTED_KEY]) return;

  mockApiServer.listen({ onUnhandledRequest: 'bypass' });
  mockGlobal[SERVER_STARTED_KEY] = true;
}
