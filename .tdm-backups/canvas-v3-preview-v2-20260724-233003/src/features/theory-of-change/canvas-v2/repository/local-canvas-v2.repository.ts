import { MOCK_NETWORK_DELAY_MS } from '../domain/canvas-v2.constants';
import type { CanvasDocument } from '../domain/canvas-v2.types';
import type { CanvasV2Repository } from './canvas-v2.repository';

function wait(delay: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, delay));
}

function storageKey(documentId: string) {
  return `tdm:canvas-v2:${documentId}`;
}

export class LocalCanvasV2Repository implements CanvasV2Repository {
  async load(documentId: string) {
    await wait(MOCK_NETWORK_DELAY_MS);
    const stored = window.localStorage.getItem(storageKey(documentId));
    if (!stored) return null;
    return JSON.parse(stored) as CanvasDocument;
  }

  async save(document: CanvasDocument) {
    await wait(MOCK_NETWORK_DELAY_MS);
    const saved = { ...document, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(storageKey(document.id), JSON.stringify(saved));
    return saved;
  }
}
