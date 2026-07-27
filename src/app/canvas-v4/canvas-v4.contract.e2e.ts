import { expect, test, type Page } from '@playwright/test';

async function enableReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

test.describe('canvas-v4 homologado', () => {
  test('mantém a estrutura visual e as ações essenciais', async ({ page }: { page: Page }) => {
    await enableReducedMotion(page);
    await page.goto('/canvas-v4');

    await expect(page.getByAltText('TMD Construtor')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Título da teoria', exact: true })).toBeVisible();
    await expect(page.getByLabel('Ferramentas do canvas', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Arrastar etapas para o canvas', { exact: true })).toBeVisible();
    await expect(page.getByText('Canvas vazio. Arraste qualquer etapa para começar.', { exact: true })).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
