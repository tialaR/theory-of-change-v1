import { setupWorker } from 'msw/browser';
import { canvasProjectHandlers } from './canvas-project.handlers';

export const canvasProjectWorker = setupWorker(...canvasProjectHandlers);
