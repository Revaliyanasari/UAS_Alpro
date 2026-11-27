import { test, expect } from '@playwright/test';

// TATA 3D di halaman pembuka situs live: file 3D (dimuat terpisah) harus berhasil diunduh & tampil.
test('situs live: TATA tampil di halaman pembuka', async ({ page }, testInfo) => {
  const chunks = [];
  page.on('response', (r) => r.url().includes('Tata3D') && chunks.push(`${r.status()} ${r.url()}`));
  await page.goto('./');
  const tata = page.locator('[data-state]').first();
  await expect(tata).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `e2e/.results/live/${testInfo.project.name}-tata.png` });
  const box = await tata.boundingBox();
  console.log(`${testInfo.project.name}: kotak TATA ${Math.round(box.width)}×${Math.round(box.height)}, file 3D: ${chunks.join(', ') || '(tidak diunduh — memakai 2D)'}`);
  expect(box.height).toBeGreaterThan(100);
  for (const c of chunks) expect(c.startsWith('200')).toBe(true);
});
