// World 4 (Menara Tantangan) & World 5 (Petualangan Literasi): setiap layar tampil berisi,
// terbuka sesuai progres, posisi pelajaran tersimpan & bisa dilanjutkan, kuis tersedia.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { useProfile, INITIAL_PROGRESS } from '../store/profileStore.js';
import { lessons } from '../content/lessons/index.js';
import { quizzes } from '../content/quizzes/index.js';
import { computeBadges } from '../features/achievements/badges.js';
import { worldStatuses } from '../features/home/progress.js';
import { toPoly } from '../math/parser.js';
import MathKeypad, { varsOf, keypadVars } from '../components/ui/MathKeypad.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
const DONE_1_3 = { 1: { lessonDone: true, completed: true, stars: 2 }, 2: { lessonDone: true, completed: true, stars: 2 }, 3: { lessonDone: true, completed: true, stars: 2 } };

beforeEach(() => {
  useProfile.setState({ ...INITIAL_PROGRESS, nickname: 'Uji', onboardingDone: true, tourDone: true, worlds: { ...DONE_1_3, 4: { lessonDone: true, completed: true, stars: 1 } } });
});

describe.each([
  [4, 'Menara Tantangan'],
  [5, 'Petualangan Literasi'],
])('World %i (%s)', (id) => {
  const screens = lessons[id].screens;

  it('punya pelajaran lengkap: pengantar, aktivitas beragam, refleksi, dan kuis 5 soal', () => {
    expect(screens.length).toBeGreaterThanOrEqual(25);
    expect(screens[0].type).toBe('info');
    expect(screens.at(-1).type).toBe('reflect');
    const types = new Set(screens.map((s) => s.type));
    expect(types.size).toBeGreaterThanOrEqual(7); // bukan hanya pilihan ganda berulang
    expect(quizzes[id].slots).toHaveLength(5);
    // Setiap soal yang dinilai punya umpan balik/pembahasan
    for (const s of screens) {
      if (s.type === 'input') expect(s.solution.length).toBeGreaterThan(0);
      if (s.type === 'choice') expect(s.explain).toBeTruthy();
      if (['sort', 'identify', 'faded', 'order', 'tiles', 'cutSlide'].includes(s.type)) expect(s.done).toBeTruthy();
    }
  });

  it('SETIAP layar tampil dengan judul & isi (tidak ada layar kosong/rusak)', () => {
    screens.forEach((s, i) => {
      useProfile.setState({ lessonSaves: { [id]: { index: i, results: {} } } });
      const { unmount } = renderAt(`/belajar/${id}`);
      expect(screen.getByRole('heading', { level: 1, name: s.title })).toBeInTheDocument();
      const main = screen.getByRole('main');
      expect(main.textContent.length, `layar ${i + 1} (${s.type})`).toBeGreaterThan(s.title.length + 20);
      if (i > 0) expect(screen.getByText(new RegExp(`Melanjutkan dari langkah ${i + 1} dari`))).toBeInTheDocument();
      unmount();
    });
  });
});

