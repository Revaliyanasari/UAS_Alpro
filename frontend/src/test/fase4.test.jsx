// Uji World 1–2 lengkap: aktivitas manipulatif baru, soal cerita, kuis dunia + pembahasan, buka-kunci pulau.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import SortScreen from '../features/lesson/SortScreen.jsx';
import FactorPairsScreen, { factorPairs } from '../features/lesson/FactorPairsScreen.jsx';
import CommonFactorsScreen from '../features/lesson/CommonFactorsScreen.jsx';
import OrderScreen, { scramble } from '../features/lesson/OrderScreen.jsx';
import FadedScreen from '../features/lesson/FadedScreen.jsx';
import InputScreen from '../features/lesson/InputScreen.jsx';
import ChoiceScreen from '../features/lesson/ChoiceScreen.jsx';
import { lessons } from '../content/lessons/index.js';
import { quizzes } from '../content/quizzes/index.js';
import { pickQuestions, gradeInput, gradeSort } from '../features/quiz/quizLogic.js';
import QuizQuestion from '../features/quiz/QuizQuestion.jsx';
import { useProfile } from '../store/profileStore.js';

const w1 = lessons[1].screens;
const w2 = lessons[2].screens;
const typeKeys = async (user, keys) => {
  for (const k of keys) await user.click(screen.getByRole('button', { name: k }));
};
const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

beforeEach(() => {
  useProfile.setState({ nickname: '', onboardingDone: true, xp: 0, worlds: {}, quizHistory: [] });
});
afterEach(() => vi.restoreAllMocks());

describe('Sortir suku sejenis (ketuk-taruh)', () => {
  it('kartu salah tempat kembali ke nampan; susunan benar menyelesaikan aktivitas', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<SortScreen screen={w1.find((s) => s.rule === 'like-terms')} onDone={done} />);
    const bin = (label) => screen.getByRole('button', { name: new RegExp(`^Keranjang ${label}:`) });
    const put = async (expr, label) => {
      await user.click(screen.getByRole('button', { name: `Kartu ${expr}` }));
      await user.click(bin(label));
    };
    await put('4x', 'Suku x');
    await put('3x^2', 'Suku x'); // salah
    await put('-x', 'Suku x');
    await put('9', 'Konstanta');
    await put('2x^2', 'Suku x²');
    await put('5', 'Konstanta');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/5 kartu sudah tepat\. 1 kartu kembali ke nampan/)).toBeInTheDocument();
    expect(done).not.toHaveBeenCalled();
    await put('3x^2', 'Suku x²');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
  });

  it('kartu bisa dikembalikan dari keranjang ke nampan', async () => {
    const user = userEvent.setup();
    render(<SortScreen screen={w1.find((s) => s.rule === 'coefficient')} onDone={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Kartu 7x' }));
    await user.click(screen.getByRole('button', { name: /^Keranjang Koefisien 7:/ }));
    expect(screen.getByRole('button', { name: /^Keranjang Koefisien 7: 1 kartu/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kembalikan kartu 7x' }));
    expect(screen.getByRole('button', { name: 'Kartu 7x' })).toBeInTheDocument();
  });
});

describe('Bangun persegi panjang dari 12 ubin (faktor)', () => {
  it('pasangan faktor dihitung benar', () => {
    expect(factorPairs(12)).toEqual([
      [1, 12],
      [2, 6],
      [3, 4],
    ]);
  });

  it('baris tidak penuh ditolak; menemukan semua ukuran menyelesaikan aktivitas', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<FactorPairsScreen screen={w2.find((s) => s.type === 'factorPairs')} onDone={done} />);
    const catat = () => user.click(screen.getByRole('button', { name: 'Catat ukuran ini' }));
    const plus = () => user.click(screen.getByRole('button', { name: 'Tambah baris' }));
    await catat(); // 1 × 12
    await plus(); // 2 baris
    await catat();
    await plus();
    await catat(); // 3 × 4 → selesai? masih kurang? (1,2,3 sudah) → selesai
    expect(done).toHaveBeenCalledWith({ firstTry: true });
    expect(screen.getByLabelText('Ukuran yang ditemukan')).toHaveTextContent('3 × 4');
  });

  it('5 baris: ada baris belum penuh', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<FactorPairsScreen screen={{ units: 12, prompt: 'x', done: 'y' }} onDone={done} />);
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: 'Tambah baris' }));
    await user.click(screen.getByRole('button', { name: 'Catat ukuran ini' }));
    expect(screen.getByText(/tidak bisa dibagi rata ke 5 baris/)).toBeInTheDocument();
  });
});

