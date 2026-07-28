'use client';

import Image from 'next/image';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

export function CanvasHeader() {
  const runtime = useCanvasRuntime();
  if (runtime.ui.fullCanvasMode) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.brandNavigation}>
        <TdmIconButton
          href="/"
          aria-label={runtime.t('tooltips.back')}
          tooltip={runtime.t('tooltips.back')}
          tooltipPosition="right"
          variant="ghost"
          size="sm"
          className={styles.backButton}
        >
          <span aria-hidden="true">{icons.chevron}</span>
        </TdmIconButton>
        <div className={styles.brandGroup}>
          <Image
            className={styles.brandLogo}
            src="/brand/tmd-construtor-header-canonical.webp"
            alt="TMD Construtor"
            width={200}
            height={43}
            priority
          />
        </div>
      </div>

      <ClearableField
        value={runtime.ui.projectTitle}
        onClear={() => runtime.ui.setProjectTitle('')}
        label={runtime.t('project.clearTitle')}
        editLabel={runtime.t('project.editTitle')}
        showEditWhenIdle
      >
        <input
          className={styles.projectTitle}
          aria-label={runtime.t('project.titleLabel')}
          value={runtime.ui.projectTitle}
          onChange={(event) => {
            runtime.ui.setProjectTitle(event.target.value);
            runtime.ui.setSaveState('dirty');
          }}
          maxLength={96}
          placeholder={runtime.t('project.titlePlaceholder')}
        />
      </ClearableField>

      <div className={styles.topActions}>
        <button type="button" className={styles.headerIconButton} onClick={runtime.undo} disabled={!runtime.flow.canUndo} data-tooltip={runtime.t('tooltips.undo')}>
          {icons.undo}
        </button>
        <button type="button" className={styles.headerIconButton} onClick={runtime.redo} disabled={!runtime.flow.canRedo} data-tooltip={runtime.t('tooltips.redo')}>
          {icons.redo}
        </button>
        <button type="button" className={styles.headerActionButton} onClick={() => runtime.ui.setHistoryOpen((value) => !value)} data-active={runtime.ui.historyOpen} data-tooltip={runtime.t('tooltips.history')}>
          {icons.history}<span>{runtime.t('header.history')}</span>
        </button>
        <button type="button" className={`${styles.headerActionButton} ${styles.resultButton}`} onClick={runtime.openResult} aria-label={runtime.t('tooltips.result')} data-tooltip={runtime.t('tooltips.result')}>
          <span className={styles.eyeIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M2.8 12s3.3-5.4 9.2-5.4S21.2 12 21.2 12 17.9 17.4 12 17.4 2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.4" /></svg>
          </span>
          <span>{runtime.t('header.result')}</span>
        </button>
        <button type="button" className={`${styles.headerActionButton} ${styles.saveButton}`} onClick={runtime.save} aria-label={runtime.t('tooltips.save')} data-tooltip={runtime.t('tooltips.save')}>
          {icons.save}<span>{runtime.t('header.save')}</span>
        </button>
      </div>
    </header>
  );
}
