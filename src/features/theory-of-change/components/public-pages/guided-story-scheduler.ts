import { FINAL_START, TICK_MS } from './guided-story-data';

export type StorySchedulerCallbacks = {
  onElapsed: (elapsed: number) => void;
  onPausedChange: (paused: boolean) => void;
  onStoppedAtFinal?: () => void;
};

export type StoryScheduler = {
  play: (from?: number) => void;
  togglePause: () => void;
  stopAtFinal: () => void;
  goTo: (chapterStartMs: number, stopFinal?: boolean) => void;
  getElapsed: () => number;
  isPaused: () => boolean;
  isRunning: () => boolean;
  destroy: () => void;
};

/**
 * Single recursive setTimeout scheduler (~33ms). Clears on pause, restart, chapter jump, unmount.
 * Never uses setInterval or requestAnimationFrame.
 */
export function createStoryScheduler(callbacks: StorySchedulerCallbacks): StoryScheduler {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let paused = false;
  let startedAt = 0;
  let pausedAt = 0;

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const emitPaused = (next: boolean) => {
    paused = next;
    callbacks.onPausedChange(next);
  };

  const stopAtFinal = () => {
    running = false;
    clear();
    pausedAt = FINAL_START;
    emitPaused(true);
    callbacks.onElapsed(FINAL_START);
    callbacks.onStoppedAtFinal?.();
  };

  const tick = () => {
    if (!running || paused) return;
    const elapsed = performance.now() - startedAt;
    callbacks.onElapsed(elapsed);
    if (elapsed >= FINAL_START) {
      stopAtFinal();
      return;
    }
    timeoutId = setTimeout(tick, TICK_MS);
  };

  const play = (from = 0) => {
    clear();
    running = true;
    pausedAt = from;
    startedAt = performance.now() - from;
    emitPaused(false);
    callbacks.onElapsed(from);
    if (from >= FINAL_START) {
      stopAtFinal();
      return;
    }
    timeoutId = setTimeout(tick, TICK_MS);
  };

  const togglePause = () => {
    if (!running) {
      play(pausedAt >= FINAL_START ? 0 : pausedAt);
      return;
    }
    if (!paused) {
      pausedAt = performance.now() - startedAt;
      clear();
      emitPaused(true);
      callbacks.onElapsed(pausedAt);
      return;
    }
    startedAt = performance.now() - pausedAt;
    emitPaused(false);
    timeoutId = setTimeout(tick, TICK_MS);
  };

  const goTo = (chapterStartMs: number, stopFinal = false) => {
    play(chapterStartMs);
    if (stopFinal) stopAtFinal();
  };

  return {
    play,
    togglePause,
    stopAtFinal,
    goTo,
    getElapsed: () => (running && !paused ? performance.now() - startedAt : pausedAt),
    isPaused: () => paused,
    isRunning: () => running,
    destroy: () => {
      running = false;
      clear();
    },
  };
}

export type RectBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type PathGeom = {
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
};

export function relativeRect(element: HTMLElement, root: HTMLElement): RectBox {
  const rr = root.getBoundingClientRect();
  const er = element.getBoundingClientRect();
  const logicalRootWidth = root.offsetWidth || rr.width || 1;
  const localScale = rr.width / logicalRootWidth || 1;
  return {
    left: (er.left - rr.left) / localScale,
    right: (er.right - rr.left) / localScale,
    top: (er.top - rr.top) / localScale,
    bottom: (er.bottom - rr.top) / localScale,
    width: er.width / localScale,
    height: er.height / localScale,
  };
}

function measurePathLength(d: string): number {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path.getTotalLength();
}

export function pathData(source: HTMLElement, target: HTMLElement, root: HTMLElement, edgeGap: number): PathGeom {
  const a = relativeRect(source, root);
  const b = relativeRect(target, root);
  const x1 = a.right + edgeGap;
  const y1 = a.top + a.height * 0.5;
  const x2 = b.left - edgeGap;
  const y2 = b.top + b.height * 0.5;
  const distance = Math.max(34, x2 - x1);
  const curve = Math.min(82, distance * 0.42);
  const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} C ${(x1 + curve).toFixed(2)} ${y1.toFixed(2)}, ${(x2 - curve).toFixed(2)} ${y2.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  return { d, x1, y1, x2, y2, length: measurePathLength(d) };
}
