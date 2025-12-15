
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils'; // Assuming utils exists or I'll copy the logic

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByPlaceholder('admin@sabor.com').fill('admin@sabor.com');
    await page.getByPlaceholder('******').fill('123456');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to Customers
    await page.getByRole('link', { name: 'Clientes' }).click();
    await expect(page).toHaveURL('/customers');
  });

  test('should create, edit, and delete a customer', async ({ page }) => {
    const testName = 'Test Customer ' + Date.now();
    const updatedName = testName + ' Updated';

    // CREATE
    await page.getByRole('button', { name: 'Nuevo Cliente' }).click();
    await expect(page.getByText('Nuevo Cliente', { exact: true })).toBeVisible();
    
    await page.getByPlaceholder('Ej: Carlos Gómez').fill(testName);
    await page.getByPlaceholder('ejemplo@correo.com').fill('test@test.com');
    await page.getByRole('button', { name: 'Crear Cliente' }).click();

    // Verify creation
    await expect(page.getByText(testName)).toBeVisible();

    // EDIT
    // Find row by text and click edit button within it
    const row = page.getByRole('row', { name: testName });
    await row.getByTitle('Editar').click();
    
    await expect(page.getByText('Editar Cliente')).toBeVisible();
    await page.getByPlaceholder('Ej: Carlos Gómez').fill(updatedName);
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // Verify update
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(testName)).not.toBeVisible();

    // DELETE
    // Listen for dialog
    page.on('dialog', dialog => dialog.accept());
    
    const rowUpdated = page.getByRole('row', { name: updatedName });
    await rowUpdated.getByTitle('Eliminar').click();

    // Verify deletion
    await expect(page.getByText(updatedName)).not.toBeVisible();
  });
});
