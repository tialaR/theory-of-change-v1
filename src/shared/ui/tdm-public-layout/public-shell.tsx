import { PublicBodyClassController } from './public-body-class-controller';
import { PublicGridBackground } from './public-grid-background';
import type { PublicShellProps } from './public-layout.types';
import styles from './tdm-public-layout.module.sass';

export function PublicShell({
  children,
  className = '',
  tone = 'default',
  headerContentGap = false,
  sectionRhythm = false
}: PublicShellProps) {
  const shellInnerClassName = [
    styles.shellInner,
    headerContentGap ? styles.shellInner_headerContentGap : '',
    sectionRhythm ? styles.shellInner_sectionRhythm : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div data-public-page="true" data-public-tone={tone} className={`${styles.shell} ${className}`}>
      <PublicBodyClassController />
      <PublicGridBackground />
      <div data-public-scroll="true" className={styles.shellScroll}>
        <div
          className={shellInnerClassName}
          data-header-content-gap={headerContentGap ? 'true' : undefined}
          data-section-rhythm={sectionRhythm ? 'true' : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
