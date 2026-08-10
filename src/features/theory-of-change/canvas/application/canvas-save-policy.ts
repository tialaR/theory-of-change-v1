export const MAX_NAVIGATION_SAVE_ATTEMPTS = 3;

export type CanvasSaveStateDecision = 'saved' | 'dirty' | 'error';

export type CanvasSaveAttemptResult = {
  ok: boolean;
  clean: boolean;
};

export type CanvasSaveSequenceResult =
  | { status: 'clean'; attempts: number }
  | { status: 'failed'; attempts: number }
  | { status: 'exhausted'; attempts: number };

export function decideCanvasSaveState(input: {
  revisionAtStart: number;
  revisionAfterSave: number;
  failed?: boolean;
}): CanvasSaveStateDecision {
  if (input.failed) return 'error';
  return input.revisionAfterSave === input.revisionAtStart ? 'saved' : 'dirty';
}

export async function saveCanvasUntilClean(input: {
  save: () => Promise<CanvasSaveAttemptResult>;
  maxAttempts?: number;
}): Promise<CanvasSaveSequenceResult> {
  const maxAttempts = input.maxAttempts ?? MAX_NAVIGATION_SAVE_ATTEMPTS;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await input.save();
    if (!result.ok) return { status: 'failed', attempts: attempt };
    if (result.clean) return { status: 'clean', attempts: attempt };
  }

  return { status: 'exhausted', attempts: maxAttempts };
}
