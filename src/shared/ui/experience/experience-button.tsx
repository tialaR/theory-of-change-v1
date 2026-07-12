import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import styles from './experience-button.module.sass';

export type ExperienceButtonProps = {
  children: ReactNode;
  tone?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  target?: string;
  rel?: string;
  'aria-label'?: string;
};

export function ExperienceButton({ children, tone = 'secondary', className, href, onClick, type = 'button', disabled, target, rel, ...ariaProps }: ExperienceButtonProps) {
  const classes = [styles.button, styles[tone], className].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel} {...ariaProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled} {...ariaProps}>
      {children}
    </button>
  );
}
