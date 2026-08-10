import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const innerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-inner.tsx');
const connectionPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-connection-controller.ts');
const markerPath = path.join(root, 'src/features/theory-of-change/components/canvas/tdm-canvas-controllers/use-canvas-marker-controller.ts');
const failures = [];

for (const file of [innerPath, connectionPath, markerPath]) {
  if (!fs.existsSync(file)) failures.push(`arquivo obrigatório ausente: ${path.relative(root, file)}`);
}

if (failures.length === 0) {
  const inner = fs.readFileSync(innerPath, 'utf8');
  const lines = inner.split(/\r?\n/).length;
  if (lines > 1100) failures.push(`TdmCanvasInner excede budget da Wave 08 (${lines}/1100)`);
  for (const forbidden of [
    'const isValidConnection:',
    'const handleConnect = useCallback',
    'const handleConnectStart:',
    'const handleConnectEnd:',
    'const deleteMarkerFromEdge = useCallback',
    'const saveMarkerOnEdge = useCallback',
    'const addMarkerToSelectedEdge = useCallback'
  ]) {
    if (inner.includes(forbidden)) failures.push(`responsabilidade de conexão/marker retornou ao Canvas Inner: ${forbidden}`);
  }
  if (!inner.includes('useCanvasConnectionController')) failures.push('Canvas Inner não compõe useCanvasConnectionController');
  if (!inner.includes('useCanvasMarkerController')) failures.push('Canvas Inner não compõe useCanvasMarkerController');

  const connection = fs.readFileSync(connectionPath, 'utf8');
  const marker = fs.readFileSync(markerPath, 'utf8');
  if (!connection.includes('isAllowedTdmConnection')) failures.push('controller de conexão perdeu regra de validação');
  if (!connection.includes('createEdge')) failures.push('controller de conexão perdeu criação de edge');
  if (!marker.includes('markEdgeRecentlyUpdated')) failures.push('controller de marker perdeu feedback de atualização');
  if (!marker.includes('GUIDE_RISK_SAVED')) failures.push('controller de marker perdeu mensagens de domínio');
}

if (failures.length) {
  console.error('\nTDM COMPONENT GOD SLAYER WAVE 08: FAIL\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('PASS: conexões, ciclo de edges e markers possuem controllers próprios; Canvas Inner caiu abaixo de 1100 linhas.');
