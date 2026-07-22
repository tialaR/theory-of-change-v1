'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import styles from './public-icon-button.module.sass';
import type {
  PublicIconButtonAsButtonProps,
  PublicIconButtonAsLinkProps,
  PublicIconButtonProps
} from './public-icon-button.types';

export function PublicIconButton(props: PublicIconButtonProps) {
  const { 'aria-label': ariaLabel, children, className = '', ...rest } = props;
  const classNames = [styles.button, className].filter(Boolean).join(' ');

  const content = (
    <span className={styles.icon} aria-hidden="true">
      {children}
    </span>
  );

  if ('href' in props && typeof props.href === 'string') {
    const { href, onClick, ...anchorProps } = rest as Omit<
      PublicIconButtonAsLinkProps,
      'aria-label' | 'children' | 'className'
    >;

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
    };

    return (
      <Link
        href={href}
        className={classNames}
        aria-label={ariaLabel}
        data-public-icon-button="true"
        onClick={handleClick}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = rest as Omit<
    PublicIconButtonAsButtonProps,
    'aria-label' | 'children' | 'className'
  >;

  return (
    <button
      type={type}
      className={classNames}
      aria-label={ariaLabel}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      data-public-icon-button="true"
      {...buttonProps}
    >
      {content}
    </button>
  );
}

export type { PublicIconButtonProps };
