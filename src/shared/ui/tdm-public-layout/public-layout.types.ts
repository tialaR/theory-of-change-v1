import type { ReactNode } from 'react';

export type PublicShellTone = 'default' | 'silver';

export interface PublicShellProps {
  children: ReactNode;
  className?: string;
  tone?: PublicShellTone;
  headerContentGap?: boolean;
  sectionRhythm?: boolean;
}

export interface PublicHeaderProps {
  ctaHref?: string;
  ctaLabel?: string;
  ctaTrailingIcon?: ReactNode;
}

export interface PublicHeroProps {
  kicker?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  compact?: boolean;
}

export interface PublicSectionProps {
  eyebrow?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}

export interface PublicCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export interface PublicTimelineStepData {
  number: string;
  title: string;
  text: string;
  visual: string;
}
