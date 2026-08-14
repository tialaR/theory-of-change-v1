import type { ReactNode } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button';
import styles from '../tdm-public-layout.module.sass';

function HeaderCtaChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

interface PublicHeaderCtaProps {
  href: string;
  label: string;
  trailingIcon?: ReactNode;
}

export function PublicHeaderCta({ href, label, trailingIcon }: PublicHeaderCtaProps) {
  return (
    <div className={styles.headerCtaWrap}>
      <TdmButton
        href={href}
        recipe="public"
        variant="tertiary"
        size="sm"
        className={styles.headerCta}
        trailingIcon={trailingIcon ?? <HeaderCtaChevronIcon />}
      >
        {label}
      </TdmButton>
    </div>
  );
}
