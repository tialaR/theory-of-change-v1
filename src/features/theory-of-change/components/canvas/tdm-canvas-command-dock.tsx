'use client';

import type { ReactElement } from 'react';
import { Panel } from '@xyflow/react';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import { TdmAnchoredTooltip } from '@/shared/ui/tooltip';
import styles from './tdm-canvas-command-dock.module.sass';

type DockActionId = 'fit' | 'columns' | 'flow' | 'guide' | 'clear';

type TdmCanvasCommandDockProps = {
  isGuideExpanded: boolean;
  isClearDisabled?: boolean;
  onFitView: () => void;
  onCenterColumns: () => void;
  onOrganizeFlow: () => void;
  onToggleGuide: () => void;
  onClearSelection: () => void;
};

const DOCK_ACTIONS: Array<{
  id: DockActionId;
  label: string;
  Icon: () => ReactElement;
}> = [
  {
    id: 'fit',
    label: 'Enquadrar teoria',
    Icon: FitIcon
  },
  {
    id: 'columns',
    label: 'Centralizar colunas',
    Icon: ColumnsIcon
  },
  {
    id: 'flow',
    label: 'Organizar fluxo',
    Icon: FlowIcon
  },
  {
    id: 'guide',
    label: 'Guia da teoria',
    Icon: GuideIcon
  },
  {
    id: 'clear',
    label: 'Limpar seleção',
    Icon: ClearIcon
  }
];

function FitIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <circle cx="8" cy="8" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 2.5v1.5M8 12v1.5M2.5 8H4M12 8h1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="8" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <rect x="2.5" y="3.5" width="2.75" height="9" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="6.625" y="3.5" width="2.75" height="9" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10.75" y="3.5" width="2.75" height="9" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <path
        d="M8 2.5 9.75 6.5H12.5L10.25 8.75l0.75 4L8 10.75 5 12.75l0.75-4L3.5 6.5H6.25L8 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <path
        d="M4 3.75h8a1 1 0 0 1 1 1v8.5L8 11.25 3 13.25V4.75a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.25 6.5h3.5M6.25 8.75h2.25" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function TdmCanvasCommandDock({
  isGuideExpanded,
  isClearDisabled = false,
  onFitView,
  onCenterColumns,
  onOrganizeFlow,
  onToggleGuide,
  onClearSelection
}: TdmCanvasCommandDockProps) {
  const handlers: Record<DockActionId, () => void> = {
    fit: onFitView,
    columns: onCenterColumns,
    flow: onOrganizeFlow,
    guide: onToggleGuide,
    clear: onClearSelection
  };

  return (
    <Panel position="bottom-left" className={styles.panel}>
      <nav className={styles.dock} aria-label="Atalhos do canvas">
        {DOCK_ACTIONS.map((action, index) => {
          const isDisabled = action.id === 'clear' && isClearDisabled;
          const isGuideAction = action.id === 'guide';

          return (
            <span key={action.id} className={styles.buttonWrap}>
              {index === 3 ? <span className={styles.divider} aria-hidden="true" /> : null}
              <TdmAnchoredTooltip content={action.label} preferredPlacements={['right', 'top']}>
                <TdmIconButton
                  aria-label={action.label}
                  aria-pressed={isGuideAction ? isGuideExpanded : undefined}
                  variant={isGuideAction && isGuideExpanded ? 'filled' : 'ghost'}
                  size="sm"
                  disabled={isDisabled}
                  className={[styles.button, isGuideAction && isGuideExpanded ? styles.buttonActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={handlers[action.id]}
                >
                  <action.Icon />
                </TdmIconButton>
              </TdmAnchoredTooltip>
            </span>
          );
        })}
      </nav>
    </Panel>
  );
}
