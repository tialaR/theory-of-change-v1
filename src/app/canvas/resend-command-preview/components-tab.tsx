import styles from './resend-command-preview.module.sass';
import { ActionBarDemo, CoachInspectorSection, CommandPlate, EditorialNode, GalleryItem, HypothesisModal, LeftRailDemo, MiniMapDemo, ResultCard, RiskModal, icons } from './resend-command-preview.shared';
export function ComponentsTab() {
  return (
    <div className={styles.labScroll}>
      <header className={styles.labHeader}>
        <h2 className={styles.labTitle}>Componentes</h2>
        <p className={styles.labLead}>
          Galeria isolada da linguagem Resend Command Canvas.
        </p>
      </header>

      <div className={styles.galleryGrid}>
        <GalleryItem label="Command Plate compact">
          <CommandPlate compact />
        </GalleryItem>

        <GalleryItem label="Command Plate expanded">
          <CommandPlate />
        </GalleryItem>

        <GalleryItem label="Editorial Node normal">
          <EditorialNode
            staticPos
            stage="activity"
            stageLabel="Atividades"
            title="Capacitação local"
            desc="Ação realizada com os recursos disponíveis."
          />
        </GalleryItem>

        <GalleryItem label="Editorial Node selected">
          <EditorialNode
            staticPos
            stage="input"
            stageLabel="Insumos"
            title="Equipe técnica"
            desc="Recurso necessário para a política acontecer."
            selected
          />
        </GalleryItem>

        <GalleryItem label="Editorial Node editing">
          <EditorialNode
            staticPos
            stage="product"
            stageLabel="Produtos"
            title="Material formativo"
            desc="Entrega concreta gerada pela atividade."
            selected
            editing
          />
        </GalleryItem>

        <GalleryItem label="Coach Inspector section">
          <CoachInspectorSection />
        </GalleryItem>

        <GalleryItem label="Input">
          <input
            className={`${styles.input} ${styles.inputFocusMock}`}
            type="text"
            defaultValue="Equipe técnica"
            readOnly
          />
        </GalleryItem>

        <GalleryItem label="Textarea">
          <textarea
            className={styles.textarea}
            placeholder="Contexto, critérios ou observação metodológica"
            readOnly
          />
        </GalleryItem>

        <GalleryItem label="CTA neutral">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryNeutral}`}>
            Conectar lógica da teoria
          </button>
        </GalleryItem>

        <GalleryItem label="CTA contextual">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnPrimaryContextual}`}>
            {icons.add}
            Adicionar insumo
          </button>
        </GalleryItem>

        <GalleryItem label="CTA danger">
          <button type="button" className={`${styles.btn} ${styles.btnLg} ${styles.btnDanger}`}>
            {icons.delete}
            Remover bloco
          </button>
        </GalleryItem>

        <GalleryItem label="Action bar">
          <ActionBarDemo />
        </GalleryItem>

        <GalleryItem label="Risk modal">
          <RiskModal />
        </GalleryItem>

        <GalleryItem label="Hypothesis modal">
          <HypothesisModal />
        </GalleryItem>

        <GalleryItem label="Quick links">
          <div className={styles.supportRow}>
            <button type="button" className={styles.supportLink}>
              {icons.example}
              Exemplos
            </button>
            <button type="button" className={styles.supportLink}>
              {icons.guide}
              Guia
            </button>
          </div>
        </GalleryItem>

        <GalleryItem label="Result card">
          <ResultCard ready />
        </GalleryItem>

        <GalleryItem label="Left rail">
          <LeftRailDemo />
        </GalleryItem>

        <GalleryItem label="Minimap">
          <MiniMapDemo />
        </GalleryItem>
      </div>
    </div>
  );
}
