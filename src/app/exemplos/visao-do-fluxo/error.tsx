'use client';
import { TdmRouteError } from '@/shared/ui/tdm-status-screen';
export default function FlowError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do fluxo" title="O fluxo não conseguiu continuar" />;
}
