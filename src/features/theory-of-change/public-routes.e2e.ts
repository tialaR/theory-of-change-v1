import { expect, test, type Page } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/exemplos',
  '/exemplos/resultado',
  '/exemplos/resultado/interativo',
  '/exemplos/visao-do-fluxo',
  '/exemplos/visao-do-fluxo/interativo',
  '/guia-de-aprendizado',
  '/referencias'
] as const;

async function expectPublicRoute(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.status(), `${route} deve responder sem erro HTTP`).toBeLessThan(400);
  await expect(page).not.toHaveURL(/\/login\?returnTo=/);
}

test.describe('superfície pública do TDM Construtor', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} permanece acessível sem sessão`, async ({ page }: { page: Page }) => {
      await expectPublicRoute(page, route);
    });
  }

  test('/canvas-legado permanece aposentado', async ({ page }: { page: Page }) => {
    await page.goto('/canvas-legado');
    await expect(page.getByLabel('Erro 404')).toBeVisible();
  });
});
