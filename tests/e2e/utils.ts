
import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('admin@sabor.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL('/');
}
