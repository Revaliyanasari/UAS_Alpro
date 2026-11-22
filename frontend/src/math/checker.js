// Pemeriksa jawaban aljabar.
// Setiap fungsi mengembalikan objek { status, code, ... }:
//   status: 'correct' | 'partial' | 'not-factored' | 'wrong' | 'invalid'
//   code  : kode diagnosis (lihat docs/LEARNING_DESIGN.md §5.2) — teks umpan baliknya ada di src/content/feedback.js
// Jawaban akhir TIDAK pernah dikembalikan di sini; yang menampilkan pembahasan adalah komponen pelajaran.

import { Poly, contentOf, differenceOfSquares, sumOfSquares, fpbOfTerms } from './polynomial.js';
import { parse, evaluate, toPoly, normalizeInput, MathInputError } from './parser.js';

// ---------- Struktur bentuk faktor ----------

// Mengurai jawaban menjadi daftar faktor: 4x(2x+3) -> [4, x, (2x+3)].
function collectFactors(node, out) {
  switch (node.type) {
    case 'group':
      collectFactors(node.expr, out);
      break;
    case 'mul':
      node.factors.forEach((f) => collectFactors(f, out));
      break;
    case 'neg':
      out.push(Poly.constant(-1));
      collectFactors(node.arg, out);
      break;
    case 'pow':
      if (node.base.type === 'group' || node.base.type === 'var') {
        for (let i = 0; i < node.exp; i++) collectFactors(node.base, out);
      } else out.push(evaluate(node));
      break;
    default:
      out.push(evaluate(node));
  }
  return out;
}

export function analyzeStructure(ast) {
  const factors = collectFactors(ast, []);
  let monomialPart = Poly.constant(1);
  const multiTerm = [];
  for (const f of factors) {
    if (f.size >= 2) multiTerm.push(f);
    else monomialPart = monomialPart.mul(f);
  }
  return {
    monomialPart,
    multiTerm,
    isProduct: multiTerm.length >= 1 && factors.length >= 2,
  };
}

// Masalah pada faktor bersuku banyak yang membuat bentuknya belum "paling sederhana".
function remainingIssue(multiTerm) {
  for (const f of multiTerm) {
    const c = contentOf(f);
    if (c && !c.isConstant(1)) {
      const [t] = c.terms.values();
      return Object.keys(t.vars).length > 0 ? 'M3' : 'M2';
    }
  }
  for (const f of multiTerm) {
    if (differenceOfSquares(f)) return 'DOTS_LEFT';
  }
  return null;
}

function sameFactorization(a, b) {
  if (!a.monomialPart.equals(b.monomialPart) || a.multiTerm.length !== b.multiTerm.length) return false;
  const rest = [...b.multiTerm];
  for (const f of a.multiTerm) {
    const i = rest.findIndex((g) => g.equals(f));
    if (i < 0) return false;
    rest.splice(i, 1);
  }
  return true;
}

// ---------- Diagnosis kesalahan ----------

// Bandingkan isi kurung P dengan hasil yang seharusnya (target : m).
function compareInner(P, target, m) {
  const expected = target.divideByMonomial(m);
  if (!expected) return 'M7';
  const pTerms = P.termList();
  for (const t of target.termList()) {
    const e = Poly.term(t.coef, t.vars).divideByMonomial(m).termList()[0];
    if (pTerms.some((p) => p.key === e.key && p.coef === e.coef)) continue;
    // Suku tidak dibagi (dibiarkan utuh) atau koefisiennya dibiarkan, mis. 4x(2x + 12) — kesalahan "Rafa".
    if (pTerms.some((p) => p.coef === t.coef)) return 'M1';
    if (pTerms.some((p) => p.key === e.key && p.coef !== e.coef)) return 'M6';
  }
  if (P.size < expected.size) return 'M1';
  return 'M7';
}

