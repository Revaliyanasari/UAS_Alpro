// TATA: 18 ekspresi berbeda, pemilihan ekspresi sesuai situasi belajar, galeri, integrasi di soal.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Tata2D from '../components/tata/Tata2D.jsx';
import { EXPRESSIONS, EXPRESSION_ORDER, baseStateOf, resolveExpression } from '../components/tata/tataExpressions.js';
import { moodFor } from '../components/tata/tataMood.js';
import { TATA_STATES } from '../components/tata/tataDesign.js';
import copy from '../content/tata-expressions.json';
import App from '../App.jsx';
import ChoiceScreen from '../features/lesson/ChoiceScreen.jsx';

const expressionOf = (container) => container.querySelector('[data-expression]')?.getAttribute('data-expression');

describe('18 ekspresi TATA', () => {
  it('ada 18 ekspresi, masing-masing punya nama & keterangan', () => {
    expect(EXPRESSION_ORDER).toHaveLength(18);
    for (const id of EXPRESSION_ORDER) {
      expect(EXPRESSIONS[id]).toBeDefined();
      expect(copy.expressions[id].name).toBeTruthy();
      expect(copy.expressions[id].desc).toBeTruthy();
      expect(copy.expressions[id].when).toBeTruthy();
    }
  });

  it('setiap ekspresi menghasilkan gambar SVG yang berbeda (bukan satu gambar yang sama)', () => {
    const drawings = EXPRESSION_ORDER.map((id) => {
      const { container } = render(<Tata2D state={id} />);
      const svg = container.querySelector('svg');
      // bandingkan isi gambar tanpa atribut penanda nama
      const html = svg.innerHTML;
      container.remove();
      return html + svg.getAttribute('class');
    });
    expect(new Set(drawings).size).toBe(18);
  });

  it('state lama tetap berlaku dan versi 3D mendapat state dasar yang dikenalnya', () => {
    for (const s of TATA_STATES) expect(resolveExpression(s)).toBeDefined();
    for (const id of EXPRESSION_ORDER) expect(TATA_STATES).toContain(baseStateOf(id));
  });
});

describe('pemilihan ekspresi sesuai situasi belajar', () => {
  it('benar, salah, petunjuk, selesai', () => {
    expect(moodFor('welcome')).toBe('wave');
    expect(moodFor('correct', { firstTry: true })).toBe('cheer');
    expect(moodFor('correct', { firstTry: false })).toBe('happy');
    expect(moodFor('wrong', { attempt: 1 })).toBe('love');
    expect(moodFor('wrong', { attempt: 2 })).toBe('thinking');
    expect(moodFor('wrong', { attempt: 4 })).toBe('confused');
    expect(moodFor('hint')).toBe('focused');
    expect(moodFor('lessonDone')).toBe('proud');
    expect(moodFor('quizResult', { percent: 100 })).toBe('cheer');
    expect(moodFor('quizResult', { percent: 60 })).toBe('proud');
    expect(moodFor('quizResult', { percent: 20 })).toBe('love');
  });

  it('TATA tidak pernah sedih/kecewa karena jawaban salah', () => {
    for (let attempt = 1; attempt < 10; attempt++) {
      expect(['sad', 'disappointed']).not.toContain(moodFor('wrong', { attempt }));
    }
  });

  it('di soal: salah → semangat → berpikir; petunjuk → fokus; benar → senang', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChoiceScreen
        screen={{ prompt: 'Pilih', options: ['A1', 'B1', 'C1'], answer: 'C1', hints: ['h1', 'h2', 'h3'] }}
        onDone={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'A1' }));
    expect(expressionOf(container)).toBe('love');
    await user.click(screen.getByRole('button', { name: 'B1' }));
    expect(expressionOf(container)).toBe('thinking');
    await user.click(screen.getByRole('button', { name: /Minta petunjuk/ }));
    expect(expressionOf(container)).toBe('focused');
    await user.click(screen.getByRole('button', { name: 'C1' }));
    expect(expressionOf(container)).toBe('happy');
  });
});

describe('Galeri Ekspresi TATA', () => {
  it('dibuka dari Pengaturan, menampilkan 18 kartu, memilih kartu mengganti pratinjau', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pengaturan']}>
        <App />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: 'Galeri Ekspresi TATA' }));
    expect(screen.getByRole('heading', { name: 'Galeri Ekspresi TATA' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Daftar ekspresi TATA' });
    expect(list.querySelectorAll('li')).toHaveLength(18);
    await user.click(screen.getByRole('button', { name: '10. Punya ide' }));
    expect(screen.getByRole('heading', { name: 'Punya ide' })).toBeInTheDocument();
    expect(screen.getByText(/membuka pembahasan/)).toBeInTheDocument();
  });
});
