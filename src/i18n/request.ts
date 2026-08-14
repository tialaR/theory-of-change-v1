import { getRequestConfig } from 'next-intl/server';
import messages from '../../messages/pt-BR.json';

export default getRequestConfig(async () => ({
  locale: 'pt-BR',
  messages
}));
