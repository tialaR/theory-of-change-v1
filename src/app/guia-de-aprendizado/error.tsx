'use client';

import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';

export default function GuideError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return (
    <TdmRouteError
      error={error}
      reset={reset}
      eyebrow="Guia de aprendizado"
      title="O guia não conseguiu continuar"
      description="Tente carregar novamente sem alterar a sua teoria."
    />
  );
}
