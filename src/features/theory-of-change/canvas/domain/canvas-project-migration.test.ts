import { describe, expect, it } from 'vitest';
import { migrateCanvasProject, type CanvasProjectV2 } from './canvas-project-migration';

function createLegacyProject(): CanvasProjectV2 {
  return {
    schemaVersion: 2,
    id: 'project-legacy',
    ownerId: 'user-1',
    title: 'Legado',
    locale: 'pt-BR',
    revision: 4,
    nodes: [
      { id: 'input-b', stage: 'input', title: 'B', description: '', advancedDetails: '', position: { x: 10, y: 300 } },
      { id: 'input-a', stage: 'input', title: 'A', description: '', advancedDetails: '', position: { x: 10, y: 100 } },
      { id: 'activity-a', stage: 'activity', title: 'Atividade', description: '', advancedDetails: '', position: { x: 20, y: 200 } }
    ],
    connections: [],
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-02T10:00:00.000Z'
  };
}

describe('migrateCanvasProject', () => {
  it('migra schema 2 para 3 e deriva order por etapa e posição', () => {
    const migrated = migrateCanvasProject(createLegacyProject());

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.nodes).toEqual([
      expect.objectContaining({ id: 'input-b', order: 1 }),
      expect.objectContaining({ id: 'input-a', order: 0 }),
      expect.objectContaining({ id: 'activity-a', order: 0 })
    ]);
  });

  it('normaliza orders corrompidos em documentos schema 3', () => {
    const migrated = migrateCanvasProject({
      ...createLegacyProject(),
      schemaVersion: 3,
      nodes: [
        { ...createLegacyProject().nodes[0], order: 8 },
        { ...createLegacyProject().nodes[1], order: 8 },
        { ...createLegacyProject().nodes[2], order: 3 }
      ]
    });

    expect(migrated.nodes).toEqual([
      expect.objectContaining({ id: 'input-b', order: 1 }),
      expect.objectContaining({ id: 'input-a', order: 0 }),
      expect.objectContaining({ id: 'activity-a', order: 0 })
    ]);
  });
});
