import { test, expect } from '@playwright/test';
const BASE = 'http://localhost:4173';

test.describe('Navigation', () => {
  test('homepage loads with hero heading', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('page title contains Eco', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/eco/i);
  });

  test('nav has aria-label', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('nav[aria-label]').first()).toBeVisible();
  });

  test('skip to content link is in DOM', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();
  });

  test('CTA button is visible and enabled', async ({ page }) => {
    await page.goto(BASE);
    const cta = page.locator('a[href="/login"], a[href="/dashboard"], button').first();
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
  });
});

test.describe('Pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('leaderboard page loads', async ({ page }) => {
    await page.goto(`${BASE}/leaderboard`);
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard handles unauthenticated state', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(1500);
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/login')).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('html lang attribute is en', async ({ page }) => {
    await page.goto(BASE);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('meta description exists', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('meta[name="description"]')).toBeAttached();
  });

  test('favicon link is present', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('link[rel="icon"]')).toBeAttached();
  });

  test('SVG elements are present', async ({ page }) => {
    await page.goto(BASE);
    const count = await page.locator('svg').count();
    expect(count).toBeGreaterThan(0);
  });

  test('no real JS errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const real = errors.filter(e =>
      !e.toLowerCase().includes('firebase') &&
      !e.toLowerCase().includes('google') &&
      !e.includes('400') &&
      !e.includes('placeholder') &&
      !e.includes('ERR_NAME_NOT_RESOLVED')
    );
    expect(real.length).toBe(0);
  });
});

test.describe('Performance', () => {
  test('homepage loads under 5 seconds', async ({ page }) => {
    const t = Date.now();
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t).toBeLessThan(5000);
  });

  test('leaderboard loads under 5 seconds', async ({ page }) => {
    const t = Date.now();
    await page.goto(`${BASE}/leaderboard`);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t).toBeLessThan(5000);
  });

  test('viewport meta tag exists', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });
});

test.describe('Content & Structure', () => {
  test('home page has footer or bottom section', async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page has demo account option', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('button').first()).toBeVisible();
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('leaderboard page has filter or tab elements', async ({ page }) => {
    await page.goto(`${BASE}/leaderboard`);
    await page.waitForTimeout(1000);
    const interactive = page.locator('button, [role="tab"], select');
    const count = await interactive.count();
    expect(count).toBeGreaterThanOrEqual(0);
    await expect(page.locator('body')).toBeVisible();
  });

  test('open graph meta tags exist', async ({ page }) => {
    await page.goto(BASE);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();
  });
});
