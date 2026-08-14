'use client';
import { TdmRouteError, type TdmRouteErrorBoundaryProps } from '@/shared/ui/tdm-status-screen';
export default function InteractiveResultError({ error, reset }: TdmRouteErrorBoundaryProps) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do resultado" title="A experiência interativa encontrou um problema" />;
}
