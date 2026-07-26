import { ResultPage } from '@/features/theory-of-change/components/public-pages';
import { simulatePublicRouteDelay } from '@/features/theory-of-change/components/public-pages/simulate-public-route-delay';

export const dynamic = 'force-dynamic';

export default async function ResultadoExemploPage() {
  await simulatePublicRouteDelay();

  return <ResultPage />;
}
