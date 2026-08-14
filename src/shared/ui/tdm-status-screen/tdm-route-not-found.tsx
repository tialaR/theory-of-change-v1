import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmStatusScreen } from './tdm-status-screen';

const BRAND_MARK_SRC = '/assets/brand/tmd-construtor-guided-story-mark.png';

export async function TdmRouteNotFound() {
  const t = await getTranslations('RouteState.notFound');
  return (
    <TdmStatusScreen
      code="404"
      codeAriaLabel={t('codeAriaLabel')}
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      icon={<Image src={BRAND_MARK_SRC} alt="" width={72} height={72} priority />}
      actions={<TdmButton recipe="public" href="/">{t('action')}</TdmButton>}
    />
  );
}