function diagnoseFactor(structure, answerPoly, target) {
  const { monomialPart: m, multiTerm } = structure;

  const sos = sumOfSquares(target);
  if (sos) {
    const dots = sos.a.mul(sos.a).sub(sos.b.mul(sos.b));
    if (answerPoly.equals(dots)) return 'M5';
  }
  if (differenceOfSquares(target) && multiTerm.length === 2) {
    const [p, q] = multiTerm;
    if (p.equals(q)) return 'M4';
  }
  if (multiTerm.length === 1) {
    const P = multiTerm[0];
    if (m.isConstant(1)) {
      // Isi kurung benar tetapi faktor di depan hilang, mis. menjawab (2x + 3) untuk 8x² + 12x.
      const lead = target.termList()[0];
      const pLead = P.termList()[0];
      const k = Poly.term(lead.coef, lead.vars).divideByMonomial(Poly.term(pLead.coef, pLead.vars));
      if (k && !k.isConstant(1) && P.mul(k).equals(target)) return 'M11';
      return 'M7';
    }
    return compareInner(P, target, m);
  }
  if (multiTerm.length === 0 && target.termList().some((t) => Poly.term(t.coef, t.vars).equals(answerPoly))) {
    return 'M1'; // ada suku yang hilang, mis. 5x(2x) untuk 10x² + 5x
  }
  return 'M7';
}

function safeParse(raw) {
  try {
    const ast = parse(raw);
    return { ast, poly: evaluate(ast) };
  } catch (err) {
    if (err instanceof MathInputError) return { error: err.message };
    throw err;
  }
}

// ---------- API publik ----------

/**
 * Periksa jawaban soal "Faktorkan ...".
 * @param {string} answer  jawaban siswa, mis. "4x(2x+3)"
 * @param {string} target  bentuk soal, mis. "8x^2+12x"
 * @param {object} [opts]
 * @param {boolean} [opts.requireFullyFactored=true]
 * @param {string[]} [opts.acceptForms] bentuk faktor lain yang diterima penuh, mis. ["3x(2x+4)"] (sesuai konteks soal)
 */
export function checkFactorization(answer, target, opts = {}) {
  const { requireFullyFactored = true, acceptForms = [] } = opts;
  const parsed = safeParse(answer);
  if (parsed.error) return { status: 'invalid', code: 'INPUT', message: parsed.error };
  const targetPoly = toPoly(target);
  const expanded = parsed.poly.toString();
  const structure = analyzeStructure(parsed.ast);

  if (!parsed.poly.equals(targetPoly)) {
    return { status: 'wrong', code: diagnoseFactor(structure, parsed.poly, targetPoly), expanded };
  }
  if (!structure.isProduct) return { status: 'not-factored', code: 'NOT_FACTORED', expanded };
  if (acceptForms.some((f) => sameFactorization(structure, analyzeStructure(parse(f))))) {
    return { status: 'correct', code: 'OK', expanded };
  }
  const issue = remainingIssue(structure.multiTerm);
  if (requireFullyFactored && issue) return { status: 'partial', code: issue, expanded };
  return { status: 'correct', code: 'OK', expanded };
}

/** Periksa apakah jawaban setara dengan target (untuk soal memodelkan, mis. luas = y² − 9). */
export function checkEquivalent(answer, target) {
  const parsed = safeParse(answer);
  if (parsed.error) return { status: 'invalid', code: 'INPUT', message: parsed.error };
  const ok = parsed.poly.equals(toPoly(target));
  return { status: ok ? 'correct' : 'wrong', code: ok ? 'OK' : 'M7', expanded: parsed.poly.toString() };
}

/**
 * Hasil perkalian/penyederhanaan yang harus ditulis sebagai bentuk paling sederhana,
 * mis. 3x × 5x = 15x². Jawaban "3x·5x" nilainya sama tetapi belum disederhanakan → NOT_SIMPLE.
 */
export function checkSimplified(answer, target) {
  const parsed = safeParse(answer);
  if (parsed.error) return { status: 'invalid', code: 'INPUT', message: parsed.error };
  const expected = toPoly(target);
  if (!parsed.poly.equals(expected)) return { status: 'wrong', code: 'M7' };
  // Bentuk sederhana = sama persis dengan tulisan baku mesin (mis. "15x^2", "2x+3").
  if (normalizeInput(answer) !== normalizeInput(expected.toString())) {
    return { status: 'partial', code: 'NOT_SIMPLE' };
  }
  return { status: 'correct', code: 'OK' };
}

