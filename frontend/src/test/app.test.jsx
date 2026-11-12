import { describe, it, expect, beforeEach } from 'vitest';
import { useProfile } from '../store/profileStore.js';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import MathText, { tokenizeMath } from '../components/ui/MathText.jsx';
import ProgressPath from '../components/ui/ProgressPath.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

beforeEach(() => {
  useProfile.setState({ nickname: '', onboardingDone: false, xp: 0, worlds: {} });
});

describe('navigasi', () => {
  it('Pengaturan berisi tautan guru ke Lab dan Katalog', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('link', { name: 'Pengaturan' }));
    expect(screen.getByRole('heading', { name: 'Pengaturan' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Lab Pemeriksa Aljabar' }));
    expect(screen.getByRole('heading', { name: 'Lab Pemeriksa Aljabar' })).toBeInTheDocument();
    renderAt('/pengaturan');
    await user.click(screen.getAllByRole('link', { name: 'Katalog Desain' })[0]);
    expect(screen.getByRole('heading', { name: 'Katalog Desain' })).toBeInTheDocument();
  });

  it('alamat yang tidak dikenal menampilkan halaman tidak ditemukan', () => {
    renderAt('/tidak-ada');
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
  });
});

describe('Lab Pemeriksa Aljabar', () => {
  it('jawaban benar mendapat umpan balik positif', async () => {
    const user = userEvent.setup();
    renderAt('/lab');
    await user.type(screen.getByLabelText('Jawaban siswa'), '4x(2x+3)');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Benar/)).toBeInTheDocument();
    expect(screen.getByText(/Tepat sekali/)).toBeInTheDocument();
  });

  it('kesalahan Rafa mendapat petunjuk tanpa jawaban akhir', async () => {
    const user = userEvent.setup();
    renderAt('/lab');
    await user.type(screen.getByLabelText('Jawaban siswa'), '4x(2x+12)');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText('Kode diagnosis: M1')).toBeInTheDocument();
    expect(screen.queryByText(/2x \+ 3/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cek dengan mengalikan' }));
    expect(screen.getByText('belum sama')).toBeInTheDocument();
  });

  it('mode bagi suku mengenali kesalahan variabel', async () => {
    const user = userEvent.setup();
    renderAt('/lab');
    await user.click(screen.getByRole('tab', { name: 'Bagi suku' }));
    await user.type(screen.getByLabelText('Jawaban siswa'), '2x^2');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText('Kode diagnosis: M8')).toBeInTheDocument();
  });

  it('tulisan yang tidak terbaca tidak membuat aplikasi rusak', async () => {
    const user = userEvent.setup();
    renderAt('/lab');
    await user.type(screen.getByLabelText('Jawaban siswa'), '4x(2x+');
    await user.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Tulisan belum terbaca/)).toBeInTheDocument();
  });
});

describe('Pengaturan', () => {
  it('ukuran tulisan dan animasi langsung diterapkan ke halaman', async () => {
    const user = userEvent.setup();
    renderAt('/pengaturan');
    await user.click(screen.getByLabelText(/Besar/));
    expect(document.documentElement.dataset.text).toBe('large');
    await user.click(screen.getByLabelText(/Kurangi animasi/));
    expect(document.documentElement.dataset.motion).toBe('reduced');
    await user.click(screen.getByLabelText(/Animasi penuh/));
    expect(document.documentElement.dataset.motion).toBe('full');
  });
});

describe('Katalog', () => {
  it('tombol contoh memunculkan pemberitahuan', async () => {
    const user = userEvent.setup();
    renderAt('/katalog');
    await user.click(screen.getByRole('button', { name: 'Contoh benar' }));
    expect(screen.getByText('Bagus! Jawabanmu benar.')).toBeInTheDocument();
  });
});

describe('komponen', () => {
  it('MathText menampilkan pangkat sebagai superskrip', () => {
    const { container } = render(<MathText>8x^2 + 12x</MathText>);
    expect(container.querySelector('sup')).toHaveTextContent('2');
    expect(tokenizeMath('y²−9').find((t) => t.type === 'sup').value).toBe('2');
  });

  it('ProgressPath membatasi nilai dan memberi label aksesibel', () => {
    render(<ProgressPath value={9} max={6} label="Langkah" />);
    const bar = screen.getByRole('progressbar', { name: 'Langkah' });
    expect(bar).toHaveAttribute('aria-valuenow', '6');
    expect(within(bar.parentElement).getByText('6/6')).toBeInTheDocument();
  });
});
