'use client';

import { useReactFlow } from '@xyflow/react';
import { icons } from './canvas-v2-icons';
import styles from '../canvas-v2.module.sass';

type Props = { fullMode: boolean; onExitFull: () => void };

export function CanvasToolbar({ fullMode, onExitFull }: Props) {
  const flow = useReactFlow();
  return (
    <nav className={styles.toolbar} aria-label="Ferramentas do canvas">
      <button type="button" data-active="true" aria-label="Selecionar"><span>{icons.cursor}</span><em>Selecionar</em></button>
      <button type="button" aria-label="Enquadrar teoria" onClick={() => flow.fitView({ padding: 0.18, duration: 320 })}><span>{icons.fit}</span><em>Enquadrar teoria</em></button>
      <button type="button" aria-label="Conexões"><span>{icons.connect}</span><em>Conexões</em></button>
      {fullMode ? <button type="button" aria-label="Sair do modo foco" onClick={onExitFull}><span>{icons.collapse}</span><em>Sair do modo foco</em></button> : null}
    </nav>
  );
}
