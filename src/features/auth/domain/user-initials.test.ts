import { describe, expect, it } from 'vitest';
import { getUserInitials } from './user-initials';

describe('getUserInitials', () => {
  it('usa primeiro e último nomes', () => expect(getUserInitials('Tiala Rocha')).toBe('TR'));
  it('usa uma inicial para nome único', () => expect(getUserInitials('Tiala')).toBe('T'));
  it('normaliza espaços', () => expect(getUserInitials('  Tiala   de Rocha  ')).toBe('TR'));
});
