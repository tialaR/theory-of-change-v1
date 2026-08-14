'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmSectionIcon } from '../tdm-section-icon/tdm-section-icon';
import { BackArrowIcon } from './tdm-sidebar-primitives';
import styles from './tdm-sidebar.module.sass';

const QUICK_SHORTCUT_SPRING = { type: 'spring' as const, stiffness: 260, damping: 22 };
const MotionLink = motion.create(Link);

function ExamplesPreviewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <path
        d="M4.5 6.5 10 3.75 15.5 6.5v7L10 16.25 4.5 13.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M10 3.75v12.5M4.5 6.5 10 9.25 15.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

function GuidesDocIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.quickShortcutBtnIcon} fill="none">
      <path
        d="M6 3.75h5.5L15.25 7.5v8.75a.75.75 0 0 1-.75.75H6a1.25 1.25 0 0 1-1.25-1.25V5a1.25 1.25 0 0 1 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11.5 3.75V7.5h3.75" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.45" />
      <path d="M7.5 10.25h5M7.5 12.75h5M7.5 15.25h3.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function QuickShortcutButton({
  href,
  icon,
  label,
  shouldReduceMotion
}: {
  href: string;
  icon: ReactNode;
  label: string;
  shouldReduceMotion: boolean;
}) {
  return (
    <MotionLink
      href={href}
      className={styles.quickShortcutBtn}
      whileHover={undefined}
      whileTap={shouldReduceMotion ? undefined : { opacity: 0.88 }}
      transition={QUICK_SHORTCUT_SPRING}
    >
      <span className={styles.quickShortcutBtnIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.quickShortcutBtnLabel}>{label}</span>
    </MotionLink>
  );
}

// BEGIN CANVAS QUICK SHORTCUTS ACCORDION MICROFIX 10
function QuickShortcutsChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        styles.quickShortcutsChevron,
        isOpen ? styles.quickShortcutsChevronOpen : ''
      ]
        .filter(Boolean)
        .join(' ')}
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuickShortcutsCard({
  canRestoreTheory,
  onRestoreTheory
}: {
  canRestoreTheory: boolean;
  onRestoreTheory: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const accordionTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className={[styles.card, styles.quickShortcutsCard].join(' ')}>
      <button
        type="button"
        className={styles.quickShortcutsHeader}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.quickShortcutsTitleRow}>
          <TdmSectionIcon variant="quickShortcuts" />
          <span className={styles.quickShortcutsTitle}>Atalhos</span>
        </span>
        <QuickShortcutsChevron isOpen={isOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key={contentId}
            id={contentId}
            className={styles.quickShortcutsContent}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { height: 0, opacity: 0 }
                : { height: 0, opacity: 0, y: -3 }
            }
            transition={accordionTransition}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.quickShortcutsGrid}>
              <QuickShortcutButton
                href="/exemplos"
                icon={<ExamplesPreviewIcon />}
                label="Exemplos"
                shouldReduceMotion={shouldReduceMotion ?? false}
              />
              <QuickShortcutButton
                href="/guia-de-aprendizado"
                icon={<GuidesDocIcon />}
                label="Guia"
                shouldReduceMotion={shouldReduceMotion ?? false}
              />
            </div>

            {canRestoreTheory ? (
              <TdmButton
                variant="tertiary"
                fullWidth
                leadingIcon={<BackArrowIcon />}
                className={styles.sidebarCtaSpaced}
                onClick={onRestoreTheory}
              >
                Voltar para minha teoria
              </TdmButton>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
// END CANVAS QUICK SHORTCUTS ACCORDION MICROFIX 10

