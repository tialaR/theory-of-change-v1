import { NARRATIVE_LABELS, NARRATIVE_TITLES } from '../result-theory-narrative/theory-narrative.templates';

export const THEORY_TRANSLATOR_MOTION = {
  duration: 0.22,
  contentDuration: 0.18,
  ease: [0.22, 1, 0.36, 1] as const,
  spring: { type: 'spring' as const, stiffness: 380, damping: 38, mass: 0.9 }
};

export const THEORY_TRANSLATOR_WIDTH = 'clamp(28rem, 34vw, 36rem)';

export const THEORY_TRANSLATOR_LABELS = {
  kicker: NARRATIVE_LABELS.kicker,
  kickerUpper: 'INTÉRPRETE DA TEORIA',
  close: NARRATIVE_LABELS.close,
  open: NARRATIVE_LABELS.open,
  empty: 'Abra o intérprete para ler a narrativa da teoria.',
  risk: NARRATIVE_LABELS.risk,
  hypothesis: NARRATIVE_LABELS.hypothesis,
  export: 'Exportar narrativa',
  exportMenu: 'Opções de exportação da narrativa',
  exportHeadingMacro: 'EXPORTAR TEORIA COMPLETA',
  exportHeadingScoped: 'EXPORTAR FLUXO SELECIONADO',
  exporting: 'Preparando exportação…',
  documentTitleMacro: NARRATIVE_TITLES.macro,
  documentTitleScoped: NARRATIVE_TITLES.scoped,
  /** @deprecated Prefer documentTitleMacro / documentTitleScoped from the ViewModel. */
  documentTitle: NARRATIVE_TITLES.macro
} as const;
