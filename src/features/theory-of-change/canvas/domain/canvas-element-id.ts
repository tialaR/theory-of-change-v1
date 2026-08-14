import type { CanvasStageId } from './canvas-project';

export type CanvasIdTokenFactory = () => string;

const MAX_ID_ATTEMPTS = 16;

function createAvailableId(
  prefix: string,
  occupiedIds: ReadonlySet<string>,
  createToken: CanvasIdTokenFactory
) {
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const token = createToken().trim();
    if (!token) continue;
    const candidate = `${prefix}-${token}`;
    if (!occupiedIds.has(candidate)) return candidate;
  }

  throw new Error('Não foi possível gerar um identificador único para o canvas.');
}

export function createCanvasNodeId(
  stage: CanvasStageId,
  occupiedIds: ReadonlySet<string>,
  createToken: CanvasIdTokenFactory
) {
  return createAvailableId(`node-${stage}`, occupiedIds, createToken);
}

export function createCanvasEdgeId(
  occupiedIds: ReadonlySet<string>,
  createToken: CanvasIdTokenFactory
) {
  return createAvailableId('edge', occupiedIds, createToken);
}
