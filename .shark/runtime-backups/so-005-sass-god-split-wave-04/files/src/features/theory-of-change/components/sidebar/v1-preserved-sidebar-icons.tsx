import buttonStyles from '@/shared/ui/tdm-button/tdm-button.module.sass';
import styles from './tdm-sidebar.module.sass';

export function AccordionChevron({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        styles.sidebarAccordionChevron,
        isOpen ? styles.sidebarAccordionChevronOpen : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      fill="none"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ColumnsAlignIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={buttonStyles.icon} fill="none">
      <rect x="6" y="5" width="20" height="22" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 10V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function FinalResultCtaArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={buttonStyles.icon}>
      <path
        d="M4.5 11.5 11.5 4.5M11.5 4.5H6.25M11.5 4.5V9.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FinalResultHelperIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={styles.finalResultHelperIcon}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.1v3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.15" r="0.55" fill="currentColor" />
    </svg>
  );
}
