import { useId, type CSSProperties, type ReactNode } from 'react';
import { TdmButton } from '@/shared/ui/tdm-button/tdm-button';
import type { TdmNodeDraft } from '../../../domain/tdm-types';
import type { TdmStage } from '../../../domain/tdm-stages';
import { TdmBlockFormFields } from '../../form-field/tdm-form-field';
import fieldStyles from '../../form-field/tdm-form-field.module.sass';
import { V1BlockFormsPanel } from '../v1-preserved-sidebar-sections';
import { AccordionChevron, BlockFormGroupHeader, DuplicateIcon, TrashIcon } from '../tdm-sidebar-primitives';
import { STAGE_CREATE_LABELS, STAGE_EDIT_LABELS, type TdmBlockForms } from '../tdm-sidebar.contract';
import styles from '../tdm-sidebar.module.sass';

const STAGE_TONE: Record<TdmStage, { accent: string; soft: string; border: string; fieldRgb: string }> = {
  input: { accent: '#a78bfa', soft: 'rgba(167, 139, 250, 0.18)', border: 'rgba(167, 139, 250, 0.34)', fieldRgb: '167, 139, 250' },
  activity: { accent: '#60a5fa', soft: 'rgba(96, 165, 250, 0.16)', border: 'rgba(96, 165, 250, 0.34)', fieldRgb: '96, 165, 250' },
  output: { accent: '#f6b35d', soft: 'rgba(246, 179, 93, 0.16)', border: 'rgba(246, 179, 93, 0.34)', fieldRgb: '246, 179, 93' },
  outcome: { accent: '#5ee0b5', soft: 'rgba(94, 224, 181, 0.16)', border: 'rgba(94, 224, 181, 0.34)', fieldRgb: '94, 224, 181' }
};

function SidebarAccordion({ id, title, isOpen, onToggle, stage, children }: { id: string; title: string; isOpen: boolean; onToggle: () => void; stage: TdmStage; children: ReactNode }) {
  const tone = STAGE_TONE[stage];
  const contentId = `${id}-content`;
  return (
    <div className={[styles.sidebarAccordion, styles.blockSidebarAccordion, isOpen ? styles.sidebarAccordionOpen : ''].filter(Boolean).join(' ')} style={{ '--stage-accent': tone.accent, '--stage-accent-soft': tone.soft, '--stage-border': tone.border, '--tdm-stage-field-rgb': tone.fieldRgb, '--tdm-field-use-mask-border': 1, '--tdm-field-accent': 'var(--stage-accent)', '--tdm-field-accent-rest': 'color-mix(in srgb, var(--stage-accent) 34%, transparent)' } as CSSProperties}>
      <button type="button" className={[styles.sidebarAccordionHeader, styles.blockAccordionHeader].join(' ')} aria-expanded={isOpen} aria-controls={contentId} onClick={onToggle}>
        <span className={styles.sidebarAccordionTitle}>{title}</span><AccordionChevron isOpen={isOpen} />
      </button>
      <div id={contentId} className={[styles.sidebarAccordionPanel, isOpen ? styles.sidebarAccordionPanelOpen : ''].join(' ')} aria-hidden={!isOpen}><div className={styles.sidebarAccordionContent}>{children}</div></div>
    </div>
  );
}

function CreateForm({ stage, draft, errorMessage, onDraftChange, onSubmit }: { stage: TdmStage; draft: TdmNodeDraft; errorMessage?: string; onDraftChange: (draft: TdmNodeDraft) => void; onSubmit: () => void }) {
  return <div className={fieldStyles.form}>{errorMessage ? <p className={fieldStyles.errorMessage}>{errorMessage}</p> : null}<TdmBlockFormFields draft={draft} onDraftChange={onDraftChange} /><TdmButton variant="primary" tone={stage} fullWidth onClick={onSubmit}>{STAGE_CREATE_LABELS[stage]}</TdmButton></div>;
}

function EditForm({ stage, forms }: { stage: TdmStage; forms: TdmBlockForms['edit'] }) {
  if (!forms.selectedStage) return <div className={fieldStyles.form}><p className={styles.sectionHint}>Selecione um bloco no canvas para editar.</p></div>;
  return (
    <div className={fieldStyles.form}>
      {forms.errorMessage ? <p className={fieldStyles.errorMessage}>{forms.errorMessage}</p> : null}
      <TdmBlockFormFields draft={forms.draft} onDraftChange={forms.onDraftChange} />
      <TdmButton variant="primary" tone={stage} fullWidth onClick={forms.onSubmit}>Salvar alterações</TdmButton>
      <div className={styles.sidebarCtaRow}><TdmButton variant="secondary" tone={stage} fullWidth leadingIcon={<DuplicateIcon />} onClick={forms.onDuplicate}>Duplicar</TdmButton><TdmButton variant="destructive" tone="danger" fullWidth leadingIcon={<TrashIcon />} onClick={forms.onDelete}>Deletar</TdmButton></div>
    </div>
  );
}

export function TdmSidebarBlockForms({ blockForms }: { blockForms?: TdmBlockForms | null }) {
  const createId = useId();
  const editId = useId();
  if (!blockForms) return null;
  const editStage = blockForms.edit.selectedStage ?? blockForms.stage;
  return (
    <V1BlockFormsPanel stage={blockForms.stage}>
      <div className={styles.blockFormGroup}><BlockFormGroupHeader label="Criar bloco" kind="create" /><SidebarAccordion id={createId} title={STAGE_CREATE_LABELS[blockForms.stage]} isOpen={blockForms.create.isOpen} onToggle={() => blockForms.create.onOpenChange(!blockForms.create.isOpen)} stage={blockForms.stage}><CreateForm stage={blockForms.stage} draft={blockForms.create.draft} errorMessage={blockForms.create.errorMessage} onDraftChange={blockForms.create.onDraftChange} onSubmit={blockForms.create.onSubmit} /></SidebarAccordion></div>
      <div className={styles.blockFormGroup}><BlockFormGroupHeader label="Editar bloco" kind="edit" /><SidebarAccordion id={editId} title={STAGE_EDIT_LABELS[editStage]} isOpen={blockForms.edit.isOpen} onToggle={() => blockForms.edit.onOpenChange(!blockForms.edit.isOpen)} stage={editStage}><EditForm stage={editStage} forms={blockForms.edit} /></SidebarAccordion></div>
    </V1BlockFormsPanel>
  );
}
