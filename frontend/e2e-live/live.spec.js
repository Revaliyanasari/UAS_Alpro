import { test, expect } from '@playwright/test';

// Uji asap situs live: alur siswa baru dari awal sampai kuis, tautan langsung, fitur pendukung.
// Memakai URL relatif terhadap baseURL (mis. https://revaliyanasari.github.io/UAS_Alpro/).

test('situs live: alur siswa, tautan langsung, galeri, guru, suara, PWA', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // 1) halaman pembuka
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Algebra Adventure' })).toBeVisible();
  await page.screenshot({ path: `e2e/.results/live/${testInfo.project.name}-pembuka.png` });

  // 2) identitas → sapaan → perkenalan → Beranda (tur muncul sekali untuk siswa baru)
  await page.getByRole('link', { name: 'Mulai Petualangan' }).click();
  await page.getByLabel(/Nama lengkap/).fill('Uji Situs Online');
  await page.getByLabel(/Nama panggilan/).fill('Uji');
  await page.getByRole('button', { name: 'VII A' }).click();
  await page.getByLabel(/Asal sekolah/).fill('SMP Uji Coba');
  await page.getByRole('button', { name: /Mulai Petualangan/ }).click();
  await expect(page.getByText('Halo, Uji! Siap memulai petualangan matematika hari ini?')).toBeVisible();
  await page.getByRole('button', { name: 'Ayo berangkat!' }).click();
  await page.getByRole('button', { name: 'Lewati' }).click();
  await expect(page.getByRole('heading', { name: 'Halo, Uji!' })).toBeVisible();
  expect(page.url()).toContain('/beranda');
  await expect(page.locator('[data-tour-card]')).toBeVisible();
  await page.getByRole('button', { name: 'Lewati tur' }).click();
  await expect(page.locator('[data-tour-card]')).toBeHidden();

  // 3) audio aktif setelah interaksi (Web Audio asli)
  await expect.poll(() => page.evaluate(() => window.__algebraAudio?.().track)).toBe('map');

  // 3b) materi lengkap World 1–5 dengan ilustrasi
  await page.getByRole('link', { name: /Buka peta petualangan/ }).click();
  await expect(page.getByRole('button', { name: /World 4: Menara Tantangan/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /World 5: Petualangan Literasi/ })).toBeVisible();

  // 4) pelajaran World 1: layar soal berfungsi
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: 'Masuk ke Lembah Aljabar' }).click();
  await expect(page.getByRole('heading', { name: 'Misi Lembah Aljabar' })).toBeVisible();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lanjut' })).toBeEnabled();
  await page.screenshot({ path: `e2e/.results/live/${testInfo.project.name}-pelajaran.png` });

  // 5) tautan langsung + muat ulang (404.html → aplikasi), progres & identitas tetap ada
  await page.goto('./peta');
  await expect(page.getByText('Halo, Uji!')).toBeVisible();
  await page.goto('./materi');
  for (let id = 1; id <= 5; id++) await expect(page.locator(`svg[data-world-art="${id}"]`)).toBeVisible();
  await page.goto('./profil');
  await expect(page.getByText('Uji Situs Online')).toBeVisible();

  // 6) Galeri TATA, Modul Guru (dimuat terpisah), Pengaturan
  await page.goto('./tata');
  await expect(page.getByRole('list', { name: 'Daftar ekspresi TATA' }).locator('li')).toHaveCount(18);
  await page.goto('./guru');
  await expect(page.getByRole('tab', { name: 'Instrumen' })).toBeVisible();
  await page.goto('./pengaturan');
  await expect(page.getByRole('heading', { name: 'Suara' })).toBeVisible();

  // 7) PWA: service worker aktif (bisa dipasang & dipakai offline)
  await expect.poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker?.getRegistration())), { timeout: 20_000 }).toBe(true);

  // 8) tidak ada error JavaScript
  expect(errors).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
