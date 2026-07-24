'use client';
import { TdmRouteError } from '@/shared/ui/tdm-status-screen';
export default function ResultError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do resultado" title="O resultado não conseguiu continuar" />;
}
