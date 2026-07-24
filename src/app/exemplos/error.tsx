'use client';

import { TdmRouteError } from '@/shared/ui/tdm-status-screen';

export default function ExamplesError({
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
      eyebrow="Exemplos"
      title="A visualização encontrou um problema"
      description="Tente carregar novamente. O conteúdo interno dos diagramas permanece preservado."
    />
  );
}
