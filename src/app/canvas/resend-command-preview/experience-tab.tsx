import styles from './resend-command-preview.module.sass';
import { ActionBarDemo, CoachInspectorSection, CommandPlate, EditorialNode, EXPERIENCE_NODES, LeftRailDemo, MiniMapDemo, RiskModal, icons } from './resend-command-preview.shared';
export function ExperienceTab() {
  return (
    <div className={styles.experience}>
      <div className={styles.canvas} aria-hidden="true" />

      <div className={styles.commandPlate}>
        <CommandPlate />
        <CommandPlate tone="neutral" compact />
        <p className={styles.commandPlateHint}>
          Depois de Resultados vem: <strong>Conectar lógica</strong>
        </p>
      </div>

      <svg className={styles.edges} viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker
            id="arrow-lab"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1 L9 5 L1 9"
              fill="none"
              stroke="rgba(188,192,204,0.45)"
              strokeWidth="1.4"
            />
          </marker>
        </defs>
        <path
          d="M210 280 C290 250, 320 230, 400 220"
          fill="none"
          stroke="rgba(188,192,204,0.28)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
        <path
          d="M520 240 C600 280, 640 340, 700 360"
          fill="none"
          stroke="rgba(188,192,204,0.24)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
        <path
          d="M760 360 C820 300, 860 260, 920 250"
          fill="none"
          stroke="rgba(188,192,204,0.22)"
          strokeWidth="1.1"
          strokeDasharray="3 7"
          markerEnd="url(#arrow-lab)"
        />
      </svg>

      <span className={`${styles.edgeBadge} ${styles.badgeR}`}>R</span>
      <span className={`${styles.edgeBadge} ${styles.badgeH}`}>H</span>

      <div className={styles.actionBarExp}>
        <ActionBarDemo />
      </div>

      <div className={styles.nodes}>
        {EXPERIENCE_NODES.map((node) => (
          <EditorialNode key={node.stage} {...node} />
        ))}
      </div>

      <div className={styles.riskPanelExp}>
        <RiskModal />
      </div>

      <div className={styles.hypothesisChip}>
        <div className={styles.hypothesisChipTitle}>Explicitar lógica causal</div>
        <div className={styles.hypothesisChipSub}>Hipótese desta passagem</div>
      </div>

      <div className={styles.leftRailExp}>
        <LeftRailDemo />
      </div>

      <aside className={styles.checklist} aria-label="Checklist técnico">
        <div className={styles.checklistTitle}>Resend Command Visual Lab</div>
        <ul className={styles.checklistList}>
          <li>zero pill em botões</li>
          <li>cor de etapa só como sinal</li>
          <li>risco/hipótese neutros</li>
          <li>Command Plate não é header</li>
          <li>sidebar é coach inspector</li>
          <li>nodes são editoriais</li>
          <li>edges são lógica fina</li>
          <li>fase Conectar é neutra</li>
        </ul>
      </aside>

      <div className={styles.miniMapExp}>
        <MiniMapDemo />
      </div>

      <aside className={styles.sidebar} aria-label="Coach Inspector">
        <div className={styles.sidebarScroll}>
          <header className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>Construtor de Teoria da Mudança</h1>
            <p className={styles.sidebarLead}>
              Mapeie como recursos viram ações, entregas e resultados.
            </p>
          </header>

          <div className={styles.divider} />

          <CoachInspectorSection />

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Entenda</div>
            <div className={styles.sectionTitle}>Insumos</div>
            <p className={styles.sectionBody}>
              Recursos que precisam existir antes da ação começar.
            </p>
            <p className={styles.guideQ}>Pergunta-guia: O que precisa estar disponível?</p>
            <p className={styles.examples}>Exemplos: equipe, orçamento, dados, parceiros.</p>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Etapas</div>
            <ol className={styles.steps}>
              <li className={styles.step} data-active="true">
                <span className={styles.stepNum}>1</span>
                Insumos
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>2</span>
                Atividades
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>3</span>
                Produtos
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum}>4</span>
                Resultados
              </li>
              <li className={styles.step} data-neutral="true">
                <span className={styles.stepNum}>5</span>
                Conectar lógica
              </li>
            </ol>
          </section>

          <div className={styles.divider} />

          <section className={styles.connectBlock}>
            <div className={styles.sectionLabel}>Fase Conectar</div>
            <p className={styles.connectHint}>
              Depois de Resultados, o próximo passo é: <strong>Conectar lógica</strong>
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
              {icons.connection}
              Conectar lógica da teoria
            </button>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Inspector</div>
            <div className={styles.inspectorRow}>
              <button type="button" className={styles.inspectorLink}>
                {icons.add}
                Criar bloco
              </button>
              <button type="button" className={styles.inspectorLink}>
                {icons.edit}
                Editar bloco
              </button>
            </div>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Formulário</div>
            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Título</span>
                <input
                  className={`${styles.input} ${styles.inputFocusMock}`}
                  type="text"
                  placeholder="Nome do insumo"
                  defaultValue="Equipe técnica"
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Descrição breve</span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Uma linha que resume o bloco"
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Detalhes avançados</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Contexto, critérios ou observação metodológica"
                  readOnly
                />
              </label>
            </div>
          </section>

          <div className={styles.divider} />

          <section className={`${styles.section} ${styles.resultBlock}`}>
            <div className={styles.sectionLabel}>Resultado</div>
            <div className={styles.sectionTitle}>Resultado da sua teoria</div>
            <p className={styles.sectionBody}>
              Revise etapas, conexões, riscos e hipóteses.
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
              Visualizar resultado
              {icons.chevron}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
