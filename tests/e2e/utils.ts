
import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin@sabor.com').fill('admin@sabor.com');
  await page.getByPlaceholder('******').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL('/');
}
