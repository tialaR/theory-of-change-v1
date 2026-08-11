import { describe, expect, it } from 'vitest';
import { AUTH_DEFAULT_RETURN_TO } from '../domain/auth.constants';
import { sanitizeReturnTo } from './auth-session';

describe('sanitizeReturnTo', () => {
  it('preserves legitimate local application destinations', () => {
    expect(sanitizeReturnTo('/canvas')).toBe('/canvas');
    expect(sanitizeReturnTo('/canvas/resultado')).toBe('/canvas/resultado');
    expect(sanitizeReturnTo('/canvas/resultado?mode=interactive#summary')).toBe(
      '/canvas/resultado?mode=interactive#summary'
    );
  });

  it('rejects external and protocol-relative destinations', () => {
    expect(sanitizeReturnTo('https://example.com')).toBe(AUTH_DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo('//example.com')).toBe(AUTH_DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo(undefined)).toBe(AUTH_DEFAULT_RETURN_TO);
  });

  it('rejects the login route as its own return destination', () => {
    expect(sanitizeReturnTo('/login')).toBe(AUTH_DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo('/login?returnTo=%2Flogin')).toBe(AUTH_DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo('/login#form')).toBe(AUTH_DEFAULT_RETURN_TO);
  });
});
