'use client';

import { useState, type ComponentProps } from 'react';
import { TdmField, TdmInput } from '@/shared/ui/tdm-field';
import styles from './auth-credential-input.module.sass';

type Props = ComponentProps<typeof TdmInput> & {
  label: string;
  error?: string;
  required?: boolean;
  clearLabel?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function AuthCredentialInput({ label, error, required, clearLabel = 'Limpar campo', showPasswordLabel = 'Mostrar senha', hidePasswordLabel = 'Ocultar senha', type = 'text', ...props }: Props) {
  const [value, setValue] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <TdmField
      label={label}
      error={error}
      required={required}
      filled={Boolean(value)}
      trailingAdornment={isPassword ? (
        <button type="button" aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel} title={passwordVisible ? hidePasswordLabel : showPasswordLabel} onClick={() => setPasswordVisible((current) => !current)}>
          {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      ) : value ? (
        <button type="button" aria-label={clearLabel} title={clearLabel} onClick={() => setValue('')}>
          <ClearIcon />
        </button>
      ) : null}
    >
      <TdmInput {...props} type={isPassword && passwordVisible ? 'text' : type} value={value} onChange={(event) => setValue(event.target.value)} />
    </TdmField>
  );
}

function ClearIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.75" /></svg>;
}
function EyeOffIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}><path d="M3 3l18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16.2 16.2 0 0 1-3 3.6M6.2 7.1C3.8 9 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>;
}
