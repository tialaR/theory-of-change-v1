'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { TdmTooltip, type TdmTooltipPosition } from '../tdm-tooltip/tdm-tooltip';
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

export type TdmIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> & {
  'aria-label': string;
  children: ReactNode;
  variant?: TdmIconButtonVariant;
  size?: TdmIconButtonSize;
  tooltip?: string;
  tooltipPosition?: TdmTooltipPosition;
};

export const TdmIconButton = forwardRef<HTMLButtonElement, TdmIconButtonProps>(function TdmIconButton(
  {
    'aria-label': ariaLabel,
    children,
    variant = 'ghost',
    size = 'md',
    tooltip,
    tooltipPosition = 'top',
    className = '',
    type = 'button',
    disabled,
    ...props
  },
  ref
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[styles.button, VARIANT_CLASS[variant], SIZE_CLASS[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className={styles.icon} aria-hidden="true">
        {children}
      </span>
    </button>
  );

  if (!tooltip || disabled) {
    return button;
  }

  return (
    <TdmTooltip content={tooltip} position={tooltipPosition}>
      {button}
    </TdmTooltip>
  );
});
