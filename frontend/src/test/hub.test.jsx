// Perombakan UI: menu ⋮ (semua item menuju halaman yang berfungsi), Beranda, misi harian, lencana,
// peringkat jujur, game, migrasi data lama, dan migrasi volume audio.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { MENU } from '../components/layout/menu.js';
import { useProfile, INITIAL_PROGRESS } from '../store/profileStore.js';
import { useStudents } from '../store/studentStore.js';
import { useSettings } from '../store/settingsStore.js';
import { idbStorage } from '../store/storage.js';
import { setProfileScope } from '../store/scopedStorage.js';
import { missionsToday, nextStep, overallPercent, activeDays } from '../features/home/progress.js';
import { computeBadges } from '../features/achievements/badges.js';
import { rankRows } from '../features/leaderboard/LeaderboardPage.jsx';
import { toPoly } from '../math/index.js';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
const today = () => new Date().toISOString();

beforeEach(() => useProfile.setState({ ...INITIAL_PROGRESS, nickname: 'Uji', onboardingDone: true }));

describe('menu utama ⋮', () => {
  it('5 kategori, setiap item berlabel teks & berikon', () => {
    expect(MENU.map((c) => c.label)).toEqual(['Beranda', 'Belajar', 'Game & Aktivitas', 'Komunitas & Prestasi', 'Lainnya']);
    for (const c of MENU) for (const it of c.items) expect(it.label && it.icon && it.to).toBeTruthy();
  });

  it('drawer terbuka dari tombol ⋮, menampilkan semua item, dan menavigasi', async () => {
    const user = userEvent.setup();
    renderAt('/beranda');
    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    const drawer = screen.getByRole('dialog', { name: 'Menu utama' });
    for (const c of MENU) {
      expect(within(drawer).getByRole('heading', { name: c.label })).toBeInTheDocument();
      for (const it of c.items) expect(within(drawer).getByRole('link', { name: it.label })).toBeInTheDocument();
    }
    await user.click(within(drawer).getByRole('link', { name: 'Pencapaian & Lencana' }));
    expect(screen.queryByRole('dialog', { name: 'Menu utama' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pencapaian & Lencana' })).toBeInTheDocument();
  });

  it('SETIAP item menu membuka halaman yang berfungsi (bukan halaman kosong / 404)', async () => {
    for (const c of MENU) {
      for (const it of c.items) {
        const { unmount } = renderAt(it.to.split('#')[0]);
        expect(screen.queryByText(/tidak ditemukan/i), it.to).not.toBeInTheDocument();
        expect(await screen.findAllByRole('heading'), it.to).not.toHaveLength(0);
        unmount();
      }
    }
  });

  it('tombol ⋮ juga ada di peta, pelajaran, dan kuis', () => {
    useProfile.setState({ worlds: { 1: { lessonDone: true } } });
    for (const path of ['/peta', '/belajar/1', '/kuis/1']) {
      const { unmount } = renderAt(path);
      expect(screen.getByRole('button', { name: 'Buka menu' }), path).toBeInTheDocument();
      unmount();
    }
  });

  it('Pengaturan mudah dikenali: ikon gear + label teks, isi terstruktur', () => {
    renderAt('/beranda');
    expect(screen.getByRole('link', { name: 'Pengaturan' })).toHaveTextContent('Pengaturan');
    renderAt('/pengaturan');
    for (const h of ['Suara', 'Tampilan', 'Asisten AI TATA', 'Kenali TATA', 'Untuk guru', 'Tentang aplikasi']) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }
  });
});

describe('Beranda & data dashboard (dari progres asli)', () => {
  it('misi harian dihitung dari aktivitas HARI INI', () => {
    expect(missionsToday({ activity: [] }).every((m) => !m.done)).toBe(true);
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(missionsToday({ activity: [{ type: 'lesson', xp: 50, date: yesterday }] }).every((m) => !m.done)).toBe(true);
    const m = missionsToday({ activity: [{ type: 'lesson', xp: 20, date: today() }, { type: 'game', xp: 12, date: today() }] });
    expect(m.map((x) => x.done)).toEqual([true, true, true]);
  });

  it('rekomendasi: pelajaran → kuis → pulau berikutnya → game', () => {
    expect(nextStep({ worlds: {} })).toMatchObject({ kind: 'lesson', worldId: 1, to: '/belajar/1' });
    expect(nextStep({ worlds: { 1: { lessonDone: true } } })).toMatchObject({ kind: 'quiz', to: '/kuis/1' });
    expect(nextStep({ worlds: { 1: { completed: true } } })).toMatchObject({ kind: 'lesson', worldId: 2 });
    const three = { worlds: { 1: { completed: true }, 2: { completed: true }, 3: { completed: true } } };
    expect(nextStep(three)).toMatchObject({ kind: 'lesson', worldId: 4, to: '/belajar/4' }); // Menara Tantangan
    expect(nextStep({ worlds: { ...three.worlds, 4: { completed: true } } })).toMatchObject({ kind: 'lesson', worldId: 5 }); // Petualangan Literasi
    const all = { worlds: { ...three.worlds, 4: { completed: true }, 5: { completed: true } } };
    expect(nextStep(all)).toMatchObject({ kind: 'game' });
    expect(overallPercent(all)).toBe(100);
  });

  it('Beranda menampilkan sapaan, XP, lencana, misi, tombol lanjut', () => {
    useProfile.setState({ xp: 40, activity: [{ type: 'lesson', worldId: 1, xp: 40, date: today() }], worlds: { 1: { lessonDone: true } } });
    renderAt('/beranda');
    expect(screen.getByRole('heading', { name: 'Halo, Uji!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lanjutkan: Kerjakan Kuis Lembah Aljabar/ })).toHaveAttribute('href', '/kuis/1');
    expect(screen.getByText('Penjelajah Aljabar')).toBeInTheDocument(); // lencana pertama diraih
    expect(screen.getByText(/Misi hari ini: 2\/3/)).toBeInTheDocument();
  });
});

describe('profil siswa', () => {
  it('menampilkan identitas, ringkasan, progres pulau, riwayat aktivitas, dan lencana dari data asli', () => {
    useProfile.setState({
      xp: 45,
      worlds: { 1: { lessonDone: true } },
      activity: [
        { type: 'game', gameId: 'pasangkan', score: 10, xp: 5, date: today() },
        { type: 'lesson', worldId: 1, xp: 40, date: today() },
      ],
    });
    renderAt('/profil');
    expect(screen.getByRole('heading', { name: 'Uji' })).toBeInTheDocument();
    expect(screen.getByText('Siswa Uji Coba')).toBeInTheDocument();
    expect(screen.getByLabelText('45 poin pengalaman')).toBeInTheDocument();
    expect(screen.getByLabelText('1 hari belajar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Progres World 1' })).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText(/Bermain Pasangkan Ekspresi — skor 10/)).toBeInTheDocument();
    expect(screen.getByText(/Menyelesaikan pelajaran Lembah Aljabar/)).toBeInTheDocument();
    expect(screen.getByText(/Penjelajah Aljabar/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ubah identitas' })).toHaveAttribute('href', '/identitas?ubah=1');
  });
});

describe('lencana', () => {
  it('hanya diraih dari progres nyata', () => {
    const none = computeBadges({ ...INITIAL_PROGRESS });
    expect(none.some((b) => b.earned)).toBe(false);
    const p = {
      ...INITIAL_PROGRESS,
      xp: 320,
      worlds: { 1: { lessonDone: true, completed: true, stars: 3 }, 2: { completed: true, stars: 3 } },
      quizHistory: [{ percent: 100 }],
      games: { 'cepat-tepat': { best: 9, plays: 1 }, pasangkan: { best: 10, plays: 1 } },
      activity: [0, 1, 2].map((d) => ({ type: 'lesson', xp: 1, date: new Date(Date.now() - d * 86400000).toISOString() })),
    };
    const earned = computeBadges(p).filter((b) => b.earned).map((b) => b.id);
    expect(earned.sort()).toEqual(['consistent', 'explorer', 'expression', 'factoring', 'matcher', 'perfect', 'speed', 'stars', 'xp'].sort());
    expect(activeDays(p.activity)).toBe(3);
  });
});

describe('peringkat jujur', () => {
  it('urut XP → bintang → nama', () => {
    const r = rankRows([
      { id: 'a', nickname: 'Budi', xp: 50, stars: 1 },
      { id: 'b', nickname: 'Ani', xp: 80, stars: 0 },
      { id: 'c', nickname: 'Caca', xp: 50, stars: 3 },
    ]);
    expect(r.map((x) => `${x.rank}.${x.nickname}`)).toEqual(['1.Ani', '2.Caca', '3.Budi']);
  });

  it('hanya siswa di perangkat ini, nama panggilan saja, ada penjelasan & penanda "Kamu"', async () => {
    const other = { id: 'siswa-lain', fullName: 'Nama Lengkap Rahasia', nickname: 'Rara', className: 'VII B', school: 'SMP X', absen: '' };
    useStudents.setState((s) => ({ students: { ...s.students, [other.id]: other } }));
    await idbStorage.setItem('aa-profile:siswa-lain', JSON.stringify({ state: { xp: 90, worlds: { 1: { stars: 2 } } }, version: 1 }));
    useProfile.setState({ xp: 30 });
    renderAt('/peringkat');
    expect(screen.getByText(/Peringkat di perangkat ini/)).toBeInTheDocument();
    expect(screen.getByText(/belum tersedia/)).toBeInTheDocument();
    const board = await screen.findByRole('list', { name: /Peringkat siswa/ });
    const rows = within(board).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Rara');
    expect(rows[1]).toHaveTextContent('UjiKamu');
    expect(board).not.toHaveTextContent('Nama Lengkap Rahasia');
  });
});

describe('game', () => {
  it('Pasangkan Ekspresi: semua pasangan dicocokkan → rekor & XP tersimpan, lencana Pemasang Jitu', async () => {
    const user = userEvent.setup();
    renderAt('/game/pasangkan');
    const cards = () => screen.getAllByRole('button', { name: /^Bentuk (penjumlahan|faktor) / });
    const text = (el) => el.getAttribute('aria-label').replace(/^Bentuk (penjumlahan|faktor) /, '').replace(/, sudah cocok$/, '');
    const expanded = cards().filter((c) => /^Bentuk penjumlahan/.test(c.getAttribute('aria-label')));
    expect(expanded).toHaveLength(6);
    for (const e of expanded) {
      const target = toPoly(text(e));
      const partner = cards().find((c) => /^Bentuk faktor/.test(c.getAttribute('aria-label')) && !c.disabled && toPoly(text(c)).equals(target));
      await user.click(e);
      await user.click(partner);
    }
    expect(screen.getByText(/Semua cocok dalam 6 langkah/)).toBeInTheDocument();
    const p = useProfile.getState();
    expect(p.games.pasangkan).toMatchObject({ best: 12, plays: 1 });
    expect(p.activity[0]).toMatchObject({ type: 'game', gameId: 'pasangkan' });
    expect(computeBadges(p).find((b) => b.id === 'matcher').earned).toBe(true);
  });

  it('Latihan Soal: 10 soal dengan pembahasan, skor tercatat', async () => {
    const user = userEvent.setup();
    renderAt('/game/latihan');
    await user.click(screen.getByRole('button', { name: '▶ Mulai' }));
    for (let i = 0; i < 10; i++) {
      const opts = screen.getAllByRole('button').filter((b) => b.className.includes('opt'));
      await user.click(opts[0]);
      expect(screen.getByText(/Tepat!|Belum tepat\./)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: i === 9 ? 'Lihat skor' : 'Soal berikutnya' }));
    }
    expect(screen.getByRole('heading', { name: /Skor: \d+ \/ 10/ })).toBeInTheDocument();
    expect(useProfile.getState().games.latihan.plays).toBe(1);
  });

  it('pusat game hanya berisi game yang berfungsi (rencana ditulis sebagai teks, bukan tombol)', () => {
    renderAt('/game');
    expect(screen.getAllByRole('link', { name: '▶ Main' })).toHaveLength(3);
    expect(screen.getByText(/Sedang disiapkan:/)).toBeInTheDocument();
  });
});

describe('kompatibilitas data', () => {
  it('progres format lama (tanpa activity/games) dimuat tanpa membawa data siswa lain', async () => {
    const s = useStudents.getState();
    const old = { id: 'siswa-lama', fullName: 'Siswa Lama', nickname: 'Lama', className: 'VII A', school: 'S', absen: '' };
    useStudents.setState({ students: { ...s.students, [old.id]: old } });
    await idbStorage.setItem('aa-profile:siswa-lama', JSON.stringify({ state: { nickname: 'Lama', xp: 70, worlds: {}, quizHistory: [] }, version: 1 }));
    useProfile.setState({ activity: [{ type: 'game', gameId: 'x', xp: 5, date: today() }], games: { x: { best: 1, plays: 1 } } });
    await useStudents.getState().switchTo('siswa-lama');
    const p = useProfile.getState();
    expect(p).toMatchObject({ xp: 70, nickname: 'Lama', activity: [], games: {} });
    setProfileScope('siswa-uji');
  });

  it('volume bawaan lama dinaikkan; volume pilihan siswa dipertahankan', () => {
    const migrate = useSettings.persist.getOptions().migrate;
    expect(migrate({ musicVolume: 0.5, sfxVolume: 0.7 }, 1)).toMatchObject({ musicVolume: 0.7, sfxVolume: 0.85 });
    expect(migrate({ musicVolume: 0.3, sfxVolume: 1 }, 1)).toMatchObject({ musicVolume: 0.3, sfxVolume: 1 });
  });
});
