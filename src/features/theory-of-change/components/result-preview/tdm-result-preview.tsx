'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TdmEdge, TdmNode } from '../../domain/tdm-types';
import { ResultExperience } from '../result-view/result-experience';
import styles from './tdm-result-preview.module.sass';

export type TdmResultPreviewProps = {
  open: boolean;
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  onClose: () => void;
};

/**
 * Fullscreen result overlay for /canvas.
 * Reuses ResultExperience (same tree as /exemplos/resultado/interativo).
 */
export function TdmResultPreview({
  open,
  title,
  description,
  nodes,
  edges,
  onClose
}: TdmResultPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      // Translator owns Escape while expanded; do not close the canvas overlay.
      if (document.querySelector('[data-translator-expanded="true"]')) {
        return;
      }

      event.preventDefault();
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado da sua teoria"
    >
      <ResultExperience
        mode="canvas-preview"
        viewModel={{ title, description, nodes, edges }}
        backLabel="Voltar ao canvas"
        onBack={onClose}
        onClose={onClose}
      />
    </div>,
    document.body
  );
}
