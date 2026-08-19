import { expect, test, type Locator, type Page } from '@playwright/test';

async function dragStageToCanvas(page: Page, stageName: string, x: number, y: number) {
  const source = page.getByRole('button', { name: `Arrastar ${stageName} para o canvas` });
  const target = page.getByTestId('canvas-react-flow-surface');
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();

  const stage = await source.getAttribute('data-stage');
  if (!stage) throw new Error(`Etapa ${stageName} sem data-stage.`);

  await page.evaluate(({ stageValue, xRatio, yRatio }) => {
    const sourceElement = document.querySelector<HTMLButtonElement>(
      `button[data-stage="${stageValue}"]`
    );
    const targetElement = document.querySelector<HTMLElement>(
      '[data-testid="canvas-react-flow-surface"]'
    );
    if (!sourceElement || !targetElement) {
      throw new Error('Origem ou superfície de drop indisponível.');
    }

    const box = targetElement.getBoundingClientRect();
    const clientX = box.left + box.width * xRatio;
    const clientY = box.top + box.height * yRatio;
    const dataTransfer = new DataTransfer();

    sourceElement.dispatchEvent(new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    }));
    targetElement.dispatchEvent(new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      dataTransfer
    }));
    targetElement.dispatchEvent(new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      dataTransfer
    }));
    sourceElement.dispatchEvent(new DragEvent('dragend', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    }));
  }, { stageValue: stage, xRatio: x, yRatio: y });
}

async function openStageCreator(page: Page) {
  await page.getByRole('button', { name: 'Arrastar etapas para o canvas' }).click();
}

async function loginAsTiala(page: Page) {
  await page.goto('/canvas');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcanvas$/);
  await page.getByLabel('Nome').fill('Tiala Rocha');
  await page.getByLabel('E-mail').fill('tialarocha@tdmconstrutor.com.br');
  await page.locator('input[name="password"]').fill('tdm123456');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/canvas$/);
}

type CanvasStage = 'input' | 'activity' | 'product' | 'outcome';

function stageNodes(page: Page, stage: CanvasStage): Locator {
  return page.locator(`article[data-canvas-node][data-stage="${stage}"]`);
}

async function nodeIdByStage(page: Page, stage: CanvasStage, index = 0): Promise<string> {
  const nodes = stageNodes(page, stage);
  await expect(nodes.nth(index)).toBeVisible();
  const nodeId = await nodes.nth(index).getAttribute('data-node-card-id');
  if (!nodeId) throw new Error(`ID do bloco ${stage}[${index}] indisponível.`);
  return nodeId;
}

function canvasHandle(page: Page, nodeId: string, type: 'source' | 'target'): Locator {
  return page.locator(`[data-canvas-handle="${type}"][data-canvas-node-id="${nodeId}"]`);
}

async function handleFor(page: Page, stage: CanvasStage, type: 'source' | 'target', index = 0): Promise<Locator> {
  const nodeId = await nodeIdByStage(page, stage, index);
  const handle = canvasHandle(page, nodeId, type);
  await expect(handle).toHaveCount(1);
  return handle;
}

async function connectNodes(page: Page, sourceStage: CanvasStage, targetStage: CanvasStage) {
  const sourceHandle = await handleFor(page, sourceStage, 'source');
  const targetHandle = await handleFor(page, targetStage, 'target');

  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  if (!sourceBox || !targetBox) throw new Error('Handles do React Flow indisponíveis.');

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  await page.mouse.up();
}

test.describe('canvas oficial com React Flow real', () => {
  test('preserva o projeto, salva automaticamente e cria novos blocos sem substituir ids hidratados', async ({ page }: { page: Page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loginAsTiala(page);

    await expect(page.locator('.react-flow')).toBeVisible();
    await expect(page.getByTestId('canvas-react-flow-surface')).toBeVisible();
    await expect(page.getByLabel('Ferramentas do canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar teoria' })).toBeVisible();

    await openStageCreator(page);
    await dragStageToCanvas(page, 'Insumo', 0.28, 0.35);

    await openStageCreator(page);
    await dragStageToCanvas(page, 'Atividade', 0.55, 0.35);

    await expect(page.locator('article[data-canvas-node]')).toHaveCount(2);
    await expect(stageNodes(page, 'input')).toHaveCount(1);
    await expect(stageNodes(page, 'activity')).toHaveCount(1);

    const hydratedInputId = await nodeIdByStage(page, 'input');
    const hydratedActivityId = await nodeIdByStage(page, 'activity');
    await connectNodes(page, 'input', 'activity');

    await expect(page.getByRole('button', { name: 'Selecionar conexão' })).toBeVisible();

    const saveButton = page.getByRole('button', { name: 'Salvar teoria' });
    await expect(saveButton).toHaveAttribute('data-save-state', 'dirty');
    await expect(saveButton).toHaveAttribute('data-save-state', 'saved', { timeout: 10_000 });

    await page.getByRole('button', { name: 'Voltar para o início' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/canvas');
    await expect(page).toHaveURL(/\/canvas$/);
    await expect(page.locator('article[data-canvas-node]')).toHaveCount(2);
    await expect(canvasHandle(page, hydratedInputId, 'source')).toHaveCount(1);
    await expect(canvasHandle(page, hydratedActivityId, 'target')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Selecionar conexão' })).toBeVisible();

    await openStageCreator(page);
    await dragStageToCanvas(page, 'Insumo', 0.32, 0.62);

    await expect(page.locator('article[data-canvas-node]')).toHaveCount(3);
    await expect(stageNodes(page, 'input')).toHaveCount(2);
    await expect(stageNodes(page, 'activity')).toHaveCount(1);

    const inputIdsAfterCreate = await stageNodes(page, 'input').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-node-card-id'))
    );
    expect(inputIdsAfterCreate).toContain(hydratedInputId);
    expect(new Set(inputIdsAfterCreate).size).toBe(2);
    expect(await nodeIdByStage(page, 'activity')).toBe(hydratedActivityId);
    await expect(page.getByRole('button', { name: 'Selecionar conexão' })).toBeVisible();

    await page.getByRole('button', { name: 'Salvar teoria' }).click();
    await expect(page.getByText('Tudo salvo.', { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.locator('article[data-canvas-node]')).toHaveCount(3);
    const inputIdsAfterReload = await stageNodes(page, 'input').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-node-card-id'))
    );
    expect(inputIdsAfterReload).toEqual(expect.arrayContaining(inputIdsAfterCreate));
    expect(await nodeIdByStage(page, 'activity')).toBe(hydratedActivityId);
    await expect(page.getByRole('button', { name: 'Selecionar conexão' })).toBeVisible();

    const persistedInputTitle = (await stageNodes(page, 'input').first().getByRole('heading').textContent())?.trim();
    if (!persistedInputTitle) throw new Error('Título do insumo persistido indisponível.');

    await page.getByRole('button', { name: 'Visualizar resultado' }).click();
    await expect(page).toHaveURL(/\/canvas\/resultado$/);
    await expect(page.getByRole('link', { name: 'Voltar ao Canvas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: persistedInputTitle, exact: true })).toBeVisible();
  });
});
