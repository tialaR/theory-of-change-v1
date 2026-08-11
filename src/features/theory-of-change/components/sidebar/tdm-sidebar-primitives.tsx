import type { RefObject } from 'react';
import { TdmAnchoredTooltip } from '@/shared/ui/tooltip';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import styles from './tdm-sidebar.module.sass';

export function BlockFormGroupHeader({ label, kind }: { label: string; kind: 'create' | 'edit' }) {
  return (
    <div className={styles.blockFormGroupHeader}>
      <TdmSectionIcon variant={kind === 'create' ? 'createBlock' : 'editBlock'} />
      <p className={styles.blockFormGroupTitle}>{label}</p>
    </div>
  );
}

export function AccordionChevron({
  isOpen,
  className,
  accentWhenOpen = false
}: {
  isOpen: boolean;
  className?: string;
  accentWhenOpen?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        styles.sidebarAccordionChevron,
        isOpen ? styles.sidebarAccordionChevronOpen : '',
        accentWhenOpen && isOpen ? styles.sidebarAccordionChevronAccent : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      fill="none"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TimelineChevron({
  isOpen,
  isActive = false,
  isBlocked = false
}: {
  isOpen: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
}) {
  return (
    <span
      className={[
        styles.timelineChevronButton,
        isOpen ? styles.timelineChevronOpen : '',
        isActive && !isBlocked ? styles.timelineChevronActive : '',
        isBlocked ? styles.timelineChevronBlocked : ''
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.timelineChevronIcon} fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function TimelineLockIcon({
  tooltip,
  boundaryRef
}: {
  tooltip: string;
  boundaryRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <TdmAnchoredTooltip content={tooltip} boundaryRef={boundaryRef}>
      <span className={styles.stageLockIcon} aria-label={tooltip} tabIndex={0} role="button">
        <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.stageLockSvg} fill="none">
          <rect x="3.25" y="7" width="9.5" height="6.75" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </TdmAnchoredTooltip>
  );
}

export function DuplicateIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6.5 7v4M9.5 7v4" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4.5 4.5l.5 7.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


export function AdvanceArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M3.5 8h9M9 4.5 12.5 8 9 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Visual-only glyph reused from the existing quickShortcuts connection path. */
export function ConnectLogicIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

