// Modul Guru: perhitungan skor & laporan, CSV, impor, dan alur antarmuka.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { useTeacher } from '../store/teacherStore.js';
import { useProfile } from '../store/profileStore.js';
import {
  comparePrePost,
  indicatorAchievement,
  itemRecapCsv,
  recapPerItem,
  recapPerStudent,
  resultScore,
  studentRecapCsv,
  toCsv,
  validateInstrument,
} from '../features/teacher/scoring.js';

// Instrumen kecil buatan uji (bukan instrumen penelitian).
const inst = (id, kind = 'latihan') => ({
  id,
  title: `Uji ${id}`,
  kind,
  status: 'draf',
  notes: '',
  items: [
    { id: 'q1', number: 1, text: 'A', indicator: 'Reasoning', rubric: [{ id: 'a', maxScore: 2 }, { id: 'b', maxScore: 2 }] },
    { id: 'q2', number: 2, text: 'B', indicator: 'Employing', rubric: [{ id: 'c', maxScore: 4 }] },
  ],
});
const res = (instrumentId, code, a, b, c) => ({ id: `${instrumentId}-${code}`, instrumentId, studentCode: code, date: '2026-11-20', answers: { q1: { scores: { a, b } }, q2: { scores: { c } } } });

describe('perhitungan penilaian', () => {
  const I = inst('i1');
  const results = [res('i1', 'S02', 2, 1, 4), res('i1', 'S01', 0, 0, 2)];

  it('nilai akhir = total / maks × 100; skor dibatasi rubrik', () => {
    expect(resultScore(I, results[0])).toMatchObject({ total: 7, max: 8, percent: 87.5 });
    expect(resultScore(I, res('i1', 'X', 9, -3, 2)).total).toBe(4); // 9 → 2, -3 → 0
  });

  it('rekap per siswa urut kode; rekap per soal & indikator', () => {
    expect(recapPerStudent(I, results).map((r) => r.studentCode)).toEqual(['S01', 'S02']);
    const [q1, q2] = recapPerItem(I, results);
    expect(q1).toMatchObject({ average: 1.5, fullPercent: 0, partialPercent: 50, zeroPercent: 50 });
    expect(q2).toMatchObject({ average: 3, fullPercent: 50, partialPercent: 50, zeroPercent: 0 });
    expect(indicatorAchievement(I, results)).toEqual([
      { indicator: 'Reasoning', score: 3, max: 8, percent: 37.5 },
      { indicator: 'Employing', score: 6, max: 8, percent: 75 },
    ]);
  });

  it('pretest–posttest dicocokkan lewat kode siswa, dengan N-gain', () => {
    const pre = inst('pre', 'pretest');
    const post = inst('post', 'posttest');
    const all = [res('pre', 'S01', 1, 1, 0), res('post', 'S01', 2, 2, 2), res('post', 'S09', 2, 2, 4)];
    const c = comparePrePost(pre, post, all);
    expect(c.rows).toEqual([{ studentCode: 'S01', pre: 25, post: 75, gain: 50, nGain: 0.67 }]);
  });

  it('CSV memakai titik koma, BOM, dan menetralkan rumus', () => {
    const text = toCsv(['a', 'b'], [['=1+1', 'x;y']]);
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text).toContain("'=1+1;\"x;y\"");
    expect(studentRecapCsv(I, results)).toContain('S02;2026-11-20;3;4;7;8;87.5');
    expect(itemRecapCsv(I, results)).toContain('Menalar');
  });

  it('impor instrumen divalidasi', () => {
    expect(validateInstrument({}).ok).toBe(false);
    expect(validateInstrument({ title: 'T', items: [{ text: 'x', rubric: [{ maxScore: -1 }] }] }).ok).toBe(false);
    const v = validateInstrument({ title: 'T', kind: 'pretest', items: [{ text: 'Soal', indicator: 'Formulating', rubric: [{ label: 'T1', maxScore: 2 }] }] });
    expect(v.ok).toBe(true);
    expect(v.instrument).toMatchObject({ kind: 'pretest', status: 'draf' });
    expect(v.instrument.items[0].rubric[0].maxScore).toBe(2);
  });

  it('cadangan tidak menyentuh progres siswa', () => {
    useProfile.setState({ xp: 120 });
    useTeacher.setState({ instruments: [I], results });
    const backup = useTeacher.getState().exportAll();
    useTeacher.setState({ instruments: [], results: [] });
    expect(useTeacher.getState().importAll({ type: 'lain' }).ok).toBe(false);
    expect(useTeacher.getState().importAll(backup).ok).toBe(true);
    expect(useTeacher.getState().results).toHaveLength(2);
    expect(useProfile.getState().xp).toBe(120);
  });
});

describe('alur Modul Guru', () => {
  beforeEach(() => useTeacher.setState({ instruments: [], results: [] }));

  it('buat instrumen + rubrik → input skor siswa → laporan', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pengaturan']}>
        <App />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: /Modul Guru/ }));
    expect(await screen.findByRole('tab', { name: 'Instrumen' })).toHaveAttribute('aria-selected', 'true');

    // Instrumen
    await user.click(screen.getByRole('button', { name: '+ Instrumen baru' }));
    const title = screen.getByLabelText('Judul instrumen');
    await user.clear(title);
    await user.type(title, 'Uji coba soal');
    await user.type(screen.getByLabelText('Teks soal'), 'Faktorkan 6x² + 9x');
    await user.selectOptions(screen.getByLabelText('Indikator literasi'), 'Employing');
    await user.click(screen.getByRole('button', { name: '+ Tahap rubrik' }));
    const max2 = screen.getByLabelText('Skor maks tahap Tahap 2');
    await user.clear(max2);
    await user.type(max2, '3');
    expect(screen.getByText(/Tersimpan otomatis · skor maks 4/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Kembali ke daftar' }));
    expect(screen.getByRole('heading', { name: 'Uji coba soal' })).toBeInTheDocument();

    // Penilaian
    await user.click(screen.getByRole('tab', { name: 'Penilaian' }));
    await user.click(screen.getByRole('button', { name: '+ Tambah hasil siswa' }));
    await user.click(screen.getByRole('button', { name: 'Simpan hasil' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/kode siswa/);
    await user.type(screen.getByLabelText('Kode siswa'), 's01');
    await user.type(screen.getByLabelText(/Jawaban siswa/), '3x(2x+3)');
    await user.type(screen.getByLabelText('Tahap 1 (0–1)'), '1');
    await user.type(screen.getByLabelText('Tahap 2 (0–3)'), '2');
    expect(screen.getByText(/Nilai/).textContent).toMatch(/75/);
    await user.click(screen.getByRole('button', { name: 'Simpan hasil' }));
    const table = screen.getByRole('table', { name: /Hasil siswa/ });
    expect(within(table).getByText('S01')).toBeInTheDocument();
    expect(within(table).getByText('3/4')).toBeInTheDocument();

    // Laporan
    await user.click(screen.getByRole('tab', { name: 'Laporan' }));
    expect(screen.getByText(/rata-rata nilai/)).toHaveTextContent('75');
    expect(screen.getByText('Menerapkan (Employing)', { selector: 'li span' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cetak / Simpan PDF' })).toBeInTheDocument();

    // Drive: jujur belum terhubung
    await user.click(screen.getByRole('tab', { name: 'Cadangan & Drive' }));
    expect(screen.getByText(/belum terhubung/)).toBeInTheDocument();
  });
});
