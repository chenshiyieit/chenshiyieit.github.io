import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sections = ['', 'biography/', 'research/', 'publications/', 'people/', 'gallery/'];

for (const width of [1440, 768, 390, 320]) {
  test(`all bilingual pages work without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const locale of ['en', 'zh']) {
      for (const section of sections) {
        const response = await page.goto(`/${locale}/${section}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator('h1')).toHaveCount(1);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const images = page.locator('img');
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await expect(image).toHaveJSProperty('complete', true);
          expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test('default entry and language switches keep section', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[http-equiv="refresh"]')).toHaveCount(0);
  for (const section of sections) {
    await page.goto(`/en/${section}`);
    await page.locator('.language-switch').click();
    await expect(page).toHaveURL(`/zh/${section}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await page.locator('.language-switch').click();
    await expect(page).toHaveURL(section ? `/en/${section}` : '/');
  }
});

test('mobile navigation works with keyboard and marks current page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const menu = page.locator('.mobile-menu summary');
  await menu.focus();
  await page.keyboard.press('Enter');
  const people = page.locator('.mobile-menu nav').getByRole('link', { name: 'People', exact: true });
  await expect(people).toBeVisible();
  await people.click();
  await expect(page).toHaveURL('/en/people/');
  await menu.click();
  await expect(people).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
});

test('publication anchors work and selected papers exist in bibliography', async ({ page }) => {
  await page.goto('/en/');
  const selected = await page.locator('.publication h3').allTextContents();
  await page.goto('/en/publications/');
  for (const title of selected) await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.locator('.year-nav').getByRole('link', { name: '1998', exact: true }).click();
  await expect(page).toHaveURL(/#year-1998$/);
  const top = await page.locator('#year-1998').evaluate((element) => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(65);
});

test('English and Chinese key pages pass automated accessibility checks', async ({ page }) => {
  for (const path of ['/en/', '/zh/', '/en/people/', '/en/publications/', '/zh/gallery/']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations, `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`).toEqual([]);
  }
});

test('capture desktop and mobile review screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/en/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.goto('/en/people/');
  await page.screenshot({ path: 'artifacts/people-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/zh/');
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
});
