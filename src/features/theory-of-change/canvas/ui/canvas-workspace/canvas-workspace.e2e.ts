import { expect, test, type Page } from '@playwright/test';

async function dragStageToCanvas(page: Page, stageName: string, x: number, y: number) {
  const source = page.getByRole('button', { name: `Arrastar ${stageName} para o canvas` });
  const target = page.getByTestId('canvas-react-flow-surface');
  const targetBox = await target.boundingBox();
  if (!targetBox) throw new Error('Superfície React Flow indisponível.');

  await source.dragTo(target, {
    targetPosition: { x: targetBox.width * x, y: targetBox.height * y }
  });
}

test.describe('canvas oficial com React Flow real', () => {
  test('cria, conecta, salva e abre o resultado sem renderer manual', async ({ page }: { page: Page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/canvas');
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fcanvas$/);
    await page.getByLabel('Nome').fill('Tiala Rocha');
    await page.getByLabel('E-mail').fill('tialarocha@tdmconstrutor.com.br');
    await page.getByLabel('Senha').fill('tdm123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/canvas$/);

    await expect(page.locator('.react-flow')).toBeVisible();
    await expect(page.getByTestId('canvas-react-flow-surface')).toBeVisible();
    await expect(page.getByLabel('Ferramentas do canvas')).toBeVisible();

    await page.getByRole('button', { name: 'Arrastar etapas para o canvas' }).click();
    await dragStageToCanvas(page, 'Insumo', 0.28, 0.35);

    await page.getByRole('button', { name: 'Arrastar etapas para o canvas' }).click();
    await dragStageToCanvas(page, 'Atividade', 0.55, 0.35);

    await expect(page.locator('article[data-canvas-node]')).toHaveCount(2);

    const sourceHandle = page.getByLabel('Conectar a partir de Insumo 1');
    const targetHandle = page.getByLabel('Conectar a Atividade 1');
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();
    if (!sourceBox || !targetBox) throw new Error('Handles do React Flow indisponíveis.');

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
    await page.mouse.up();

    await expect(page.getByRole('button', { name: 'Selecionar conexão' })).toBeVisible();

    await page.getByRole('button', { name: 'Salvar teoria' }).click();
    await expect(page.getByText('Tudo salvo.', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Visualizar resultado' }).click();
    await expect(page).toHaveURL(/\/canvas\/resultado$/);
    await expect(page.getByRole('heading', { name: 'Insumos', exact: true })).toBeVisible();
  });
});
