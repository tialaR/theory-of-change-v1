'use client';
import { TdmRouteError } from '@/shared/ui/tdm-status-screen';
export default function FlowAliasError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplos" title="O fluxo não pôde ser aberto" />;
}
