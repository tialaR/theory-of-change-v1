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
