import { authHandlers } from '@/features/auth/infrastructure/msw/auth.handlers';
import { canvasProjectHandlers } from '@/features/theory-of-change/canvas/infrastructure/msw/canvas-project.handlers';

export const mockApiHandlers = [...authHandlers, ...canvasProjectHandlers];
