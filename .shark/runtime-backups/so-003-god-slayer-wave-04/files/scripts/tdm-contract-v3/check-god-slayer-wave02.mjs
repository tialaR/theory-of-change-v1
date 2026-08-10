import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controllerPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts';
const flowActionsPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-flow-actions.ts';
const relationActionsPath = 'src/features/theory-of-change/canvas/ui/hooks/use-canvas-relation-actions.ts';

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

for (const file of [controllerPath, flowActionsPath, relationActionsPath]) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`arquivo obrigatório ausente: ${file}`);
}

if (failures.length === 0) {
  const controller = read(controllerPath);
  const flowActions = read(flowActionsPath);
  const relationActions = read(relationActionsPath);
  const controllerLines = controller.split(/\r?\n/).length;
  const flowActionsLines = flowActions.split(/\r?\n/).length;

  if (controllerLines > 240) failures.push(`workspace controller excede 240 linhas (${controllerLines}).`);
  if (flowActionsLines > 120) failures.push(`flow actions excede 120 linhas (${flowActionsLines}).`);
  if (!controller.includes('useCanvasWorkspaceFlowActions')) failures.push('workspace controller não delega ações de fluxo.');
  if (controller.includes('CANVAS_CONNECT_NOTICE_KEYS')) failures.push('política de notices de conexão ainda vazou para o workspace controller.');
  if (controller.includes('const onPaneClick = useCallback')) failures.push('ação de pane ainda está no workspace controller.');
  if (controller.includes('const onConnect = useCallback')) failures.push('ação de conexão ainda está no workspace controller.');
  if (controller.includes('const centralizeColumns = useCallback')) failures.push('ação de organização ainda está no workspace controller.');
  if (!flowActions.includes("t('notices.unknownBlock')")) failures.push('flow actions não usa copy traduzida para blocos desconhecidos.');

  const relationNoticeDependencyCount = (relationActions.match(/relationNoticeValues,/g) ?? []).length;
  if (relationNoticeDependencyCount < 3) failures.push('callbacks de relação não protegem relationNoticeValues nas dependências.');
}

if (failures.length > 0) {
  console.error('\nTDM GOD SLAYER WAVE 02: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: ações de fluxo extraídas, controller abaixo do budget e callbacks de relação estabilizados.');
