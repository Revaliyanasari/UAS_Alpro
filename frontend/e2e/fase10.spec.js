import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { setProfile } from './helpers.js';
import { pretty } from '../src/components/ui/prettyMath.js';

// Fase 10: World 4 (Menara Tantangan) & World 5 (Petualangan Literasi) dimainkan PENUH di browser:
// setiap layar dijawab (sebagian dicoba salah dulu), keluar-masuk di tengah pelajaran (posisi tersimpan),
// pelajaran selesai → kuis → bintang, XP, dan pulau berikutnya terbuka.
const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const LESSONS = { 4: load('../src/content/lessons/world-4.json'), 5: load('../src/content/lessons/world-5.json') };
const QUIZZES = { 4: load('../src/content/quizzes/world-4.json'), 5: load('../src/content/quizzes/world-5.json') };
const DONE = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { lessonDone: true, completed: true, stars: 2, bestPercent: 80 }]));
const ascii = (s) => String(s).replace(/−/g, '-').replace(/²/g, '^2').replace(/ /g, '');
const BOARD = { '10x^2+15x': ['5x', '2x+3'] };
const answerOf = (c) => c.key ?? c.target;

async function lanjut(page) {
  const btn = page.getByRole('button', { name: /^(Lanjut|Selesai)$/ });
  await expect(btn).toBeEnabled();
  await btn.click();
}

/** Menyelesaikan satu layar sesuai jenisnya. tryWrong: jawab salah dulu & pastikan Lanjut masih terkunci. */
async function solve(page, s, tryWrong) {
  const next = page.getByRole('button', { name: /^(Lanjut|Selesai)$/ });
  switch (s.type) {
    case 'info':
      return;
    case 'example':
      while (await page.getByRole('button', { name: /Langkah berikutnya/ }).count()) await page.getByRole('button', { name: /Langkah berikutnya/ }).click();
      return;
    case 'choice': {
      if (tryWrong) {
        const wrong = s.options.find((o) => o !== s.answer);
        await page.getByRole('button', { name: wrong, exact: true }).click();
        await expect(page.getByText(/Belum tepat|Coba|Hmm/).first()).toBeVisible();
        await expect(next).toBeDisabled();
      }
      await page.getByRole('button', { name: s.answer, exact: true }).click();
      return;
    }
    case 'input': {
      const box = page.getByRole('textbox', { name: 'Jawabanmu' });
      if (tryWrong) {
        await box.fill('1');
        await page.getByRole('button', { name: 'Cek' }).click();
        await expect(next).toBeDisabled();
        await box.fill('');
      }
      await box.fill(ascii(answerOf(s.check)));
      await page.getByRole('button', { name: 'Cek' }).click();
      return;
    }
    case 'faded':
      for (const [i, b] of s.blanks.entries()) {
        await page.getByRole('textbox', { name: `Isi kotak ${i + 1}` }).fill(ascii(b.answer));
        await page.getByRole('button', { name: 'Cek' }).click();
      }
      return;
    case 'sort':
    case 'identify':
      for (const it of s.items) {
        await page.getByRole('button', { name: `Kartu ${it.expr}`, exact: true }).click();
        await page.locator(`[data-bin="${it.bin}"]`).click();
      }
      await page.getByRole('button', { name: 'Periksa', exact: true }).click();
      return;
    case 'order': {
      const pool = page.getByLabel('Kartu langkah');
      for (const step of s.steps) await pool.getByRole('button', { name: pretty(step), exact: true }).click();
      await page.getByRole('button', { name: 'Periksa urutan' }).click();
      return;
    }
    case 'tiles': {
      for (const [kind, total] of [['x2', s.x2], ['x', s.x]]) {
        await page.locator(`[data-tray="${kind}"]`).click();
        for (let lane = 0; lane < s.count; lane++) for (let k = 0; k < total / s.count; k++) await page.locator(`[data-lane="${lane}"]`).click();
      }
      await page.getByRole('button', { name: 'Periksa susunan' }).click();
      return;
    }
    case 'cutSlide':
      await page.getByRole('button', { name: /Potong pojok/ }).click();
      await page.getByRole('button', { name: /Potong sisa L/ }).click();
      await page.getByRole('button', { name: 'Putar dan geser potongan bawah ke kanan' }).click();
      await page.getByRole('group', { name: 'Pilih panjang persegi panjang' }).getByRole('button', { name: 'a + b', exact: true }).click();
      await page.getByRole('group', { name: 'Pilih lebar persegi panjang' }).getByRole('button', { name: 'a − b', exact: true }).click();
      return;
    case 'board': {
      const [outer, inner] = BOARD[s.target];
      await page.getByRole('button', { name: 'Faktor luar', exact: true }).click();
      await page.getByRole('textbox', { name: 'Faktor luar' }).fill(outer);
      await page.getByRole('button', { name: 'Isi kurung', exact: true }).click();
      await page.getByRole('textbox', { name: 'Isi kurung' }).fill(inner);
      await page.getByRole('button', { name: 'Periksa', exact: true }).click();
      return;
    }
    case 'reflect':
      for (const [qi, q] of s.questions.entries()) {
        const good = q.options.find((o) => o.good);
        if (tryWrong) {
          const bad = q.options.find((o) => !o.good);
          await page.getByRole('button', { name: pretty(bad.text), exact: true }).click();
          await expect(page.getByText(bad.feedback)).toBeVisible();
        }
        await page.getByRole('button', { name: pretty(good.text), exact: true }).click();
        if (qi < s.questions.length - 1) await page.getByRole('button', { name: 'Pertanyaan berikutnya' }).click();
      }
      return;
    default:
      throw new Error(`jenis layar belum ditangani: ${s.type}`);
  }
}

