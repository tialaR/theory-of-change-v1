'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button';
import type { PublicHeaderProps } from './public-layout.types';
import styles from './tdm-public-layout.module.sass';

const PUBLIC_NAV_ITEMS = [
  { href: '/guia-de-aprendizado', label: 'Guia' },
  { href: '/exemplos', label: 'Exemplos' },
  { href: '/referencias', label: 'Referências' },
  { href: '/canvas', label: 'Canvas' }
] as const;

const HIDDEN_HEADER_ROUTES = [
  '/canvas',
  '/exemplos/resultado/interativo',
  '/exemplos/visao-do-fluxo/interativo'
] as const;

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function shouldHidePublicHeader(pathname: string) {
  if (pathname.startsWith('/canvas')) return true;
  return HIDDEN_HEADER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function usePublicHeaderScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollRoot = document.querySelector('[data-public-scroll="true"]');
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        root: scrollRoot instanceof Element ? scrollRoot : null,
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isScrolled };
}

export function PublicHeader({
  ctaHref = '/canvas',
  ctaLabel = 'Criar teoria',
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
            <Link href="/" className={styles.brand} aria-label="TMD Construtor — Página inicial">
              <Image
                src="/assets/brand/tmd-construtor-header-canonical.png"
                alt="TMD Construtor"
                width={1184}
                height={247}
                priority
                quality={100}
                className={styles.brandMark}
              />
            </Link>
            <nav className={styles.nav} aria-label="Navegação principal">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const active = isNavActive(pathname, item.href);
                const linkClassName = `${styles.navLink} ${active ? styles.navLink_active : ''}`;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClassName}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className={styles.headerCtaWrap}>
              <TdmButton
                href={ctaHref}
                recipe="public"
                variant="tertiary"
                size="sm"
                className={styles.headerCta}
                trailingIcon={ctaTrailingIcon}
              >
                {ctaLabel}
              </TdmButton>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
