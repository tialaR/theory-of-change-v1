import type { RefObject } from 'react';
import { TheoryHeaderForm } from '../theory-header-form';
import styles from '../tdm-sidebar.module.sass';

export function TdmSidebarHero({
  theoryName,
  theoryDescription,
  isScrolled,
  isCompact,
  formRef,
  onTheoryNameChange,
  onTheoryDescriptionChange
}: {
  theoryName: string;
  theoryDescription: string;
  isScrolled: boolean;
  isCompact: boolean;
  formRef: RefObject<HTMLDivElement | null>;
  onTheoryNameChange: (value: string) => void;
  onTheoryDescriptionChange: (value: string) => void;
}) {
  return (
    <header className={[styles.header, isScrolled ? styles.headerScrolled : ''].filter(Boolean).join(' ')}>
      <div className={styles.headerCopy}>
        <section className={[styles.heroCard, isCompact ? styles.heroCardCollapsed : ''].filter(Boolean).join(' ')} aria-label="Hero da teoria da mudança">
          <span className={styles.heroGlowTop} aria-hidden="true" />
          <span className={styles.heroGlowBottom} aria-hidden="true" />
          <span className={styles.heroSpecular} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className={styles.heroLead}>
              <h1 className={styles.heroTitle}>Construtor de Teoria da Mudança</h1>
              <p className={styles.heroDescription}>Mapeie como recursos viram ações, entregas e resultados.</p>
            </div>
            <div ref={formRef} className={[styles.heroFormShell, isCompact ? styles.heroFormShellCollapsed : ''].filter(Boolean).join(' ')} aria-hidden={isCompact}>
              <TheoryHeaderForm
                theoryName={theoryName}
                theoryDescription={theoryDescription}
                onTheoryNameChange={onTheoryNameChange}
                onTheoryDescriptionChange={onTheoryDescriptionChange}
              />
            </div>
          </div>
        </section>
      </div>
    </header>
  );
}
