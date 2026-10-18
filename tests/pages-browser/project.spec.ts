import { test, expect } from '@playwright/test';

test('user-site root, localized pages, images and styles work without a repository prefix', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (response) => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  await page.goto('');
  await expect(page).toHaveURL('http://127.0.0.1:4323/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[http-equiv="refresh"]')).toHaveCount(0);
  for (const locale of ['en', 'zh']) {
    for (const section of ['', 'biography/', 'research/', 'publications/', 'people/', 'gallery/']) {
      const response = await page.goto(`${locale}/${section}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 244, 244)');
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
      }
      await page.locator('.language-switch').click();
      const counterpart = locale === 'zh' && !section ? '/' : `/${locale === 'en' ? 'zh' : 'en'}/${section}`;
      await expect(page).toHaveURL(`http://127.0.0.1:4323${counterpart}`);
    }
  }
  expect(failed).toEqual([]);
});
