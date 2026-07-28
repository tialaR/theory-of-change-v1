'use client';

import { useMemo, useState } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import { createCanvasResultStageSummary } from './canvas-result-summary';
import styles from './canvas-resultado-page.module.sass';
import { useCanvasResultProject } from './use-canvas-result-project';

const EXPORT_ACTIONS = [
  { id: 'docx', label: 'Exportar DOCX' },
  { id: 'pdf', label: 'Exportar PDF' },
  { id: 'png', label: 'Exportar PNG' },
  { id: 'svg', label: 'Exportar SVG' }
] as const;

const EXPORT_PENDING_MESSAGE = 'A exportação será conectada após a validação final do resultado.';

export function CanvasResultadoPage() {
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const result = useCanvasResultProject();
  const stageSummary = useMemo(
    () => result.project ? createCanvasResultStageSummary(result.project) : [],
    [result.project]
  );

  return (
    <main className={styles.page} data-canvas-resultado="true">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>Revisão final</p>
            <h1 className={styles.title}>{result.project?.title ?? 'Resultado da sua teoria'}</h1>
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
                  onClick={() => setExportMessage(EXPORT_PENDING_MESSAGE)}
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

        {result.status === 'loading' ? (
          <TdmSurface as="section" variant="raised" padding="lg" radius="md" className={styles.panel}>
            <p className={styles.emptyState}>Carregando teoria salva…</p>
          </TdmSurface>
        ) : null}

        {result.status === 'empty' || result.status === 'error' ? (
          <TdmSurface as="section" variant="raised" padding="lg" radius="md" className={styles.panel}>
            <p className={styles.emptyState}>
              {result.status === 'empty'
                ? 'Salve a teoria no Canvas antes de abrir o resultado.'
                : 'Não foi possível recuperar a teoria salva. Volte ao Canvas e tente novamente.'}
            </p>
          </TdmSurface>
        ) : null}

        {result.status === 'ready' ? (
          <section className={styles.resultGrid} aria-label="Síntese da teoria">
            <div className={styles.summaryGrid}>
              {stageSummary.map((item) => (
                <TdmSurface
                  key={item.stage}
                  as="article"
                  variant="raised"
                  padding="md"
                  radius="md"
                  className={styles.summaryCard}
                >
                  <span className={styles.summaryValue}>{item.count}</span>
                  <span className={styles.summaryLabel}>{item.label}</span>
                </TdmSurface>
              ))}
            </div>

            <TdmSurface as="section" variant="raised" padding="lg" radius="md" className={styles.projectPanel}>
              <div className={styles.projectMeta}>
                <span>{result.project.nodes.length} blocos</span>
                <span>{result.project.connections.length} conexões</span>
                <span>Revisão {result.project.revision}</span>
              </div>

              <div className={styles.stageLists}>
                {stageSummary.map((summary) => {
                  const nodes = result.project.nodes.filter((node) => node.stage === summary.stage);
                  return (
                    <section key={summary.stage} className={styles.stageSection}>
                      <h2>{summary.label}</h2>
                      {nodes.length ? (
                        <ul>
                          {nodes.map((node) => (
                            <li key={node.id}>
                              <strong>{node.title}</strong>
                              <span>{node.description}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Nenhum bloco adicionado.</p>
                      )}
                    </section>
                  );
                })}
              </div>
            </TdmSurface>
          </section>
        ) : null}
      </div>
    </main>
  );
}
