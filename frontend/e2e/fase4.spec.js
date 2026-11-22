import { test, expect } from '@playwright/test';

// World 1–2 lengkap: kuis dunia dengan seret sungguhan pada soal sortir, pembahasan, buka-kunci World 2.

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

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('Kuis Dunia 1: sortir dengan seret, lulus 100%, pembahasan, World 2 terbuka', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Math.random = () => 0; // varian pertama setiap soal (deterministik)
  });
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 0, worlds: { 1: { lessonDone: true } }, quizHistory: [] });
  await page.goto('/peta');
  await page.getByRole('button', { name: /World 1/ }).click();
  await page.getByRole('link', { name: /Kuis Dunia 1/ }).click();

  const next = (name = 'Soal berikutnya') => page.getByRole('button', { name }).click();
  const send = () => page.getByRole('button', { name: 'Kirim jawaban' }).click();
  const keys = async (list) => {
    for (const k of list) await page.getByRole('group', { name: 'Papan ketik matematika' }).getByRole('button', { name: k, exact: true }).click();
  };

  await page.getByRole('radio', { name: '-5' }).click();
  await send();
  await next();
  await page.getByRole('radio', { name: 'Salah' }).click();
  await send();
  await next();
  await keys(['6', 'x']);
  await send();
  await next();

  // Soal sortir: seret sungguhan untuk dua kartu, ketuk-taruh untuk sisanya
  const bin = (id) => page.locator(`[data-bin="${id}"]`);
  await drag(page, page.getByRole('button', { name: 'Kartu 5x' }), bin('x'));
  await drag(page, page.getByRole('button', { name: 'Kartu -2x^2' }), bin('x^2'));
  await expect(bin('x').getByRole('button')).toHaveCount(1);
  await expect(bin('x^2').getByRole('button')).toHaveCount(1);
  for (const [expr, id] of [['7', '1'], ['x^2', 'x^2'], ['-3x', 'x'], ['4', '1']]) {
    await page.getByRole('button', { name: `Kartu ${expr}`, exact: true }).click();
    await bin(id).click();
  }
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  await send();
  await expect(page.getByText(/Benar! Lanjut/)).toBeVisible();
  await next();

  await keys(['3', 'x']);
  await send();
  await next('Lihat hasil');

  await expect(page.getByLabel('Nilai 100')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Pembahasan/ })).toBeVisible();
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-kuis-hasil.png`, fullPage: true });
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);

  // World 2 terbuka di peta, riwayat kuis tampil
  await page.getByRole('button', { name: 'Kembali ke peta' }).click();
  await page.getByRole('button', { name: /World 1/ }).click();
  await expect(page.getByText('100% (5/5)')).toBeVisible();
  await page.getByRole('button', { name: 'Tutup' }).click();
  await page.getByRole('button', { name: /World 2/ }).click();
  await expect(page.getByRole('link', { name: 'Masuk ke Gua Rahasia Pemfaktoran' })).toBeVisible();
});

test('World 1: aktivitas sortir koefisien bisa diseret', async ({ page }, testInfo) => {
  await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 0, worlds: {}, quizHistory: [] });
  await page.goto('/belajar/1');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: '-x', exact: true }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByRole('heading', { name: 'Sortir koefisien' })).toBeVisible();
  await drag(page, page.getByRole('button', { name: 'Kartu 7x' }), page.locator('[data-bin="7"]'));
  await expect(page.locator('[data-bin="7"]').getByRole('button')).toHaveCount(1);
  await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-sortir.png`, fullPage: true });
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
});
