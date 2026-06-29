'use client';

import { ButtonHTMLAttributes } from 'react';
import styles from './icon-button.module.sass';

export function IconButton({ className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={[styles.button, className].filter(Boolean).join(' ')} {...props} />;
}
