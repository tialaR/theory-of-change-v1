'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './tdm-button.module.sass';

export type TdmButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASS: Record<TdmButtonVariant, string> = {
  primary: styles.variantPrimary,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  danger: styles.variantDanger
};

export function tdmButtonClassName({
  variant = 'primary',
  fullWidth = false,
  className = ''
}: {
  variant?: TdmButtonVariant;
  fullWidth?: boolean;
  className?: string;
}) {
  return [styles.button, VARIANT_CLASS[variant], fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ');
}

export function TdmButton({
  variant = 'primary',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  showPlus = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: TdmButtonVariant;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  showPlus?: boolean;
}) {
  const leadingIcon = showPlus ? <span className={styles.plusIcon} aria-hidden="true">+</span> : iconPosition === 'left' ? icon : null;
  const trailingIcon = !showPlus && iconPosition === 'right' ? icon : null;

  return (
    <button type={type} className={tdmButtonClassName({ variant, fullWidth, className })} {...props}>
      {leadingIcon}
      {children ? <span className={styles.label}>{children}</span> : null}
      {trailingIcon}
    </button>
  );
}
