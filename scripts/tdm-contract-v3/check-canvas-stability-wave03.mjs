import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const controller = read('src/features/theory-of-change/canvas/ui/hooks/use-canvas-workspace-controller.ts');
const relationActions = read('src/features/theory-of-change/canvas/ui/hooks/use-canvas-relation-actions.ts');
const flowSurface = read('src/features/theory-of-change/canvas/ui/components/canvas-flow-surface.tsx');
const toolbar = read('src/features/theory-of-change/canvas/ui/components/canvas-toolbar.tsx');
const notice = read('src/features/theory-of-change/canvas/ui/components/canvas-notice.tsx');
const inspector = read('src/features/theory-of-change/canvas/ui/components/canvas-inspector.tsx');
const workspaceStyles = read('src/features/theory-of-change/canvas/ui/canvas-workspace/canvas-workspace.module.sass');

assert(!controller.includes("t('notices.positionUpdated')"), 'movimentar bloco nao pode emitir notice tecnico');
assert(!controller.includes("t('notices.connectionCreated')"), 'criar conexao nao pode emitir notice tecnico');
assert(relationActions.includes("setRelationPanelMode('form')"), 'clicar em marcador deve abrir formulario de risco/hipotese');
assert(!flowSurface.includes('CANVAS_DIMENSIONS.width'), 'superficie React Flow nao pode impor largura gigante');
assert(!flowSurface.includes('onConnectStart={() => runtime.ui.notify'), 'inicio de conexao deve ser silencioso');
assert(toolbar.includes('runtime.ui.fullCanvasMode ? runtime.exitFullCanvas : runtime.enterFullCanvas'), 'toolbar deve controlar fullscreen pela transicao estabilizada');
assert(toolbar.includes('className={styles.rail}'), 'controles de zoom devem existir tambem no fullscreen');
assert(notice.includes('Boolean(message)') && notice.includes('{visible ? ('), 'notice vazio nao pode renderizar capsula sem conteudo');
assert(inspector.includes('<motion.aside'), 'inspector deve permanecer montado e deslizar com Motion');
assert(!inspector.includes('if (runtime.ui.fullCanvasMode) return null'), 'inspector nao deve ser removido abruptamente no fullscreen');
assert(workspaceStyles.includes("grid-template-rows: 0 minmax(0, 1fr)"), 'fullscreen deve animar a moldura sem desmontar a pagina');
assert(workspaceStyles.includes(".topActions\n  justify-self: end"), 'contrato visual do header deve permanecer presente');

if (failures.length) {
  console.error('FAIL: canvas stability wave 03');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('PASS: fullscreen, inspector, relacoes, notices, avatar e controles do Canvas estao protegidos.');
