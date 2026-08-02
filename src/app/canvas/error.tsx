'use client';

import { TdmRouteError } from '@/shared/ui/tdm-status-screen';

export default function CanvasError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <TdmRouteError error={error} reset={reset} />;
}
