'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { resultStageMeta, resultStageOrder, getStageNodes, type ResultExperienceData } from './types';
import styles from './result-experience.module.sass';

export function ResultInteractivePreview({ data }: { data: ResultExperienceData }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={styles.previewShell}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: .62, ease: [.22, 1, .36, 1] }}
    >
      <div className={styles.previewContext}>
        <p>Pré-visualização</p>
        <h2>Um mapa compacto para entender a lógica antes de mergulhar.</h2>
        <span>O preview mostra a estrutura causal sem ocupar toda a página. A interação completa fica na rota dedicada.</span>
        <Link href="/exemplos/resultado/interativo" className={styles.previewCta}>
          Abrir visualização interativa
          <span>↗</span>
        </Link>
      </div>
      <Link href="/exemplos/resultado/interativo" className={styles.previewCanvas} aria-label="Abrir visualização interativa">
        <span className={styles.expandIcon} aria-hidden="true">⌗</span>
        <svg className={styles.previewConnections} viewBox="0 0 100 48" role="img" aria-label="Conexões resumidas entre etapas">
          <path d="M15 17 C 28 17, 28 17, 38 17" />
          <path d="M15 26 C 26 26, 28 31, 38 31" />
          <path d="M44 17 C 55 17, 55 17, 64 17" />
          <path d="M44 31 C 55 31, 55 31, 64 31" />
          <path d="M70 17 C 79 17, 78 24, 86 24" />
          <path d="M70 31 C 79 31, 78 24, 86 24" />
        </svg>
        <div className={styles.previewColumns}>
          {resultStageOrder.map((stage) => (
            <div key={stage} className={styles.previewStage} style={{ '--accent': resultStageMeta[stage].accent } as CSSProperties}>
              <strong>{resultStageMeta[stage].label}</strong>
              {getStageNodes(data, stage).slice(0, 3).map((node) => (
                <span key={node.id}>{node.title}</span>
              ))}
            </div>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