async function answerQuiz(page, quiz) {
  const answered = [];
  for (let i = 0; i < quiz.slots.length; i++) {
    // Tunggu soal ke-(i+1) benar-benar tampil, baru kenali variannya (count() tidak menunggu).
    await expect(page.getByRole('heading', { level: 1, name: new RegExp(`Soal ${i + 1} dari ${quiz.slots.length}`) })).toBeVisible();
    // Varian soal dipilih acak: kenali dari teks pertanyaannya.
    let q = null;
    for (const v of quiz.slots[i].variants) {
      const story = v.story ? await page.getByText(pretty(v.story), { exact: false }).count() : 1;
      if (story && (await page.getByText(pretty(v.prompt), { exact: false }).count())) q = v;
    }
    expect(q, `varian soal ${i + 1} dikenali`).toBeTruthy();
    if (q.type === 'choice') await page.getByRole('radio', { name: q.answer, exact: true }).click();
    else await page.getByRole('textbox', { name: 'Jawabanmu' }).fill(ascii(q.key));
    await page.getByRole('button', { name: 'Kirim jawaban' }).click();
    // Umpan balik langsung setelah menjawab; pembahasan lengkap di halaman hasil
    await expect(page.getByText(/^Benar!/).first()).toBeVisible();
    answered.push(q);
    await page.getByRole('button', { name: i === quiz.slots.length - 1 ? 'Lihat hasil' : 'Soal berikutnya' }).click();
  }
  // Halaman hasil: pembahasan setiap soal yang dikerjakan
  for (const q of answered) await expect(page.getByText(pretty(q.solution[0]), { exact: false }).first()).toBeAttached();
}

for (const id of [4, 5]) {
  test(`World ${id}: seluruh pelajaran dimainkan, keluar-masuk, kuis, progres tersimpan`, async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await setProfile(page, { nickname: 'Uji', onboardingDone: true, xp: 100, worlds: DONE(id - 1) });

    // Terbuka sesuai progres: pulau ini terbuka, pulau sesudahnya masih terkunci
    await page.goto('/peta');
    await expect(page.getByRole('button', { name: new RegExp(`World ${id}: .*Terbuka`) })).toBeVisible();
    if (id === 4) await expect(page.getByRole('button', { name: /World 5: .*Terkunci/ })).toBeVisible();

    await page.goto(`/belajar/${id}`);
    const screens = LESSONS[id].screens;
    const seenWrong = new Set();
    for (const [i, s] of screens.entries()) {
      await expect(page.getByRole('heading', { level: 1, name: s.title })).toBeVisible();
      const tryWrong = ['input', 'choice', 'reflect'].includes(s.type) && !seenWrong.has(s.type);
      if (tryWrong) seenWrong.add(s.type);
      await solve(page, s, tryWrong);
      if (i === 0) await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-w${id}-awal.png`, fullPage: true });
      await lanjut(page);
      // Di tengah pelajaran: keluar ke peta lalu masuk lagi → melanjutkan di langkah yang sama
      if (i === 9) {
        await page.getByRole('button', { name: 'Keluar ke peta' }).click();
        await page.goto(`/belajar/${id}`);
        await expect(page.getByText(new RegExp(`Melanjutkan dari langkah ${i + 2} dari ${screens.length}`))).toBeVisible();
        await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-w${id}-lanjut.png`, fullPage: true });
      }
    }

    await expect(page.getByRole('heading', { name: 'Pelajaran selesai!' })).toBeVisible();
    await expect(page.locator(`svg[data-world-art="${id}"]`)).toBeVisible(); // ilustrasi dunia
    await expect(page.locator('[data-reward]')).toContainText(/\+\d+ XP/); // XP melayang (animasi)
    await page.getByRole('link', { name: 'Mulai Kuis Dunia' }).click();
    await answerQuiz(page, QUIZZES[id]);
    await expect(page.getByLabel('3 bintang')).toBeAttached();
    // Animasi penghargaan: 3 bintang menyala + XP; animasi selesai sendiri (tidak berulang) & tidak menutupi tombol
    const burst = page.locator('[data-reward]');
    await expect(burst).toBeVisible();
    await expect(burst).toContainText('+50 XP');
    const running = await burst.evaluate(async (el) => {
      const anims = el.getAnimations({ subtree: true });
      await Promise.all(anims.map((a) => a.finished.catch(() => {})));
      return anims.filter((a) => a.playState === 'running').length;
    });
    expect(running).toBe(0);
    const back = page.getByRole('button', { name: 'Kembali ke peta' }).or(page.getByRole('link', { name: 'Kembali ke peta' })).first();
    await back.scrollIntoViewIfNeeded();
    expect(await back.evaluate((el) => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })).toBe(true);
    await expect(page.getByText(/Benar 5 dari 5 soal/)).toBeVisible();
    await page.screenshot({ path: `e2e/.results/${testInfo.project.name}-w${id}-hasil.png`, fullPage: true });

    // Progres tersimpan: setelah muat ulang, pulau selesai ★★★; World 4 membuka World 5
    await page.goto('/peta');
    await page.reload();
    await expect(page.getByRole('button', { name: new RegExp(`World ${id}: .*Selesai`) })).toBeVisible();
    if (id === 4) await expect(page.getByRole('button', { name: /World 5: .*Terbuka/ })).toBeVisible();
    await page.goto('/pencapaian');
    await expect(page.getByText(id === 4 ? 'Penakluk Menara' : 'Petualang Literasi').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
