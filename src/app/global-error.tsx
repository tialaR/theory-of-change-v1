'use client';

import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmStatusScreen } from '@/shared/ui/tdm-status-screen';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <TdmStatusScreen
          eyebrow="Falha global"
          title="A aplicação precisa ser recarregada"
          description="Tente reconstruir a experiência atual."
          tone="danger"
          actions={<TdmButton recipe="public" onClick={reset}>Recarregar experiência</TdmButton>}
        />
      </body>
    </html>
  );
}
