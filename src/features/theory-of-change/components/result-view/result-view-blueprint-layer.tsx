'use client';

import styles from './result-view-blueprint-layer.module.sass';

export function ResultViewBlueprintLayer() {
  return (
    <div className={styles.blueprintLayer} aria-hidden="true">
      <svg className={styles.blueprintSvg} preserveAspectRatio="none">
        <defs>
          <pattern id="result-blueprint-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.028)" strokeWidth="0.5" />
          </pattern>
          <pattern id="result-blueprint-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.75" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#result-blueprint-grid)" />
        <rect width="100%" height="100%" fill="url(#result-blueprint-dots)" opacity="0.55" />
        <line x1="0" y1="18%" x2="100%" y2="18%" className={styles.guideLine} />
        <line x1="0" y1="50%" x2="100%" y2="50%" className={styles.guideLine} />
        <line x1="0" y1="82%" x2="100%" y2="82%" className={styles.guideLine} />
        <line x1="12.5%" y1="0" x2="12.5%" y2="100%" className={styles.guideLineVertical} />
        <line x1="37.5%" y1="0" x2="37.5%" y2="100%" className={styles.guideLineVertical} />
        <line x1="62.5%" y1="0" x2="62.5%" y2="100%" className={styles.guideLineVertical} />
        <line x1="87.5%" y1="0" x2="87.5%" y2="100%" className={styles.guideLineVertical} />
      </svg>
      <div className={styles.blueprintCornerMarks}>
        <span className={styles.cornerMark} />
        <span className={styles.cornerMark} />
        <span className={styles.cornerMark} />
        <span className={styles.cornerMark} />
      </div>
    </div>
  );
}
