'use client';

import Link from 'next/link';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode
} from 'react';
import { TdmTooltip, type TdmTooltipPosition, type TdmTooltipSkin } from '../tdm-tooltip';
import styles from './tdm-icon-button.module.sass';

export type TdmIconButtonVariant = 'ghost' | 'subtle' | 'filled' | 'destructive';
export type TdmIconButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<TdmIconButtonVariant, string> = {
  ghost: styles.variantGhost,
  subtle: styles.variantSubtle,
  filled: styles.variantFilled,
  destructive: styles.variantDestructive
};

const SIZE_CLASS: Record<TdmIconButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg
};

type TdmIconButtonSharedProps = {
  'aria-label': string;
  children: ReactNode;
  variant?: TdmIconButtonVariant;
  size?: TdmIconButtonSize;
  tooltip?: string;
  tooltipPosition?: TdmTooltipPosition;
  tooltipSkin?: TdmTooltipSkin;
  className?: string;
};

type TdmIconButtonAsButtonProps = TdmIconButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof TdmIconButtonSharedProps | 'href'> & {
    href?: never;
  };

type TdmIconButtonAsLinkProps = TdmIconButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TdmIconButtonSharedProps> & {
    href: string;
    disabled?: boolean;
  };

export type TdmIconButtonProps = TdmIconButtonAsButtonProps | TdmIconButtonAsLinkProps;

function iconButtonClassName({
  variant,
  size,
  className
}: {
  variant: TdmIconButtonVariant;
  size: TdmIconButtonSize;
  className: string;
}) {
  return [styles.button, VARIANT_CLASS[variant], SIZE_CLASS[size], className].filter(Boolean).join(' ');
}

export const TdmIconButton = forwardRef<HTMLButtonElement, TdmIconButtonProps>(function TdmIconButton(
  props,
  ref
) {
  const {
    'aria-label': ariaLabel,
    children,
    variant = 'ghost',
    size = 'md',
    tooltip,
    tooltipPosition = 'top',
    tooltipSkin = 'default',
    className = '',
    ...rest
  } = props;

  const classNames = iconButtonClassName({ variant, size, className });
  const content = (
    <span className={styles.icon} aria-hidden="true">
      {children}
    </span>
  );

  let control: ReactNode;
  let isDisabled = false;

  if ('href' in props && typeof props.href === 'string') {
    const { href, onClick, disabled, ...anchorProps } = rest as Omit<
      TdmIconButtonAsLinkProps,
      keyof TdmIconButtonSharedProps
    >;
    isDisabled = Boolean(disabled);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    control = (
      <Link
        href={href}
        className={classNames}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={handleClick}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  } else {
    const { type = 'button', disabled, ...buttonProps } = rest as Omit<
      TdmIconButtonAsButtonProps,
      keyof TdmIconButtonSharedProps
    >;
    isDisabled = Boolean(disabled);

    control = (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        className={classNames}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }

  if (!tooltip || isDisabled) return control;

  return (
    <TdmTooltip content={tooltip} position={tooltipPosition} skin={tooltipSkin}>
      {control as ReactElement}
    </TdmTooltip>
  );
});
