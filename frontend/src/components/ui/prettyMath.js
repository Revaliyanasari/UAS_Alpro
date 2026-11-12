const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** Untuk teks campuran (kalimat + rumus): ubah ^2 menjadi ² dan " - " menjadi " − " tanpa memiringkan kata. */
export function pretty(text) {
  return String(text ?? '')
    .replace(/\^(\d+)/g, (_, d) => d.split('').map((c) => SUP[c]).join(''))
    .replace(/ - /g, ' − ');
}
