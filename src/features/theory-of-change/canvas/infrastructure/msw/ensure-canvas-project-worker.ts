'use client';

type CanvasProjectWorkerRuntime = {
  start(options: {
    onUnhandledRequest: 'bypass';
    serviceWorker: { url: string };
  }): Promise<unknown>;
};

let workerStartPromise: Promise<void> | null = null;

export function ensureCanvasProjectWorkerStarted(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (!workerStartPromise) {
    workerStartPromise = import('./canvas-project.worker')
      .then(({ canvasProjectWorker }) => {
        const worker = canvasProjectWorker as CanvasProjectWorkerRuntime;
        return worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { url: '/mockServiceWorker.js' }
        });
      })
      .then(() => undefined);
  }

  return workerStartPromise;
}
