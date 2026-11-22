import { describe, it, expect, beforeEach, vi } from 'vitest';
import DividerScreen from '../features/lesson/DividerScreen.jsx';
import BoardScreen from '../features/lesson/BoardScreen.jsx';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { useProfile } from '../store/profileStore.js';
import InputScreen from '../features/lesson/InputScreen.jsx';
import TilesScreen from '../features/lesson/TilesScreen.jsx';
import { lessons } from '../content/lessons/index.js';
import { quizStars } from '../store/profileStore.js';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
const next = (user) => user.click(screen.getByRole('button', { name: 'Lanjut' }));
const typeKeys = async (user, keys) => {
  for (const k of keys) await user.click(screen.getByRole('button', { name: k }));
};

beforeEach(() => {
  useProfile.setState({ nickname: '', onboardingDone: true, xp: 0, worlds: {} });
});

describe('Pemutar pelajaran World 1', () => {
  it('soal pilihan: Lanjut terkunci sampai benar; petunjuk bertahap', async () => {
    const user = userEvent.setup();
    renderAt('/belajar/1');
    await next(user);
    await next(user);
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Minta petunjuk \(0\/3\)/ }));
    expect(screen.getByText(/angka di depan variabel/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '7x' }));
    expect(screen.getByText(/Belum tepat/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '7' }));
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeEnabled();
  });

  it('isian dengan papan ketik: diperiksa mesin aljabar; pembahasan setelah 3 petunjuk + 1 salah', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    const fpbScreen = lessons[1].screens.find((s) => s.prompt === 'Tentukan FPB dari 6x^2 dan 9x.');
    render(<InputScreen screen={fpbScreen} onDone={done} />);
    await typeKeys(user, ['6', 'x']);
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(screen.queryByRole('button', { name: 'Lihat pembahasan' })).not.toBeInTheDocument();
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: /Minta petunjuk/ }));
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await user.click(screen.getByRole('button', { name: 'Lihat pembahasan' }));
    expect(screen.getByLabelText('Pembahasan')).toHaveTextContent('FPB = 3x');
    expect(done).toHaveBeenCalledWith({ firstTry: false });
  });
});

describe('Mesin Pembagi', () => {
  it('bagi angka lalu variabel, mengenali kesalahan', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<DividerScreen screen={{ dividend: '8x^2', divisor: '4x' }} onDone={done} />);
    await user.type(screen.getByLabelText('Hasil bagi angka'), '4');
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(screen.getByText(/Itu pengurangan/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Hasil bagi angka'));
    await user.type(screen.getByLabelText('Hasil bagi angka'), '2');
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await user.click(screen.getByRole('button', { name: 'x²' }));
    expect(screen.getByText(/x² itu x · x/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'x' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
    expect(screen.getByText(/Cek:/)).toBeInTheDocument();
  });

  it('12x : 4x = 3 (variabel habis)', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<DividerScreen screen={{ dividend: '12x', divisor: '4x' }} onDone={done} />);
    await user.type(screen.getByLabelText('Hasil bagi angka'), '3');
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    expect(done).toHaveBeenCalledWith({ firstTry: true });
  });
});

describe('Algebra Tiles & Papan Matematika (World 2)', () => {
  beforeEach(() => useProfile.setState({ worlds: { 1: { completed: true, stars: 3 } } }));

  it('mode bagi sama: ketuk-taruh, susunan tidak sama ditolak, susunan benar → 4(2x² + 3x)', async () => {
    const user = userEvent.setup();
    render(<TilesScreen screen={lessons[2].screens.find((s) => s.mode === 'groups')} onDone={vi.fn()} />);
    const lane = (i) => screen.getByRole('button', { name: new RegExp(`^Kotak ${i}:`) });
    await user.click(screen.getByRole('button', { name: /Ubin x kuadrat, sisa 8/ }));
    for (let i = 0; i < 8; i++) await user.click(lane(1)); // semua x² ke kotak 1
    await user.click(screen.getByRole('button', { name: /Ubin x, sisa 12/ }));
    for (let i = 0; i < 12; i++) await user.click(lane(1 + (i % 4)));
    await user.click(screen.getByRole('button', { name: 'Periksa susunan' }));
    expect(screen.getByText(/harus sama/)).toBeInTheDocument();
    // kembalikan 6 ubin x² dari kotak 1, bagi rata
    for (let i = 0; i < 6; i++) await user.click(screen.getAllByRole('button', { name: 'Kembalikan ubin x kuadrat' })[0]);
    await user.click(screen.getByRole('button', { name: /Ubin x kuadrat, sisa 6/ }));
    for (const i of [2, 2, 3, 3, 4, 4]) await user.click(lane(i));
    await user.click(screen.getByRole('button', { name: 'Periksa susunan' }));
    expect(screen.getByText(/4\(2x² \+ 3x\)/)).toBeInTheDocument();
  });

  it('Papan Matematika menampilkan perkalian tiap suku dan menerima 3x(2x + 3)', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<BoardScreen screen={{ target: '6x^2+9x', prompt: 'Isi papan' }} onDone={done} />);
    await typeKeys(user, ['3', 'x']);
    await user.click(screen.getByRole('button', { name: 'Isi kurung' }));
    await typeKeys(user, ['2', 'x', '+', '9']);
    expect(screen.getByText(/belum sama/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(done).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Hapus satu' }));
    await typeKeys(user, ['3']);
    expect(screen.getByText(/✔ sama/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
  });
});

describe('perhitungan bintang kuis', () => {
  it('≥ 60% = 1, ≥ 80% = 2, 100% = 3', () => {
    expect(quizStars(100)).toBe(3);
    expect(quizStars(80)).toBe(2);
    expect(quizStars(60)).toBe(1);
    expect(quizStars(40)).toBe(0);
  });
});
