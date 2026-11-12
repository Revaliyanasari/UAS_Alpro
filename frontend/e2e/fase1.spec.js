import { test, expect } from '@playwright/test';

const PAGES = ['/', '/mulai', '/peta', '/lab', '/katalog', '/pengaturan', '/tidak-ada'];

test('tidak ada scroll horizontal di semua halaman', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `halaman ${path}`).toBeLessThanOrEqual(0);
  }
});

test('target sentuh tombol & tautan minimal 40 px', async ({ page }) => {
  for (const path of ['/', '/mulai', '/peta', '/lab', '/pengaturan']) {
    await page.goto(path);
    const small = await page.$$eval('button, a, label', (els) =>
      els
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ text: el.textContent.trim().slice(0, 30), h: el.getBoundingClientRect().height }))
        .filter((e) => e.h < 40),
    );
    expect(small, `halaman ${path}`).toEqual([]);
  }
});

test('Lab: periksa jawaban dengan ketuk/klik dan cek dengan mengalikan', async ({ page }) => {
  await page.goto('/pengaturan');
  await page.getByRole('link', { name: 'Lab Pemeriksa Aljabar' }).click();
  await page.getByLabel('Jawaban siswa').fill('4x(2x+12)');
  await page.getByRole('button', { name: 'Periksa' }).click();
  await expect(page.getByText('Kode diagnosis: M1')).toBeVisible();
  await page.getByRole('button', { name: 'Cek dengan mengalikan' }).click();
  await expect(page.getByText('belum sama')).toBeVisible();
  await page.getByLabel('Jawaban siswa').fill('4x(2x+3)');
  await page.getByLabel('Jawaban siswa').press('Enter'); // keyboard
  await expect(page.getByText('Tepat sekali!', { exact: false })).toBeVisible();
});

test('Pengaturan tersimpan setelah halaman dimuat ulang (IndexedDB)', async ({ page }) => {
  await page.goto('/pengaturan');
  await page.getByText('Besar', { exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await page.getByText('Biasa', { exact: true }).click();
});

test('PWA: manifest dan service worker aktif', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    return link ? (await fetch(link.href)).json() : null;
  });
  expect(manifest?.name).toBe('Algebra Adventure');
  expect(manifest.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  const swReady = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(swReady).toBe(true);
});

test('tangkapan layar halaman (untuk peninjauan visual)', async ({ page }, testInfo) => {
  for (const [path, name] of [
    ['/lab', 'lab'],
    ['/katalog', 'katalog'],
  ]) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-${name}.png`, fullPage: true });
  }
});
