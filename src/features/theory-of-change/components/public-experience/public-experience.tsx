'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  PublicFooter,
  PublicHeader,
  PublicReveal,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ContextLabelBookOpenIcon } from '@/shared/ui/tdm-context-label';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import {
  GUIDE_STEPS,
  GuideStageCard,
  useActiveGuideStep,
  type GuideStep
} from '../learning-guide';
import styles from '../learning-guide/guide-experience.module.sass';

export function GuideExperiencePage() {
  return (
    <PublicShell tone="silver" className={styles.guideShell} headerContentGap>
      <PublicHeader />
      <GuideHero />
      <GuideTimeline />
      <PublicFooter />
    </PublicShell>
  );
}

function GuideHero() {
  return (
    <section className={styles.guideHero}>
      <PublicReveal className={styles.guideHeroCopy} amount={0.35}>
        <TdmKicker icon={ContextLabelBookOpenIcon}>Guia de aprendizado</TdmKicker>
        <h1>Construa a teoria etapa por etapa.</h1>
        <p className={styles.guideHeroDescription}>
          Cada etapa revela uma parte da lógica causal, com orientação prática e contexto visual.
        </p>
      </PublicReveal>
    </section>
  );
}

function GuideTimeline() {
  const reducedMotion = useReducedMotion() ?? false;
  const timelineRef = useRef<HTMLElement>(null);
  const { activeIndex, setStepRef } = useActiveGuideStep(GUIDE_STEPS.length);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.75', 'end 0.35']
  });
  const railScale = useTransform(scrollYProgress, [0, 1], [0.04, 1]);
  const shimmerY = useTransform(scrollYProgress, [0, 1], ['0%', '88%']);

  return (
    <section ref={timelineRef} className={styles.guideTimeline} aria-label="Linha do tempo do guia">
      <div className={styles.guideTimelineRail} aria-hidden="true">
        <motion.div className={styles.guideTimelineRailFill} style={{ scaleY: railScale }} />
        <motion.div className={styles.guideTimelineRailShimmer} style={{ y: shimmerY }} />
        {GUIDE_STEPS.map((step, index) => (
          <GuideTimelineDot
            key={step.number}
            step={step}
            isActive={activeIndex === index}
            reduced={reducedMotion}
          />
        ))}
      </div>

      <div className={styles.guideTimelineSteps}>
        {GUIDE_STEPS.map((step, index) => (
          <GuideTimelineRow
            key={step.number}
            step={step}
            index={index}
            isActive={activeIndex === index}
            reduced={reducedMotion}
            setRef={setStepRef(index)}
          />
        ))}
      </div>
    </section>
  );
}

function GuideTimelineDot({
  step,
  isActive,
  reduced
}: {
  step: GuideStep;
  isActive: boolean;
  reduced: boolean;
}) {
  const activeScale = isActive ? 1.35 : 1;
  const activeOpacity = isActive ? 1 : 0.72;
  const initialScale = reduced ? 1 : 0.6;
  const activeState = isActive ? 'true' : 'false';
  const transitionDuration = reduced ? 0.01 : 0.34;

  return (
    <motion.span
      className={styles.guideTimelineDot}
      data-tone={step.tone}
      data-active={activeState}
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      animate={{ scale: activeScale, opacity: activeOpacity }}
      transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    />
  );
}

function GuideTimelineRow({
  step,
  index,
  isActive,
  reduced,
  setRef
}: {
  step: GuideStep;
  index: number;
  isActive: boolean;
  reduced: boolean;
  setRef: (element: HTMLElement | null) => void;
}) {
  const showStageAccents = step.number === 'Passo 5' || step.number === 'Passo 6';
  const copyOpacity = isActive ? 1 : 0.48;
  const cardOpacity = isActive ? 1 : 0.38;
  const cardOffset = isActive ? '-0.35rem' : '0rem';
  const cardScale = isActive ? 1 : 0.985;
  const revealCopyInitialY = reduced ? 0 : '1.25rem';
  const revealCardInitialY = reduced ? 0 : '1.75rem';
  const initialOpacity = reduced ? 1 : 0;
  const copyTransitionDuration = reduced ? 0.01 : 0.55;
  const cardTransitionDuration = reduced ? 0.01 : 0.62;
  const stageAccents = renderGuideStageAccents(showStageAccents);

  return (
    <article ref={setRef} className={styles.guideTimelineRow} data-tone={step.tone}>
      <motion.div
        className={styles.guideTimelineCopy}
        initial={{ opacity: initialOpacity, y: revealCopyInitialY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: copyTransitionDuration, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        animate={{ opacity: copyOpacity }}
      >
        <span className={styles.guideStepNumber}>{step.number}</span>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
      </motion.div>

      <motion.div
        className={styles.guideStepCardMotion}
        initial={{ opacity: initialOpacity, y: revealCardInitialY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: cardTransitionDuration, delay: 0.04 + index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        animate={{ opacity: cardOpacity, y: cardOffset, scale: cardScale }}
      >
        <GuideStageCard
          tone={step.tone}
          className={styles.guideStageCard}
          contentClassName={styles.guideStageCardInner}
          aria-label={step.title}
        >
          {stageAccents}
          <h3>{step.title}</h3>
          <p className={styles.guideStepCardLead}>{step.description}</p>
          <div className={styles.guideStepCardMeta}>
            <div>
              <span>Recomendação</span>
              <p>{step.recommendation}</p>
            </div>
            <div>
              <span>Exemplo</span>
              <p>{step.example}</p>
            </div>
          </div>
        </GuideStageCard>
      </motion.div>
    </article>
  );
}

function renderGuideStageAccents(showStageAccents: boolean) {
  if (!showStageAccents) return null;
  return <GuideStageAccents />;
}

function GuideStageAccents() {
  return (
    <div className={styles.guideStageAccents} aria-hidden="true">
      <span data-tone="input">Insumos</span>
      <span data-tone="activity">Atividades</span>
      <span data-tone="output">Produtos</span>
      <span data-tone="outcome">Resultados</span>
    </div>
  );
}
