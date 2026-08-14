'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TdmNode } from '../../../domain/tdm-types';
import { TDM_STAGE_LABELS, type TdmStage } from '../../../domain/tdm-stages';
import { getResultStageAccent } from '../result-view-utils';
import { ResultLiquidCard, getLiquidGlassStageTheme } from '../liquid-glass';
import styles from '../result-view.module.sass';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;
const FOCUS_TRANSITION = { duration: 0.3, ease: PREMIUM_EASE };
const RIPPLE_TRANSITION = { duration: 0.52, ease: PREMIUM_EASE };
const CARD_FLOAT_Y = -2;
const CARD_FLOAT_SCALE = 1.006;

type RipplePoint = { x: number; y: number; id: number };

type ResultReadingCardProps = {
  node: TdmNode;
  stage: TdmStage;
  incomingCount: number;
  outgoingCount: number;
  isFocused: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  onRegisterRef: (nodeId: string, element: HTMLElement | null) => void;
  shouldReduceMotion: boolean | null;
};

export function ResultReadingCard({
  node,
  stage,
  incomingCount,
  outgoingCount,
  isFocused,
  isHighlighted,
  isDimmed,
  isDisabled,
  onSelect,
  onRegisterRef,
  shouldReduceMotion
}: ResultReadingCardProps) {
  const [ripple, setRipple] = useState<RipplePoint | null>(null);
  const theme = getResultStageAccent(stage);
  const hasDetails = Boolean(node.advancedDetails?.trim());
  const hasNotes = Boolean(node.shortNotes?.trim());
  const description = node.description?.trim() || 'Sem descrição registrada.';

  const handleActivate = useCallback(
    (clientX?: number, clientY?: number, element?: HTMLElement | null) => {
      if (!isFocused && element && clientX !== undefined && clientY !== undefined && !shouldReduceMotion) {
        const rect = element.getBoundingClientRect();
        setRipple({ x: clientX - rect.left, y: clientY - rect.top, id: Date.now() });
      }

      onSelect();
    },
    [isFocused, onSelect, shouldReduceMotion]
  );

  return (
    <motion.article
      ref={(element) => onRegisterRef(node.id, element)}
      layout={false}
      className={[
        styles.readingCardShell,
        isFocused ? styles.readingCardFocused : '',
        isHighlighted && !isFocused ? styles.readingCardHighlighted : '',
        isDimmed ? styles.readingCardDimmed : '',
        isDisabled ? styles.readingCardDisabled : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--stage-accent': theme.accent,
          '--stage-accent-soft': theme.accentSoft,
          '--stage-border': theme.border,
          '--stage-glow': theme.glow,
          transformOrigin: 'center top'
        } as CSSProperties
      }
      onClick={(event) => handleActivate(event.clientX, event.clientY, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleActivate(undefined, undefined, event.currentTarget);
        }
      }}
      tabIndex={0}
      aria-pressed={isFocused}
      aria-selected={isFocused}
      aria-label={`${node.title}, ${TDM_STAGE_LABELS[stage]}`}
      animate={{
        opacity: isDisabled && !isFocused ? 0.34 : isDimmed ? 0.45 : isHighlighted && !isFocused ? 0.94 : 1,
        y: isFocused ? CARD_FLOAT_Y : 0,
        scale: isFocused ? CARD_FLOAT_SCALE : 1
      }}
      transition={shouldReduceMotion ? { duration: 0.01 } : FOCUS_TRANSITION}
    >
      <ResultLiquidCard
        title={node.title}
        description={description}
        details={hasDetails ? node.advancedDetails : undefined}
        notes={hasNotes ? node.shortNotes : undefined}
        incomingCount={incomingCount}
        outgoingCount={outgoingCount}
        accentColor={theme.accent}
        theme={getLiquidGlassStageTheme(stage)}
        glassClassName={styles.readingCardGlass}
        titleClassName={styles.readingCardTitle}
        ariaLabel={`${node.title}, ${TDM_STAGE_LABELS[stage]}`}
      >
        <AnimatePresence>
          {ripple ? (
            <motion.span
              key={ripple.id}
              className={styles.cardRipple}
              style={{ left: ripple.x, top: ripple.y }}
              initial={{ scale: 0, opacity: 0.42 }}
              animate={{ scale: 5.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0.01 } : RIPPLE_TRANSITION}
              onAnimationComplete={() => setRipple(null)}
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>
      </ResultLiquidCard>
    </motion.article>
  );
}
