import { expect, test } from '@playwright/test';

test.describe('cadastro mockado do TDM Construtor', () => {
  test('cria uma conta própria, autentica e preserva o Canvas protegido', async ({ page }) => {
    const uniqueEmail = `recrutador-${Date.now()}@tdm.local`;

    await page.goto('/cadastro');
    await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible();

    await page.getByLabel('Nome').fill('Recrutador Demo');
    await page.getByLabel('E-mail').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill('tdm123456');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/canvas$/);
    await expect(page.getByText('Modo demonstração', { exact: true })).toHaveCount(0);
  });

  test('não permite duas contas com o mesmo e-mail', async ({ browser }) => {
    const uniqueEmail = `duplicado-${Date.now()}@tdm.local`;

    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();

    await firstPage.goto('/cadastro');
    await firstPage.getByLabel('Nome').fill('Primeira Pessoa');
    await firstPage.getByLabel('E-mail').fill(uniqueEmail);
    await firstPage.locator('input[name="password"]').fill('tdm123456');
    await firstPage.getByRole('button', { name: 'Criar conta' }).click();
    await expect(firstPage).toHaveURL(/\/canvas$/);

    await firstContext.close();

    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();

    await secondPage.goto('/cadastro');
    await secondPage.getByLabel('Nome').fill('Segunda Pessoa');
    await secondPage.getByLabel('E-mail').fill(uniqueEmail);
    await secondPage.locator('input[name="password"]').fill('tdm123456');
    await secondPage.getByRole('button', { name: 'Criar conta' }).click();

    await expect(
      secondPage.getByText('Este e-mail já está cadastrado. Entre com sua conta existente.')
    ).toBeVisible();

    await secondContext.close();
  });
});
