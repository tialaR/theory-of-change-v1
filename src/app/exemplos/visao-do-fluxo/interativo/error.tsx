'use client';
import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';
export default function InteractiveFlowError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do fluxo" title="A experiência interativa encontrou um problema" />;
}
