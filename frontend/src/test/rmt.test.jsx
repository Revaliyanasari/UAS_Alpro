// Penerapan RMT: penanda fase, analisis tugas, refleksi, diagnosis fase kognitif pada umpan balik.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import SortScreen from '../features/lesson/SortScreen.jsx';
import ReflectScreen from '../features/lesson/ReflectScreen.jsx';
import InputScreen from '../features/lesson/InputScreen.jsx';
import { phaseOf, diagnoseError } from '../features/lesson/rmt.js';
import { lessons } from '../content/lessons/index.js';
import rmt from '../content/rmt.json';
import { feedback } from '../content/feedback.js';
import { useProfile } from '../store/profileStore.js';

const w1 = lessons[1].screens;
const w2 = lessons[2].screens;

beforeEach(() => useProfile.setState({ nickname: '', onboardingDone: true, xp: 0, worlds: {}, quizHistory: [] }));

describe('fase berpikir RMT (Input–Elaborasi–Output)', () => {
  it('setiap layar World 1–2 punya fase', () => {
    for (const s of [...w1, ...w2]) expect(['input', 'elaborasi', 'output']).toContain(phaseOf(s));
  });

  it('pelajaran memuat ketiga fase dan aktivitas belajar lengkap (analisis, rencana, refleksi)', () => {
    for (const screens of [w1, w2]) {
      const phases = new Set(screens.map(phaseOf));
      expect(phases).toEqual(new Set(['input', 'elaborasi', 'output']));
      const types = screens.map((s) => s.type);
      expect(types).toContain('identify'); // analisis tugas
      expect(types).toContain('order'); // perencanaan tindakan
      expect(types).toContain('reflect'); // refleksi
    }
  });

  it('setiap kode kesalahan pemeriksa punya diagnosis fase kognitif', () => {
    for (const code of Object.keys(feedback).filter((c) => c !== 'OK')) {
      expect(diagnoseError(code), code).not.toBeNull();
      expect(rmt.phases[diagnoseError(code).phase]).toBeDefined();
    }
  });

  it('penanda fase tampil di layar pelajaran', () => {
    render(
      <MemoryRouter initialEntries={['/belajar/1']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Input · Kumpulkan informasi/)).toBeInTheDocument();
  });
});

describe('analisis tugas (identify)', () => {
  it('memilah kalimat cerita ke diketahui/ditanya/tidak diperlukan', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    const s = w1.find((x) => x.type === 'identify');
    render(<SortScreen screen={s} onDone={done} />);
    expect(screen.getByText(/Setiap pagi Pak Danu/)).toBeInTheDocument();
    const label = { known: 'Diketahui', asked: 'Ditanya', extra: 'Tidak diperlukan' };
    for (const it of s.items) {
      await user.click(screen.getByRole('button', { name: `Kartu ${it.expr}` }));
      await user.click(screen.getByRole('button', { name: new RegExp(`^Keranjang ${label[it.bin]}:`) }));
    }
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(done).toHaveBeenCalledWith({ firstTry: true });
  });
});

describe('refleksi', () => {
  it('pilihan kurang tepat ditanggapi dengan ajakan; pilihan baik melanjutkan', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    const s = w1.find((x) => x.type === 'reflect');
    render(<ReflectScreen screen={s} onDone={done} />);
    await user.click(screen.getByRole('button', { name: 'Langsung menebak jawabannya' }));
    expect(screen.getByText(/Menebak itu coba-coba/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Mencari FPB angkanya/ }));
    await user.click(screen.getByRole('button', { name: 'Pertanyaan berikutnya' }));
    expect(done).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Aku mengalikan hasilnya/ }));
    expect(done).toHaveBeenCalledWith({ firstTry: true });
  });
});

describe('diagnosis fase pada umpan balik isian', () => {
  it('kesalahan M1 diarahkan ke fase Elaborasi', async () => {
    const user = userEvent.setup();
    const s = w2.find((x) => x.prompt === 'Faktorkan 12x^2 + 18x');
    render(<InputScreen screen={s} onDone={vi.fn()} />);
    for (const k of ['6', 'x', '(', '2', 'x', '+', '1', '8', ')']) await user.click(screen.getByRole('button', { name: k }));
    await user.click(screen.getByRole('button', { name: 'Cek' }));
    expect(screen.getByText(/Elaborasi:/)).toBeInTheDocument();
    expect(screen.getByText(/setiap suku harus dibagi FPB/)).toBeInTheDocument();
  });
});
