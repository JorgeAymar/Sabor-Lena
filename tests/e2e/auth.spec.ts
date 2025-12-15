
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    
    // Check if sidebar text "Admin Panel" is visible to confirm login
    await expect(page.getByText('Admin Panel')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sabor.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Logout
    await page.click('button:has-text("Cerrar Sesión")');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/login/);
  });
});
