import Link from 'next/link';
import { FlowDraftPreview } from '@/features/theory-of-change/components/resend-public/example-previews';
import styles from '@/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass';

export default function FluxoExemploPage() {
  return (
    <main className={styles.fullPage}>
      <section className={styles.fullShell}>
        <header className={styles.fullHeader}>
          <Link href="/exemplos">← Voltar</Link>
          <h1>Visualização do fluxo</h1>
        </header>
        <div className={styles.fullPreview}>
          <FlowDraftPreview active />
        </div>
      </section>
    </main>
  );
}
