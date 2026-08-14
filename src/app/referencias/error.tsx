'use client';

import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';

export default function ReferencesError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return (
    <TdmRouteError
      error={error}
      reset={reset}
      eyebrow="Referências"
      title="As referências não puderam ser exibidas"
      description="Tente carregar novamente ou volte ao início."
    />
  );
}
