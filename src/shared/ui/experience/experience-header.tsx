import Link from 'next/link';
import styles from './experience-header.module.sass';

export type ExperienceHeaderLink = {
  href: string;
  label: string;
  tone?: 'primary' | 'default';
};

export function ExperienceHeader({ brand = 'Construtor de Teoria da Mudança', links }: { brand?: string; links: ExperienceHeaderLink[] }) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {brand}
      </Link>
      <nav className={styles.nav} aria-label="Principal">
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href} className={link.tone === 'primary' ? styles.cta : styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
