'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject
} from 'react';
import { createPortal } from 'react-dom';
import styles from './tdm-anchored-tooltip.module.sass';

const OFFSET_PX = 8;
const BOUNDARY_PADDING_PX = 10;
const SHOW_DELAY_MS = 100;
const HIDE_DELAY_MS = 80;

type Placement = 'top' | 'bottom' | 'left' | 'right';

const PLACEMENT_CLASS: Record<Placement, string> = {
  top: styles.tooltipTop,
  bottom: styles.tooltipBottom,
  left: styles.tooltipLeft,
  right: styles.tooltipRight
};

export type TdmAnchoredTooltipSize = 'default' | 'compact';

export type TdmAnchoredTooltipProps = {
  content: ReactNode;
  boundaryRef?: RefObject<HTMLElement | null>;
  preferredPlacements?: Placement[];
  showDelayMs?: number;
  /** Compact shell for short labels; default matches the lock/help tooltip. */
  size?: TdmAnchoredTooltipSize;
  children: ReactElement<{ ref?: React.Ref<HTMLElement> }>;
};

function getViewportBoundary(): DOMRect {
  return {
    top: BOUNDARY_PADDING_PX,
    left: BOUNDARY_PADDING_PX,
    right: window.innerWidth - BOUNDARY_PADDING_PX,
    bottom: window.innerHeight - BOUNDARY_PADDING_PX,
    width: window.innerWidth - BOUNDARY_PADDING_PX * 2,
    height: window.innerHeight - BOUNDARY_PADDING_PX * 2,
    x: BOUNDARY_PADDING_PX,
    y: BOUNDARY_PADDING_PX,
    toJSON: () => ({})
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCoordsForPlacement(
  placement: Placement,
  anchor: DOMRect,
  tooltip: { width: number; height: number }
) {
  switch (placement) {
    case 'bottom':
      return {
        top: anchor.bottom + OFFSET_PX,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2
      };
    case 'top':
      return {
        top: anchor.top - tooltip.height - OFFSET_PX,
        left: anchor.left + anchor.width / 2 - tooltip.width / 2
      };
    case 'left':
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.left - tooltip.width - OFFSET_PX
      };
    case 'right':
      return {
        top: anchor.top + anchor.height / 2 - tooltip.height / 2,
        left: anchor.right + OFFSET_PX
      };
  }
}

function fitsInBoundary(
  top: number,
  left: number,
  tooltip: { width: number; height: number },
  boundary: DOMRect
) {
  return (
    top >= boundary.top + BOUNDARY_PADDING_PX &&
    left >= boundary.left + BOUNDARY_PADDING_PX &&
    top + tooltip.height <= boundary.bottom - BOUNDARY_PADDING_PX &&
    left + tooltip.width <= boundary.right - BOUNDARY_PADDING_PX
  );
}

function computeTooltipPosition(
  anchor: DOMRect,
  tooltip: { width: number; height: number },
  boundary: DOMRect,
  preferredPlacements: Placement[]
) {
  for (const placement of preferredPlacements) {
    const coords = getCoordsForPlacement(placement, anchor, tooltip);
    const left = clamp(
      coords.left,
      boundary.left + BOUNDARY_PADDING_PX,
      boundary.right - tooltip.width - BOUNDARY_PADDING_PX
    );
    const top = clamp(
      coords.top,
      boundary.top + BOUNDARY_PADDING_PX,
      boundary.bottom - tooltip.height - BOUNDARY_PADDING_PX
    );

    if (fitsInBoundary(top, left, tooltip, boundary)) {
      return { top, left, placement };
    }
  }

  const fallbackPlacement = preferredPlacements[0] ?? 'bottom';
  const fallback = getCoordsForPlacement(fallbackPlacement, anchor, tooltip);

  return {
    top: clamp(
      fallback.top,
      boundary.top + BOUNDARY_PADDING_PX,
      boundary.bottom - tooltip.height - BOUNDARY_PADDING_PX
    ),
    left: clamp(
      fallback.left,
      boundary.left + BOUNDARY_PADDING_PX,
      boundary.right - tooltip.width - BOUNDARY_PADDING_PX
    ),
    placement: fallbackPlacement
  };
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.RefObject<T | null>).current = node;
      }
    });
  };
}

