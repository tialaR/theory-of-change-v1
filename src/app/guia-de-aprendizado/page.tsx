import { GuideExperiencePage } from '@/features/theory-of-change/components/resend-public/public-experience';
import { simulatePublicRouteDelay } from '@/features/theory-of-change/components/public-pages/simulate-public-route-delay';

export const dynamic = 'force-dynamic';

export default async function GuiaDeAprendizadoPage() {
  await simulatePublicRouteDelay();

  return <GuideExperiencePage />;
}
