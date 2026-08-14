import Link from 'next/link';
import { PUBLIC_NAV_ITEMS, isPublicNavItemActive } from './public-header-policy';
import styles from '../tdm-public-layout.module.sass';

interface PublicHeaderNavigationProps {
  pathname: string;
}

export function PublicHeaderNavigation({ pathname }: PublicHeaderNavigationProps) {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {PUBLIC_NAV_ITEMS.map((item) => {
        const active = isPublicNavItemActive(pathname, item.href);
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
  );
}
