import Image from 'next/image';
import Link from 'next/link';
import styles from '../tdm-public-layout.module.sass';

export function PublicHeaderBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="TDM Construtor — Página inicial">
      <Image
        src="/assets/brand/tmd-construtor-header-canonical.png"
        alt="TDM Construtor"
        width={1184}
        height={247}
        priority
        quality={100}
        className={styles.brandMark}
      />
    </Link>
  );
}
