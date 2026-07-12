import type { TdmStage } from '../../../domain/tdm-stages';
import { getResultStageAccent } from '../result-view-utils';
import type { ThemeTokens } from './types';

const BASE_THEME: ThemeTokens = {
  accentColor: '#a98cff',
  accentSoftColor: '#c1adff',
  backgroundColor: '#121318',
  panelColor: 'rgba(17, 18, 22, .12)',
  cardColor: 'rgba(11, 12, 15, .12)',
  titleColor: 'rgba(242, 242, 245, .94)',
  bodyColor: 'rgba(218, 218, 222, .76)',
  mutedColor: 'rgba(198, 198, 204, .68)',
  lineColor: 'rgba(255, 255, 255, .065)'
};

const STAGE_SOFT_COLORS: Record<TdmStage, string> = {
  input: 'rgba(196, 181, 253, 0.96)',
  activity: 'rgba(147, 197, 253, 0.96)',
  output: 'rgba(253, 186, 116, 0.96)',
  outcome: 'rgba(110, 231, 183, 0.96)'
};

export function getLiquidGlassStageTheme(stage: TdmStage): ThemeTokens {
  const accent = getResultStageAccent(stage);

  return {
    ...BASE_THEME,
    accentColor: accent.accent,
    accentSoftColor: STAGE_SOFT_COLORS[stage]
  };
}
