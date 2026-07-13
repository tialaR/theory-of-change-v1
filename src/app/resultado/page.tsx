import Link from 'next/link';
import styles from './page.module.sass';

export default function ResultadoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.panel}>
          <p className={styles.kicker}>Resultado</p>
          <h1 className={styles.title}>Abra pelo canvas para ver sua teoria atual</h1>
          <p className={styles.copy}>
            Ainda não há persistência global para abrir o resultado fora do canvas. Construa ou continue sua
            teoria no canvas, ou explore a visualização com dados de exemplo.
          </p>
          <div className={styles.actions}>
            <Link href="/canvas" className={styles.primary}>
              Ir para o canvas
            </Link>
            <Link href="/exemplos/resultado" className={styles.secondary}>
              Ver resultado exemplo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