/** Pembagian suku tunggal, mis. 8x² : 4x. */
export function checkDivision(answer, dividend, divisor) {
  const parsed = safeParse(answer);
  if (parsed.error) return { status: 'invalid', code: 'INPUT', message: parsed.error };
  const a = toPoly(dividend);
  const b = toPoly(divisor);
  const q = a.divideByMonomial(b);
  if (!q) throw new Error(`Soal tidak valid: ${dividend} : ${divisor} tidak bulat`);
  const ans = parsed.poly;
  if (ans.equals(q)) return { status: 'correct', code: 'OK' };
  if (!ans.isMonomial()) return { status: 'wrong', code: 'M7' };

  const [ansKey] = ans.terms.keys();
  const [qKey] = q.terms.keys();
  const [dividendKey] = a.terms.keys();
  const ansCoef = ans.terms.get(ansKey).coef;
  const qCoef = q.terms.get(qKey).coef;
  let code = 'M7';
  if (ansCoef === qCoef) {
    if (qKey === '' && ansKey !== '') code = 'M9'; // 12x : 4x = 3x (lupa x : x = 1)
    else if (ansKey === dividendKey) code = 'M8'; // 8x² : 4x = 2x² (variabel tidak dibagi)
    else if (qKey !== '' && ansKey === '') code = 'M10'; // 8x² : 4x = 2 (variabel ikut habis)
  } else if (ansKey === qKey) {
    code = 'M6'; // variabel benar, koefisien salah (mis. 8 − 4 = 4)
  }
  return { status: 'wrong', code };
}

/** Hasil bagi bentuk aljabar oleh satu suku, mis. (8x² + 12x) : 4x = 2x + 3. */
export function checkQuotient(answer, dividend, divisor) {
  const parsed = safeParse(answer);
  if (parsed.error) return { status: 'invalid', code: 'INPUT', message: parsed.error };
  const target = toPoly(dividend);
  const m = toPoly(divisor);
  const expected = target.divideByMonomial(m);
  if (!expected) throw new Error(`Soal tidak valid: ${dividend} : ${divisor}`);
  if (parsed.poly.equals(expected)) return { status: 'correct', code: 'OK' };
  return { status: 'wrong', code: compareInner(parsed.poly, target, m) };
}

/** FPB dari beberapa suku tunggal, mis. fpb("8x^2", "12x") → "4x". */
export function fpb(...monomials) {
  const terms = monomials.map((s) => {
    const p = toPoly(s);
    if (!p.isMonomial()) throw new Error(`${s} bukan suku tunggal`);
    return p.termList()[0];
  });
  return fpbOfTerms(terms);
}

/**
 * FPB dua bentuk aljabar (cakupan kelas VII): FPB dari faktor persekutuan masing-masing,
 * dikali isi kurung bila isi kurungnya sama persis. Faktor bersuku banyak yang berbeda dianggap
 * tidak punya faktor persekutuan (benar untuk binomial derajat satu yang tidak sama).
 */
export function fpbOfExpressions(exprA, exprB) {
  const a = toPoly(exprA);
  const b = toPoly(exprB);
  const ca = contentOf(a);
  const cb = contentOf(b);
  const common = fpbOfTerms([...ca.termList(), ...cb.termList()]);
  const pa = a.divideByMonomial(ca);
  const pb = b.divideByMonomial(cb);
  if (pa.equals(pb)) return common.mul(pa);
  if (pa.equals(pb.neg())) return common.mul(pa);
  return common;
}

/** Ekspansi untuk tombol "Cek dengan mengalikan". */
export function expand(raw) {
  return toPoly(raw).toString();
}

/** Substitusi nilai: evaluateExpression("x-4", { x: 3 }) → -1 */
export function evaluateExpression(raw, values) {
  return toPoly(raw).evaluateAt(values);
}

/** true jika bentuk termasuk selisih dua kuadrat (aktivitas sortir World 3). */
export function isDifferenceOfSquares(raw) {
  return differenceOfSquares(toPoly(raw)) !== null;
}
