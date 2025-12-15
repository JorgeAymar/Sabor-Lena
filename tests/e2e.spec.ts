import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Sabor & Leña/);
});

test('navigate to menu and see products', async ({ page }) => {
  await page.goto('/');
  // Target the link inside the sidebar specifically
  await page.locator('aside').getByRole('link', { name: 'Menú' }).click();
  await expect(page).toHaveURL(/menu/);
  // Expect the main heading
  await expect(page.getByRole('heading', { name: 'Menú', exact: true })).toBeVisible();
  // Check if at least one product card exists (from seed) - Target the Product Name specifically
  await expect(page.getByRole('heading', { name: 'Empanadas' })).toBeVisible();
});

test('navigate to inventory and check stock', async ({ page }) => {
  await page.goto('/inventory');
  await expect(page.getByRole('heading', { name: 'Inventario' })).toBeVisible();
  // Check for stock input availability
  await expect(page.locator('input[name="quantity"]').first()).toBeVisible();
});

test('navigate to users page and check create modal', async ({ page }) => {
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
  // Target the user in the table
  await expect(page.getByRole('cell', { name: 'Admin User' }).first()).toBeVisible();
  
  // Test the new modal
  await page.getByRole('button', { name: 'Añadir Usuario' }).click();
  await expect(page.getByText('Crear Nuevo Usuario')).toBeVisible();
  await expect(page.locator('input[name="name"]')).toBeVisible();
});
