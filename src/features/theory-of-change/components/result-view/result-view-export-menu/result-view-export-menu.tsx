'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EXPORT_FORMAT_OPTIONS, type ExportFormatOption, type ResultExportFormat } from '../result-view-utils';
import { TdmGlassSurface } from '../tdm-glass-surface';
import styles from '../result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

function ExportFormatIcon({ format }: { format: ResultExportFormat }) {
  switch (format) {
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'png':
    case 'jpeg':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <path d="m5.5 17 4.5-4 3 2.5 2.5-2 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'svg':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path d="M5 5h9l5 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 5v5h5M8 14.5h8M8 17.5h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'word':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportOptionIcon}>
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 12.5 10 17l1.5-3 1.5 3 1.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function ExportMenuOption({ option, onExport }: { option: ExportFormatOption; onExport: (format: ResultExportFormat) => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[styles.exportOption, option.available ? '' : styles.exportOptionDisabled].filter(Boolean).join(' ')}
      disabled={!option.available}
      onClick={() => option.available && onExport(option.id)}
    >
      <ExportFormatIcon format={option.id} />
      <span className={styles.exportOptionCopy}>
        <span className={styles.exportOptionLabel}>{option.label}</span>
        <span className={styles.exportOptionDescription}>
          {option.available ? option.description : option.unavailableNote ?? option.description}
        </span>
      </span>
    </button>
  );
}

export function ResultViewExportMenu({
  isOpen,
  onToggle,
  onClose,
  onExport,
  shouldReduceMotion,
  isExporting = false
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onExport: (format: ResultExportFormat) => void | Promise<void>;
  shouldReduceMotion: boolean | null;
  isExporting?: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTransition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.24, ease: PREMIUM_EASE };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  return (
    <div className={styles.exportMenuWrap} ref={menuRef}>
      <TdmGlassSurface
        variant="strong"
        stage="neutral"
        interactive
        className={[styles.exportTriggerGlass, isOpen ? styles.exportTriggerGlassOpen : ''].filter(Boolean).join(' ')}
      >
        <button
          type="button"
          className={styles.exportTriggerInner}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-busy={isExporting || undefined}
          disabled={isExporting}
          onClick={onToggle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.exportTriggerIcon}>
            <path d="M12 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8.5 11.5 12 15l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>Exportar</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={[styles.exportTriggerChevron, isOpen ? styles.exportTriggerChevronOpen : ''].filter(Boolean).join(' ')}>
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </TdmGlassSurface>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className={styles.exportMenuMotion}
            role="menu"
            aria-label="Formatos de exportação"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={menuTransition}
          >
            <TdmGlassSurface variant="strong" stage="neutral" className={styles.exportMenuGlass} contentClassName={styles.exportMenuContent}>
              {EXPORT_FORMAT_OPTIONS.map((option) => (
                <ExportMenuOption key={option.id} option={option} onExport={onExport} />
              ))}
            </TdmGlassSurface>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
