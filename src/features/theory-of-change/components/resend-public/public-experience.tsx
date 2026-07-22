'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  PublicFooter,
  PublicHeader,
  PublicReveal,
  PublicShell
} from '@/shared/ui/lusion-resend-ds';
import { ContextLabelBookOpenIcon } from '@/shared/ui/tdm-context-label';
import { TdmKicker } from '@/shared/ui/tdm-kicker';
import styles from './public-experience.module.sass';
import { GuideStageCard } from './guide-stage-card/guide-stage-card';

type GuideStepAccent = {
  color: string;
  glow: string;
  soft: string;
};

type GuideStep = {
  number: string;
  title: string;
  description: string;
  recommendation: string;
  example: string;
  accent: GuideStepAccent;
};

const GUIDE_STEP_ACCENTS = {
  silver: {
    color: 'rgba(232, 235, 242, 0.92)',
    glow: 'rgba(255, 255, 255, 0.22)',
    soft: 'rgba(255, 255, 255, 0.08)'
  },
  input: {
    color: 'rgba(198, 181, 255, 0.94)',
    glow: 'rgba(198, 181, 255, 0.34)',
    soft: 'rgba(198, 181, 255, 0.12)'
  },
  activity: {
    color: 'rgba(185, 217, 255, 0.94)',
    glow: 'rgba(185, 217, 255, 0.34)',
    soft: 'rgba(185, 217, 255, 0.12)'
  },
  output: {
    color: 'rgba(255, 216, 168, 0.94)',
    glow: 'rgba(255, 216, 168, 0.34)',
    soft: 'rgba(255, 216, 168, 0.12)'
  },
  outcome: {
    color: 'rgba(185, 245, 215, 0.94)',
    glow: 'rgba(185, 245, 215, 0.34)',
    soft: 'rgba(185, 245, 215, 0.12)'
  },
  connections: {
    color: 'rgba(232, 235, 242, 0.92)',
    glow: 'rgba(255, 255, 255, 0.18)',
    soft: 'rgba(255, 255, 255, 0.06)'
  }
} as const;

const GUIDE_STEPS: GuideStep[] = [
  {
    number: 'Passo 0',
    title: 'Fundamentos da Teoria de Mudança',
    description:
      'Entenda a lógica CLEAR/FGV para construir uma Teoria de Mudança: insumos → atividades → produtos → resultados.',
    recommendation:
      'Use esta etapa para compreender a coerência causal, as hipóteses e os riscos antes de preencher os cartões.',
    example: 'Insumos sustentam atividades, atividades geram produtos, produtos viabilizam resultados.',
    accent: GUIDE_STEP_ACCENTS.silver
  },
  {
    number: 'Passo 1',
    title: 'Insumos',
    description: 'Liste recursos e capacidades necessários para viabilizar a política.',
    recommendation:
      'Escreva como recursos ou capacidades em forma nominal: equipe formada, orçamento anual, parceria com municípios.',
    example: 'Equipe técnica, orçamento, dados educacionais.',
    accent: GUIDE_STEP_ACCENTS.input
  },
  {
    number: 'Passo 2',
    title: 'Atividades',
    description: 'Descreva o que a política faz com os insumos.',
    recommendation: 'Comece com verbos de ação: realizar, oferecer, implantar, acompanhar.',
    example: 'Formar professores, acompanhar escolas, revisar planos de ação.',
    accent: GUIDE_STEP_ACCENTS.activity
  },
  {
    number: 'Passo 3',
    title: 'Produtos',
    description: 'Registre as entregas diretas geradas pelas atividades.',
    recommendation: 'Produtos devem ser observáveis ou quantificáveis.',
    example: 'Oficinas realizadas, planos validados, relatórios emitidos.',
    accent: GUIDE_STEP_ACCENTS.output
  },
  {
    number: 'Passo 4',
    title: 'Resultados',
    description: 'Descreva mudanças de curto prazo nos públicos-alvo.',
    recommendation: 'Resultados indicam mudança de comportamento, atitude ou condição.',
    example: 'Escolas passam a usar dados com mais regularidade.',
    accent: GUIDE_STEP_ACCENTS.outcome
  },
  {
    number: 'Passo 5',
    title: 'Conexões causais',
    description:
      'Clique em um cartão de origem e depois em um cartão do estágio seguinte para criar uma relação causal.',
    recommendation: 'Conexões só acontecem entre fases consecutivas.',
    example: 'Insumos → Atividades → Produtos → Resultados.',
    accent: GUIDE_STEP_ACCENTS.connections
  },
  {
    number: 'Passo 6',
    title: 'Riscos e hipóteses',
    description: 'Use riscos e hipóteses para qualificar as conexões da teoria.',
    recommendation:
      'Riscos aparecem entre insumos, atividades e produtos. Hipóteses aparecem entre produtos e resultados.',
    example: 'Risco: baixa adesão das escolas. Hipótese: produtos entregues geram mudança observável.',
    accent: GUIDE_STEP_ACCENTS.connections
  },
  {
    number: 'Passo 7',
    title: 'Leitura final',
    description: 'Visualize a teoria completa após conectar as etapas.',
    recommendation:
      'Clique nos cards para destacar relações e revisar riscos, hipóteses e coerência causal.',
    example: 'A leitura final mostra quais elementos sustentam cada resultado.',
    accent: GUIDE_STEP_ACCENTS.silver
  }
];

