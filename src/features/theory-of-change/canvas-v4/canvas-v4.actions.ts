'use server';

import type { CanvasDocument } from './canvas-v4.model';

export async function saveCanvasV4(document: CanvasDocument) {
  await new Promise((resolve) => setTimeout(resolve, 420));
  return {
    ...document,
    updatedAt: new Date().toISOString()
  };
}
