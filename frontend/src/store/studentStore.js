import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';
import { setProfileScope, getProfileScope, scopedKey } from './scopedStorage.js';
import { useProfile, INITIAL_PROGRESS } from './profileStore.js';
import { newId } from '../features/teacher/scoring.js';

// Identitas siswa di perangkat ini (bisa lebih dari satu siswa bergantian memakai satu perangkat).
// - Identitas disimpan di IndexedDB "aa-students" HANYA di perangkat ini; tidak dikirim ke server atau AI.
// - Progres setiap siswa terpisah: "aa-profile:<id>" (lihat scopedStorage.js).
// - Mengubah identitas tidak menyentuh XP, bintang, atau progres.
// students[id] = { id, fullName, nickname, className, school, absen, createdAt, updatedAt }

const PROFILE_KEY = 'aa-profile';

/** Muat progres siswa `id` ke profileStore (atau progres kosong bila belum pernah belajar). */
async function loadProgressFor(id) {
  setProfileScope(id);
  const raw = await idbStorage.getItem(scopedKey(PROFILE_KEY, id));
  if (raw) await useProfile.persist.rehydrate();
  else useProfile.setState({ ...INITIAL_PROGRESS });
}

export const useStudents = create(
  persist(
    (setState, getState) => ({
      students: {},
      activeId: null,
      ready: false, // progres siswa aktif sudah dimuat (false sebentar saat berganti siswa). Tidak disimpan.
      initialized: false, // initSession sudah berjalan (sekali per pembukaan aplikasi). Tidak disimpan.

      activeStudent: () => getState().students[getState().activeId] ?? null,
      studentList: () => Object.values(getState().students).sort((a, b) => a.nickname.localeCompare(b.nickname, 'id')),

      /** Dipanggil sekali saat aplikasi dibuka (setelah data perangkat terbaca). */
      initSession: async () => {
        const { activeId, students, initialized } = getState();
        if (initialized) return;
        setState({ initialized: true });
        if (activeId && students[activeId]) await loadProgressFor(activeId);
        else setProfileScope(null);
        setState({ ready: true });
      },

      /** Siswa baru. Progres lama dari versi sebelum fitur identitas dipindahkan ke siswa PERTAMA saja. */
      createStudent: async (identity) => {
        const now = new Date().toISOString();
        const id = newId('siswa');
        const isFirst = Object.keys(getState().students).length === 0;
        const legacyScope = getProfileScope() === null;
        // Catatan: `ready` sengaja tidak diubah di sini — halaman identitas tetap tampil untuk menyapa siswa.
        if (isFirst && legacyScope) {
          // progres yang sedang dimuat = data lama (kunci "aa-profile") → pindahkan ke siswa ini
          const legacy = await idbStorage.getItem(PROFILE_KEY);
          setProfileScope(id);
          if (legacy) {
            useProfile.setState({ nickname: identity.nickname });
            await idbStorage.removeItem(PROFILE_KEY);
          } else {
            useProfile.setState({ ...INITIAL_PROGRESS, nickname: identity.nickname });
          }
        } else {
          setProfileScope(id);
          useProfile.setState({ ...INITIAL_PROGRESS, nickname: identity.nickname });
        }
        setState((s) => ({ students: { ...s.students, [id]: { ...identity, id, createdAt: now, updatedAt: now } }, activeId: id, ready: true }));
        return id;
      },

      /** Ubah identitas siswa aktif. Progres (XP, bintang, misi) tidak diubah — hanya nama panggilan ikut disalin. */
      updateActive: (identity) => {
        const id = getState().activeId;
        if (!id) return;
        setState((s) => ({ students: { ...s.students, [id]: { ...s.students[id], ...identity, updatedAt: new Date().toISOString() } } }));
        useProfile.getState().setNickname(identity.nickname);
      },

      /** Ganti siswa: progres siswa sebelumnya sudah tersimpan di kuncinya sendiri. */
      switchTo: async (id) => {
        if (!getState().students[id]) return;
        setState({ ready: false });
        await loadProgressFor(id);
        setState({ activeId: id, ready: true });
      },

      /** Keluar tanpa menghapus data (perangkat siap untuk siswa lain). */
      signOut: () => {
        setProfileScope(null);
        useProfile.setState({ ...INITIAL_PROGRESS });
        setState({ activeId: null });
      },

      /** Hapus identitas DAN progres seorang siswa dari perangkat ini. */
      removeStudent: async (id) => {
        await idbStorage.removeItem(scopedKey(PROFILE_KEY, id));
        const wasActive = getState().activeId === id;
        setState((s) => {
          const rest = { ...s.students };
          delete rest[id];
          return { students: rest, activeId: wasActive ? null : s.activeId };
        });
        if (wasActive) {
          setProfileScope(null);
          useProfile.setState({ ...INITIAL_PROGRESS });
        }
      },
    }),
    {
      name: 'aa-students',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ students, activeId }) => ({ students, activeId }),
    },
  ),
);
