import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import Tata from '../components/tata/Tata.jsx';
import { TATA_STATES } from '../components/tata/tataDesign.js';
import { useProfile } from '../store/profileStore.js';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

beforeEach(() => {
  useProfile.setState({ nickname: '', onboardingDone: false, xp: 0, worlds: {} });
});

describe('Welcome', () => {
  it('siswa baru melihat "Mulai Petualangan" menuju onboarding', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Algebra Adventure' })).toBeInTheDocument();
    await user.click(await screen.findByRole('link', { name: 'Mulai Petualangan' }));
    expect(screen.getByRole('heading', { name: 'Kenalan dengan TATA' })).toBeInTheDocument();
  });

  it('siswa yang kembali melihat "Lanjutkan Petualangan", nama panggilannya, dan pilihan ganti siswa', async () => {
    useProfile.setState({ onboardingDone: true, nickname: 'Uji' });
    renderAt('/');
    expect(await screen.findByRole('link', { name: 'Lanjutkan Petualangan' })).toHaveAttribute('href', '/beranda');
    expect(screen.getByText(/Selamat datang kembali, Uji/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bukan Uji? Ganti siswa' })).toHaveAttribute('href', '/siswa');
  });
});

describe('Onboarding & aktivitas ubin', () => {
  const goToTiles = async (user) => {
    renderAt('/mulai');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.getByRole('heading', { name: 'Kenalan dengan ubin' })).toBeInTheDocument();
  };

  it('ubin yang salah bingkai ditolak dengan petunjuk, ubin yang cocok terpasang', async () => {
    const user = userEvent.setup();
    await goToTiles(user);
    // ketuk ubin x² lalu ketuk bingkai 1×1 → ditolak
    await user.click(screen.getByRole('button', { name: 'Ubin x kuadrat' }));
    await user.click(screen.getByRole('button', { name: /Bingkai 1 kali 1/ }));
    expect(screen.getByText(/Belum muat/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ubin x kuadrat' })).toBeInTheDocument();
    // ketuk ubin x² lalu bingkai x×x → terpasang
    await user.click(screen.getByRole('button', { name: 'Ubin x kuadrat' }));
    await user.click(screen.getByRole('button', { name: /Bingkai x kali x/ }));
    expect(screen.queryByRole('button', { name: 'Ubin x kuadrat' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bingkai x kali x, sudah terisi/ })).toBeDisabled();
  });

  it('memasang ketiga ubin (dengan keyboard) menampilkan kesimpulan luas', async () => {
    const user = userEvent.setup();
    await goToTiles(user);
    for (const [tile, frame] of [
      ['Ubin x', /Bingkai x kali 1/],
      ['Ubin satu', /Bingkai 1 kali 1/],
      ['Ubin x kuadrat', /Bingkai x kali x/],
    ]) {
      screen.getByRole('button', { name: tile }).focus();
      await user.keyboard('{Enter}');
      screen.getByRole('button', { name: frame }).focus();
      await user.keyboard('{Enter}');
    }
    expect(screen.getByText(/Nama ubin adalah luasnya/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mulai Berpetualang' })).toBeInTheDocument();
  });

  it('perkenalan selesai → peta menyapa dengan nama panggilan dari identitas (tidak ditanya ulang)', async () => {
    const user = userEvent.setup();
    useProfile.setState({ nickname: 'Uji' });
    renderAt('/mulai');
    for (let i = 0; i < 2; i++) await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.queryByLabelText('Nama panggilan')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mulai Berpetualang' }));
    expect(useProfile.getState().onboardingDone).toBe(true);
    expect(screen.getByText('Halo, Uji!')).toBeInTheDocument();
  });
});

describe('Peta petualangan', () => {
  it('World 1 terbuka, World 2–5 terkunci; XP & bintang dimulai dari 0', () => {
    renderAt('/peta');
    expect(screen.getByRole('button', { name: /World 1: Lembah Aljabar\. Terbuka/ })).toBeInTheDocument();
    for (const id of [2, 3, 4, 5]) {
      expect(screen.getByRole('button', { name: new RegExp(`World ${id}: .*Terkunci`) })).toBeInTheDocument();
    }
    expect(screen.getByLabelText('0 bintang')).toBeInTheDocument();
    expect(screen.getByLabelText('0 poin pengalaman')).toBeInTheDocument();
  });

  it('mengetuk pulau membuka kartu misi & materi; Escape menutup', async () => {
    const user = userEvent.setup();
    renderAt('/peta');
    await user.click(screen.getByRole('button', { name: /World 1/ }));
    const dialog = screen.getByRole('dialog', { name: 'Lembah Aljabar' });
    expect(within(dialog).getByText('Pembagian suku tunggal')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Masuk ke Lembah Aljabar' })).toHaveAttribute('href', '/belajar/1');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pulau terkunci menjelaskan syarat membukanya', async () => {
    const user = userEvent.setup();
    renderAt('/peta');
    await user.click(screen.getByRole('button', { name: /World 3/ }));
    expect(screen.getByText(/Selesaikan Gua Rahasia Pemfaktoran dulu/)).toBeInTheDocument();
  });

  it('menyelesaikan World 1 membuka World 2', () => {
    useProfile.setState({ worlds: { 1: { completed: true, stars: 2 } } });
    renderAt('/peta');
    expect(screen.getByRole('button', { name: /World 2: .*Terbuka/ })).toBeInTheDocument();
    expect(screen.getByLabelText('2 bintang')).toBeInTheDocument();
  });
});

describe('TATA', () => {
  it('semua ekspresi dapat ditampilkan (2D saat WebGL tidak tersedia)', () => {
    for (const state of TATA_STATES) {
      const { container, unmount } = render(<Tata state={state} size="lg" />);
      expect(container.querySelector(`[data-state="${state}"] svg`)).not.toBeNull();
      unmount();
    }
  });
});
