'use client';

import { usePathname } from 'next/navigation';
import type { PublicHeaderProps } from '../public-layout.types';
import styles from '../tdm-public-layout.module.sass';
import { PublicHeaderBrand } from './public-header-brand';
import { PublicHeaderCta } from './public-header-cta';
import { PublicHeaderNavigation } from './public-header-navigation';
import { shouldHidePublicHeader } from './public-header-policy';
import { usePublicHeaderScrolled } from './use-public-header-scrolled';

export function PublicHeader({
  ctaHref = '/canvas',
  ctaLabel = 'Comece agora',
  ctaTrailingIcon
}: PublicHeaderProps) {
  const pathname = usePathname();
  const { sentinelRef, isScrolled } = usePublicHeaderScrolled();

  if (shouldHidePublicHeader(pathname)) return null;

  return (
    <>
      <div ref={sentinelRef} className={styles.scrollSentinel} aria-hidden="true" />
      <header className={styles.header} data-scrolled={isScrolled ? 'true' : 'false'}>
        <div className={styles.headerShell}>
          <div className={styles.headerBar}>
            <PublicHeaderBrand />
            <PublicHeaderNavigation pathname={pathname} />
            <PublicHeaderCta href={ctaHref} label={ctaLabel} trailingIcon={ctaTrailingIcon} />
          </div>
        </div>
      </header>
    </>
  );
}
