'use client';
import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';
export default function FlowError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do fluxo" title="O fluxo não conseguiu continuar" />;
}
