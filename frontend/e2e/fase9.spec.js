import { test, expect } from '@playwright/test';
import { setProfile } from './helpers.js';

// Fase 9: tur Beranda (tutup/lewati/ulang, tidak menutupi modal), jalan setapak peta, audio & suara TATA.
const PROGRESS = { nickname: 'Uji', onboardingDone: true, xp: 60, worlds: { 1: { lessonDone: true, completed: true, stars: 2, bestPercent: 80 } } };

/** Elemen paling atas di titik tengah sebuah locator berada di dalam `inside`? */
const topmostInside = (page, locator, insideSelector) =>
  locator.evaluate((el, sel) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40));
    return Boolean(hit && hit.closest(sel));
  }, insideSelector);

test('tur Beranda: muncul sekali, pas di layar, mengalah pada modal, bisa dilewati & diulang', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setProfile(page, { ...PROGRESS, tourDone: false });
  await page.goto('/beranda');
  const tour = page.locator('[data-tour-card]');
  await expect(tour).toBeVisible();
  await expect(tour).toContainText('Halo, aku TATA!');

  // Langkah 2: menu disorot; kartu seluruhnya di dalam layar
  await tour.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await expect(tour).toContainText('Menu');
  await page.waitForTimeout(450);
  const vp = page.viewportSize();
  const box = await tour.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-tur.png` });

  // Tombol suara tetap bisa ditekan saat tur terbuka; panel suara berada PALING ATAS dan tur bersembunyi
  await page.getByRole('button', { name: /^Pengaturan suara/ }).first().click();
  const audioDialog = page.getByRole('dialog', { name: 'Suara' });
  await expect(audioDialog).toBeVisible();
  await expect(tour).toBeHidden();
  expect(await topmostInside(page, audioDialog.getByRole('heading', { name: 'Suara' }), '[role="dialog"]')).toBe(true);
  // Esc menutup panel suara (bukan tur); tur muncul lagi di langkah yang sama
  await page.keyboard.press('Escape');
  await expect(audioDialog).toBeHidden();
  await expect(tour).toContainText('Menu');

  // Menu ⋮ / sidebar: klik di luar panel suara menutupnya (uji klik luar)
  await page.getByRole('button', { name: /^Pengaturan suara/ }).first().click();
  await page.mouse.click(vp.width / 2, 8); // di atas panel (lembar bawah di HP, dialog tengah di laptop)
  await expect(audioDialog).toBeHidden();

  // Lewati → tersimpan; muat ulang tidak memunculkan tur lagi
  await tour.getByRole('button', { name: 'Lewati tur' }).click();
  await expect(tour).toBeHidden();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Halo, Uji!' })).toBeVisible();
  await page.waitForTimeout(300);
  await expect(tour).toBeHidden();

  // Ulangi dari Beranda dan dari Pengaturan
  await page.getByRole('button', { name: 'Lihat tur aplikasi' }).click();
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Tutup tur' }).click();
  await page.goto('/pengaturan');
  await page.getByRole('link', { name: 'Ulangi tur aplikasi' }).click();
  await expect(page).toHaveURL(/\/beranda/);
  await expect(tour).toBeVisible();
  // Selesaikan sampai akhir
  for (let i = 0; i < 5; i++) await tour.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await tour.getByRole('button', { name: 'Selesai' }).click();
  await expect(tour).toBeHidden();
  expect(errors).toEqual([]);
});

test('peta: jalan setapak berkelok di belakang pulau (tidak ada garis lurus menembus panel)', async ({ page }, testInfo) => {
  await setProfile(page, PROGRESS);
  await page.goto('/peta');
  const trail = page.locator('svg[data-trail] path').first();
  await expect(trail).toBeAttached();
  const d = await trail.getAttribute('d');
  expect(d).toMatch(/C /); // kurva, bukan garis lurus
  // Setiap pulau dapat diklik (bukan tertutup jalan)
  const islands = page.locator('main ol > li > *');
  const n = await islands.count();
  expect(n).toBeGreaterThanOrEqual(5);
  for (let i = 0; i < n; i++) {
    await islands.nth(i).scrollIntoViewIfNeeded();
    expect(await topmostInside(page, islands.nth(i), 'li')).toBe(true);
  }
  // Lembar pulau berada di atas jalan & header
  await islands.first().click();
  const sheet = page.getByRole('dialog').first();
  await expect(sheet).toBeVisible();
  expect(await topmostInside(page, sheet, '[role="dialog"]')).toBe(true);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-peta-jalan.png`, fullPage: true });
});

test('audio: aktif setelah ketukan, berhenti saat tab tersembunyi & pulih lagi; tes suara di Pengaturan', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setProfile(page, PROGRESS);
  await page.goto('/peta');
  // sebelum ketukan: tombol speaker memberi tanda "aktifkan suara"
  await expect(page.getByRole('button', { name: /ketuk untuk mengaktifkan suara/ })).toBeVisible();
  await page.getByText('Halo, Uji!').first().click(); // ketukan pertama (teks sapaan, bukan tombol)
  await expect.poll(() => page.evaluate(() => window.__algebraAudio().state)).toBe('running');
  await expect(page.getByRole('button', { name: /ketuk untuk mengaktifkan suara/ })).toHaveCount(0);
  expect(await page.evaluate(() => window.__algebraAudio().track)).toBe('map');

  const setVisibility = (state) =>
    page.evaluate((s) => {
      Object.defineProperty(document, 'visibilityState', { value: s, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, state);
  await setVisibility('hidden');
  await expect.poll(() => page.evaluate(() => window.__algebraAudio().state)).toBe('suspended');
  await setVisibility('visible');
  await expect.poll(() => page.evaluate(() => window.__algebraAudio().state)).toBe('running');

  // Pengaturan: tiga kelompok + tes + kembalikan bawaan
  await page.goto('/pengaturan');
  await page.getByText('Semua pengaturan tersimpan otomatis').click();
  for (const name of ['🎵 Musik', '🔔 Efek suara', '🤖 Suara TATA']) await expect(page.getByRole('group', { name })).toBeVisible();
  await page.getByRole('button', { name: '▶ Tes musik' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Memutar musik' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__algebraAudio().track)).not.toBeNull();
  await page.getByRole('button', { name: '▶ Tes efek' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Efek suara berbunyi' })).toBeVisible();
  await page.getByRole('button', { name: '▶ Tes suara TATA' }).click();
  // Perangkat uji mungkin tidak punya suara Indonesia: yang penting ada keterangan jujur, bukan diam saja
  await expect(page.getByRole('status').filter({ hasText: /TATA berbicara|belum punya suara bahasa Indonesia|tidak mendukung|Memeriksa/ })).toBeVisible();
  await page.getByRole('checkbox', { name: /^Musik latar/ }).uncheck();
  await page.getByRole('button', { name: 'Kembalikan pengaturan suara bawaan' }).click();
  await expect(page.getByRole('checkbox', { name: /^Musik latar/ })).toBeChecked();
  expect(errors).toEqual([]);
});
