/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '../../../../../messages/pt-BR.json';
import { LoginForm } from './login-form';

vi.mock('../../server/login.action', () => ({
  loginAction: vi.fn()
}));

describe('LoginForm', () => {
  it('mantém os três campos e o CTA em português', () => {
    render(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <LoginForm returnTo="/canvas" />
      </NextIntlClientProvider>
    );

    expect(screen.getByLabelText(/nome/i)).toBeVisible();
    expect(screen.getByLabelText(/e-mail/i)).toBeVisible();
    expect(
      screen.getByLabelText(/senha/i, { selector: 'input[name="password"]' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
