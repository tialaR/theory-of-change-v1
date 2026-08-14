'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { ExamplePreviewFrame } from './example-preview-frame';
import { FlowDraftPreview } from './flow-draft-preview';
import { ResultDraftPreview } from './result-draft-preview';

type DedicatedExamplePreviewProps = {
  type: 'flow' | 'result';
  active?: boolean;
};

export function DedicatedExamplePreview({ type, active }: DedicatedExamplePreviewProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.45,
  });
  const isActive = active ?? isInView;
  const Preview = type === 'flow' ? FlowDraftPreview : ResultDraftPreview;
  const density = type === 'flow' ? 'compact' : 'detailed';
  const ariaLabel =
    type === 'flow'
      ? 'Prévia viva da visão do fluxo'
      : 'Prévia viva da leitura executiva / resultado conectado';

  return (
    <ExamplePreviewFrame ref={ref} ariaLabel={ariaLabel} density={density}>
      <Preview active={isActive} />
    </ExamplePreviewFrame>
  );
}
