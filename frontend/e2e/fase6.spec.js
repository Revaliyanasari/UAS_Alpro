import { test, expect } from '@playwright/test';
import { setProfile } from './helpers.js';

// Fase 6: identitas siswa, penyimpanan setelah muat ulang, pergantian siswa dengan progres terpisah.

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function fill(page, { full, nick, kelas, school }) {
  await page.getByLabel(/Nama lengkap/).fill(full);
  await page.getByLabel(/Nama panggilan/).fill(nick);
  await page.getByRole('button', { name: kelas }).click();
  await page.getByLabel(/Asal sekolah/).fill(school);
  await page.getByRole('button', { name: /Mulai Petualangan/ }).click();
}

test('identitas: validasi, sapaan, tersimpan setelah muat ulang, responsif', async ({ page }, testInfo) => {
  await page.goto('/peta'); // tanpa identitas → diarahkan ke halaman identitas
  await expect(page.getByRole('heading', { name: 'Kenalan dulu, yuk!' })).toBeVisible();
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-identitas.png`, fullPage: true });

  await page.getByRole('button', { name: /Mulai Petualangan/ }).click();
  await expect(page.getByText(/Masih ada yang belum lengkap/)).toBeVisible();
  await expect(page.getByText('Nama lengkapmu belum diisi, ya.')).toBeVisible();

  await fill(page, { full: 'Rara Ayu Lestari', nick: 'Rara', kelas: 'VII B', school: 'SMP Negeri 1 Harapan' });
  await expect(page.getByText('Halo, Rara! Siap memulai petualangan matematika hari ini?')).toBeVisible();

  await page.reload();
  await page.goto('/');
  await expect(page.getByText(/Selamat datang kembali, Rara/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bukan Rara? Ganti siswa' })).toBeVisible();
});

test('dua siswa bergantian: progres terpisah, ubah identitas tidak menghapus progres', async ({ page }, testInfo) => {
  // Rara sudah punya progres (World 1 lulus, XP 120)
  await setProfile(page, { nickname: 'Rara', onboardingDone: true, xp: 120, worlds: { 1: { completed: true, stars: 3 } } }, {
    id: 'siswa-rara', fullName: 'Rara Ayu Lestari', nickname: 'Rara', className: 'VII B', school: 'SMP Negeri 1 Harapan', absen: '',
  });
  await page.goto('/peta');
  await expect(page.getByLabel('120 poin pengalaman')).toBeVisible();

  // ganti ke siswa baru Budi → progres kosong
  await page.getByRole('link', { name: 'Profil belajarku' }).click();
  await page.getByRole('link', { name: 'Ganti siswa' }).click();
  await page.getByRole('link', { name: '+ Aku siswa baru' }).click();
  await fill(page, { full: 'Budi Santoso', nick: 'Budi', kelas: 'VII C', school: 'SMP Negeri 1 Harapan' });
  await page.getByRole('button', { name: 'Ayo berangkat!' }).click();
  await page.getByRole('button', { name: 'Lewati' }).click();
  await expect(page.getByText('Halo, Budi!')).toBeVisible();
  await expect(page.getByLabel('0 poin pengalaman')).toBeVisible();

  // muat ulang, kembali ke Rara → progres Rara utuh
  await page.reload();
  await page.goto('/siswa');
  await page.getByRole('button', { name: 'Belajar sebagai Rara, kelas VII B' }).click();
  await expect(page.getByText(/Selamat datang kembali, Rara/)).toBeVisible();
  await page.goto('/peta');
  await expect(page.getByLabel('120 poin pengalaman')).toBeVisible();

  // ubah identitas Rara → XP tetap
  await page.goto('/identitas?ubah=1');
  await page.getByLabel(/Nama panggilan/).fill('Ayu');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await page.getByRole('button', { name: 'Kembali ke profil' }).click();
  await expect(page.getByLabel('120 poin pengalaman')).toBeVisible();
  await expect(page.getByText('Rara Ayu Lestari')).toBeVisible();
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-profil.png`, fullPage: true });
});
