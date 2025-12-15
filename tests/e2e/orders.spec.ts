
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Pedidos' }).click();
    await expect(page).toHaveURL('/orders');
  });

  test('should display Kanban board columns', async ({ page }) => {
    await expect(page.getByText('Pendiente')).toBeVisible();
    await expect(page.getByText('Cocinando')).toBeVisible();
    await expect(page.getByText('Listo')).toBeVisible();
    await expect(page.getByText('Entregado')).toBeVisible();
  });
});
