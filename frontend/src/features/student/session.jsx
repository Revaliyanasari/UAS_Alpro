import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStudents } from '../../store/studentStore.js';
import { useProfile } from '../../store/profileStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';

/**
 * Membuka sesi siswa saat aplikasi dimuat: tunggu data perangkat terbaca, lalu muat progres siswa aktif.
 * Dipanggil sekali di App.
 */
export function useStudentSession() {
  const studentsReady = useHydrated(useStudents);
  const profileReady = useHydrated(useProfile);
  const initialized = useStudents((s) => s.initialized);
  const initSession = useStudents((s) => s.initSession);
  // Hanya sekali: jangan dijalankan ulang saat `ready` sebentar false ketika berganti siswa
  // (dulu menyebabkan progres siswa sebelumnya termuat kembali).
  useEffect(() => {
    if (studentsReady && profileReady && !initialized) initSession();
  }, [studentsReady, profileReady, initialized, initSession]);
}

/** Halaman belajar hanya untuk siswa yang sudah mengisi identitas. */
export function RequireStudent({ children }) {
  const ready = useStudents((s) => s.ready);
  const activeId = useStudents((s) => s.activeId);
  const hasStudents = useStudents((s) => Object.keys(s.students).length > 0);
  const location = useLocation();
  if (!ready) return null;
  if (!activeId) return <Navigate to={hasStudents ? '/siswa' : '/identitas'} replace state={{ from: location.pathname }} />;
  return children;
}
