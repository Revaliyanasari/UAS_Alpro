import { test, expect } from '@playwright/test';
import { setProfile } from './helpers.js';
import { MENU } from '../src/components/layout/menu.js';

// Fase 8: perombakan UI — menu ⋮ / sidebar, Beranda, halaman baru, game, kejernihan audio.
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const PROGRESS = { nickname: 'Uji', onboardingDone: true, xp: 60, worlds: { 1: { lessonDone: true, completed: true, stars: 2, bestPercent: 80 } } };

test('menu: setiap item membuka halaman yang berfungsi (drawer di HP, sidebar di laptop)', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setProfile(page, PROGRESS);
  await page.goto('/beranda');
  await expect(page.getByRole('heading', { name: 'Halo, Uji!' })).toBeVisible();
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-beranda.png`, fullPage: true });
  const mobile = testInfo.project.name.startsWith('ponsel');

  for (const cat of MENU) {
    for (const item of cat.items) {
      if (item.to === '/guru') continue; // Modul Guru diuji di fase5 (dimuat terpisah)
      if (mobile) await page.getByRole('button', { name: 'Buka menu' }).click();
      const nav = mobile ? page.getByRole('dialog', { name: 'Menu utama' }) : page.getByRole('complementary', { name: 'Navigasi samping' });
      await nav.getByRole('link', { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(item.to.split('#')[0].replace(/\//g, '\\/') + '(#.*)?$'));
      await expect(page.getByRole('heading').first()).toBeVisible();
      expect(await overflow(page), item.to).toBeLessThanOrEqual(0);
      // dari peta kembali ke halaman ber-sidebar agar menu laptop tersedia lagi
      if (!mobile && item.to === '/peta') await page.goto('/beranda');
    }
  }
  expect(errors).toEqual([]);
});

test('halaman baru: tangkapan layar & tanpa overflow', async ({ page }, testInfo) => {
  await setProfile(page, PROGRESS);
  for (const [path, name] of [
    ['/game', 'game'],
    ['/pencapaian', 'pencapaian'],
    ['/peringkat', 'peringkat'],
    ['/progres', 'progres'],
    ['/materi', 'materi'],
    ['/asisten', 'asisten'],
    ['/pengaturan', 'pengaturan'],
    ['/peta', 'peta'],
    ['/profil', 'profil'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await page.waitForTimeout(150);
    expect(await overflow(page), path).toBeLessThanOrEqual(0);
    await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-${name}.png`, fullPage: true });
  }
});

test('game Cepat Tepat & Pasangkan bisa dimainkan', async ({ page }) => {
  test.setTimeout(90_000);
  await setProfile(page, PROGRESS);
  await page.goto('/game/cepat-tepat');
  await page.getByRole('button', { name: '▶ Mulai' }).click();
  await expect(page.getByText(/⏱/)).toBeVisible();
  // satu siklus nyata: jawab → umpan balik → soal berikutnya otomatis (alur 10 soal diuji di uji komponen)
  const prompt = await page.locator('p[class*="prompt"]').textContent();
  await page.locator('button[class*="opt"]').first().click();
  await expect(page.getByText(/Tepat!|Belum tepat./)).toBeVisible();
  await expect(page.getByText(/Tepat!|Belum tepat./)).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('button[class*="opt"]').first()).toBeEnabled();
  console.log('soal pertama:', prompt);
  await expect(page.getByText(/Skor/)).toBeVisible();

  await page.goto('/game/pasangkan');
  const cards = page.getByRole('button', { name: /^Bentuk (penjumlahan|faktor) / });
  await expect(cards).toHaveCount(12);
  await cards.nth(0).click();
  await cards.nth(1).click();
  await expect(page.getByText(/Langkah 1/)).toBeVisible();
});

test('audio lebih jelas TANPA pecah: puncak sinyal diukur saat musik + efek berbunyi bersamaan', async ({ page }) => {
  await setProfile(page, PROGRESS);
  await page.goto('/');
  await page.getByRole('link', { name: 'Lanjutkan Petualangan' }).click(); // interaksi pertama → audio aktif
  await expect.poll(() => page.evaluate(() => window.__algebraAudio().track)).toBe('map');
  await page.waitForTimeout(1500); // musik terdengar penuh (crossfade selesai)
  const musicPeak = await page.evaluate(() => window.__algebraAudioTest.peak(1500));
  // efek terkeras dibunyikan bersamaan di atas musik
  const mixPeak = await page.evaluate(async () => {
    window.__algebraAudioTest.play('victory');
    window.__algebraAudioTest.play('star');
    window.__algebraAudioTest.play('correct');
    return window.__algebraAudioTest.peak(1800);
  });
  console.log(`puncak musik ${musicPeak.toFixed(3)} · puncak musik+efek ${mixPeak.toFixed(3)} (batas pecah 1.000)`);
  expect(musicPeak).toBeGreaterThan(0.08); // terdengar jelas
  expect(mixPeak).toBeGreaterThan(musicPeak); // efek menonjol di atas musik
  expect(mixPeak).toBeLessThan(1); // tidak clipping
});

test('di peta: drawer menu & panel suara tampil PALING ATAS (tidak tertutup pulau)', async ({ page }) => {
  await setProfile(page, PROGRESS);
  await page.goto('/peta');
  const onTop = async (name) => {
    // tunggu animasi masuk panel selesai sebelum memeriksa titik tengahnya
    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      return el && el.getAnimations().every((a) => a.playState !== 'running');
    });
    return page.evaluate((label) => {
      const el = document.querySelector(`[role="dialog"][aria-label="${label}"], [role="dialog"][aria-labelledby="audio-title"]`);
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el.contains(hit);
    }, name);
  };
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu utama' })).toBeVisible();
  expect(await onTop('Menu utama')).toBe(true);
  await page.getByRole('button', { name: 'Tutup menu' }).click();
  await page.getByRole('button', { name: 'Pengaturan suara' }).click();
  await expect(page.getByRole('dialog', { name: 'Suara' })).toBeVisible();
  expect(await onTop('Suara')).toBe(true);
});
