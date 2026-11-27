// Pembangkit soal game (materi World 1–3, kelas VII). Kunci dihitung dengan rumus, lalu DIVERIFIKASI
// mesin aljabar di uji otomatis (src/math/games.test.js). Pengecoh meniru kesalahan umum (M1, M3, M4, M6, M8, M9).
import { gcd } from '../../math/index.js';

export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const coef = (n, v) => (n === 1 ? v : n === -1 ? `-${v}` : `${n}${v}`);
const shuffle = (rng, list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const unique = (list) => [...new Set(list)];

/** Dua pengali yang saling prima (FPB-nya 1), mis. 2 & 3 → 4x² + 6x punya FPB tepat 2x. */
function coprimePair(rng) {
  for (;;) {
    const m = int(rng, 1, 5);
    const n = int(rng, 1, 7);
    if (m !== n && gcd(m, n) === 1) return [m, n];
  }
}

const MAKERS = {
  coefficient(rng) {
    const v = pick(rng, ['x', 'y']);
    const a = pick(rng, [-7, -5, -3, -2, 2, 3, 4, 5, 6, 8, 9]);
    const pow = pick(rng, ['', '^2']);
    const answer = String(a);
    return {
      topic: 'Koefisien',
      prompt: `Berapa koefisien dari ${coef(a, v + pow)}?`,
      answer,
      options: unique([answer, String(-a), `${v}${pow}`, coef(a, v + pow)]),
      explain: `Koefisien adalah angka di depan variabel, termasuk tandanya: ${answer}.`,
    };
  },
  likeTerms(rng) {
    const k = int(rng, 2, 9);
    const answer = coef(pick(rng, [-1, 3, 5, -4]), 'x');
    return {
      topic: 'Suku sejenis',
      prompt: `Mana yang sejenis dengan ${k}x?`,
      answer,
      options: unique([answer, `${k}x^2`, `${k}y`, String(k)]),
      explain: 'Suku sejenis punya variabel dan pangkat yang sama (x berpangkat 1).',
    };
  },
  fpb(rng) {
    const g = int(rng, 2, 6);
    const [m, n] = coprimePair(rng);
    const a = g * m;
    const b = g * n;
    const answer = coef(g, 'x');
    return {
      topic: 'FPB',
      prompt: `FPB dari ${a}x^2 dan ${b}x adalah …`,
      answer,
      options: unique([answer, String(g), coef(g, 'x^2'), coef(a * b / g, 'x')]),
      explain: `FPB angka ${a} dan ${b} = ${g}; variabel bersama berpangkat terkecil = x. Jadi ${answer}.`,
    };
  },
  division(rng) {
    const q = int(rng, 2, 6);
    const d = int(rng, 2, 5);
    const withX = rng() < 0.6;
    const dividend = withX ? `${q * d}x^2` : `${q * d}x`;
    const answer = withX ? coef(q, 'x') : String(q);
    const options = withX ? [answer, coef(q, 'x^2'), String(q), coef(q * d - d, 'x')] : [answer, coef(q, 'x'), String(q * d - d), coef(q, 'x^2')];
    return {
      topic: 'Pembagian suku',
      prompt: `${dividend} : ${d}x = …`,
      answer,
      options: unique(options),
      explain: withX ? `${q * d} : ${d} = ${q} dan x² : x = x → ${answer}.` : `${q * d} : ${d} = ${q} dan x : x = 1 → ${answer}.`,
    };
  },
  factor(rng) {
    const g = int(rng, 2, 5);
    const [m, n] = coprimePair(rng);
    const expr = `${g * m}x^2 + ${g * n}x`;
    const answer = `${g}x(${coef(m, 'x')} + ${n})`;
    return {
      topic: 'Pemfaktoran FPB',
      prompt: `Bentuk faktor dari ${expr} adalah …`,
      answer,
      target: expr,
      options: unique([answer, `${g}(${coef(m, 'x^2')} + ${coef(n, 'x')})`, `${g}x(${coef(m, 'x')} + ${g * n})`, `${g}x(${coef(m, 'x^2')} + ${n})`]),
      explain: `FPB = ${g}x. Bagi setiap suku: ${g * m}x² : ${g}x = ${coef(m, 'x')} dan ${g * n}x : ${g}x = ${n}.`,
    };
  },
  dos(rng) {
    const v = pick(rng, ['x', 'y']);
    const n = int(rng, 2, 9);
    const expr = `${v}^2 - ${n * n}`;
    const answer = `(${v} + ${n})(${v} - ${n})`;
    return {
      topic: 'Selisih dua kuadrat',
      prompt: `Bentuk faktor dari ${expr} adalah …`,
      answer,
      target: expr,
      options: unique([answer, `(${v} - ${n})(${v} - ${n})`, `(${v} + ${n})(${v} + ${n})`, `(${v} + ${n * n})(${v} - 1)`]),
      explain: `${n * n} = ${n}², jadi a = ${v}, b = ${n} → (a + b)(a − b).`,
    };
  },
};

export const QUESTION_TYPES = Object.keys(MAKERS);

/** Satu soal pilihan ganda acak (opsi diacak). */
export function makeQuestion(rng = Math.random, type = pick(rng, QUESTION_TYPES)) {
  const q = MAKERS[type](rng);
  return { ...q, type, options: shuffle(rng, q.options) };
}

/** Pasangan "bentuk penjumlahan ↔ bentuk faktor" untuk game Pasangkan Ekspresi. */
export function makePairs(rng = Math.random, count = 6) {
  const pairs = [];
  const seen = new Set();
  while (pairs.length < count) {
    const q = MAKERS[rng() < 0.65 ? 'factor' : 'dos'](rng);
    if (seen.has(q.target)) continue;
    seen.add(q.target);
    pairs.push({ id: pairs.length, expanded: q.target, factored: q.answer });
  }
  return pairs;
}

/** Pembangkit acak yang bisa diulang (untuk uji): mulberry32. */
export function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
