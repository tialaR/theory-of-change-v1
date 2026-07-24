'use client';

import { TdmRouteError } from '@/shared/ui/tdm-status-screen';

export default function GuideError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
