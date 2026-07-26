import styles from './resend-command-preview.module.sass';
import { ActionBarDemo, CommandPlate, EditorialNode, HypothesisModal, ResultCard, RiskModal, StateFrame, icons } from './resend-command-preview.shared';
export function StatesTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Estados</h2>
        <p className={styles.labLead}>
          Sequência visual do canvas — incluindo a fase neutra Conectar lógica.
        </p>
      </header>

      <div className={styles.statesGrid}>
        <StateFrame label="Empty canvas">
          <div className={styles.stateCanvas}>
            <p className={styles.stateEmpty}>Canvas vazio · pronto para o primeiro bloco</p>
          </div>
        </StateFrame>

        <StateFrame label="1 node">
          <div className={styles.stateCanvas}>
            <EditorialNode
              staticPos
              stage="input"
              stageLabel="Insumos"
              title="Novo insumo"
              desc="Primeiro bloco no canvas."
            />
          </div>
        </StateFrame>

        <StateFrame label="Node selected">
          <div className={styles.stateCanvas}>
            <div className={styles.stateStack}>
              <ActionBarDemo />
              <EditorialNode
                staticPos
                stage="input"
                stageLabel="Insumos"
                title="Equipe técnica"
                desc="Bloco selecionado."
                selected
              />
            </div>
          </div>
        </StateFrame>

        <StateFrame label="Editing node">
          <div className={styles.stateCanvas}>
            <EditorialNode
              staticPos
              stage="activity"
              stageLabel="Atividades"
              title="Capacitação local"
              desc="Editando descrição do bloco."
              selected
              editing
            />
          </div>
        </StateFrame>

        <StateFrame label="Connecting phase">
          <div className={styles.stateCanvas}>
            <div className={styles.stateConnecting}>
              <EditorialNode
                staticPos
                stage="input"
                stageLabel="Insumos"
                title="Equipe"
                desc="Origem"
              />
              <div className={styles.connectLine} />
              <EditorialNode
                staticPos
                stage="activity"
                stageLabel="Atividades"
                title="Ação"
                desc="Destino"
                selected
              />
            </div>
            <span className={styles.connectHintChip}>Arraste para conectar</span>
          </div>
        </StateFrame>

        <StateFrame label="Risk open">
          <div className={styles.stateCanvas}>
            <RiskModal />
          </div>
        </StateFrame>

        <StateFrame label="Hypothesis open">
          <div className={styles.stateCanvas}>
            <HypothesisModal />
          </div>
        </StateFrame>

        <StateFrame label="Result blocked">
          <div className={styles.stateCanvas}>
            <ResultCard />
          </div>
        </StateFrame>

        <StateFrame label="Result ready">
          <div className={styles.stateCanvas}>
            <ResultCard ready />
          </div>
        </StateFrame>

        <StateFrame label="Connect phase active" wide>
          <div className={styles.stateCanvas} data-connect="true">
            <CommandPlate tone="neutral" />
            <section className={styles.connectBlock}>
              <div className={styles.sectionLabel}>Conectar lógica</div>
              <p className={styles.connectHint}>
                Depois de Resultados: fase neutra branco/prata — sem cor de etapa.
              </p>
              <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
                {icons.connection}
                Conectar lógica da teoria
              </button>
            </section>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNum}>4</span>
                Resultados
              </li>
              <li className={styles.step} data-neutral="true" data-active="true">
                <span className={styles.stepNum}>5</span>
                Conectar lógica
              </li>
            </ol>
          </div>
        </StateFrame>
      </div>
    </div>
  );
}
