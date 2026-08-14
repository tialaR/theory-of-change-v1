import { expect, test, type Page } from '@playwright/test';

test('diferencia 404 dos demais estados de erro', async ({ page }: { page: Page }) => {
  await page.goto('/rota-que-nao-existe');
  await expect(page.getByLabel('Erro 404')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Esta página não existe.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toBeVisible();
});
