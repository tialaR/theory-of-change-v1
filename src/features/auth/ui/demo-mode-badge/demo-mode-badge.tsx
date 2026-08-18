'use client';

import { useTranslations } from 'next-intl';
import type { AuthUser } from '../../domain/auth.types';
import styles from './demo-mode-badge.module.sass';

export function DemoModeBadge({ user }: { user: AuthUser }) {
  const t = useTranslations('Auth.demo');
  if (user.accessMode !== 'demo') return null;

  return (
    <span className={styles.badge} aria-label={t('ariaLabel')}>
      {t('label')}
    </span>
  );
}
