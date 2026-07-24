'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import styles from './tdm-tooltip.module.sass';

export type TdmTooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TdmTooltipSkin = 'default' | 'canvas';

const SHOW_DELAY_MS = 320;
const HIDE_DELAY_MS = 40;
const OFFSET_PX = 8;
const VIEWPORT_PADDING_PX = 10;

export type TdmTooltipProps = {
  content: string;
  position?: TdmTooltipPosition;
  skin?: TdmTooltipSkin;
  children: ReactElement;
};

type TooltipCoordinates = {
  top: number;
  left: number;
};

function findFocusable(root: HTMLElement | null) {
  if (!root) return null;
  return root.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function calculateCoordinates(
  anchor: DOMRect,
  tooltip: DOMRect,
  position: TdmTooltipPosition
): TooltipCoordinates {
  let top = anchor.top - tooltip.height - OFFSET_PX;
  let left = anchor.left + anchor.width / 2 - tooltip.width / 2;

  if (position === 'bottom') {
    top = anchor.bottom + OFFSET_PX;
  }

  if (position === 'left') {
    top = anchor.top + anchor.height / 2 - tooltip.height / 2;
    left = anchor.left - tooltip.width - OFFSET_PX;
  }

  if (position === 'right') {
    top = anchor.top + anchor.height / 2 - tooltip.height / 2;
    left = anchor.right + OFFSET_PX;
  }

  return {
    top: clamp(top, VIEWPORT_PADDING_PX, window.innerHeight - tooltip.height - VIEWPORT_PADDING_PX),
    left: clamp(left, VIEWPORT_PADDING_PX, window.innerWidth - tooltip.width - VIEWPORT_PADDING_PX)
  };
}

export function TdmTooltip({ content, position = 'top', skin = 'default', children }: TdmTooltipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current == null) return;
    window.clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = null;
  }, []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current == null) return;
    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  }, []);

  const hide = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setOpen(false);
    setPositioned(false);
  }, [clearHideTimeout, clearShowTimeout]);

  const show = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setOpen(true);
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

  const updatePosition = useCallback(() => {
    const tooltipElement = tooltipRef.current;
    const anchor = rootRef.current?.getBoundingClientRect();
    const tooltip = tooltipElement?.getBoundingClientRect();
    if (!anchor || !tooltip || !tooltipElement) return;
    const coordinates = calculateCoordinates(anchor, tooltip, position);
    tooltipElement.style.top = `${coordinates.top}px`;
    tooltipElement.style.left = `${coordinates.left}px`;
    setPositioned(true);
  }, [position]);

  useLayoutEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, updatePosition]);

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

    const handleViewportChange = () => updatePosition();
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [hide, open, updatePosition]);

  useEffect(() => {
    return () => {
      clearShowTimeout();
      clearHideTimeout();
    };
  }, [clearHideTimeout, clearShowTimeout]);

  if (!content) return children as ReactNode;

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') hide();
  };

  const tooltipClassName = [
    styles.tooltip,
    skin === 'canvas' ? styles.tooltipCanvas : '',
    positioned ? styles.visible : ''
  ]
    .filter(Boolean)
    .join(' ');

  let tooltipPortal: ReactNode = null;
  if (open && typeof document !== 'undefined') {
    tooltipPortal = createPortal(
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={tooltipClassName}
        data-placement={position}
      >
        {content}
      </span>,
      document.body
    );
  }

  return (
    <span
      ref={rootRef}
      className={styles.root}
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      onFocusCapture={scheduleShow}
      onBlurCapture={scheduleHide}
      onPointerDownCapture={hide}
      onKeyDown={handleKeyDown}
    >
      {children}
      {tooltipPortal}
    </span>
  );
}
