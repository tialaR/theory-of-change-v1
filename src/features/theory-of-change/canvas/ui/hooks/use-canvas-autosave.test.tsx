/** @vitest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCanvasAutosave } from './use-canvas-autosave';

afterEach(() => {
  vi.useRealTimers();
});

describe('useCanvasAutosave', () => {
  it('salva somente depois do tempo ocioso e reinicia o debounce após nova mudança', async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => undefined);
    const { rerender } = renderHook(
      ({ changeRevision }) => useCanvasAutosave({
        enabled: true,
        changeRevision,
        delayMs: 1200,
        onSave
      }),
      { initialProps: { changeRevision: 1 } }
    );

    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    rerender({ changeRevision: 2 });
    await act(async () => {
      vi.advanceTimersByTime(1199);
    });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });


  it('inicia uma gravação silenciosa ao desmontar com alterações pendentes', async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => undefined);
    const { unmount } = renderHook(() => useCanvasAutosave({
      enabled: true,
      changeRevision: 1,
      delayMs: 1200,
      onSave
    }));

    unmount();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('não agenda gravação quando o projeto está limpo', async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => undefined);
    renderHook(() => useCanvasAutosave({
      enabled: false,
      changeRevision: 0,
      delayMs: 1200,
      onSave
    }));

    await act(async () => {
      vi.runAllTimers();
    });
    expect(onSave).not.toHaveBeenCalled();
  });
});
