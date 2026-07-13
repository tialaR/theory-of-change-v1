import type { CSSProperties } from 'react';
import styles from './experience-timeline.module.sass';

export type ExperienceTimelineItem = {
  title: string;
  copy: string;
  meta?: string;
  accent?: string;
};

export function ExperienceTimeline({ items }: { items: ExperienceTimelineItem[] }) {
  return (
    <ol className={styles.timeline}>
      {items.map((item, index) => (
        <li key={item.title} className={styles.item} style={{ '--timeline-accent': item.accent ?? 'rgba(255,255,255,.48)' } as CSSProperties}>
          <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
          <div>
            {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
