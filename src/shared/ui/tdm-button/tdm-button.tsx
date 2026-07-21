'use client';

import Link from 'next/link';
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode
} from 'react';
import styles from './tdm-button.module.sass';

export type TdmButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

/** @deprecated Use `tertiary` or `destructive`. Kept for public compatibility. */
export type TdmButtonLegacyVariant = 'ghost' | 'danger';

export type TdmButtonSize = 'sm' | 'md' | 'lg';

export type TdmButtonTone =
  | 'neutral'
  | 'danger'
  | 'input'
  | 'activity'
  | 'output'
  | 'outcome';

type TdmButtonAcceptedVariant = TdmButtonVariant | TdmButtonLegacyVariant;

const VARIANT_CLASS: Record<TdmButtonVariant, string> = {
  primary: styles.variantPrimary,
  secondary: styles.variantSecondary,
  tertiary: styles.variantTertiary,
  destructive: styles.variantDestructive
};

const SIZE_CLASS: Record<TdmButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg
};

const TONE_CLASS: Record<TdmButtonTone, string> = {
  neutral: styles.toneNeutral,
  danger: styles.toneDanger,
  input: styles.toneInput,
  activity: styles.toneActivity,
  output: styles.toneOutput,
  outcome: styles.toneOutcome
};

function resolveVariant(variant: TdmButtonAcceptedVariant): TdmButtonVariant {
  if (variant === 'ghost') return 'tertiary';
  if (variant === 'danger') return 'destructive';
  return variant;
}

function resolveTone(variant: TdmButtonVariant, tone?: TdmButtonTone): TdmButtonTone {
  if (tone) return tone;
  if (variant === 'destructive') return 'danger';
  return 'neutral';
}

export function tdmButtonClassName({
  variant = 'primary',
  tone,
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = ''
}: {
  variant?: TdmButtonAcceptedVariant;
  tone?: TdmButtonTone;
  size?: TdmButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  const resolvedVariant = resolveVariant(variant);
  const resolvedTone = resolveTone(resolvedVariant, tone);
  const isBordered = resolvedVariant !== 'tertiary';

  return [
    styles.button,
    isBordered ? styles.bordered : '',
    VARIANT_CLASS[resolvedVariant],
    isBordered ? TONE_CLASS[resolvedTone] : '',
    SIZE_CLASS[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.isLoading : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
}

type TdmButtonSharedProps = {
  variant?: TdmButtonAcceptedVariant;
  tone?: TdmButtonTone;
  size?: TdmButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
  /** @deprecated Prefer `leadingIcon` / `trailingIcon`. */
  icon?: ReactNode;
  /** @deprecated Prefer `leadingIcon` / `trailingIcon`. */
  iconPosition?: 'left' | 'right';
  /** @deprecated Prefer `leadingIcon`. */
  showPlus?: boolean;
  className?: string;
  children?: ReactNode;
};

type TdmButtonAsButtonProps = TdmButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof TdmButtonSharedProps | 'href'> & {
    href?: undefined;
  };

type TdmButtonAsLinkProps = TdmButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TdmButtonSharedProps> & {
    href: string;
  };

export type TdmButtonProps = TdmButtonAsButtonProps | TdmButtonAsLinkProps;

function resolveLeadingIcon({
  leadingIcon,
  icon,
  iconPosition,
  showPlus
}: Pick<TdmButtonSharedProps, 'leadingIcon' | 'icon' | 'iconPosition' | 'showPlus'>) {
  if (leadingIcon) return leadingIcon;
  if (showPlus) {
    return (
      <span className={styles.plusIcon} aria-hidden="true">
        +
      </span>
    );
  }
  if (iconPosition === 'left') return icon ?? null;
  return null;
}

function resolveTrailingIcon({
  trailingIcon,
  icon,
  iconPosition,
  showPlus
}: Pick<TdmButtonSharedProps, 'trailingIcon' | 'icon' | 'iconPosition' | 'showPlus'>) {
  if (trailingIcon) return trailingIcon;
  if (showPlus) return null;
  if (iconPosition === 'right') return icon ?? null;
  return null;
}

export function TdmButton(props: TdmButtonProps) {
  const {
    variant = 'primary',
    tone,
    size = 'md',
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    isLoading = false,
    icon,
    iconPosition = 'right',
    showPlus = false,
    className = '',
    children,
    ...rest
  } = props;

  const resolvedVariant = resolveVariant(variant);
  const resolvedTone = resolveTone(resolvedVariant, tone);
  const resolvedLeading = resolveLeadingIcon({
    leadingIcon,
    icon,
    iconPosition,
    showPlus
  });
  const resolvedTrailing = resolveTrailingIcon({
    trailingIcon,
    icon,
    iconPosition,
    showPlus
  });
  const classNames = tdmButtonClassName({ variant, tone, size, fullWidth, isLoading, className });

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
      {!isLoading && resolvedTrailing ? (
        <span className={styles.icon} aria-hidden="true">
          {resolvedTrailing}
        </span>
      ) : null}
      {isLoading ? <span className={styles.srOnly}>Carregando</span> : null}
    </span>
  );

  if ('href' in props && typeof props.href === 'string') {
    const { href, onClick, ...anchorProps } = rest as Omit<TdmButtonAsLinkProps, keyof TdmButtonSharedProps>;
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
        data-tdm-button-variant={resolvedVariant}
        data-tdm-button-tone={resolvedTone}
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
    TdmButtonAsButtonProps,
    keyof TdmButtonSharedProps
  >;
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      type={type}
      className={classNames}
      data-tdm-button-variant={resolvedVariant}
      data-tdm-button-tone={resolvedTone}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isDisabled || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
