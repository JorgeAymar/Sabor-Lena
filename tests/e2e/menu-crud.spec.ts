
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Menú' }).click();
    await expect(page).toHaveURL('/menu');
  });

  test('should create and update a product', async ({ page }) => {
    const testProduct = 'Test Dish ' + Date.now();
    const updatedProduct = testProduct + ' Updated';

    // CREATE
    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await expect(page.getByText('Crear Nuevo Producto')).toBeVisible();

    // Validation check
    await page.getByRole('button', { name: 'Guardar' }).click();
    // Expect input validation (HTML5 required or Zod error if we handled it UI side, handled via required attribute in UI)
    // We will just fill valid data
    
    await page.getByPlaceholder('Ej. Paella de Marisco').fill(testProduct);
    await page.getByPlaceholder('0.00').fill('15.50');
    // Select category - assuming 'Platos Principales' exists from seed or we pick the first option
    // It's a select, let's pick value by index or text if possible, or just default first one
    const categorySelect = page.locator('select[name="categoryId"]');
    await categorySelect.selectOption({ index: 0 }); 

    await page.getByPlaceholder('Descripción del plato...').fill('Delicious test food');
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Verify creation
    await expect(page.getByText(testProduct)).toBeVisible();
    await expect(page.getByText('$15.50')).toBeVisible();

    // UPDATE
    // Find the product card
    const card = page.locator('.group').filter({ hasText: testProduct }).first();
    
    // Check toggle availability
    const toggleBtn = card.getByRole('button', { name: 'Disponible' }); // It starts as true
    await expect(toggleBtn).toBeVisible();
    // We can't easily click edit since it didn't have a unique accessible name in the loop easily targeting, 
    // let's rely on text search for "Editar" within the card
    
    await card.getByRole('button', { name: 'Editar' }).click(); // "Editar" text button
    
    // Modal should open
    await page.getByPlaceholder('Ej. Paella de Marisco').fill(updatedProduct);
    await page.getByRole('button', { name: 'Guardar' }).click(); // Reusing the save button from modal

    // Verify update
    await expect(page.getByText(updatedProduct)).toBeVisible();
    await expect(page.getByText(testProduct)).not.toBeVisible();
  });
});
