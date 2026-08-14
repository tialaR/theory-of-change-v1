'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmAlertIcon } from '@/shared/ui/tdm-icons';
import { TdmStatusScreen } from './tdm-status-screen';

export type TdmRouteErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export type TdmRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function TdmRouteError({ error, reset, eyebrow, title, description }: TdmRouteErrorProps) {
  const t = useTranslations('RouteState.error');
  useEffect(() => console.error(error), [error]);

  return (
    <TdmStatusScreen
      eyebrow={eyebrow ?? t('eyebrow')}
      title={title ?? t('title')}
      description={description ?? t('description')}
      icon={<TdmAlertIcon />}
      tone="danger"
      actions={
        <>
          <TdmButton recipe="public" onClick={reset}>{t('retry')}</TdmButton>
          <TdmButton recipe="public" href="/" variant="tertiary">{t('home')}</TdmButton>
        </>
      }
    />
  );
}
