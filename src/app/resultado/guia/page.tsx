import Link from 'next/link';
import styles from './guia.module.sass';

const GUIDE_SECTIONS = [
  {
    title: 'Colunas',
    copy: 'A leitura segue o fluxo causal da esquerda para a direita: insumos, atividades, produtos e resultados. Cada coluna agrupa os blocos daquela etapa da teoria.'
  },
  {
    title: 'Conexões',
    copy: 'As linhas entre cartões mostram caminhos causais. Ao focar um bloco ou uma conexão, o restante da cena se atenua para destacar o percurso relevante.'
  },
  {
    title: 'Riscos',
    copy: 'Marcadores de risco aparecem em conexões críticas — tipicamente entre insumos e atividades, ou atividades e produtos — sinalizando pontos de atenção na cadeia.'
  },
  {
    title: 'Hipóteses',
    copy: 'Hipóteses marcam pressupostos entre produtos e resultados. Elas ajudam a explicitar o que precisa ser verdadeiro para a mudança esperada ocorrer.'
  },
  {
    title: 'Foco automático',
    copy: 'Ao selecionar um cartão ou uma ponte, a visualização destaca o caminho conectado e abre o inspetor de fluxo com o contexto daquela relação.'
  },
  {
    title: 'Exportação',
    copy: 'No resultado da sua teoria (aberto pelo canvas), você pode exportar o fluxo em formatos disponíveis no menu de exportação para compartilhar ou documentar.'
  }
] as const;

export default function ResultadoGuiaPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            Teoria da Mudança
          </Link>
          <nav className={styles.nav} aria-label="Guia">
            <Link href="/canvas" className={styles.navLink}>
              Canvas
            </Link>
            <Link href="/exemplos/resultado" className={styles.navLink}>
              Resultado exemplo
            </Link>
          </nav>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Guia de leitura</p>
          <h1 className={styles.title}>Como ler o resultado da sua teoria</h1>
          <p className={styles.lead}>
            Uma visão rápida dos elementos da tela de resultado — para navegar colunas, conexões e marcadores
            com clareza.
          </p>
        </section>

        <ul className={styles.list}>
          {GUIDE_SECTIONS.map((section) => (
            <li key={section.title} className={styles.item}>
              <h2 className={styles.itemTitle}>{section.title}</h2>
              <p className={styles.itemCopy}>{section.copy}</p>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link href="/canvas" className={styles.primary}>
            Abrir canvas
          </Link>
          <Link href="/exemplos/resultado" className={styles.secondary}>
            Ver resultado exemplo
          </Link>
        </div>
      </div>
    </main>
  );
}
