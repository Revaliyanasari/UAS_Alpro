import { test, expect } from '@playwright/test';

async function drag(page, from, to) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 4 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/** Menyimpan progres langsung ke IndexedDB (sama seperti yang dilakukan aplikasi). */
async function setProfile(page, state) {
  await page.goto('/');
  await page.evaluate(async (s) => {
    const req = indexedDB.open('keyval-store');
    const db = await new Promise((res, rej) => {
      req.onupgradeneeded = () => req.result.createObjectStore('keyval');
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    await new Promise((res) => {
      const tx = db.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').put(JSON.stringify({ state: s, version: 1 }), 'aa-profile');
      tx.oncomplete = res;
    });
  }, state);
}

test('peta → masuk World 1 → layar pelajaran berfungsi', async ({ page }) => {
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 0, worlds: {} });
  await page.goto('/peta');
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: 'Masuk ke Lembah Aljabar' }).click();
  await expect(page.getByRole('heading', { name: 'Misi Lembah Aljabar' })).toBeVisible();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lanjut' })).toBeEnabled();
});

test('Algebra Tiles mode baris: seret ubin → persegi panjang 4x(2x + 3)', async ({ page }, testInfo) => {
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 10, worlds: { 1: { completed: true, stars: 3 } } });
  await page.goto('/belajar/2');
  for (let i = 0; i < 4; i++) {
    if (i === 1) {
      // layar 2: bangun persegi panjang dari 12 ubin (1 × 12, 2 × 6, 3 × 4)
      for (let k = 0; k < 3; k++) {
        if (k > 0) await page.getByRole('button', { name: 'Tambah baris' }).click();
        await page.getByRole('button', { name: 'Catat ukuran ini' }).click();
      }
      await expect(page.getByText(/Kamu menemukan semuanya/)).toBeVisible();
    }
    if (i === 3) {
      // layar 4 (bagi sama) dilewati dengan menyelesaikannya cepat lewat ketuk
      await page.locator('[data-tray="x2"]').click();
      for (const lane of [0, 0, 1, 1, 2, 2, 3, 3]) await page.locator(`[data-lane="${lane}"]`).click();
      await page.locator('[data-tray="x"]').click();
      for (const lane of [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]) await page.locator(`[data-lane="${lane}"]`).click();
      await page.getByRole('button', { name: 'Periksa susunan' }).click();
      await expect(page.getByText(/4\(2x² \+ 3x\)/)).toBeVisible();
    }
    await page.getByRole('button', { name: 'Lanjut' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Bangun persegi panjang' })).toBeVisible();

  // seret sungguhan dengan pointer untuk baris 1, ketuk-taruh untuk sisanya
  await drag(page, page.locator('[data-tray="x2"]'), page.locator('[data-lane="0"]'));
  await drag(page, page.locator('[data-tray="x2"]'), page.locator('[data-lane="0"]'));
  for (let k = 0; k < 3; k++) await drag(page, page.locator('[data-tray="x"]'), page.locator('[data-lane="0"]'));
  await expect(page.locator('[data-lane="0"] button')).toHaveCount(5);
  await page.locator('[data-tray="x2"]').click();
  for (const lane of [1, 1, 2, 2, 3, 3]) await page.locator(`[data-lane="${lane}"]`).click();
  await page.locator('[data-tray="x"]').click();
  for (const lane of [1, 1, 1, 2, 2, 2, 3, 3, 3]) await page.locator(`[data-lane="${lane}"]`).click();
  await page.getByRole('button', { name: 'Periksa susunan' }).click();
  await expect(page.getByText(/4x\(2x \+ 3\)/)).toBeVisible();
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-tiles-baris.png`, fullPage: true });

  // tidak ada scroll horizontal di layar pelajaran
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
