
import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should display inventory items', async ({ page }) => {
    await page.click('a[href="/inventory"]');
    await expect(page).toHaveURL('/inventory');
    await expect(page.getByRole('heading', { name: 'Inventario' })).toBeVisible();
    
    // Check for inventory table
    await expect(page.locator('table')).toBeVisible();
  });
});
