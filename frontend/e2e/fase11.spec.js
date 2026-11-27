import { test, expect } from '@playwright/test';
import { setProfile } from './helpers.js';

// Fase 11: Tanya TATA (riwayat sesi, Coba lagi, tanpa jawaban buatan) & ilustrasi dunia.
// Server AI DITIRU dengan page.route → tidak ada panggilan ke DeepSeek (tidak memakai saldo).
const PROGRESS = { nickname: 'Uji', onboardingDone: true, xp: 60, worlds: { 1: { lessonDone: true, completed: true, stars: 2, bestPercent: 80 } } };
const QUOTA = 'TATA AI sedang istirahat (kuota habis). Pakai tombol petunjuk 💡 dulu, ya.';
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('Tanya TATA: gagal (kuota) → Coba lagi → jawaban; riwayat bertahan setelah muat ulang & ganti topik', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const sent = [];
  let quotaEmpty = true;
  await page.route('**/api/ai/status', (r) => r.fulfill({ json: { enabled: true } }));
  await page.route('**/api/ai/chat', async (r) => {
    sent.push(JSON.parse(r.request().postData()));
    if (quotaEmpty) return r.fulfill({ status: 502, json: { error: QUOTA } });
    return r.fulfill({ json: { reply: 'Coba cari bilangan terbesar yang membagi 12 dan 18.' } });
  });
  await setProfile(page, PROGRESS);
  await page.goto('/asisten');

  const box = page.getByLabel('Pertanyaan untuk TATA');
  await box.fill('Bagaimana mencari FPB?');
  await page.getByRole('button', { name: 'Kirim', exact: true }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('kuota habis');
  // Tidak ada jawaban buatan: hanya pertanyaan siswa di percakapan
  const convo = page.getByLabel('Percakapan dengan TATA');
  await expect(convo).not.toContainText('bilangan terbesar');
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-chat-gagal.png`, fullPage: true });

  quotaEmpty = false; // saldo diisi
  await alert.getByRole('button', { name: /Coba lagi/ }).click();
  await expect(convo).toContainText('Coba cari bilangan terbesar yang membagi 12 dan 18.');
  await expect(alert).toHaveCount(0);
  expect(sent[1].messages).toEqual([{ role: 'user', content: 'Bagaimana mencari FPB?' }]);

  // Muat ulang halaman → riwayat masih ada (sesi yang sama)
  await page.reload();
  await expect(convo).toContainText('Bagaimana mencari FPB?');
  await expect(convo).toContainText('bilangan terbesar');
  // Ganti topik → percakapan topik lain kosong; kembali → riwayat masih ada
  await page.getByRole('button', { name: 'Selisih dua kuadrat' }).click();
  await expect(convo).not.toContainText('Bagaimana mencari FPB?');
  await page.getByRole('button', { name: 'Aljabar umum' }).click();
  await expect(convo).toContainText('Bagaimana mencari FPB?');
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-chat-riwayat.png`, fullPage: true });
  expect(await overflow(page)).toBeLessThanOrEqual(0);

  // Hapus percakapan
  await page.getByRole('button', { name: 'Hapus percakapan' }).click();
  await expect(convo).not.toContainText('Bagaimana mencari FPB?');
  expect(errors).toEqual([]);
});

test('ilustrasi dunia: 5 dunia di Materi, di lembar pulau peta; tombol Masuk tetap terjangkau', async ({ page }, testInfo) => {
  await setProfile(page, PROGRESS);
  await page.goto('/materi');
  for (let id = 1; id <= 5; id++) await expect(page.locator(`svg[data-world-art="${id}"]`)).toBeVisible();
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-materi-ilustrasi.png`, fullPage: true });

  await page.goto('/peta');
  await page.getByRole('button', { name: /World 2/ }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.locator('svg[data-world-art="2"]')).toBeVisible();
  const enter = sheet.getByRole('link', { name: /Masuk ke/ });
  await enter.scrollIntoViewIfNeeded();
  await expect(enter).toBeVisible();
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-peta-ilustrasi.png` });
});
