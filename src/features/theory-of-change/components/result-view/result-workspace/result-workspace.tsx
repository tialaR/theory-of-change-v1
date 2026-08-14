'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { CameraAnchor, ResultCameraMode, ResultCameraState } from '../result-view.camera';
import { RESULT_MOTION, RESULT_ZOOM } from '../result-view.constants';
import styles from './result-workspace.module.sass';

type ResultWorkspaceProps = {
  camera: ResultCameraState;
  cameraMode?: ResultCameraMode;
  isZooming?: boolean;
  /** When set, freezes the diagram's layout width so the supporting pane cannot reflow cards. */
  lockedContentWidth?: number | null;
  onZoomChange?: (next: number | ((current: number) => number), anchor?: CameraAnchor) => void;
  onManualPan?: () => void;
  onCameraAnimationComplete?: () => void;
  children: ReactNode;
};

/**
 * Trackpad pinch arrives as wheel + ctrlKey. Without a non-passive listener,
 * the browser steals the gesture as page zoom (toolbar stays out of sync).
 */
export function ResultWorkspace({
  camera,
  cameraMode = 'manual',
  isZooming = false,
  lockedContentWidth = null,
  onZoomChange,
  onManualPan,
  onCameraAnimationComplete,
  children
}: ResultWorkspaceProps) {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !onZoomChange) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      const intensity = Math.abs(event.deltaY);
      const step =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? RESULT_ZOOM.step
          : Math.min(RESULT_ZOOM.step, Math.max(0.02, intensity * 0.0018));

      // Pinch-out (deltaY < 0) → zoom in; pinch-in (deltaY > 0) → zoom out.
      const direction = event.deltaY > 0 ? -1 : 1;
      const rect = viewport.getBoundingClientRect();
      const anchor: CameraAnchor = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      onZoomChange((current) => current + direction * step, anchor);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [onZoomChange]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const onScroll = () => {
      onManualPan?.();
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
    };
  }, [onManualPan]);

  const lockStyle =
    lockedContentWidth && lockedContentWidth > 0
      ? { width: lockedContentWidth, minWidth: lockedContentWidth }
      : undefined;

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-result-viewport="true"
      data-camera-mode={cameraMode}
      data-zooming={isZooming ? 'true' : 'false'}
    >
      <motion.div
        className={styles.scaler}
        data-result-scaler="true"
        style={lockStyle}
        animate={{
          scale: camera.zoom,
          x: camera.translateX,
          y: camera.translateY
        }}
        transition={{
          duration: reduce ? 0.01 : RESULT_MOTION.zoomDuration,
          ease: RESULT_MOTION.ease
        }}
        onAnimationComplete={onCameraAnimationComplete}
      >
        {children}
      </motion.div>
    </div>
  );
}
