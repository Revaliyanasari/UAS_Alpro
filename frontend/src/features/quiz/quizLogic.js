// Logika kuis dunia tanpa React: memilih varian soal dan menilai jawaban.
import { runCheck } from '../lesson/runCheck.js';
import { feedbackFor } from '../../content/feedback.js';

export const XP_PER_CORRECT = 10;

/**
 * Pilih satu varian untuk setiap slot soal. Setiap mengulang kuis, varian bisa berbeda
 * (LEARNING_DESIGN §7: "Kuis bisa diulang dengan soal varian"). rng bisa diganti saat pengujian.
 */
export function pickQuestions(quiz, rng = Math.random) {
  return quiz.slots.map((slot) => slot.variants[Math.floor(rng() * slot.variants.length)]);
}

/** Pilihan ganda / benar-salah. */
export function gradeChoice(question, option) {
  return { correct: option === question.answer, given: option };
}

/**
 * Isian, diperiksa mesin aljabar. Jawaban yang tidak bisa dibaca (status 'invalid') tidak dinilai:
 * siswa diminta memperbaiki tulisan dulu, supaya salah ketik tidak dihitung salah konsep.
 */
export function gradeInput(question, answer) {
  const r = runCheck(question.check, answer);
  if (r.status === 'invalid') return { invalid: true, text: feedbackFor(r).text };
  const correct = r.status === 'correct';
  return { correct, given: answer, text: correct ? null : feedbackFor(r).text };
}

/** Sortir: benar jika semua kartu berada di keranjang yang tepat. */
export function gradeSort(question, placement) {
  if (placement.some((p) => p === null)) return { invalid: true, text: 'Masih ada kartu di nampan. Pasang semuanya, ya.' };
  const wrong = question.items.filter((it, i) => placement[i] !== it.bin).length;
  return { correct: wrong === 0, given: wrong === 0 ? 'Semua kartu tepat' : `${wrong} kartu salah tempat` };
}

/** Teks kunci jawaban untuk halaman pembahasan. */
export function keyOf(question) {
  if (question.type === 'choice') return question.answer;
  return question.key ?? null;
}

export function summarize(answers) {
  const correct = answers.filter((a) => a.correct).length;
  return { correct, total: answers.length };
}
