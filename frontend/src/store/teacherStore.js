import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './storage.js';
import { newId } from '../features/teacher/scoring.js';

// Data Modul Guru di perangkat ini (IndexedDB). Siswa hanya dicatat dengan KODE (mis. S01), tanpa nama
// (CLAUDE.md aturan 8). Terpisah dari progres siswa (aa-profile) sehingga tidak saling menghapus.
// instruments: [{ id, title, kind, status, notes, items: [{ id, number, text, topic, indicator, key, revisionNote, rubric: [{ id, label, maxScore, criteria }] }] }]
// results:     [{ id, instrumentId, studentCode, date, answers: { [itemId]: { answer, scores: { [rubricId]: n }, note } }, teacherNote }]

export const emptyItem = (number) => ({
  id: newId('soal'),
  number,
  text: '',
  topic: '',
  indicator: '',
  key: '',
  revisionNote: '',
  rubric: [{ id: newId('tahap'), label: 'Tahap 1', maxScore: 1, criteria: '' }],
});

export const useTeacher = create(
  persist(
    (setState, getState) => ({
      instruments: [],
      results: [],
      addInstrument: (inst) => {
        const instrument = inst ?? { id: newId('ins'), title: 'Instrumen baru', kind: 'latihan', status: 'draf', notes: '', items: [emptyItem(1)] };
        setState((s) => ({ instruments: [...s.instruments, instrument] }));
        return instrument.id;
      },
      updateInstrument: (id, patch) =>
        setState((s) => ({ instruments: s.instruments.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteInstrument: (id) =>
        setState((s) => ({ instruments: s.instruments.filter((i) => i.id !== id), results: s.results.filter((r) => r.instrumentId !== id) })),
      saveResult: (result) =>
        setState((s) => {
          const exists = s.results.some((r) => r.id === result.id);
          return { results: exists ? s.results.map((r) => (r.id === result.id ? result : r)) : [...s.results, result] };
        }),
      deleteResult: (id) => setState((s) => ({ results: s.results.filter((r) => r.id !== id) })),
      /** Cadangan lengkap (untuk diunduh / diunggah manual ke Google Drive). */
      exportAll: () => ({ app: 'algebra-adventure', type: 'teacher-backup', version: 1, exportedAt: new Date().toISOString(), instruments: getState().instruments, results: getState().results }),
      importAll: (data) => {
        if (data?.type !== 'teacher-backup' || !Array.isArray(data.instruments) || !Array.isArray(data.results)) {
          return { ok: false, error: 'Berkas bukan cadangan Modul Guru Algebra Adventure.' };
        }
        setState({ instruments: data.instruments, results: data.results });
        return { ok: true };
      },
    }),
    {
      name: 'aa-teacher',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ instruments, results }) => ({ instruments, results }),
    },
  ),
);
