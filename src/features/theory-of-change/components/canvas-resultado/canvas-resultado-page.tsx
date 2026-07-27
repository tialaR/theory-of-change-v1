'use client';

import { useState } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import styles from './canvas-resultado-page.module.sass';

/**
 * Standalone `/canvas/resultado` shell.
 * Active theory export (DOCX/PDF/PNG/SVG) lives on ResultExperience —
 * opened from Canvas via “Visualizar teoria” (TdmResultPreview overlay)
 * and on `/exemplos/resultado/interativo`.
 */
const EXPORT_ACTIONS = [
  { id: 'docx', label: 'Exportar DOCX' },
  { id: 'pdf', label: 'Exportar PDF' },
  { id: 'png', label: 'Exportar PNG' },
  { id: 'svg', label: 'Exportar SVG' }
] as const;

const NO_DIAGRAM_MESSAGE =
  'Abra o resultado a partir do Canvas (Visualizar teoria) para exportar.';

export function CanvasResultadoPage() {
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  return (
    <main className={styles.page} data-canvas-resultado="true">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>Revisão final</p>
            <h1 className={styles.title}>Resultado da sua teoria</h1>
            <p className={styles.subtitle}>
              Revise a síntese das etapas, conexões, riscos e hipóteses antes de exportar.
            </p>
          </div>

          <div className={styles.actions}>
            <TdmButton href="/canvas" variant="tertiary" size="md">
              Voltar ao canvas
            </TdmButton>
            <div className={styles.exportGroup} aria-label="Exportações">
              {EXPORT_ACTIONS.map((action) => (
                <TdmButton
                  key={action.id}
                  type="button"
                  variant="secondary"
                  size="md"
                  title={NO_DIAGRAM_MESSAGE}
                  aria-label={`${action.label} — ${NO_DIAGRAM_MESSAGE}`}
                  onClick={() => setExportMessage(NO_DIAGRAM_MESSAGE)}
                >
                  {action.label}
                </TdmButton>
              ))}
            </div>
          </div>
        </header>

        {exportMessage ? (
          <p className={styles.emptyState} role="status" aria-live="polite">
            {exportMessage}
          </p>
        ) : null}

        <TdmSurface
          as="section"
          variant="raised"
          padding="lg"
          radius="md"
          className={styles.panel}
          aria-label="Painel de resultado"
        >
          <p className={styles.emptyState}>
            Seu resultado aparecerá aqui quando a teoria tiver blocos suficientes. Use Visualizar
            teoria no Canvas para abrir o resultado interativo com exportações DOCX, PDF, PNG e SVG.
          </p>
        </TdmSurface>
      </div>
    </main>
  );
}
