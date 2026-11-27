import { test, expect } from '@playwright/test';
import { setProfile } from './helpers.js';

// Fase 7: musik & efek suara di browser sungguhan (Web Audio asli).
const audioState = (page) => page.evaluate(() => window.__algebraAudio());

test('musik: diam sebelum interaksi, berpindah per halaman tanpa bertumpuk, mute tersimpan', async ({ page }, testInfo) => {
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 0, worlds: { 1: { lessonDone: true } } });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Lanjutkan Petualangan' })).toBeVisible();

  // 1) belum ada interaksi → tidak ada suara (aturan autoplay)
  expect(await audioState(page)).toMatchObject({ unlocked: false, track: null, desired: 'welcome' });

  // 2) interaksi pertama → audio aktif; peta memutar lagu petualangan
  await page.getByRole('link', { name: 'Lanjutkan Petualangan' }).click();
  await expect.poll(async () => (await audioState(page)).track).toBe('map'); // Beranda
  await page.getByRole('link', { name: /Buka peta petualangan/ }).click(); // Beranda → peta
  await expect.poll(async () => (await audioState(page)).track).toBe('map');
  const s = await audioState(page);
  expect(s).toMatchObject({ available: true, unlocked: true, state: 'running', playing: 1 });

  // 3) pelajaran → lagu fokus; kuis → lagu kuis; selalu tepat satu lagu
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: 'Masuk ke Lembah Aljabar' }).click();
  await expect.poll(async () => (await audioState(page)).track).toBe('lesson');
  expect((await audioState(page)).playing).toBe(1);
  await page.getByRole('button', { name: 'Keluar ke peta' }).click();
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: /Kuis Dunia 1/ }).click();
  await expect.poll(async () => (await audioState(page)).track).toBe('quiz');
  expect((await audioState(page)).playing).toBe(1);

  // 4) tombol speaker di kuis: matikan musik → hening, kuis tetap bisa dikerjakan
  await page.getByRole('button', { name: 'Pengaturan suara' }).click();
  await page.getByLabel(/Musik latar/).uncheck();
  await expect.poll(async () => (await audioState(page)).track).toBeNull();
  await page.getByRole('slider', { name: 'Volume efek suara' }).fill('40');
  expect(await page.getByRole('dialog', { name: 'Suara' }).screenshot({ path: `e2e/.results/${testInfo.project.name}-panel-suara.png` })).toBeTruthy();
  await page.getByRole('button', { name: 'Tutup pengaturan suara' }).click();
  await expect(page.getByText(/Soal 1 dari 5/)).toBeVisible();

  // 5) muat ulang → pilihan tetap tersimpan
  await page.reload();
  await page.getByRole('button', { name: 'Pengaturan suara' }).click();
  await expect(page.getByLabel(/Musik latar/)).not.toBeChecked();
  await expect(page.getByText('Volume efek suara: 40%')).toBeVisible();
  expect((await audioState(page)).track).toBeNull();
});

test('opsi hening saat belajar: pelajaran tanpa musik, peta tetap bermusik', async ({ page }) => {
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 0, worlds: {} });
  await page.goto('/pengaturan');
  await page.getByLabel(/Musik lembut saat belajar/).uncheck();
  await page.goto('/'); // halaman pembuka (pengaturan tersimpan di perangkat)
  await page.getByRole('link', { name: 'Lanjutkan Petualangan' }).click();
  await page.getByRole('link', { name: /Buka peta petualangan/ }).click(); // Beranda → peta
  await expect.poll(async () => (await audioState(page)).track).toBe('map');
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: 'Masuk ke Lembah Aljabar' }).click();
  await expect(page.getByRole('heading', { name: 'Misi Lembah Aljabar' })).toBeVisible();
  await expect.poll(async () => (await audioState(page)).track).toBeNull();
});
