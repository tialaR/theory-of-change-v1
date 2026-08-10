import fs from 'node:fs';

const modelPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-view-model.ts';
const innerPath = 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx';
const failures = [];

if (!fs.existsSync(modelPath)) failures.push(`ausente: ${modelPath}`);
if (!fs.existsSync(innerPath)) failures.push(`ausente: ${innerPath}`);

if (failures.length === 0) {
  const model = fs.readFileSync(modelPath, 'utf8');
  const inner = fs.readFileSync(innerPath, 'utf8');

  const expectedContract = 'onCreateDraftChange: (nextDraft: TdmNodeDraft) => void;';
  const staleContract = 'onCreateDraftChange: (stage: TdmStage, nextDraft: TdmNodeDraft) => void;';

  if (!model.includes(expectedContract)) {
    failures.push('buildSidebarBlockForms não expõe o callback de criação já vinculado à etapa ativa');
  }
  if (model.includes(staleContract)) {
    failures.push('contrato antigo com stage duplicado ainda existe no view model');
  }
  if (!model.includes('onDraftChange: input.onCreateDraftChange')) {
    failures.push('adapter de formulário não repassa o callback tipado ao painel de criação');
  }
  if (!inner.includes('onCreateDraftChange: handleCreateDraftChange')) {
    failures.push('Canvas Inner não entrega o callback de draft ao adapter');
  }
  if (!inner.includes('const handleCreateDraftChange = useCallback')) {
    failures.push('callback de criação vinculado à etapa ativa não foi preservado');
  }
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 05 CONTRACT: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: onCreateDraftChange pertence ao formulário da etapa ativa e mantém assinatura de um único draft.');
