import Image from 'next/image';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmStatusScreen } from './tdm-status-screen';

const BRAND_MARK_SRC = '/assets/brand/tmd-construtor-guided-story-mark.png';

export function TdmRouteNotFound() {
  return (
    <TdmStatusScreen
      eyebrow="Caminho não encontrado"
      title="Esta página saiu do mapa."
      description="O endereço pode ter mudado. Volte ao início e siga por um caminho disponível."
      icon={<Image src={BRAND_MARK_SRC} alt="" width={72} height={72} priority />}
      actions={<TdmButton recipe="public" href="/">Voltar ao início</TdmButton>}
    />
  );
}
