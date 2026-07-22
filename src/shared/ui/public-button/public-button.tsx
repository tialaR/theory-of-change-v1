'use client';

import Link from 'next/link';
import { type MouseEvent, type ReactNode } from 'react';
import styles from './public-button.module.sass';
import type {
  PublicButtonAsButtonProps,
  PublicButtonAsLinkProps,
  PublicButtonProps,
  PublicButtonSize,
  PublicButtonVariant
} from './public-button.types';

const VARIANT_CLASS: Record<PublicButtonVariant, string> = {
  primary: styles.variantPrimary,
  text: styles.variantText,
  textCompact: styles.variantTextCompact,
  exportCompact: styles.variantExportCompact
};

function resolveActionIcon(label: string): ReactNode | null {
  const text = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/criar|comece|abrir canvas|ir para o canvas/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 3.25v9.5M3.25 8h9.5" />
      </svg>
    );
  }

  if (/experiencia interativa|abrir experiencia|abrir visualiza/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="3.5" cy="8" r="1.6" />
        <circle cx="8" cy="3.75" r="1.6" />
        <circle cx="12.5" cy="8" r="1.6" />
        <circle cx="8" cy="12.25" r="1.6" />
        <path d="M4.9 7.1 6.6 4.85M9.4 4.85 11.1 7.1M11.1 8.9 9.4 11.15M6.6 11.15 4.9 8.9" />
      </svg>
    );
  }

  if (/ver|explorar/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2.5 8s2.2-4 5.5-4 5.5 4 5.5 4-2.2 4-5.5 4-5.5-4-5.5-4Z" />
        <circle cx="8" cy="8" r="1.75" />
      </svg>
    );
  }

  if (/fechar/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.25 4.25 11.75 11.75M11.75 4.25 4.25 11.75" />
      </svg>
    );
  }

  if (/voltar/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M9.5 3.5 4.5 8l5 4.5" />
        <path d="M4.75 8h6.75" />
      </svg>
    );
  }

  if (/guia/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 2.75h6.5L12.25 4.5V13H4V2.75Z" />
        <path d="M6.25 2.75V13" />
      </svg>
    );
  }

  if (/exportar|pdf|png|svg|docx/.test(text)) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.25 2.75h5.5L12.25 5.25v8H4.25v-10.5Z" />
        <path d="M9.5 2.75V5.5h2.75" />
        <path d="M6.25 8.5h3.5M6.25 10.75h3.5" />
      </svg>
    );
  }

  return null;
}

function publicButtonClassName({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className = ''
}: {
  variant?: PublicButtonVariant;
  size?: PublicButtonSize;
  isLoading?: boolean;
  className?: string;
}) {
  return [
    styles.button,
    VARIANT_CLASS[variant],
    size === 'hero' && variant === 'primary' ? styles.sizeHero : '',
    isLoading ? styles.isLoading : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
}

export function PublicButton(props: PublicButtonProps) {
  const {
    variant = 'primary',
    size = 'default',
    leadingIcon,
    trailingIcon,
    isLoading = false,
    className = '',
    children,
    ...rest
  } = props;

  const label = typeof children === 'string' ? children : '';
  const autoIcon = !leadingIcon && !trailingIcon && label ? resolveActionIcon(label) : null;
  const resolvedLeading = leadingIcon ?? autoIcon;
  const classNames = publicButtonClassName({ variant, size, isLoading, className });

  const content = (
    <span className={styles.content}>
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : resolvedLeading ? (
        <span className={styles.icon} aria-hidden="true">
          {resolvedLeading}
        </span>
      ) : null}
      {children ? <span className={styles.label}>{children}</span> : null}
      {!isLoading && trailingIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
      {isLoading ? <span className={styles.srOnly}>Carregando</span> : null}
    </span>
  );

  if ('href' in props && typeof props.href === 'string') {
    const { href, onClick, ...anchorProps } = rest as Omit<
      PublicButtonAsLinkProps,
      | 'variant'
      | 'size'
      | 'leadingIcon'
      | 'trailingIcon'
      | 'isLoading'
      | 'className'
      | 'children'
    >;
    const isDisabled = Boolean(isLoading);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <Link
        href={href}
        className={classNames}
        data-public-button-variant={variant}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={handleClick}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = rest as Omit<
    PublicButtonAsButtonProps,
    | 'variant'
    | 'size'
    | 'leadingIcon'
    | 'trailingIcon'
    | 'isLoading'
    | 'className'
    | 'children'
  >;
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      type={type}
      className={classNames}
      data-public-button-variant={variant}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isDisabled || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

export type { PublicButtonProps, PublicButtonSize, PublicButtonVariant };
