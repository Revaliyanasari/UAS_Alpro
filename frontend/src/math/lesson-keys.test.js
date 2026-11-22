// Semua kunci di file pelajaran (src/content/lessons/*.json) dan kuis (src/content/quizzes/*.json)
// diuji dengan mesin pemeriksa — tidak ada kunci yang ditulis "dari kepala".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { checkFactorization, checkEquivalent, checkDivision, checkQuotient, checkSimplified, fpb } from './checker.js';
import { toPoly } from './parser.js';
import { keyOf as termKey } from './polynomial.js';

const readDir = (rel) => {
  const dir = new URL(rel, import.meta.url);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(new URL(f, dir), 'utf8')) }));
};

/** Kunci yang dipakai siswa: jawaban yang ditulis di konten (key/answer) harus dinilai benar. */
function assertCheck(c, written) {
  if (c.kind === 'factor') {
    if (written) assert.equal(checkFactorization(written, c.target).status, 'correct', `${written} untuk ${c.target}`);
    assert.ok(toPoly(c.target).size >= 2);
  }
  if (c.kind === 'equivalent') assert.equal(checkEquivalent(written ?? c.target, c.target).status, 'correct');
  if (c.kind === 'simplified') assert.equal(checkSimplified(toPoly(c.target).toString(), c.target).status, 'correct');
  if (c.kind === 'division') {
    const q = toPoly(c.dividend).divideByMonomial(toPoly(c.divisor));
    assert.ok(q && q.isMonomial(), `${c.dividend} : ${c.divisor} harus bulat`);
    if (written) assert.equal(checkDivision(written, c.dividend, c.divisor).status, 'correct', `${written}`);
  }
  if (c.kind === 'quotient') {
    assert.ok(toPoly(c.dividend).divideByMonomial(toPoly(c.divisor)), `${c.dividend} : ${c.divisor} harus bulat`);
    if (written) assert.equal(checkQuotient(written, c.dividend, c.divisor).status, 'correct');
  }
}

/** Kartu sortir: keranjang harus sesuai aturan matematis (koefisien / suku sejenis). */
function assertSort(s) {
  const binIds = s.bins.map((b) => b.id);
  for (const it of s.items) {
    assert.ok(binIds.includes(it.bin), `keranjang ${it.bin} tidak ada`);
    const [t] = toPoly(it.expr).termList();
    if (s.rule === 'coefficient') assert.equal(t.coef, Number(it.bin), `koefisien ${it.expr}`);
    if (s.rule === 'like-terms') assert.equal(termKey(t.vars), termKey(toPoly(it.bin).termList()[0].vars), `jenis ${it.expr}`);
  }
}

function assertTiles(s) {
  assert.ok(s.x2 % s.count === 0 && s.x % s.count === 0, 'ubin harus bisa dibagi rata');
}

for (const { file, data } of readDir('../content/lessons/')) {
  data.screens.forEach((s, i) => {
    const name = `pelajaran ${file} #${i + 1} (${s.type})`;
    if (s.type === 'input') {
      test(`${name}: kunci lulus pemeriksa`, () => {
        assertCheck(s.check, s.check.key);
        assert.equal(s.hints.length, 3, 'harus ada 3 petunjuk');
        assert.ok(s.solution.length > 0);
      });
    }
    if (s.type === 'choice') test(`${name}: jawaban ada di pilihan`, () => assert.ok(s.options.includes(s.answer)));
    if (s.type === 'divider') test(`${name}: pembagian bulat`, () => assert.ok(toPoly(s.dividend).divideByMonomial(toPoly(s.divisor))));
    if (s.type === 'board') test(`${name}: target dapat difaktorkan`, () => assert.ok(toPoly(s.target).size >= 2));
    if (s.type === 'sort') test(`${name}: kartu di keranjang yang benar`, () => assertSort(s));
    if (s.type === 'identify') test(`${name}: analisis tugas punya diketahui & ditanya`, () => {
      const bins = s.items.map((it) => it.bin);
      assert.ok(bins.includes('known') && bins.includes('asked'));
      for (const b of bins) assert.ok(s.bins.some((x) => x.id === b));
      assert.equal(s.hints.length, 3);
    });
    if (s.type === 'reflect') test(`${name}: setiap pertanyaan refleksi punya pilihan baik & tanggapan`, () => {
      for (const q of s.questions) {
        assert.ok(q.options.some((o) => o.good));
        for (const o of q.options) assert.ok(o.feedback.length > 0);
      }
    });
    if (s.type === 'tiles') test(`${name}: ubin bisa dibagi rata`, () => assertTiles(s));
    if (s.type === 'faded') {
      test(`${name}: setiap kotak lulus pemeriksa`, () => {
        for (const b of s.blanks) assertCheck(b.check, b.answer);
      });
    }
    if (s.type === 'order') test(`${name}: ada 3 petunjuk & langkah unik`, () => {
      assert.equal(s.hints.length, 3);
      assert.equal(new Set(s.steps).size, s.steps.length);
    });
  });
}

for (const { file, data } of readDir('../content/quizzes/')) {
  test(`kuis ${file}: 5 soal, masing-masing ≥ 2 varian`, () => {
    assert.equal(data.slots.length, 5);
    for (const slot of data.slots) assert.ok(slot.variants.length >= 2);
  });
  data.slots.forEach((slot, si) =>
    slot.variants.forEach((q, vi) => {
      const name = `kuis ${file} soal ${si + 1} varian ${vi + 1} (${q.type})`;
      test(`${name}: kunci benar & ada pembahasan`, () => {
        assert.ok(q.solution?.length > 0, 'pembahasan wajib');
        assert.ok((q.hints ?? []).length <= 2, 'kuis tanpa petunjuk tingkat 3');
        if (q.type === 'choice') {
          assert.ok(q.options.includes(q.answer));
          if (q.verify) {
            const same = toPoly(q.verify.lhs).equals(toPoly(q.verify.rhs));
            assert.equal(q.answer, same ? 'Benar' : 'Salah');
          }
        }
        if (q.type === 'input') {
          assert.ok(q.key, 'kunci tampilan wajib');
          assertCheck(q.check, q.key);
        }
        if (q.type === 'sort') assertSort(q);
        if (q.type === 'tiles') assertTiles(q);
      });
    }),
  );
}

test('FPB pada pelajaran World 1 sesuai mesin', () => {
  assert.equal(fpb('6x^2', '9x').toString(), '3x');
  assert.equal(fpb('16x^2', '24x').toString(), '8x');
  assert.equal(fpb('14x^2', '21x').toString(), '7x');
  assert.equal(fpb('10y^2', '15y').toString(), '5y');
  assert.equal(fpb('18x^2', '12x').toString(), '6x');
  assert.equal(fpb('20y^2', '30y').toString(), '10y');
  assert.equal(checkDivision('5x', '15x^2', '3x').status, 'correct');
});

test('checkSimplified: nilai sama tapi belum disederhanakan → NOT_SIMPLE', () => {
  assert.equal(checkSimplified('15x^2', '15x^2').status, 'correct');
  assert.equal(checkSimplified('15x²', '15x^2').status, 'correct');
  assert.equal(checkSimplified('3x*5x', '15x^2').code, 'NOT_SIMPLE');
  assert.equal(checkSimplified('15x', '15x^2').code, 'M7');
  assert.equal(checkSimplified('2x+3', '2x+3').status, 'correct');
});
