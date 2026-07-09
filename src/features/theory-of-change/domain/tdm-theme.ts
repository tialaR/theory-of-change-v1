import type { TdmStage } from './tdm-stages';

export const TDM_STAGE_THEME: Record<
  TdmStage,
  {
    accent: string;
    accentSoft: string;
    border: string;
    glow: string;
    surface: string;
  }
> = {
  input: {
    accent: '#8B7CFF',
    accentSoft: 'rgba(139, 124, 255, 0.18)',
    border: 'rgba(139, 124, 255, 0.38)',
    glow: 'rgba(139, 124, 255, 0.24)',
    surface: 'rgba(139, 124, 255, 0.10)'
  },
  activity: {
    accent: '#49B3FF',
    accentSoft: 'rgba(73, 179, 255, 0.16)',
    border: 'rgba(73, 179, 255, 0.34)',
    glow: 'rgba(73, 179, 255, 0.22)',
    surface: 'rgba(73, 179, 255, 0.09)'
  },
  output: {
    accent: '#F2A65A',
    accentSoft: 'rgba(242, 166, 90, 0.16)',
    border: 'rgba(242, 166, 90, 0.34)',
    glow: 'rgba(242, 166, 90, 0.22)',
    surface: 'rgba(242, 166, 90, 0.09)'
  },
  outcome: {
    accent: '#37C893',
    accentSoft: 'rgba(55, 200, 147, 0.16)',
    border: 'rgba(55, 200, 147, 0.34)',
    glow: 'rgba(55, 200, 147, 0.22)',
    surface: 'rgba(55, 200, 147, 0.09)'
  }
};

export function getTdmStageTheme(stage: TdmStage) {
  return TDM_STAGE_THEME[stage];
}

/** Neutral silver palette for Theory (Fase 0) — not a stage color */
export const TDM_THEORY_NEUTRAL = {
  text: '#FAFAFA',
  accent: 'rgba(250, 250, 250, 0.72)',
  border: 'rgba(250, 250, 250, 0.14)',
  glow: 'rgba(250, 250, 250, 0.08)',
  muted: 'rgba(176, 182, 194, 0.88)'
} as const;

/** Full journey gradient: Insumos → Atividades → Produtos → Resultados */
export const TDM_JOURNEY_GRADIENT =
  'linear-gradient(90deg, #8B7CFF 0%, #49B3FF 34%, #F2A65A 67%, #37C893 100%)';

const STAGE_CRYSTAL_TOKEN_KEYS: Record<TdmStage, { accent: string; glow: string }> = {
  input: { accent: '--stage-accent-insumos', glow: '--stage-glow-insumos' },
  activity: { accent: '--stage-accent-atividades', glow: '--stage-glow-atividades' },
  output: { accent: '--stage-accent-produtos', glow: '--stage-glow-produtos' },
  outcome: { accent: '--stage-accent-resultados', glow: '--stage-glow-resultados' }
};

export function getTdmStageCrystalCssVars(stage: TdmStage): Record<string, string> {
  const theme = getTdmStageTheme(stage);
  const keys = STAGE_CRYSTAL_TOKEN_KEYS[stage];

  return {
    [keys.accent]: theme.accent,
    [keys.glow]: theme.glow
  };
}

export const TDM_CRYSTAL_SILVER_PALETTE = {
  deep: '#111827',
  mid: '#6B7280',
  bright: '#D1D5DB',
  wire: 'rgba(209, 213, 219, 0.34)',
  wireBack: 'rgba(17, 24, 39, 0.28)',
  wireBright: 'rgba(243, 244, 246, 0.58)',
  outline: 'rgba(229, 231, 235, 0.72)',
  nodeCore: 'rgba(229, 231, 235, 0.88)',
  nodeGlow: 'rgba(156, 163, 175, 0.28)',
  specular: 'rgba(255, 255, 255, 0.88)'
} as const;

const TDM_STAGE_CRYSTAL_TINT: Record<
  TdmStage,
  {
    accent: string;
    accentSoft: string;
    glow: string;
    shadow: string;
  }
> = {
  input: {
    accent: 'rgba(150, 116, 255, 0.95)',
    accentSoft: 'rgba(150, 116, 255, 0.22)',
    glow: 'rgba(150, 116, 255, 0.28)',
    shadow: 'rgba(96, 72, 180, 0.32)'
  },
  activity: {
    accent: 'rgba(76, 144, 255, 0.95)',
    accentSoft: 'rgba(76, 144, 255, 0.2)',
    glow: 'rgba(76, 144, 255, 0.26)',
    shadow: 'rgba(36, 96, 196, 0.3)'
  },
  output: {
    accent: 'rgba(226, 156, 58, 0.95)',
    accentSoft: 'rgba(226, 156, 58, 0.2)',
    glow: 'rgba(226, 156, 58, 0.24)',
    shadow: 'rgba(160, 96, 24, 0.28)'
  },
  outcome: {
    accent: 'rgba(74, 194, 116, 0.95)',
    accentSoft: 'rgba(74, 194, 116, 0.2)',
    glow: 'rgba(74, 194, 116, 0.24)',
    shadow: 'rgba(36, 128, 72, 0.28)'
  }
};

export function getTdmStageCrystalPalette(_stage: TdmStage) {
  return TDM_CRYSTAL_SILVER_PALETTE;
}

export function getTdmStageCrystalTint(stage: TdmStage) {
  return TDM_STAGE_CRYSTAL_TINT[stage];
}

export function getTdmStageCrystalCssVarsExtended(stage: TdmStage): Record<string, string> {
  const tint = getTdmStageCrystalTint(stage);

  return {
    '--stage-crystal-accent': tint.accent,
    '--stage-crystal-accent-soft': tint.accentSoft,
    '--stage-crystal-glow': tint.glow,
    '--stage-crystal-shadow': tint.shadow
  };
}
