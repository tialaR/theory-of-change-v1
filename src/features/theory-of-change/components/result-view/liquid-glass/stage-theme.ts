import type { TdmStage } from '../../../domain/tdm-stages';
import { getResultStageAccent } from '../result-view-utils';
import type { ThemeTokens } from './types';

const BASE_THEME: ThemeTokens = {
  accentColor: '#8b7cff',
  accentSoftColor: '#a89cff',
  backgroundColor: '#0e0f13',
  panelColor: 'rgba(14, 15, 19, .94)',
  cardColor: 'rgba(13, 14, 18, .96)',
  titleColor: 'rgba(236, 237, 241, .94)',
  bodyColor: 'rgba(206, 208, 214, .74)',
  mutedColor: 'rgba(176, 178, 186, .58)',
  lineColor: 'rgba(255, 255, 255, .05)'
};

const STAGE_SOFT_COLORS: Record<TdmStage, string> = {
  input: 'rgba(168, 156, 255, 0.58)',
  activity: 'rgba(120, 196, 255, 0.58)',
  output: 'rgba(242, 186, 128, 0.58)',
  outcome: 'rgba(96, 210, 168, 0.58)'
};

export function getLiquidGlassStageTheme(stage: TdmStage): ThemeTokens {
  const accent = getResultStageAccent(stage);

  return {
    ...BASE_THEME,
    accentColor: accent.accent,
    accentSoftColor: STAGE_SOFT_COLORS[stage]
  };
}
