// Teks umpan balik TATA untuk setiap kode diagnosis dari src/math/checker.js.
// Prinsip (docs/LEARNING_DESIGN.md §5.2): sebut dulu yang sudah benar, jangan beri jawaban akhir,
// arahkan ke bagian yang perlu diperiksa, kalimat pendek.

export const feedback = {
  OK: { tone: 'happy', text: 'Tepat sekali! Kamu sudah mengeceknya dengan baik.' },
  INPUT: { tone: 'confused', text: 'Tulisan jawabanmu belum bisa aku baca.' },
  NOT_FACTORED: {
    tone: 'confused',
    text: 'Nilainya sudah sama, tapi bentuknya masih penjumlahan. Ubah jadi perkalian, ya.',
  },
  M1: { tone: 'confused', text: 'Coba kalikan kembali. Apakah hasilnya sama dengan soal? Periksa setiap suku di dalam kurung.' },
  M2: { tone: 'happy', text: 'Benar! Tapi isi kurungnya masih punya faktor angka yang sama. Bisa dikeluarkan lagi?' },
  M3: { tone: 'happy', text: 'Angkanya sudah tepat. Apakah variabelnya juga ada di semua suku?' },
  DOTS_LEFT: { tone: 'happy', text: 'Hampir! Bagian dalam kurung masih berbentuk a² − b². Bisa difaktorkan lagi?' },
  M4: { tone: 'confused', text: 'Coba kalikan kedua kurungnya. Suku tengahnya hilang atau tidak? Perhatikan tandanya.' },
  M5: { tone: 'confused', text: 'Kalikan kembali jawabanmu. Tanda di antara kedua suku cocok dengan soal?' },
  M6: { tone: 'confused', text: 'Variabelnya sudah tepat. Sekarang cek lagi pembagian angkanya.' },
  M7: { tone: 'confused', text: 'Belum tepat. Coba cek dengan mengalikan kembali, atau minta petunjuk.' },
  M8: { tone: 'confused', text: 'Angkanya sudah benar. Ingat, x² itu x · x. Kalau dibagi x, tinggal berapa x?' },
  M9: { tone: 'confused', text: 'Angkanya sudah benar. x dibagi x hasilnya 1. Jadi, masih ada x atau tidak?' },
  M10: { tone: 'confused', text: 'Angkanya sudah benar. Cek variabelnya: x² dibagi x masih menyisakan x.' },
  NOT_SIMPLE: { tone: 'happy', text: 'Nilainya sudah benar! Sekarang sederhanakan jadi satu bentuk: kalikan angkanya, lalu variabelnya.' },
  M11: { tone: 'happy', text: 'Isi kurungnya sudah benar! Tapi faktor di depan kurung belum ditulis.' },
};

export function feedbackFor(result) {
  const base = feedback[result.code] ?? feedback.M7;
  if (result.code === 'INPUT' && result.message) return { ...base, text: `${base.text} ${result.message}` };
  return base;
}
