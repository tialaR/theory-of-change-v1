import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './login-form';
import styles from './login-page.module.sass';

const BRAND_MARK_SRC = '/assets/brand/tmd-construtor-guided-story-mark.png';

export type LoginPageProps = {
  returnTo: string;
};

export async function LoginPage({ returnTo }: LoginPageProps) {
  const t = await getTranslations('Auth.login');

  return (
    <main className={styles.page} data-auth-page="true">
      <Link className={styles.backLink} href="/" aria-label={t('backAriaLabel')}>
        <span aria-hidden="true">‹</span>
        <span>{t('back')}</span>
      </Link>
      <div className={styles.decorativeLeft} aria-hidden="true" />
      <div className={styles.decorativeRight} aria-hidden="true" />

      <section className={styles.panel} aria-labelledby="login-title">
        <header className={styles.header}>
          <Image
            className={styles.mark}
            src={BRAND_MARK_SRC}
            alt=""
            width={96}
            height={96}
            priority
          />
          <h1 className={styles.title} id="login-title">{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
        </header>
        <LoginForm returnTo={returnTo} />
      </section>
    </main>
  );
}
