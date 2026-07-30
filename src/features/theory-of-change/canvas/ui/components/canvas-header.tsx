'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import type { AuthUser } from '@/features/auth/domain/auth.types';
import { UserMenu } from '@/features/auth/ui/user-menu/user-menu';
import { canvasIcons as icons } from '../canvas-icons';
import styles from '../canvas-workspace/canvas-workspace.module.sass';
import { useCanvasRuntime } from '../runtime/canvas-runtime-context';
import { ClearableField } from './clearable-field';

export function CanvasHeader({ user }: { user: AuthUser }) {
  const runtime = useCanvasRuntime();
  return (
    <motion.header
      className={styles.topbar}
      initial={false}
      animate={{ opacity: runtime.ui.fullCanvasMode ? 0 : 1, y: runtime.ui.fullCanvasMode ? -18 : 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={runtime.ui.fullCanvasMode}
    >
      <div className={styles.brandNavigation}>
        <TdmIconButton
          aria-label={runtime.t('tooltips.back')}
          tooltip={runtime.t('tooltips.back')}
          tooltipPosition="right"
          variant="ghost"
          size="sm"
          className={styles.backButton}
          onClick={() => void runtime.openHome()}
        >
          <span aria-hidden="true">{icons.chevron}</span>
        </TdmIconButton>
        <div className={styles.brandGroup}>
          <Image
            className={styles.brandLogo}
            src="/brand/tmd-construtor-header-canonical.webp"
            alt={runtime.t('brand.alt')}
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
            runtime.ui.markDirty();
          }}
          maxLength={96}
          placeholder={runtime.t('project.titlePlaceholder')}
        />
      </ClearableField>

      <div className={styles.topActions}>
        <button type="button" className={styles.headerIconButton} onClick={runtime.undo} disabled={!runtime.flow.canUndo} data-tooltip={runtime.t('tooltips.undo')} title={runtime.t('tooltips.undo')} aria-label={runtime.t('tooltips.undo')}>
          {icons.undo}
        </button>
        <button type="button" className={styles.headerIconButton} onClick={runtime.redo} disabled={!runtime.flow.canRedo} data-tooltip={runtime.t('tooltips.redo')} title={runtime.t('tooltips.redo')} aria-label={runtime.t('tooltips.redo')}>
          {icons.redo}
        </button>
        <button type="button" className={styles.headerActionButton} data-history-trigger onClick={() => runtime.ui.setHistoryOpen((value) => !value)} data-active={runtime.ui.historyOpen} data-tooltip={runtime.t('tooltips.history')} title={runtime.t('tooltips.history')} aria-label={runtime.t('tooltips.history')}>
          {icons.history}
        </button>
        <button type="button" className={`${styles.headerActionButton} ${styles.resultButton}`} onClick={runtime.openResult} aria-label={runtime.t('tooltips.result')} data-tooltip={runtime.t('tooltips.result')}>
          <span className={styles.eyeIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M2.8 12s3.3-5.4 9.2-5.4S21.2 12 21.2 12 17.9 17.4 12 17.4 2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.4" /></svg>
          </span>

        </button>
        <button type="button" className={`${styles.headerActionButton} ${styles.saveButton}`} onClick={() => void runtime.save()} aria-label={runtime.t('tooltips.save')} data-tooltip={runtime.t('tooltips.save')} data-save-state={runtime.ui.saveState} aria-busy={runtime.ui.saveState === 'saving'} disabled={runtime.ui.saveState === 'saving'}>
          {icons.save}
        </button>
        <UserMenu initialUser={user} />
      </div>
    </motion.header>
  );
}
