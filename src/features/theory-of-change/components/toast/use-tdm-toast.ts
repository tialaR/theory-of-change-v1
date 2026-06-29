'use client';

import { useCallback, useState } from 'react';
import type { TdmToast, TdmToastInput } from './tdm-toast-types';

let toastCounter = 0;

export function useTdmToast() {
  const [activeToast, setActiveToast] = useState<TdmToast | null>(null);

  const closeToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const showToast = useCallback((input: TdmToastInput) => {
    const id = input.id ?? `toast-${++toastCounter}`;
    setActiveToast({ ...input, id });
  }, []);

  return { activeToast, showToast, closeToast };
}
