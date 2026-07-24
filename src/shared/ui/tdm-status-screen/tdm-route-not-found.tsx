import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmSearchIcon } from '@/shared/ui/tdm-icons';
import { TdmStatusScreen } from './tdm-status-screen';

export function TdmRouteNotFound() {
  return (
    <TdmStatusScreen
      eyebrow="404"
      title="Esta rota não foi encontrada"
      description="O endereço pode ter mudado ou não fazer parte da experiência publicada."
      icon={<TdmSearchIcon />}
      actions={<TdmButton recipe="public" href="/">Voltar ao início</TdmButton>}
    />
  );
}
