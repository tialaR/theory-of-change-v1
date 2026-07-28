import { describe, expect, it } from 'vitest';
import { validateAuthCredentials } from './auth.validation';

describe('validateAuthCredentials', () => {
  it('normaliza credenciais válidas', () => {
    const result = validateAuthCredentials({
      name: '  Tiala Rocha  ',
      email: ' TIALAROCHA@TDMCONSTRUTOR.COM.BR ',
      password: 'tdm123456'
    });

    expect(result).toEqual({
      valid: true,
      credentials: {
        name: 'Tiala Rocha',
        email: 'tialarocha@tdmconstrutor.com.br',
        password: 'tdm123456'
      }
    });
  });

  it('rejeita nome vazio, e-mail inválido e senha curta', () => {
    const result = validateAuthCredentials({ name: '', email: 'invalido', password: '123' });
    expect(result).toEqual({
      valid: false,
      errors: { name: 'nameRequired', email: 'emailInvalid', password: 'passwordTooShort' }
    });
  });
});