describe('progres & lanjutkan', () => {
  it('World 4 terkunci sebelum World 3 lulus; terbuka sesudahnya; World 5 menyusul World 4', () => {
    const status = (worlds) => worldStatuses({ worlds }).filter((w) => w.id >= 4).map((w) => [w.id, w.available, w.unlocked]);
    expect(status({ 1: { completed: true } })).toEqual([[4, true, false], [5, true, false]]);
    expect(status(DONE_1_3)).toEqual([[4, true, true], [5, true, false]]);
    expect(status({ ...DONE_1_3, 4: { completed: true } })).toEqual([[4, true, true], [5, true, true]]);
  });

  it('World 5 tidak bisa dibuka lewat alamat langsung bila World 4 belum lulus', () => {
    useProfile.setState({ worlds: DONE_1_3 });
    renderAt('/belajar/5');
    expect(screen.queryByRole('heading', { name: 'Petualangan Literasi' })).toBeNull();
  });

  it('posisi pelajaran tersimpan per pulau; bisa dilanjutkan atau diulang dari awal', async () => {
    const user = userEvent.setup();
    useProfile.setState({ lessonSaves: {} });
    const { unmount } = renderAt('/belajar/4');
    expect(screen.getByRole('heading', { level: 1, name: 'Selamat datang di Menara Tantangan' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(useProfile.getState().lessonSaves[4].index).toBe(1);
    unmount();
    // keluar lalu masuk lagi → melanjutkan langkah 2
    renderAt('/belajar/4');
    expect(screen.getByText(/Melanjutkan dari langkah 2 dari/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: lessons[4].screens[1].title })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mulai dari awal' }));
    expect(screen.getByRole('heading', { level: 1, name: lessons[4].screens[0].title })).toBeInTheDocument();
    expect(useProfile.getState().lessonSaves[4]).toBeUndefined();
  });

  it('menyelesaikan pelajaran menghapus simpanan posisi & mencatat XP', () => {
    useProfile.setState({ xp: 0, lessonSaves: { 5: { index: 3, results: {} } } });
    useProfile.getState().completeLesson(5, 120);
    expect(useProfile.getState().lessonSaves[5]).toBeUndefined();
    expect(useProfile.getState().xp).toBe(120);
    expect(useProfile.getState().worlds[5].lessonDone).toBe(true);
  });

  it('kuis World 4 & 5: lulus → bintang, XP, lencana; lulus World 4 membuka World 5', () => {
    useProfile.setState({ xp: 0, worlds: { ...DONE_1_3, 4: { lessonDone: true } } });
    expect(useProfile.getState().isUnlocked(5)).toBe(false);
    const r = useProfile.getState().recordQuiz(4, 5, 5, 50);
    expect(r).toMatchObject({ passed: true, stars: 3 });
    expect(useProfile.getState().isUnlocked(5)).toBe(true);
    useProfile.getState().recordQuiz(5, 4, 5, 40);
    const p = useProfile.getState();
    expect(p.xp).toBe(90);
    const earned = computeBadges(p).filter((b) => b.earned).map((b) => b.id);
    expect(earned).toEqual(expect.arrayContaining(['tower', 'literacy']));
  });

  it('kuis World 5 tampil dengan soal cerita setelah pelajarannya selesai', () => {
    useProfile.setState({ worlds: { ...DONE_1_3, 4: { completed: true, lessonDone: true }, 5: { lessonDone: true } } });
    renderAt('/kuis/5');
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('button').length).toBeGreaterThan(0);
    expect(main.textContent).toMatch(/\S{10,}/);
  });
});

describe('papan ketik di layar (HP tanpa keyboard)', () => {
  // Setiap jawaban isian di SEMUA pulau harus bisa diketik hanya dengan tombol papan ketik.
  const KEY_CHARS = new Set('0123456789()+-*:^ '.split(''));
  const typeable = (answer, check) => {
    const vars = keypadVars(varsOf(check));
    return [...String(answer).replace(/−/g, '-').replace(/²/g, '^2').replace(/·/g, '*')].every((ch) => KEY_CHARS.has(ch) || vars.includes(ch));
  };
  // Soal pembagian tanpa kunci tertulis: kuncinya dihitung mesin aljabar.
  const quotientOf = (c) => toPoly(c.dividend).divideByMonomial(toPoly(c.divisor)).toString();
  const tasks = [];
  for (const [id, lesson] of Object.entries(lessons)) {
    lesson.screens.forEach((s, i) => {
      if (s.type === 'input') tasks.push([`W${id} #${i + 1}`, s.check.key ?? s.check.target ?? quotientOf(s.check), s.check]);
      if (s.type === 'faded') s.blanks.forEach((b) => tasks.push([`W${id} #${i + 1} ${b.label}`, b.answer, b.check]));
    });
  }
  for (const [id, quiz] of Object.entries(quizzes)) {
    quiz.slots.forEach((slot, si) => slot.variants.forEach((q, vi) => q.type === 'input' && tasks.push([`kuis W${id} ${si + 1}.${vi + 1}`, q.key, q.check])));
  }

  it.each(tasks)('%s: jawaban "%s" bisa diketik', (_name, answer, check) => {
    expect(typeable(answer, check)).toBe(true);
  });

  it('soal ber-variabel p menampilkan tombol p', () => {
    render(<MathKeypad value="" onChange={() => {}} onSubmit={() => {}} vars={varsOf({ target: 'p^2-16' })} />);
    expect(screen.getByRole('button', { name: 'p' })).toBeInTheDocument();
  });
});
