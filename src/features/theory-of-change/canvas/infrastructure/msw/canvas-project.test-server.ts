import { setupServer } from 'msw/node';
import { canvasProjectHandlers } from './canvas-project.handlers';

export const canvasProjectTestServer = setupServer(...canvasProjectHandlers);
