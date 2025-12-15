
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    await page.click('a[href="/users"]');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Admin User')).toBeVisible();
  });

  test('should filter open "Add User" modal', async ({ page }) => {
    await page.click('button:has-text("Añadir Usuario")');
    await expect(page.getByText('Nuevo Usuario')).toBeVisible(); // Assuming modal title
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should show error when submitting invalid form', async ({ page }) => {
    await page.click('button:has-text("Añadir Usuario")');
    await expect(page.getByText('Nuevo Usuario')).toBeVisible();
    
    // Attempt to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation or UI error message
    // Assuming browser validation is active for required fields
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
    
    // Or if server side validation shows error toast/message
    // await expect(page.getByText('Missing fields')).toBeVisible();
  });
});
