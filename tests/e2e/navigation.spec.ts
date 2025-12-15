
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Orders', async ({ page }) => {
    await page.click('a[href="/orders"]');
    await expect(page).toHaveURL('/orders');
    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible();
  });

  test('should navigate to Menu', async ({ page }) => {
    await page.click('a[href="/menu"]');
    await expect(page).toHaveURL('/menu');
    await expect(page.getByRole('heading', { name: 'Menú' })).toBeVisible();
  });

  test('should navigate to Users', async ({ page }) => {
    await page.click('a[href="/users"]');
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
  });
});
