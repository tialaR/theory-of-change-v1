import styles from './resend-command-preview.module.sass';
export function ReferencesTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Referências</h2>
        <p className={styles.labLead}>Regra visual do Resend Command Canvas.</p>
      </header>

      <article className={styles.refsCard}>
        <h3 className={styles.typeDisplay}>Resend Command Canvas</h3>
        <ul className={styles.refsList}>
          <li>preto profundo</li>
          <li>prata</li>
          <li>luz no topo</li>
          <li>borda fina</li>
          <li>bottom desaparecendo</li>
          <li>cor de etapa só como sinal</li>
          <li>CTA neutro por padrão</li>
          <li>risco/hipótese neutros</li>
          <li>zero pill</li>
          <li>zero neon</li>
          <li>zero botão chapado</li>
        </ul>

        <div className={styles.refsRules}>
          <div>
            <h4 className={styles.sectionTitle}>Radius</h4>
            <p className={styles.typeMuted}>
              micro 0.5rem · botões 0.625–0.75rem · inputs 0.75rem · cards 0.875–1rem ·
              dots circulares · nunca 999rem em botões/inputs/cards/toolbar
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>CTAs</h4>
            <p className={styles.typeMuted}>
              retangulares · gradiente branco/prata no neutro · acento sutil contextual ·
              nunca chapado
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Inputs</h4>
            <p className={styles.typeMuted}>
              borda fina · menos peso · mais respiro · foco sutil
            </p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Tipografia</h4>
            <p className={styles.typeMuted}>
              sem #fff puro · títulos com gradiente branco/prata · labels menos espaçados ·
              muted legível
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