function useActiveGuideStep(stepCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const elements = stepRefs.current.filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const index = elements.indexOf(visible[0].target as HTMLElement);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.2, 0.45, 0.7, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [stepCount]);

  const setStepRef = (index: number) => (element: HTMLElement | null) => {
    stepRefs.current[index] = element;
  };

  return { activeIndex, setStepRef };
}

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
        <TdmKicker icon={ContextLabelBookOpenIcon}>
          Guia de aprendizado
        </TdmKicker>
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
            index={index}
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
  index,
  isActive,
  reduced
}: {
  step: GuideStep;
  index: number;
  isActive: boolean;
  reduced: boolean;
}) {
  const top = `${((index + 0.5) / GUIDE_STEPS.length) * 100}%`;

  return (
    <motion.span
      className={styles.guideTimelineDot}
      style={
        {
          top,
          '--step-accent': step.accent.color,
          '--step-glow': step.accent.glow
        } as CSSProperties
      }
      initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      animate={{
        scale: isActive ? 1.35 : 1,
        opacity: isActive ? 1 : 0.72,
        boxShadow: isActive ? `0 0 1.1rem ${step.accent.glow}, 0 0 0 0.22rem ${step.accent.soft}` : `0 0 0 0.14rem ${step.accent.soft}`
      }}
      transition={{ duration: reduced ? 0.01 : 0.34, ease: [0.22, 1, 0.36, 1] }}
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

  return (
    <article
      ref={setRef}
      className={styles.guideTimelineRow}
      style={
        {
          '--step-accent': step.accent.color,
          '--step-accent-soft': step.accent.soft,
          '--step-soft': step.accent.soft
        } as CSSProperties
      }
    >
      <motion.div
        className={styles.guideTimelineCopy}
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : '1.25rem' }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: reduced ? 0.01 : 0.55, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        animate={{ opacity: isActive ? 1 : 0.48 }}
      >
        <span className={styles.guideStepNumber}>{step.number}</span>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
      </motion.div>

      <motion.div
        className={styles.guideStepCardMotion}
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : '1.75rem' }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: reduced ? 0.01 : 0.62, delay: 0.04 + index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        animate={{
          opacity: isActive ? 1 : 0.38,
          y: isActive ? '-0.35rem' : '0rem',
          scale: isActive ? 1 : 0.985
        }}
      >
        <GuideStageCard
          accentColor={step.accent.color}
          className={styles.guideStageCard}
          contentClassName={styles.guideStageCardInner}
          aria-label={step.title}
        >
          {showStageAccents ? (
            <div className={styles.guideStageAccents} aria-hidden="true">
              <span style={{ '--chip-color': GUIDE_STEP_ACCENTS.input.color } as CSSProperties}>Insumos</span>
              <span style={{ '--chip-color': GUIDE_STEP_ACCENTS.activity.color } as CSSProperties}>Atividades</span>
              <span style={{ '--chip-color': GUIDE_STEP_ACCENTS.output.color } as CSSProperties}>Produtos</span>
              <span style={{ '--chip-color': GUIDE_STEP_ACCENTS.outcome.color } as CSSProperties}>Resultados</span>
            </div>
          ) : null}
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
