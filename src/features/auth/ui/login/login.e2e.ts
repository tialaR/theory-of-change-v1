import { expect, test, type Page } from '@playwright/test';

const RODGER_CREDENTIALS = {
  name: 'Rodger Rocha',
  email: 'rodgerrocha@tdmconstrutor.com.br'
} as const;

async function fillRodgerCredentials(page: Page, password: string) {
  await page.getByLabel('Nome').fill(RODGER_CREDENTIALS.name);
  await page.getByLabel('E-mail').fill(RODGER_CREDENTIALS.email);
  await page.locator('input[name="password"]').fill(password);
}

test.describe('autenticação mockada do TDM Construtor', () => {
  test('protege somente o Canvas, valida credenciais e autentica persona existente', async ({ page }: { page: Page }) => {
    await page.goto('/canvas');
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fcanvas$/);
    await expect(page.getByRole('heading', { name: 'Entrar no TDM Construtor' })).toBeVisible();

    await fillRodgerCredentials(page, 'senha-incorreta');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(
      page.getByText('Nome, e-mail ou senha não correspondem a um usuário existente.', { exact: true }),
    ).toBeVisible();

    await fillRodgerCredentials(page, 'tdm123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/canvas$/);
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('cria uma sessão demo privada por visitante sem expor credenciais', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto('/login');
    await pageA.getByRole('button', { name: 'Explorar com conta demo' }).click();
    await expect(pageA).toHaveURL(/\/canvas$/);
    await expect(pageA.getByText('Modo demonstração', { exact: true })).toBeVisible();

    await pageB.goto('/login');
    await pageB.getByRole('button', { name: 'Explorar com conta demo' }).click();
    await expect(pageB).toHaveURL(/\/canvas$/);
    await expect(pageB.getByText('Modo demonstração', { exact: true })).toBeVisible();

    const sessionA = (await contextA.cookies()).find((cookie) => cookie.name === 'tdm_session');
    const sessionB = (await contextB.cookies()).find((cookie) => cookie.name === 'tdm_session');

    expect(sessionA?.value).toBeTruthy();
    expect(sessionB?.value).toBeTruthy();
    expect(sessionA?.value).not.toBe(sessionB?.value);

    await contextA.close();
    await contextB.close();
  });

  test('mantém as rotas públicas acessíveis sem sessão', async ({ page }: { page: Page }) => {
    await page.goto('/guia-de-aprendizado');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