describe('Faktor bersama → FPB', () => {
  it('memilih faktor bersama 8 dan 12, lalu yang terbesar', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<CommonFactorsScreen screen={{ a: 8, b: 12 }} onDone={done} />);
    await user.click(screen.getByRole('button', { name: 'Faktor 8 dari 8' }));
    await user.click(screen.getByRole('button', { name: 'Periksa faktor bersama' }));
    expect(screen.getByText(/tidak ada di daftar faktor 12/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Faktor 8 dari 8' }));
    for (const d of [1, 2, 4]) await user.click(screen.getByRole('button', { name: `Faktor ${d} dari 8` }));
    await user.click(screen.getByRole('button', { name: 'Periksa faktor bersama' }));
    await user.click(screen.getByRole('button', { name: 'FPB 2' }));
    expect(screen.getByText(/belum yang paling besar/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'FPB 4' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
  });
});

describe('Jelaskan ke TATA (urutkan langkah)', () => {
  it('acakan selalu berbeda dari urutan benar', () => {
    expect(scramble([1, 2, 3, 4])).not.toEqual([0, 1, 2, 3]);
    expect(scramble([1, 2, 3, 4, 5, 6])).not.toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('urutan benar diterima', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    const s = w1.find((x) => x.type === 'order');
    render(<OrderScreen screen={s} onDone={done} />);
    // salah dulu: kartu kedua lebih dulu
    await user.click(screen.getByRole('button', { name: s.steps[1] }));
    for (const step of [s.steps[0], s.steps[2], s.steps[3]]) await user.click(screen.getByRole('button', { name: step }));
    await user.click(screen.getByRole('button', { name: 'Periksa urutan' }));
    expect(screen.getByText(/Langkah pertama belum tepat/)).toBeInTheDocument();
    for (const step of s.steps) await user.click(screen.getByRole('button', { name: step }));
    await user.click(screen.getByRole('button', { name: 'Periksa urutan' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
  });
});

describe('Contoh rumpang (Coba bersama)', () => {
  it('kotak diisi satu per satu dan diperiksa mesin aljabar', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<FadedScreen screen={w2.find((s) => s.type === 'faded')} onDone={done} />);
    await typeKeys(user, ['3']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(screen.getByText(/Belum tepat/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hapus satu' }));
    await typeKeys(user, ['3', 'x']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await typeKeys(user, ['2', 'x']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await typeKeys(user, ['3']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await typeKeys(user, ['3', 'x', '(', '2', 'x', '+', '3', ')']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
    expect(screen.getByLabelText('Langkah contoh')).toHaveTextContent('3x(2x + 3)');
  });
});

describe('Soal perkalian & soal cerita', () => {
  it('3x·5x nilainya benar tapi diminta disederhanakan', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<InputScreen screen={w1.find((s) => s.check?.kind === 'simplified')} onDone={done} />);
    await typeKeys(user, ['3', 'x', '·', '5', 'x']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(screen.getByText(/sederhanakan/)).toBeInTheDocument();
    expect(done).not.toHaveBeenCalled();
  });

  it('soal cerita menampilkan konteks dan panel diketahui/ditanya', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<InputScreen screen={w1.find((s) => s.title === 'Kebun sayur')} onDone={done} />);
    expect(screen.getByText(/Pak Danu/)).toBeInTheDocument();
    expect(screen.getByText('Yang diketahui & yang ditanya')).toBeInTheDocument();
    await typeKeys(user, ['4', 'x']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(done).toHaveBeenCalledWith({ firstTry: true });
  });

  it('menilai kewajaran: ukuran negatif tidak masuk akal', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<ChoiceScreen screen={w2.find((s) => s.title === 'Masuk akal?')} onDone={done} />);
    await user.click(screen.getByRole('button', { name: /Tidak, ukuran panjang/ }));
    expect(done).toHaveBeenCalledWith({ firstTry: true });
  });
});

describe('Logika kuis', () => {
  it('memilih satu varian per slot', () => {
    expect(pickQuestions(quizzes[1], () => 0)).toEqual(quizzes[1].slots.map((s) => s.variants[0]));
    expect(pickQuestions(quizzes[1], () => 0.99)).toEqual(quizzes[1].slots.map((s) => s.variants[1]));
  });

  it('tulisan tak terbaca tidak dinilai; M1 dinilai salah dengan umpan balik', () => {
    const q = quizzes[2].slots[1].variants[0];
    expect(gradeInput(q, '3y(3y+').invalid).toBe(true);
    const r = gradeInput(q, '3y(3y+6)');
    expect(r.correct).toBe(false);
    expect(r.text).toMatch(/kalikan kembali/i);
    expect(gradeInput(q, '3y(3y+2)').correct).toBe(true);
  });

  it('sortir: semua kartu wajib dipasang', () => {
    const q = quizzes[1].slots[3].variants[0];
    expect(gradeSort(q, q.items.map(() => null)).invalid).toBe(true);
    expect(gradeSort(q, q.items.map((it) => it.bin)).correct).toBe(true);
  });
});

describe('Soal ubin di kuis', () => {
  it('dinilai dari percobaan pertama, hanya sekali', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<QuizQuestion question={quizzes[2].slots[3].variants[0]} onAnswer={onAnswer} />);
    await user.click(screen.getByRole('button', { name: 'Periksa susunan' }));
    await user.click(screen.getByRole('button', { name: 'Periksa susunan' }));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith({ correct: false, given: 'Susunan pertama belum tepat' });
    expect(screen.getByText(/nilainya dari percobaan pertama/)).toBeInTheDocument();
  });
});

describe('Kuis Dunia 1: alur lengkap', () => {
  async function answerWorld1(user, { allRight }) {
    // Soal 1: koefisien −5x²
    await user.click(screen.getByRole('radio', { name: allRight ? '-5' : '5' }));
    await user.click(screen.getByRole('button', { name: 'Kirim jawaban' }));
    await user.click(screen.getByRole('button', { name: 'Soal berikutnya' }));
    // Soal 2: benar/salah
    await user.click(screen.getByRole('radio', { name: allRight ? 'Salah' : 'Benar' }));
    await user.click(screen.getByRole('button', { name: 'Kirim jawaban' }));
    await user.click(screen.getByRole('button', { name: 'Soal berikutnya' }));
    // Soal 3: FPB 18x² dan 12x
    await typeKeys(user, allRight ? ['6', 'x'] : ['3', 'x']);
    await user.click(screen.getByRole('button', { name: 'Kirim jawaban' }));
    await user.click(screen.getByRole('button', { name: 'Soal berikutnya' }));
    // Soal 4: sortir
    const q = quizzes[1].slots[3].variants[0];
    const binLabel = { x: 'Suku x', 'x^2': 'Suku x²', 1: 'Konstanta' };
    for (const it of q.items) {
      await user.click(screen.getByRole('button', { name: `Kartu ${it.expr}` }));
      await user.click(screen.getByRole('button', { name: new RegExp(`^Keranjang ${binLabel[it.bin]}:`) }));
    }
    await user.click(screen.getByRole('button', { name: 'Kirim jawaban' }));
    await user.click(screen.getByRole('button', { name: 'Soal berikutnya' }));
    // Soal 5: 18x² : 6x
    await typeKeys(user, ['3', 'x']);
    await user.click(screen.getByRole('button', { name: 'Kirim jawaban' }));
    await user.click(screen.getByRole('button', { name: 'Lihat hasil' }));
  }

  it('kuis terkunci sebelum pelajaran selesai', () => {
    renderAt('/kuis/1');
    expect(screen.getByText(/Selesaikan pelajaran di pulau ini dulu/)).toBeInTheDocument();
  });

  it('nilai 100% → 3 bintang, pembahasan tampil, World 2 terbuka, riwayat tersimpan', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    useProfile.setState({ worlds: { 1: { lessonDone: true } } });
    const user = userEvent.setup();
    renderAt('/kuis/1');
    expect(screen.getByRole('button', { name: 'Soal berikutnya' })).toBeDisabled();
    await answerWorld1(user, { allRight: true });
    expect(screen.getByLabelText('Nilai 100')).toBeInTheDocument();
    expect(screen.getByLabelText('3 bintang')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pembahasan/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Pembahasan soal 3')).toHaveTextContent('FPB = 6x');
    const s = useProfile.getState();
    expect(s.worlds[1]).toMatchObject({ completed: true, stars: 3, bestPercent: 100 });
    expect(s.isUnlocked(2)).toBe(true);
    expect(s.quizHistory[0]).toMatchObject({ worldId: 1, correct: 5, total: 5, percent: 100 });
    expect(s.xp).toBe(50);
  });

  it('nilai 40% → belum lulus, World 2 tetap terkunci, ada tawaran ulang', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    useProfile.setState({ worlds: { 1: { lessonDone: true } } });
    const user = userEvent.setup();
    renderAt('/kuis/1');
    await answerWorld1(user, { allRight: false });
    expect(screen.getByLabelText('Nilai 40')).toBeInTheDocument();
    expect(useProfile.getState().isUnlocked(2)).toBe(false);
    expect(screen.getByRole('button', { name: /Ulangi kuis/ })).toBeInTheDocument();
    // jawaban benar baru terlihat di pembahasan (setelah kuis)
    const review = screen.getByRole('heading', { name: /Pembahasan/ }).closest('section');
    expect(within(review).getAllByText(/Jawaban benar/).length).toBeGreaterThan(0);
  });
});

describe('Peta: tombol kuis & riwayat', () => {
  it('kartu pulau menampilkan kuis dan riwayat setelah pelajaran selesai', async () => {
    useProfile.setState({
      worlds: { 1: { lessonDone: true, bestPercent: 40 } },
      quizHistory: [{ worldId: 1, date: '2026-11-20T08:00:00.000Z', correct: 2, total: 5, percent: 40 }],
    });
    const user = userEvent.setup();
    renderAt('/peta');
    await user.click(screen.getByRole('button', { name: /World 1/ }));
    expect(screen.getByRole('link', { name: /Kuis Dunia 1/ })).toHaveAttribute('href', '/kuis/1');
    expect(screen.getByText(/Nilai terbaik 40%/)).toBeInTheDocument();
    expect(screen.getByText('40% (2/5)')).toBeInTheDocument();
  });

  it('pelajaran selesai belum membuka pulau berikutnya (harus lulus kuis)', () => {
    useProfile.getState().completeLesson(1, 30);
    expect(useProfile.getState().isUnlocked(2)).toBe(false);
    expect(useProfile.getState().canTakeQuiz(1)).toBe(true);
    useProfile.getState().recordQuiz(1, 3, 5, 30);
    expect(useProfile.getState().isUnlocked(2)).toBe(true);
    expect(useProfile.getState().worlds[1].stars).toBe(1);
  });
});
