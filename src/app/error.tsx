'use client';

import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';

export default function ErrorPage({ error, reset }: TdmRouteErrorBoundaryProps) {
  return <TdmRouteError error={error} reset={reset} />;
}
