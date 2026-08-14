'use client';

import { useMemo } from 'react';
import {
  TdmCenterIcon,
  TdmCloseIcon,
  TdmDownloadIcon,
  TdmImageIcon,
  TdmResetIcon,
  TdmZoomInIcon,
  TdmZoomOutIcon
} from '@/shared/ui/tdm-icons';
import { TdmIconButton } from '@/shared/ui/tdm-icon-button';
import { TdmMenu, type TdmMenuItem } from '@/shared/ui/tdm-menu';
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
  onExportImage?: (format: ResultImageExportFormat) => void | Promise<void>;
  exportImageHeading?: string;
  isExportingImage?: boolean;
  exportingImageFormat?: ResultImageExportFormat | null;
  exportImageError?: string | null;
};

function buildExportItems(
  onExportImage: (format: ResultImageExportFormat) => void | Promise<void>
): readonly TdmMenuItem[] {
  return (['png', 'svg'] as const).map((format) => ({
    id: format,
    label: format.toUpperCase(),
    icon: <TdmImageIcon />,
    onSelect: () => onExportImage(format)
  }));
}

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
  exportImageHeading = 'EXPORTAR IMAGEM DA TEORIA COMPLETA',
  isExportingImage = false,
  exportImageError = null
}: ResultToolbarProps) {
  const exportItems = useMemo(
    () => (onExportImage ? buildExportItems(onExportImage) : []),
    [onExportImage]
  );

  const closeControl = closeHref ? (
    <TdmIconButton
      href={closeHref}
      aria-label={closeLabel}
      tooltip={closeLabel}
      variant="subtle"
      size="md"
    >
      <TdmCloseIcon />
    </TdmIconButton>
  ) : (
    <TdmIconButton
      type="button"
      aria-label={closeLabel}
      tooltip={closeLabel}
      variant="subtle"
      size="md"
      onClick={onClose}
    >
      <TdmCloseIcon />
    </TdmIconButton>
  );

  return (
    <div data-export-exclude="true" className={styles.toolbarRoot}>
      <div className={styles.cluster} role="group" aria-label="Controles de visualização">
        <TdmIconButton aria-label="Aumentar zoom" tooltip="Aumentar zoom" variant="ghost" size="md" onClick={onZoomIn}>
          <TdmZoomInIcon />
        </TdmIconButton>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <TdmIconButton aria-label="Diminuir zoom" tooltip="Diminuir zoom" variant="ghost" size="md" onClick={onZoomOut}>
          <TdmZoomOutIcon />
        </TdmIconButton>
        <span className={styles.divider} aria-hidden="true" />
        <TdmIconButton
          aria-label="Centralizar visualização"
          tooltip="Centralizar visualização"
          variant="ghost"
          size="md"
          onClick={onCenter}
        >
          <TdmCenterIcon />
        </TdmIconButton>
        <TdmIconButton
          aria-label="Reiniciar visualização"
          tooltip="Reiniciar visualização"
          variant="ghost"
          size="md"
          onClick={onReset}
        >
          <TdmResetIcon />
        </TdmIconButton>
      </div>

      {onExportImage ? (
        <TdmMenu
          triggerLabel="Exportar imagem"
          triggerIcon={<TdmDownloadIcon />}
          tooltip="Exportar imagem"
          heading={exportImageHeading}
          items={exportItems}
          busy={isExportingImage}
          align="end"
          triggerVariant="subtle"
          triggerSize="md"
        />
      ) : null}

      {closeControl}

      {exportImageError ? (
        <span className={styles.exportError} role="status" aria-live="polite">
          {exportImageError}
        </span>
      ) : null}
    </div>
  );
}
