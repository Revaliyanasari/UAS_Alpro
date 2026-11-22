import { test, expect } from '@playwright/test';

/** Seret elemen dengan pointer sungguhan (tekan → gerak bertahap → lepas), seperti jari/mouse siswa. */
async function drag(page, from, to) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 4 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  // dnd-kit sengaja membuang satu klik yang datang tepat setelah seretan selesai;
  // jeda singkat meniru kecepatan siswa sungguhan sebelum ketukan berikutnya.
  await page.waitForTimeout(150);
}

/** Siswa baru: isi identitas (halaman wajib sebelum petualangan). */
async function fillIdentity(page, nickname = 'Rani') {
  await page.getByLabel(/Nama lengkap/).fill('Rani Putri Utami');
  await page.getByLabel(/Nama panggilan/).fill(nickname);
  await page.getByRole('button', { name: 'VII C' }).click();
  await page.getByLabel(/Asal sekolah/).fill('SMP Negeri 2 Contoh');
  await page.getByRole('button', { name: /Mulai Petualangan/ }).click();
  await expect(page.getByText(`Halo, ${nickname}! Siap memulai petualangan matematika hari ini?`)).toBeVisible();
  await page.getByRole('button', { name: 'Ayo berangkat!' }).click();
}

async function openTilesStep(page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Mulai Petualangan' }).click();
  await fillIdentity(page);
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByRole('heading', { name: 'Kenalan dengan ubin' })).toBeVisible();
}

test('alur lengkap: welcome → identitas → onboarding → seret ubin → peta', async ({ page }) => {
  await openTilesStep(page);

  // salah bingkai: ubin x² diseret ke bingkai 1×1 → ditolak, ubin kembali ke nampan
  await drag(page, page.locator('[data-tile="x2"]'), page.locator('[data-frame="one"]'));
  await expect(page.getByText(/Belum muat/)).toBeVisible();
  await expect(page.locator('[data-tile="x2"]')).toBeVisible();

  // pasangan yang benar dengan seret
  await drag(page, page.locator('[data-tile="x2"]'), page.locator('[data-frame="x2"]'));
  await drag(page, page.locator('[data-tile="x"]'), page.locator('[data-frame="x"]'));
  // alternatif ketuk-taruh untuk ubin terakhir
  await page.locator('[data-tile="one"]').click();
  await page.locator('[data-frame="one"]').click();
  await expect(page.getByText(/Nama ubin adalah luasnya/)).toBeVisible();

  await page.getByRole('button', { name: 'Ke Peta Petualangan' }).click();
  await expect(page.getByText('Halo, Rani!')).toBeVisible();

  // peta: buka kartu World 1, tutup
  await page.getByRole('button', { name: /World 1/ }).click();
  await expect(page.getByRole('dialog', { name: 'Lembah Aljabar' })).toBeVisible();
  await page.getByRole('button', { name: 'Tutup' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // progres tersimpan: buka ulang → welcome menawarkan lanjutkan
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Lanjutkan Petualangan' })).toBeVisible();
});

test('TATA tampil 3D di welcome bila WebGL tersedia', async ({ page }) => {
  await page.goto('/');
  const tata3d = page.locator('[data-tata-mode="3d"] canvas');
  await expect(tata3d).toBeVisible({ timeout: 15_000 });
  const box = await tata3d.boundingBox();
  expect(box.width).toBeGreaterThan(100);
});

test('dengan "kurangi animasi", TATA memakai versi 2D', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-state="waving"] svg[role="img"]')).toBeVisible();
  await expect(page.locator('[data-tata-mode="3d"]')).toHaveCount(0);
  await ctx.close();
});

test('tangkapan layar Fase 2', async ({ page }, testInfo) => {
  const p = testInfo.project.name;
  await page.goto('/');
  await page.waitForTimeout(1500); // beri waktu model 3D tampil
  await page.screenshot({ path: `e2e/.results/${p}-welcome.png` });
  await openTilesStep(page);
  await page.screenshot({ path: `e2e/.results/${p}-ubin.png`, fullPage: true });
  await page.goto('/peta');
  await page.screenshot({ path: `e2e/.results/${p}-peta.png`, fullPage: true });
  await page.getByRole('button', { name: /World 2/ }).click();
  await page.screenshot({ path: `e2e/.results/${p}-kartu-pulau.png` });
});
