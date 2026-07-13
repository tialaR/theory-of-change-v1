'use client';

import { useRouter } from 'next/navigation';
import { ResultView } from '@/features/theory-of-change/components/result-view/result-view';
import { exampleTheory } from '@/features/theory-of-change/data/example-theory';

export function ResultadoExemploClient() {
  const router = useRouter();

  return (
    <ResultView
      title={exampleTheory.title}
      nodes={exampleTheory.nodes}
      edges={exampleTheory.edges}
      backLabel="Voltar ao início"
      onBack={() => router.push('/')}
    />
  );
}
