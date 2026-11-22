// Identitas siswa: validasi, penyimpanan, alur masuk, ubah identitas, ganti siswa, pemisahan progres.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { validateIdentity, normalizeClass } from '../features/student/identity.js';
import { useStudents } from '../store/studentStore.js';
import { useProfile, INITIAL_PROGRESS } from '../store/profileStore.js';
import { setProfileScope, getProfileScope } from '../store/scopedStorage.js';
import { idbStorage } from '../store/storage.js';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
const rara = { fullName: 'Rara Ayu Lestari', nickname: 'Rara', className: 'VII B', school: 'SMP Negeri 1 Harapan', absen: '7' };
const budi = { fullName: 'Budi Santoso', nickname: 'Budi', className: 'VII C', school: 'SMP Negeri 1 Harapan', absen: '' };

beforeEach(async () => {
  // perangkat kosong: belum ada siswa (mengganti siswa uji bawaan dari setup.js)
  setProfileScope(null);
  await idbStorage.removeItem('aa-profile');
  useStudents.setState({ students: {}, activeId: null, ready: true, initialized: true });
  useProfile.setState({ ...INITIAL_PROGRESS });
});

describe('validasi identitas', () => {
  it('nama lengkap, panggilan, kelas, sekolah wajib; absen opsional', () => {
    const r = validateIdentity({ fullName: '', nickname: ' ', className: '', school: '', absen: '' });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['className', 'fullName', 'nickname', 'school']);
    expect(validateIdentity(rara).ok).toBe(true);
    expect(validateIdentity({ ...rara, absen: '' }).ok).toBe(true);
  });

  it('isi yang tidak wajar ditolak dengan pesan ramah', () => {
    expect(validateIdentity({ ...rara, fullName: 'R2D2' }).errors.fullName).toMatch(/huruf/);
    expect(validateIdentity({ ...rara, fullName: 'Ra' }).errors.fullName).toMatch(/minimal 3/);
    expect(validateIdentity({ ...rara, nickname: 'x'.repeat(21) }).errors.nickname).toMatch(/maksimal 20/);
    expect(validateIdentity({ ...rara, absen: '0' }).errors.absen).toMatch(/1 sampai 99/);
    expect(validateIdentity({ ...rara, fullName: "  Siti   Nur'aini  " }).value.fullName).toBe("Siti Nur'aini");
  });

  it('kelas dirapikan', () => {
    expect(normalizeClass('vii a')).toBe('VII A');
    expect(normalizeClass('7B')).toBe('VII B');
    expect(normalizeClass('VII-C')).toBe('VII C');
  });
});

describe('alur masuk', () => {
  it('tanpa identitas, peta mengarah ke halaman identitas', () => {
    renderAt('/peta');
    expect(screen.getByRole('heading', { name: 'Kenalan dulu, yuk!' })).toBeInTheDocument();
  });

  it('halaman pembuka → identitas → validasi → sapaan personal → perkenalan; identitas tersimpan', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('link', { name: 'Mulai Petualangan' }));
    expect(screen.getByRole('heading', { name: 'Kenalan dulu, yuk!' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mulai Petualangan/ }));
    expect(screen.getByText(/Masih ada yang belum lengkap/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama lengkap/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Nama lengkap/)).toHaveFocus();

    await user.type(screen.getByLabelText(/Nama lengkap/), rara.fullName);
    await user.type(screen.getByLabelText(/Nama panggilan/), rara.nickname);
    await user.click(screen.getByRole('button', { name: 'VII B' }));
    await user.type(screen.getByLabelText(/Asal sekolah/), rara.school);
    await user.type(screen.getByLabelText(/Nomor absen/), '7');
    await user.click(screen.getByRole('button', { name: /Mulai Petualangan/ }));

    expect(await screen.findByText('Halo, Rara! Siap memulai petualangan matematika hari ini?')).toBeInTheDocument();
    const s = useStudents.getState();
    expect(s.activeStudent()).toMatchObject({ fullName: rara.fullName, nickname: 'Rara', className: 'VII B', absen: '7' });
    expect(useProfile.getState().nickname).toBe('Rara');
    // tersimpan di penyimpanan perangkat (bertahan saat dimuat ulang)
    expect(await idbStorage.getItem('aa-students')).toContain('Rara Ayu Lestari');

    await user.click(screen.getByRole('button', { name: 'Ayo berangkat!' }));
    expect(screen.getByRole('heading', { name: 'Kenalan dengan TATA' })).toBeInTheDocument();
  });
});

