'use client';

import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button/tdm-icon-button';
import styles from './result-toolbar.module.sass';

export type ResultImageExportFormat = 'png' | 'svg';

type ResultToolbarProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onReset: () => void;
  closeHref?: string;
  onClose?: () => void;
  closeLabel?: string;
  onExportImage?: (format: ResultImageExportFormat) => void;
  isExportingImage?: boolean;
  exportingImageFormat?: ResultImageExportFormat | null;
  exportImageError?: string | null;
};

export function ResultToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onCenter,
  onReset,
  closeHref,
  onClose,
  closeLabel = 'Fechar',
  onExportImage,
  isExportingImage = false,
  exportingImageFormat = null,
  exportImageError = null
}: ResultToolbarProps) {
  return (
    <div data-export-exclude="true" className={styles.toolbarRoot}>
      <div className={styles.cluster} role="group" aria-label="Controles de visualização">
        <TdmIconButton aria-label="Aumentar zoom" tooltip="Aumentar zoom" variant="ghost" size="sm" onClick={onZoomIn}>
          +
        </TdmIconButton>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <TdmIconButton aria-label="Diminuir zoom" tooltip="Diminuir zoom" variant="ghost" size="sm" onClick={onZoomOut}>
          −
        </TdmIconButton>
        <span className={styles.divider} aria-hidden="true" />
        <TdmIconButton
          aria-label="Centralizar visualização"
          tooltip="Centralizar"
          variant="ghost"
          size="sm"
          onClick={onCenter}
        >
          ⌖
        </TdmIconButton>
        <TdmIconButton
          aria-label="Reiniciar visualização"
          tooltip="Reiniciar"
          variant="ghost"
          size="sm"
          onClick={onReset}
        >
          ↺
        </TdmIconButton>
      </div>

      {onExportImage ? (
        <div
          className={styles.exportCluster}
          role="group"
          aria-label="Exportar diagrama"
          aria-busy={isExportingImage || undefined}
        >
          <TdmButton
            type="button"
            variant="secondary"
            tone="neutral"
            size="sm"
            disabled={isExportingImage}
            isLoading={isExportingImage && exportingImageFormat === 'png'}
            onClick={() => onExportImage('png')}
          >
            PNG
          </TdmButton>
          <TdmButton
            type="button"
            variant="secondary"
            tone="neutral"
            size="sm"
            disabled={isExportingImage}
            isLoading={isExportingImage && exportingImageFormat === 'svg'}
            onClick={() => onExportImage('svg')}
          >
            SVG
          </TdmButton>
          {exportImageError ? (
            <span className={styles.exportError} role="status" aria-live="polite">
              {exportImageError}
            </span>
          ) : null}
        </div>
      ) : null}

      {closeHref ? (
        <TdmButton href={closeHref} variant="primary" tone="neutral" size="sm">
          {closeLabel}
        </TdmButton>
      ) : (
        <TdmButton type="button" variant="primary" tone="neutral" size="sm" onClick={onClose}>
          {closeLabel}
        </TdmButton>
      )}
    </div>
  );
}
