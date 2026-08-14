'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmField, TdmInput } from '@/shared/ui/tdm-field';
import { INITIAL_LOGIN_ACTION_STATE } from '../../application/login-action-state';
import { loginAction } from '../../server/login.action';
import styles from './login-page.module.sass';

export type LoginFormProps = {
  returnTo: string;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const t = useTranslations('Auth.login');
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_LOGIN_ACTION_STATE);
  const currentState = state ?? INITIAL_LOGIN_ACTION_STATE;

  return (
    <form className={styles.form} action={formAction} noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className={styles.fields}>
        <TdmField label={t('nameLabel')} error={currentState.fieldErrors.name} required>
          <TdmInput
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            minLength={2}
            required
          />
        </TdmField>
        <TdmField label={t('emailLabel')} error={currentState.fieldErrors.email} required>
          <TdmInput
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            required
          />
        </TdmField>
        <TdmField label={t('passwordLabel')} error={currentState.fieldErrors.password} required>
          <TdmInput
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t('passwordPlaceholder')}
            minLength={6}
            required
          />
        </TdmField>
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
