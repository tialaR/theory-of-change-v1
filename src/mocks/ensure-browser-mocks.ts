'use client';

let startPromise: Promise<void> | null = null;

export function ensureBrowserMocksStarted() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (startPromise) return startPromise;

  startPromise = import('./browser').then(async ({ mockApiWorker }) => {
    await mockApiWorker.start({ onUnhandledRequest: 'bypass', quiet: true });
  });

  return startPromise;
}
