import { test, expect } from '@playwright/test';

// Fase 5: Galeri Ekspresi TATA, AI Assistant (mode nonaktif), Modul Guru.

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('Galeri Ekspresi TATA: 18 ekspresi, responsif', async ({ page }, testInfo) => {
  await page.goto('/pengaturan');
  await page.getByRole('link', { name: 'Galeri Ekspresi TATA' }).click();
  await expect(page.getByRole('list', { name: 'Daftar ekspresi TATA' }).locator('li')).toHaveCount(18);
  await page.getByRole('button', { name: '9. Berpikir' }).click();
  await expect(page.getByRole('heading', { name: 'Berpikir' })).toBeVisible();
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-galeri-tata.png`, fullPage: true });
});
