'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { TdmButton } from '@/shared/ui/tdm-button';
import { AuthCredentialInput } from '../auth-credential-input/auth-credential-input';
import { INITIAL_REGISTRATION_ACTION_STATE } from '../../application/registration-action-state';
import { registerAction } from '../../server/register.action';
import styles from '../login/login-page.module.sass';

export function RegisterForm({ returnTo }: { returnTo: string }) {
  const t = useTranslations('Auth.register');
  const [state, formAction, isPending] = useActionState(
    registerAction,
    INITIAL_REGISTRATION_ACTION_STATE
  );
  const currentState = state ?? INITIAL_REGISTRATION_ACTION_STATE;

  return (
    <form className={styles.form} action={formAction} noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className={styles.fields}>
        <AuthCredentialInput label={t('nameLabel')} error={currentState.fieldErrors.name} name="name" type="text" autoComplete="name" placeholder={t('namePlaceholder')} minLength={4} required />

        <AuthCredentialInput label={t('emailLabel')} error={currentState.fieldErrors.email} name="email" type="email" inputMode="email" autoComplete="email" placeholder={t('emailPlaceholder')} required />

        <AuthCredentialInput label={t('passwordLabel')} error={currentState.fieldErrors.password} name="password" type="password" autoComplete="new-password" placeholder={t('passwordPlaceholder')} minLength={6} required />
      </div>

      {currentState.message ? (
        <p className={styles.formError} role="alert">
          {currentState.message}
        </p>
      ) : null}

      <TdmButton
        type="submit"
        recipe="public"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? t('submitting') : t('submit')}
      </TdmButton>

      <p className={styles.helper}>{t('helper')}</p>
    </form>
  );
}
