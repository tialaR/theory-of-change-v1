'use client';

import styles from './result-experience.module.sass';

const formats = ['PDF', 'JPEG', 'PNG', 'SVG'] as const;

export function ResultExportActions() {
  return (
    <div className={styles.exportRow} aria-label="Exportações">
      {formats.map((format) => (
        <button
          key={format}
          type="button"
          className={styles.exportButton}
          onClick={() => console.info(`Export ${format}: TODO integrate existing exporter`)}
        >
          Exportar {format}
        </button>
      ))}
    </div>
  );
}
