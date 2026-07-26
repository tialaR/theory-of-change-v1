'use client';

import { useReactFlow } from '@xyflow/react';
import { icons } from './canvas-v2-icons';
import styles from '../canvas-v2.module.sass';

type Props = {
  fullMode: boolean;
  onExitFull: () => void;
  onOrganize: () => void;
  onCenterColumns: () => void;
  onGuide: () => void;
  onClearSelection: () => void;
};

export function CanvasToolbar(props: Props) {
  const flow = useReactFlow();

  return (
    <div className={styles.toolbarDock}>
      <nav className={styles.toolbar} aria-label="Atalhos do canvas">
        <button type="button" aria-label="Enquadrar teoria" onClick={() => flow.fitView({ padding: 0.2, duration: 320 })}><span>{icons.fit}</span><em>Enquadrar teoria</em></button>
        <button type="button" aria-label="Centralizar colunas" onClick={props.onCenterColumns}><span>{icons.columns}</span><em>Centralizar colunas</em></button>
        <button type="button" aria-label="Organizar fluxo" onClick={props.onOrganize}><span>{icons.organize}</span><em>Organizar fluxo</em></button>
        <button type="button" aria-label="Guia da teoria" onClick={props.onGuide}><span>{icons.guide}</span><em>Guia da teoria</em></button>
        <button type="button" aria-label="Limpar seleção" onClick={props.onClearSelection}><span>{icons.clear}</span><em>Limpar seleção</em></button>
      </nav>
      <nav className={styles.zoomToolbar} aria-label="Controles de zoom">
        <button type="button" aria-label="Aumentar zoom" onClick={() => flow.zoomIn({ duration: 180 })}><span>{icons.zoomIn}</span><em>Aumentar zoom</em></button>
        <button type="button" aria-label="Diminuir zoom" onClick={() => flow.zoomOut({ duration: 180 })}><span>{icons.zoomOut}</span><em>Diminuir zoom</em></button>
        {props.fullMode ? <button type="button" aria-label="Sair do modo foco" onClick={props.onExitFull}><span>{icons.collapse}</span><em>Sair do modo foco</em></button> : null}
      </nav>
    </div>
  );
}
