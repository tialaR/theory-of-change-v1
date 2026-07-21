'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode
} from 'react';
import styles from './tdm-tooltip.module.sass';

export type TdmTooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TdmTooltipSkin = 'default' | 'canvas';

const SHOW_DELAY_MS = 500;
const HIDE_DELAY_MS = 80;

const POSITION_CLASS: Record<TdmTooltipPosition, string> = {
  top: styles.positionTop,
  right: styles.positionRight,
  bottom: styles.positionBottom,
  left: styles.positionLeft
};

export type TdmTooltipProps = {
  content: string;
  position?: TdmTooltipPosition;
  /** Visual shell only. `canvas` matches TdmAnchoredTooltip; default keeps non-canvas routes. */
  skin?: TdmTooltipSkin;
  children: ReactElement;
};

function findFocusable(root: HTMLElement | null) {
  if (!root) return null;
  return root.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

export function TdmTooltip({ content, position = 'top', skin = 'default', children }: TdmTooltipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current != null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setOpen(true);
  }, [clearHideTimeout, clearShowTimeout]);

  const hide = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setOpen(false);
  }, [clearHideTimeout, clearShowTimeout]);

  const scheduleShow = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    showTimeoutRef.current = window.setTimeout(show, SHOW_DELAY_MS);
  }, [clearHideTimeout, clearShowTimeout, show]);

  const scheduleHide = useCallback(() => {
    clearShowTimeout();
    clearHideTimeout();
    hideTimeoutRef.current = window.setTimeout(hide, HIDE_DELAY_MS);
  }, [clearHideTimeout, clearShowTimeout, hide]);

  useEffect(() => {
    const focusable = findFocusable(rootRef.current);
    if (!focusable) return;

    if (open) {
      focusable.setAttribute('aria-describedby', tooltipId);
      return;
    }

    if (focusable.getAttribute('aria-describedby') === tooltipId) {
      focusable.removeAttribute('aria-describedby');
    }
  }, [open, tooltipId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        hide();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hide, open]);

  useEffect(() => {
    return () => {
      clearShowTimeout();
      clearHideTimeout();
    };
  }, [clearHideTimeout, clearShowTimeout]);

  if (!content) {
    return children as ReactNode;
  }

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      hide();
    }
  };

  return (
    <span
      ref={rootRef}
      className={styles.root}
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      onFocusCapture={scheduleShow}
      onBlurCapture={scheduleHide}
      onKeyDown={onKeyDown}
    >
      {children}
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            styles.tooltip,
            skin === 'canvas' ? styles.tooltipCanvas : '',
            POSITION_CLASS[position],
            styles.visible
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