export function TdmAnchoredTooltip({
  content,
  boundaryRef,
  preferredPlacements = ['bottom', 'top', 'left', 'right'],
  showDelayMs = SHOW_DELAY_MS,
  size = 'default',
  children
}: TdmAnchoredTooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placement: Placement } | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current != null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const showTooltip = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setVisible(true);
  }, [clearHideTimeout, clearShowTimeout]);

  const hideTooltip = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    setVisible(false);
    setIsPositioned(false);
    setPosition(null);
  }, [clearHideTimeout, clearShowTimeout]);

  const scheduleShow = useCallback(() => {
    clearHideTimeout();
    clearShowTimeout();
    showTimeoutRef.current = window.setTimeout(showTooltip, showDelayMs);
  }, [clearHideTimeout, clearShowTimeout, showDelayMs, showTooltip]);

  const scheduleHide = useCallback(() => {
    clearShowTimeout();
    clearHideTimeout();
    hideTimeoutRef.current = window.setTimeout(hideTooltip, HIDE_DELAY_MS);
  }, [clearHideTimeout, clearShowTimeout, hideTooltip]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip || !visible) return;

    const anchor = trigger.getBoundingClientRect();
    const boundary = boundaryRef?.current?.getBoundingClientRect() ?? getViewportBoundary();
    const tooltipSize = {
      width: tooltip.offsetWidth,
      height: tooltip.offsetHeight
    };

    const nextPosition = computeTooltipPosition(anchor, tooltipSize, boundary, preferredPlacements);

    setPosition((prev) => {
      if (
        prev &&
        prev.top === nextPosition.top &&
        prev.left === nextPosition.left &&
        prev.placement === nextPosition.placement
      ) {
        return prev;
      }

      return nextPosition;
    });
    setIsPositioned((prev) => prev || true);
  }, [boundaryRef, preferredPlacements, visible]);

  useLayoutEffect(() => {
    if (!visible) return;

    let frame = 0;
    const measure = () => {
      updatePosition();
    };

    frame = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [content, updatePosition, visible]);

  useEffect(() => {
    if (!visible) return;

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    const boundary = boundaryRef?.current;
    boundary?.addEventListener('scroll', handleReposition, { passive: true });

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      boundary?.removeEventListener('scroll', handleReposition);
    };
  }, [boundaryRef, updatePosition, visible]);

  useEffect(() => {
    return () => {
      clearHideTimeout();
      clearShowTimeout();
    };
  }, [clearHideTimeout, clearShowTimeout]);

  if (!isValidElement(children)) {
    return children;
  }

  const childProps = children.props as {
    ref?: React.Ref<HTMLElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    'aria-describedby'?: string;
  };

  const trigger = cloneElement(children, {
    ref: mergeRefs(triggerRef, childProps.ref),
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      scheduleShow();
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      scheduleHide();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      scheduleShow();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      scheduleHide();
    },
    'aria-describedby': visible ? tooltipId : childProps['aria-describedby']
  } as Record<string, unknown>);

  const tooltipStyle: CSSProperties = {
    top: position?.top ?? -9999,
    left: position?.left ?? -9999
  };

  return (
    <>
      {trigger}
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            data-placement={position?.placement ?? preferredPlacements[0]}
            className={[
              styles.tooltip,
              size === 'compact' ? styles.tooltipCompact : '',
              position ? PLACEMENT_CLASS[position.placement] : '',
              isPositioned ? styles.tooltipVisible : ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={tooltipStyle}
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}
