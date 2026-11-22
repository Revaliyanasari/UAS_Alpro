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

test('Modul Guru: instrumen → skor → laporan → unduh CSV sungguhan', async ({ page }, testInfo) => {
  await page.goto('/guru');
  await page.getByRole('button', { name: '+ Instrumen baru' }).click();
  await page.getByLabel('Judul instrumen').fill('Uji coba e2e');
  await page.getByLabel('Teks soal').fill('Faktorkan 6x² + 9x');
  await page.getByLabel('Indikator literasi').selectOption('Employing');
  await page.getByLabel('Skor maks tahap Tahap 1').fill('4');
  await page.getByRole('button', { name: '← Kembali ke daftar' }).click();
  await page.getByRole('tab', { name: 'Penilaian' }).click();
  await page.getByRole('button', { name: '+ Tambah hasil siswa' }).click();
  await page.getByLabel('Kode siswa').fill('S07');
  await page.getByLabel('Tahap 1 (0–4)').fill('3');
  await page.getByRole('button', { name: 'Simpan hasil' }).click();
  await page.getByRole('tab', { name: 'Laporan' }).click();
  await expect(page.getByText(/rata-rata nilai/)).toContainText('75');
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-guru-laporan.png`, fullPage: true });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Unduh CSV' }).first().click()]);
  const path = await download.path();
  const text = (await import('node:fs')).readFileSync(path, 'utf8');
  expect(text).toContain('S07');
  expect(text).toContain('75');
  // data tetap ada setelah muat ulang (IndexedDB)
  await page.reload();
  await page.getByRole('tab', { name: 'Penilaian' }).click();
  await expect(page.getByRole('cell', { name: 'S07' })).toBeVisible();
});

test('Tanpa server AI: tombol Tanya TATA tidak muncul, Pengaturan menjelaskan', async ({ page }) => {
  await page.goto('/pengaturan');
  await expect(page.getByText(/Server AI tidak berjalan|API key DeepSeek belum diisi/)).toBeVisible();
  await page.goto('/belajar/1');
  await expect(page.getByRole('heading', { name: 'Misi Lembah Aljabar' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Tanya TATA/ })).toHaveCount(0);
});
