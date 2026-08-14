import { TdmRouteLoading } from '@/shared/ui/tdm-status-screen';

export default function Loading() {
  return (
    <TdmRouteLoading
      eyebrow="Carregando"
      title="Preparando a experiência"
      description="Estamos organizando os elementos desta rota."
    />
  );
}
