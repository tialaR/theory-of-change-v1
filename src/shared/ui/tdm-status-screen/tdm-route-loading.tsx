import { TdmLoadingIcon } from '@/shared/ui/tdm-icons';
import { TdmStatusScreen } from './tdm-status-screen';

export type TdmRouteLoadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function TdmRouteLoading({ eyebrow, title, description }: TdmRouteLoadingProps) {
  return (
    <TdmStatusScreen
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={<TdmLoadingIcon />}
      busy
    />
  );
}
