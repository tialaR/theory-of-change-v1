import { setupWorker } from 'msw/browser';
import { mockApiHandlers } from './handlers';

export const mockApiWorker = setupWorker(...mockApiHandlers);
