'use client';

import { useEffect } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmAlertIcon } from '@/shared/ui/tdm-icons';
import { TdmStatusScreen } from './tdm-status-screen';

export type TdmRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function TdmRouteError({
  error,
  reset,
  eyebrow = 'Erro inesperado',
  title = 'A experiência não conseguiu continuar',
  description = 'Tente novamente. Se o problema persistir, volte ao início sem perder a referência da rota.'
}: TdmRouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <TdmStatusScreen
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={<TdmAlertIcon />}
      tone="danger"
      actions={
        <>
          <TdmButton recipe="public" onClick={reset}>Tentar novamente</TdmButton>
          <TdmButton recipe="public" href="/" variant="tertiary">Voltar ao início</TdmButton>
        </>
      }
    />
  );
}
