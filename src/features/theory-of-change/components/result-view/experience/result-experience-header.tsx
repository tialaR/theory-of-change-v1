'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { TdmEdge, TdmNode } from '../../../domain/tdm-types';
import { buildTheoryStatusSummary } from '../result-view-utils';
import styles from './result-experience.module.sass';

interface ResultExperienceHeaderProps {
  title: string;
  description?: string;
  nodes: TdmNode[];
  edges: TdmEdge[];
  backHref?: string;
  backLabel?: string;
}

export function ResultExperienceHeader({
  title,
  description,
  nodes,
  edges,
  backHref = '/exemplos',
  backLabel = 'Voltar aos exemplos'
}: ResultExperienceHeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const compactProgress = useTransform(scrollY, [0, 96], [0, 1]);
  const titleY = useTransform(compactProgress, [0, 1], [0, -6]);
  const metaOpacity = useTransform(compactProgress, [0, 1], [1, 0.56]);
  const summary = buildTheoryStatusSummary(nodes, edges);

  return (
    <motion.header
      ref={ref}
      className={styles.resultHeader}
      style={shouldReduceMotion ? undefined : { '--header-progress': compactProgress } as never}
    >
      <div className={styles.resultHeaderContent}>
        <motion.div style={shouldReduceMotion ? undefined : { y: titleY }} className={styles.resultHeaderCopy}>
          <p className={styles.eyebrow}>Resultado da Teoria da Mudança</p>
          <h1>{title}</h1>
          <motion.p style={shouldReduceMotion ? undefined : { opacity: metaOpacity }} className={styles.headerLead}>
            {description ?? 'Leia a lógica da intervenção em etapas, conexões, riscos e hipóteses.'}
          </motion.p>
          <motion.ul style={shouldReduceMotion ? undefined : { opacity: metaOpacity }} className={styles.headerStats}>
            <li><strong>{summary.stageCounts.input}</strong> Insumos</li>
            <li><strong>{summary.stageCounts.activity}</strong> Atividades</li>
            <li><strong>{summary.stageCounts.output}</strong> Produtos</li>
            <li><strong>{summary.stageCounts.outcome}</strong> Resultados</li>
            <li><strong>{summary.connectionCount}</strong> Conexões</li>
          </motion.ul>
        </motion.div>
        <Link className={styles.backButton} href={backHref}>
          <span aria-hidden="true">‹</span>
          {backLabel}
        </Link>
      </div>
    </motion.header>
  );
}
