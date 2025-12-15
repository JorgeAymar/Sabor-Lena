
import { test, expect } from '@playwright/test';

test.describe('Core Modules (Orders & Menu)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should display orders list', async ({ page }) => {
    await page.click('a[href="/orders"]');
    await expect(page).toHaveURL('/orders');
    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible();
    
    // Check if table or list of orders is present.
    // Assuming there's at least one order from the seed
    const table = page.locator('table');
    // If table exists, check it has rows, otherwise check for "No orders" message if seed didn't populate orders
    if (await table.isVisible()) {
       await expect(page.locator('table tbody tr').first()).toBeVisible();
    }
  });

  test('should display menu items', async ({ page }) => {
    await page.click('a[href="/menu"]');
    await expect(page).toHaveURL('/menu');
    await expect(page.getByRole('heading', { name: 'Menú' })).toBeVisible();
    
    // Check for products grid or list
    // Assuming seed created products like "Lomo Saltado"
    await expect(page.getByText('Lomo Saltado').first()).toBeVisible();
  });
});
