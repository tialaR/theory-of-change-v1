'use client';

import { useEffect, type ReactElement } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getDefaultToastDuration, type TdmToast } from './tdm-toast-types';
import styles from './tdm-toast.module.sass';

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.1V11" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.75" fill="currentColor" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.2 8.2 6.8 10.8 11.8 5.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.2 13.4 12.8H2.6L8 3.2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M8 7.1V9.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.6 5.6 10.4 10.4M10.4 5.6 5.6 10.4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.8 4.8 11.2 11.2M11.2 4.8 4.8 11.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

const STATUS_CLASS: Record<TdmToast['status'], string> = {
  info: styles.toastInfo,
  success: styles.toastSuccess,
  warning: styles.toastWarning,
  error: styles.toastError
};

const STATUS_ICON: Record<TdmToast['status'], () => ReactElement> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon
};

function getLiveRole(status: TdmToast['status']): 'status' | 'alert' {
  return status === 'warning' || status === 'error' ? 'alert' : 'status';
}

function getAriaLive(status: TdmToast['status']): 'polite' | 'assertive' {
  return status === 'warning' || status === 'error' ? 'assertive' : 'polite';
}

export function TdmToastViewport({
  toast,
  onClose
}: {
  toast: TdmToast | null;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, toast.duration ?? getDefaultToastDuration(toast.status));

    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  return (
    <div className={styles.toastViewport}>
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            className={`${styles.toast} ${STATUS_CLASS[toast.status]}`}
            role={getLiveRole(toast.status)}
            aria-live={getAriaLive(toast.status)}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.985 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <span className={styles.toastIcon}>{STATUS_ICON[toast.status]()}</span>

            <div className={styles.toastContent}>
              <strong className={styles.toastTitle}>{toast.title}</strong>
              {toast.description ? <p className={styles.toastDescription}>{toast.description}</p> : null}
            </div>

            <button type="button" className={styles.toastClose} aria-label="Fechar mensagem" onClick={onClose}>
              <CloseIcon />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
