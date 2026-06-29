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
    accent: '#a78bfa',
    accentSoft: 'rgba(167, 139, 250, 0.16)',
    border: 'rgba(167, 139, 250, 0.42)',
    glow: 'rgba(167, 139, 250, 0.28)',
    surface: 'rgba(167, 139, 250, 0.08)'
  },
  activity: {
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.16)',
    border: 'rgba(56, 189, 248, 0.42)',
    glow: 'rgba(56, 189, 248, 0.26)',
    surface: 'rgba(56, 189, 248, 0.08)'
  },
  output: {
    accent: '#f472b6',
    accentSoft: 'rgba(244, 114, 182, 0.16)',
    border: 'rgba(244, 114, 182, 0.42)',
    glow: 'rgba(244, 114, 182, 0.24)',
    surface: 'rgba(244, 114, 182, 0.08)'
  },
  outcome: {
    accent: '#34d399',
    accentSoft: 'rgba(52, 211, 153, 0.16)',
    border: 'rgba(52, 211, 153, 0.42)',
    glow: 'rgba(52, 211, 153, 0.24)',
    surface: 'rgba(52, 211, 153, 0.08)'
  }
};

export function getTdmStageTheme(stage: TdmStage) {
  return TDM_STAGE_THEME[stage];
}
