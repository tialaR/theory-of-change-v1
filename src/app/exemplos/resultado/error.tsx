'use client';
import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';
export default function ResultError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do resultado" title="O resultado não conseguiu continuar" />;
}
