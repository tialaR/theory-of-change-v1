export type ToastStatus = 'info' | 'success' | 'warning' | 'error';

export type TdmToast = {
  id: string;
  status: ToastStatus;
  title: string;
  description?: string;
  duration?: number;
};

export type TdmToastInput = Omit<TdmToast, 'id'> & { id?: string };

export function getDefaultToastDuration(status: ToastStatus): number {
  switch (status) {
    case 'success':
      return 4600;
    case 'warning':
      return 6200;
    case 'error':
      return 7000;
    case 'info':
    default:
      return 5200;
  }
}
