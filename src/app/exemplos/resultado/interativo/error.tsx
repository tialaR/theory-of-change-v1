'use client';
import { TdmRouteError } from '@/shared/ui/tdm-status-screen';
export default function InteractiveResultError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <TdmRouteError error={error} reset={reset} eyebrow="Exemplo do resultado" title="A experiência interativa encontrou um problema" />;
}
