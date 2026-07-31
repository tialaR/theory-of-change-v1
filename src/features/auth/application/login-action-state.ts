import type { AuthCredentials } from '../domain/auth.types';

export type LoginActionState = {
  status: 'idle' | 'error';
  message: string | null;
  fieldErrors: Partial<Record<keyof AuthCredentials, string>>;
};

export const INITIAL_LOGIN_ACTION_STATE: LoginActionState = {
  status: 'idle',
  message: null,
  fieldErrors: {}
};
