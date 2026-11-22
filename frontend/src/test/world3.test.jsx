// World 3: aktivitas Potong & Geser (a² − b²) dan kuis Dunia 3.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CutSlideScreen from '../features/lesson/CutSlideScreen.jsx';
import { lessons } from '../content/lessons/index.js';
import { quizzes } from '../content/quizzes/index.js';
import { gradeInput } from '../features/quiz/quizLogic.js';

describe('Potong & Geser', () => {
  it('potong pojok → potong L → ketuk potongan → tentukan panjang & lebar', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<CutSlideScreen screen={lessons[3].screens.find((s) => s.type === 'cutSlide')} onDone={done} />);
    expect(screen.getByRole('img', { name: 'Persegi bersisi a' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Potong pojok/ }));
    expect(screen.getByText(/Luasnya a² − b²/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Potong sisa L/ }));
    // ketuk potongan kuning langsung (bukan tombol)
    await user.click(screen.getByRole('button', { name: /Potongan kuning/ }));
    expect(screen.getByRole('img', { name: /panjang a \+ b dan lebar a − b/ })).toBeInTheDocument();
    const group = () => screen.getByRole('group');
    await user.click(screen.getAllByRole('button', { name: 'a' })[0]);
    expect(screen.getByText(/ditambah potongan yang digeser/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'a + b' }));
    expect(group()).toHaveAccessibleName('Pilih lebar persegi panjang');
    await user.click(screen.getByRole('button', { name: 'a − b' }));
    expect(done).toHaveBeenCalledWith({ firstTry: false });
    expect(screen.getByText(/Luas tetap sama/)).toBeInTheDocument();
  });
});

describe('Kuis Dunia 3', () => {
  it('kesalahan tanda (M4) dikenali dengan umpan balik', () => {
    const q = quizzes[3].slots[1].variants[0];
    const r = gradeInput(q, '(3x-2)(3x-2)');
    expect(r.correct).toBe(false);
    expect(r.text).toMatch(/suku tengah/i);
    expect(gradeInput(q, '(3x+2)(3x-2)').correct).toBe(true);
  });
});
