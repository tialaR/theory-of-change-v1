import type { AuthFieldErrors } from '../domain/auth.validation';

export type RegistrationActionState = {
  status: 'idle' | 'error';
  message: string;
  fieldErrors: AuthFieldErrors;
};

export const INITIAL_REGISTRATION_ACTION_STATE: RegistrationActionState = {
  status: 'idle',
  message: '',
  fieldErrors: {}
};
