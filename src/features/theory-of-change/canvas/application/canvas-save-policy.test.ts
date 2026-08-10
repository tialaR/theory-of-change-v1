import { describe, expect, it, vi } from 'vitest';
import {
  MAX_NAVIGATION_SAVE_ATTEMPTS,
  decideCanvasSaveState,
  saveCanvasUntilClean
} from './canvas-save-policy';

describe('canvas save policy', () => {
  it('marks the save as clean only when no revision changed during persistence', () => {
    expect(decideCanvasSaveState({ revisionAtStart: 4, revisionAfterSave: 4 })).toBe('saved');
    expect(decideCanvasSaveState({ revisionAtStart: 4, revisionAfterSave: 5 })).toBe('dirty');
    expect(decideCanvasSaveState({ revisionAtStart: 4, revisionAfterSave: 4, failed: true })).toBe('error');
  });

  it('retries dirty saves until the state is clean', async () => {
    const save = vi.fn()
      .mockResolvedValueOnce({ ok: true, clean: false })
      .mockResolvedValueOnce({ ok: true, clean: true });

    await expect(saveCanvasUntilClean({ save })).resolves.toEqual({ status: 'clean', attempts: 2 });
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('stops immediately after a failed save', async () => {
    const save = vi.fn().mockResolvedValue({ ok: false, clean: false });

    await expect(saveCanvasUntilClean({ save })).resolves.toEqual({ status: 'failed', attempts: 1 });
    expect(save).toHaveBeenCalledOnce();
  });

  it('returns exhausted after the bounded navigation save attempts', async () => {
    const save = vi.fn().mockResolvedValue({ ok: true, clean: false });

    await expect(saveCanvasUntilClean({ save })).resolves.toEqual({
      status: 'exhausted',
      attempts: MAX_NAVIGATION_SAVE_ATTEMPTS
    });
    expect(save).toHaveBeenCalledTimes(MAX_NAVIGATION_SAVE_ATTEMPTS);
  });
});
