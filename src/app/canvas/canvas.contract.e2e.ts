import { expect, test, type Page } from '@playwright/test';

async function enableReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

test.describe('canvas oficial homologado', () => {
  test('não mantém rotas temporárias ou versionadas', async ({ request }) => {
    const versionedRoute = await request.get('/canvas-v4');
    const previewRoute = await request.get('/canvas/resend-command-preview-v2');

    expect(versionedRoute.status()).toBe(404);
    expect(previewRoute.status()).toBe(404);
  });

  test('mantém a estrutura visual, salva pelo contrato e abre o resultado', async ({ page }: { page: Page }) => {
    await enableReducedMotion(page);
    await page.goto('/canvas');

    await expect(page.getByAltText('TMD Construtor')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Título da teoria', exact: true })).toBeVisible();
    await expect(page.getByLabel('Ferramentas do canvas', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Arrastar etapas para o canvas', { exact: true })).toBeVisible();
    await expect(page.getByText('Canvas vazio. Arraste qualquer etapa para começar.', { exact: true })).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);

    await page.getByRole('button', { name: 'Salvar teoria', exact: true }).click();
    await expect(page.getByText('Tudo salvo.', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Visualizar resultado', exact: true }).click();
    await expect(page).toHaveURL(/\/canvas\/resultado$/);
    await expect(page.getByRole('heading', { name: 'Minha teoria da mudança', exact: true })).toBeVisible();
    await expect(page.getByText('0 blocos', { exact: true })).toBeVisible();
  });
});
