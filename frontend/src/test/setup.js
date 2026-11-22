import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useStudents } from '../store/studentStore.js';
import { setProfileScope } from '../store/scopedStorage.js';

// Bawaan setiap uji: sudah ada satu siswa aktif (identitas terisi), sehingga uji fitur belajar
// langsung bisa membuka peta/pelajaran/kuis. Uji identitas (student.test.jsx) mengosongkannya sendiri.
export const TEST_STUDENT = { id: 'siswa-uji', fullName: 'Siswa Uji Coba', nickname: 'Uji', className: 'VII A', school: 'SMP Uji', absen: '' };

beforeEach(() => {
  setProfileScope(TEST_STUDENT.id);
  useStudents.setState({ students: { [TEST_STUDENT.id]: TEST_STUDENT }, activeId: TEST_STUDENT.id, ready: true, initialized: true });
});

afterEach(() => cleanup());
