import type { ReactNode } from 'react';
import styles from './resend-command-preview.module.sass';
import { icons } from './resend-command-preview.shared';
export function TypographyTab() {
  const iconExamples: { label: string; icon: ReactNode }[] = [
    { label: 'fácil de usar', icon: icons.easy },
    { label: 'anexos', icon: icons.attach },
    { label: 'alta visibilidade', icon: icons.visibility },
    { label: 'entrega e acesso', icon: icons.delivery },
    { label: 'criar', icon: icons.add },
    { label: 'editar', icon: icons.edit },
    { label: 'duplicar', icon: icons.duplicate },
    { label: 'deletar', icon: icons.delete },
    { label: 'camadas', icon: icons.layers },
    { label: 'conexão', icon: icons.connection },
    { label: 'guia', icon: icons.guide },
    { label: 'exemplos', icon: icons.example },
    { label: 'fechar', icon: icons.close },
    { label: 'chevron', icon: icons.chevron }
  ];

  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Tipografia & Ícones</h2>
        <p className={styles.labLead}>
          Branco/prata translúcido — nunca #FFFFFF puro. Ícones finos, 16–18px.
        </p>
      </header>

      <section className={styles.typeGuide}>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>display / title</span>
          <h3 className={styles.typeDisplay}>Construtor de Teoria da Mudança</h3>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>label técnico</span>
          <span className={styles.typeLabel}>Insumos · 2/2/1/1 · Conexões</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>node title</span>
          <span className={styles.typeNodeTitle}>Equipe técnica</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>body</span>
          <p className={styles.typeBody}>
            Mapeie como recursos viram ações, entregas e resultados mensuráveis.
          </p>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>muted</span>
          <p className={styles.typeMuted}>Texto de apoio que não some no fundo escuro.</p>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>button</span>
          <span className={styles.typeButton}>Conectar lógica da teoria</span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.galleryLabel}>helper text</span>
          <p className={styles.typeHelper}>
            Depois de Resultados vem a fase neutra: Conectar lógica.
          </p>
        </div>
      </section>

      <section className={styles.iconGuide}>
        <h3 className={styles.sectionTitle}>Ícones</h3>
        <p className={styles.sectionBody}>
          SVG inline · stroke 1.55 · sem container gigante · cor translúcida.
        </p>
        <div className={styles.iconGrid}>
          {iconExamples.map((item) => (
            <div key={item.label} className={styles.iconCard}>
              <span className={styles.iconGlyph}>{item.icon}</span>
              <span className={styles.iconCardLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
