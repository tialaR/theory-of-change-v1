import styles from './home-brand-logo.module.sass';

export type HomeBrandLogoVariant = 'hero' | 'header';

const HERO_SRC = '/assets/brand/logo-premium-vortex.png';
const HEADER_SRC = '/assets/brand/tdm-brand-icon.png';

export function HomeBrandLogo({ variant }: { variant: HomeBrandLogoVariant }) {
  if (variant === 'header') {
    return (
      <img
        className={styles.headerIcon}
        src={HEADER_SRC}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
      />
    );
  }

  return (
    <div className={styles.heroRoot} aria-hidden="true">
      <img
        className={styles.heroImage}
        src={HERO_SRC}
        alt=""
        width={1024}
        height={1024}
      />
      <img
        className={styles.heroImageMotion}
        src={HERO_SRC}
        alt=""
        width={1024}
        height={1024}
      />
    </div>
  );
}