describe('ubah identitas & pemisahan progres', () => {
  it('mengubah identitas tidak menghapus XP, bintang, atau progres', async () => {
    await useStudents.getState().createStudent(rara);
    useProfile.getState().completeLesson(1, 40);
    useProfile.getState().recordQuiz(1, 5, 5, 50);
    const user = userEvent.setup();
    renderAt('/identitas?ubah=1');
    expect(screen.getByRole('heading', { name: 'Ubah identitasmu' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama lengkap/)).toHaveValue(rara.fullName);
    await user.clear(screen.getByLabelText(/Nama panggilan/));
    await user.type(screen.getByLabelText(/Nama panggilan/), 'Ayu');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(await screen.findByText(/Sip, Ayu!/)).toBeInTheDocument();
    const p = useProfile.getState();
    expect(p).toMatchObject({ xp: 90, nickname: 'Ayu' });
    expect(p.worlds[1]).toMatchObject({ completed: true, stars: 3 });
    expect(Object.keys(useStudents.getState().students)).toHaveLength(1);
  });

  it('progres tiap siswa terpisah dan kembali utuh saat berganti siswa', async () => {
    const { createStudent, switchTo } = useStudents.getState();
    const idRara = await createStudent(rara);
    useProfile.getState().completeLesson(1, 30);
    expect(useProfile.getState().xp).toBe(30);

    const idBudi = await createStudent(budi);
    expect(useProfile.getState()).toMatchObject({ xp: 0, worlds: {}, nickname: 'Budi' });
    useProfile.getState().completeLesson(1, 10);

    await switchTo(idRara);
    expect(getProfileScope()).toBe(idRara);
    expect(useProfile.getState()).toMatchObject({ xp: 30, nickname: 'Rara' });
    await switchTo(idBudi);
    expect(useProfile.getState()).toMatchObject({ xp: 10, nickname: 'Budi' });
  });

  it('progres versi lama (sebelum ada identitas) dipindahkan ke siswa pertama saja', async () => {
    useProfile.setState({ xp: 120, onboardingDone: true, worlds: { 1: { completed: true, stars: 2 } } }); // tersimpan di kunci lama
    expect(await idbStorage.getItem('aa-profile')).toContain('"xp":120');
    await useStudents.getState().createStudent(rara);
    expect(useProfile.getState()).toMatchObject({ xp: 120, nickname: 'Rara' });
    expect(await idbStorage.getItem('aa-profile')).toBeNull();
    await useStudents.getState().createStudent(budi);
    expect(useProfile.getState().xp).toBe(0);
  });

  it('halaman ganti siswa: memilih siswa memuat progresnya; hapus siswa menghapus progresnya', async () => {
    const idRara = await useStudents.getState().createStudent(rara);
    useProfile.getState().completeLesson(1, 30);
    await useStudents.getState().createStudent(budi);
    const user = userEvent.setup();
    renderAt('/siswa');
    await user.click(screen.getByRole('button', { name: 'Belajar sebagai Rara, kelas VII B' }));
    expect(await screen.findByText(/Selamat datang kembali, Rara/)).toBeInTheDocument();
    expect(useStudents.getState().activeId).toBe(idRara);
    expect(useProfile.getState().xp).toBe(30);

    await useStudents.getState().removeStudent(idRara);
    expect(useStudents.getState().students[idRara]).toBeUndefined();
    expect(useStudents.getState().activeId).toBeNull();
    expect(await idbStorage.getItem(`aa-profile:${idRara}`)).toBeNull();
  });

  it('profil menampilkan identitas & progres, dan bisa keluar tanpa menghapus data', async () => {
    await useStudents.getState().createStudent(rara);
    useProfile.getState().completeLesson(1, 20);
    const user = userEvent.setup();
    renderAt('/profil');
    expect(screen.getByText(rara.fullName)).toBeInTheDocument();
    expect(screen.getByText('SMP Negeri 1 Harapan')).toBeInTheDocument();
    expect(screen.getByLabelText('20 poin pengalaman')).toBeInTheDocument();
    expect(screen.getByText('Pelajaran selesai')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Selesai belajar (keluar)' }));
    expect(await screen.findByRole('link', { name: 'Mulai Petualangan' })).toHaveAttribute('href', '/siswa');
    expect(useStudents.getState().activeId).toBeNull();
    expect(Object.keys(useStudents.getState().students)).toHaveLength(1);
  });
});
