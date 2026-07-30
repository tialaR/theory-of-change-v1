'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@/features/auth/domain/auth.types';
import { UserMenu } from '@/features/auth/ui/user-menu/user-menu';
import type { CanvasProject } from '../../domain/canvas-project';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmSurface } from '@/shared/ui/tdm-surface/tdm-surface';
import { createCanvasResultStageSummary } from './canvas-result-summary';
import styles from './canvas-result.module.sass';

const EXPORT_ACTION_IDS = ['docx', 'pdf', 'png', 'svg'] as const;

export function CanvasResultView({ project, user }: { project: CanvasProject; user: AuthUser }) {
  const t = useTranslations('Canvas');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const stageSummary = useMemo(() => createCanvasResultStageSummary(project), [project]);

  return (
    <main className={styles.page} data-canvas-resultado="true">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>{t('result.kicker')}</p>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.subtitle}>{t('result.subtitle')}</p>
          </div>

          <div className={styles.actions}>
            <TdmButton href="/canvas" variant="tertiary" size="md">{t('result.back')}</TdmButton>
            <div className={styles.exportGroup} aria-label={t('result.exports')}>
              {EXPORT_ACTION_IDS.map((id) => (
                <TdmButton key={id} type="button" variant="secondary" size="md" onClick={() => setExportMessage(t('result.exportPending'))}>
                  {t(`result.export${id.toUpperCase()}`)}
                </TdmButton>
              ))}
            </div>
            <UserMenu initialUser={user} />
          </div>
        </header>

        {exportMessage ? <p className={styles.emptyState} role="status">{exportMessage}</p> : null}

        <section className={styles.resultGrid} aria-label={t('result.summary')}>
          <div className={styles.summaryGrid}>
            {stageSummary.map((item) => (
              <TdmSurface key={item.stage} as="article" variant="raised" padding="md" radius="md" className={styles.summaryCard}>
                <span className={styles.summaryValue}>{item.count}</span>
                <span className={styles.summaryLabel}>{t(`stages.${item.stage}.label`)}</span>
              </TdmSurface>
            ))}
          </div>

          <TdmSurface as="section" variant="raised" padding="lg" radius="md" className={styles.projectPanel}>
            <div className={styles.projectMeta}>
              <span>{t('result.blocks', { count: project.nodes.length })}</span>
              <span>{t('result.connections', { count: project.connections.length })}</span>
              <span>{t('result.revision', { revision: project.revision })}</span>
            </div>

            <div className={styles.stageLists}>
              {stageSummary.map((summary) => {
                const nodes = project.nodes.filter((node) => node.stage === summary.stage);
                return (
                  <section key={summary.stage} className={styles.stageSection}>
                    <h2>{t(`stages.${summary.stage}.label`)}</h2>
                    {nodes.length ? (
                      <ul>{nodes.map((node) => <li key={node.id}><strong>{node.title}</strong><span>{node.description}</span></li>)}</ul>
                    ) : <p>{t('result.emptyStage')}</p>}
                  </section>
                );
              })}
            </div>
          </TdmSurface>
        </section>
      </div>
    </main>
  );
}
