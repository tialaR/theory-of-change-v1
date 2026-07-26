'use client';

import { useEffect, useRef, useState } from 'react';
import { AUTOSAVE_DELAY_MS } from '../domain/canvas-v2.constants';
import type { CanvasDocument, SaveStatus } from '../domain/canvas-v2.types';
import type { CanvasV2Repository } from '../repository/canvas-v2.repository';

export function useCanvasAutosave(document: CanvasDocument, enabled: boolean, repository: CanvasV2Repository) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const previousSerialized = useRef(JSON.stringify(document));
  const mounted = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!mounted.current) {
      mounted.current = true;
      previousSerialized.current = JSON.stringify(document);
      return;
    }

    const serialized = JSON.stringify(document);
    if (serialized === previousSerialized.current) return;
    setStatus('dirty');

    const timeout = window.setTimeout(async () => {
      try {
        setStatus('saving');
        const saved = await repository.save(document);
        previousSerialized.current = JSON.stringify(saved);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [document, enabled, repository]);

  return status;
}
