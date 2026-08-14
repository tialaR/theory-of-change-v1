'use client';

import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getStageNodes, resultStageMeta, resultStageOrder, type ResultExperienceProps } from './types';
import styles from './result-experience.module.sass';

export function ResultReportSection({ data }: { data: ResultExperienceProps }) {
  const reducedMotion = useReducedMotion();
  const insights = [
    {
      label: 'Conexões',
      title: 'A lógica causal conecta recursos a mudança observável.',
      body: `${data.edges.length} relações ligam recursos, ações, entregas e resultado. Cada linha precisa ser lida como uma hipótese prática.`
    },
    {
      label: 'Riscos',
      title: 'Riscos aparecem onde a execução pode perder força.',
      body: 'Os marcadores R ajudam a localizar gargalos de adesão, governança ou capacidade antes que eles virem falhas.'
    },
    {
      label: 'Hipóteses',
      title: 'Hipóteses tornam explícito o que a teoria está assumindo.',
      body: 'Os marcadores H deixam a relação causal auditável: o usuário entende por que uma etapa deveria influenciar a outra.'
    }
  ];

  return (
    <div className={styles.reportStack}>
      {insights.map((insight, index) => (
        <motion.article
          key={insight.label}
          className={styles.reportInsight}
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-16% 0px' }}
          transition={{ duration: .58, delay: index * .04, ease: [.22, 1, .36, 1] }}
        >
          <span>{insight.label}</span>
          <h3>{insight.title}</h3>
          <p>{insight.body}</p>
        </motion.article>
      ))}
      <div className={styles.stageReportGrid}>
        {resultStageOrder.map((stage) => (
          <motion.article
            key={stage}
            className={styles.stageReportCard}
            style={{ '--accent': resultStageMeta[stage].accent, '--accent-soft': resultStageMeta[stage].accentSoft } as CSSProperties}
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: .52, ease: [.22, 1, .36, 1] }}
          >
            <span>{resultStageMeta[stage].eyebrow}</span>
            <h3>{resultStageMeta[stage].label}</h3>
            <ul>
              {getStageNodes(data, stage).map((node) => (
                <li key={node.id}>
                  <strong>{node.title}</strong>
                  <p>{node.description}</p>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
