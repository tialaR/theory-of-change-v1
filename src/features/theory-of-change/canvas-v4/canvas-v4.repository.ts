import type { CanvasDocument } from './canvas-v4.model';

const STORAGE_KEY = 'tdm:canvas-v4:document';

export interface CanvasV4Repository {
  read(): CanvasDocument | null;
  write(document: CanvasDocument): void;
}

export class BrowserCanvasV4Repository implements CanvasV4Repository {
  read() {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as CanvasDocument;
    } catch {
      return null;
    }
  }

  write(document: CanvasDocument) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }
}
