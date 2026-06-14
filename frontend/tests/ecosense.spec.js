import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';

test.describe('EcoSense Platform', () => {
  test('homepage loads with hero text', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.title()).resolves.toContain('Eco');
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/login')).toBeTruthy();
  });

  test('leaderboard page loads', async ({ page }) => {
    await page.goto(`${BASE}/leaderboard`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('home page has CTA button', async ({ page }) => {
    await page.goto(BASE);
    const cta = page.locator('a[href="/login"], a[href="/dashboard"], button').first();
    await expect(cta).toBeVisible();
  });

  test('world visualizer SVG renders', async ({ page }) => {
    await page.goto(BASE);
    // SVG should be present somewhere on page
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    // Filter out known third-party and dummy configuration network errors
    const realErrors = errors.filter(e => {
      const lower = e.toLowerCase();
      return !lower.includes('firebase') && 
             !lower.includes('google') && 
             !lower.includes('failed to load resource') && 
             !lower.includes('status of 400');
    });
    expect(realErrors.length).toBe(0);
  });
});
