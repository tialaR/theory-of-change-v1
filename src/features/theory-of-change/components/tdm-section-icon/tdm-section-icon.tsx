'use client';

import type { ReactElement } from 'react';
import styles from './tdm-section-icon.module.sass';

export type TdmSectionIconVariant =
  | 'organization'
  | 'alignColumns'
  | 'quickShortcuts'
  | 'editBlock'
  | 'createBlock';

type TdmSectionIconProps = {
  variant: TdmSectionIconVariant;
  className?: string;
};

function OrganizationGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12 4.5 5.25 8.25 12 12 18.75 8.25 12 4.5" />
      <polyline points="5.25 13.25 12 17.25 18.75 13.25" />
      <polyline points="5.25 18.25 12 22.25 18.75 18.25" />
    </svg>
  );
}

function AlignColumnsGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.75" y="5" width="3.75" height="14" rx="1.25" />
      <rect x="10.125" y="5" width="3.75" height="14" rx="1.25" />
      <rect x="15.5" y="5" width="3.75" height="14" rx="1.25" />
    </svg>
  );
}

function QuickShortcutsGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
}

function EditBlockGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 5.75H8a2 2 0 0 0-2 2v10.25a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.75" />
      <path d="m16.75 3.75 3.5 3.5" />
      <path d="M12 12h4.75" />
      <path d="M12 12v4.75" />
    </svg>
  );
}

function CreateBlockGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.25" y="10.75" width="8.5" height="8.5" rx="1.75" />
      <rect x="9.25" y="5.75" width="8.5" height="8.5" rx="1.75" />
      <path d="M13.5 9.25v4.25" />
      <path d="M11.375 11.375h4.25" />
    </svg>
  );
}

const GLYPHS: Record<TdmSectionIconVariant, () => ReactElement> = {
  organization: OrganizationGlyph,
  alignColumns: AlignColumnsGlyph,
  quickShortcuts: QuickShortcutsGlyph,
  editBlock: EditBlockGlyph,
  createBlock: CreateBlockGlyph
};

export function TdmSectionIcon({ variant, className }: TdmSectionIconProps) {
  const Glyph = GLYPHS[variant];

  return (
    <span className={[styles.sectionIcon, className].filter(Boolean).join(' ')} aria-hidden="true">
      <Glyph />
    </span>
  );
}
