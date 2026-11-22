// Logika penilaian Modul Guru (tanpa React): skor rubrik, rekap, indikator, pretest–posttest, CSV.
// Skor setiap soal = jumlah skor tahap rubrik. Nilai akhir = total skor / skor maksimum × 100.

export const INDICATORS = {
  Reasoning: 'Menalar (Mathematical Reasoning)',
  Formulating: 'Merumuskan (Formulating)',
  Employing: 'Menerapkan (Employing)',
  Interpreting: 'Menafsirkan & menilai (Interpreting)',
};

export const STUDENT_CODE = /^[A-Za-z0-9-]{1,12}$/;

export function newId(prefix = 'id') {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

const round1 = (n) => Math.round(n * 10) / 10;

export const itemMax = (item) => item.rubric.reduce((s, r) => s + (Number(r.maxScore) || 0), 0);
export const instrumentMax = (inst) => inst.items.reduce((s, it) => s + itemMax(it), 0);

/** Skor satu soal pada satu hasil (skor tiap tahap dibatasi 0..maks). */
export function itemScore(item, answer) {
  if (!answer) return 0;
  return item.rubric.reduce((s, r) => {
    const v = Number(answer.scores?.[r.id]);
    return s + (Number.isFinite(v) ? Math.min(Math.max(v, 0), Number(r.maxScore) || 0) : 0);
  }, 0);
}

export function resultScore(inst, result) {
  const perItem = inst.items.map((it) => ({ itemId: it.id, score: itemScore(it, result.answers?.[it.id]), max: itemMax(it) }));
  const total = perItem.reduce((s, x) => s + x.score, 0);
  const max = instrumentMax(inst);
  return { perItem, total, max, percent: max ? round1((total / max) * 100) : 0 };
}

/** Rekap per siswa (urut kode siswa). */
export function recapPerStudent(inst, results) {
  return results
    .filter((r) => r.instrumentId === inst.id)
    .map((r) => ({ studentCode: r.studentCode, date: r.date, ...resultScore(inst, r) }))
    .sort((a, b) => a.studentCode.localeCompare(b.studentCode, 'id', { numeric: true }));
}

/** Rekap per soal: rata-rata, % siswa skor penuh, % sebagian, % nol (analisis benar/salah). */
export function recapPerItem(inst, results) {
  const rs = results.filter((r) => r.instrumentId === inst.id);
  return inst.items.map((it) => {
    const max = itemMax(it);
    const scores = rs.map((r) => itemScore(it, r.answers?.[it.id]));
    const n = scores.length;
    const pct = (f) => (n ? round1((scores.filter(f).length / n) * 100) : 0);
    return {
      itemId: it.id,
      number: it.number,
      indicator: it.indicator,
      max,
      n,
      average: n ? round1(scores.reduce((a, b) => a + b, 0) / n) : 0,
      averagePercent: n && max ? round1((scores.reduce((a, b) => a + b, 0) / (n * max)) * 100) : 0,
      fullPercent: pct((s) => max > 0 && s === max),
      partialPercent: pct((s) => s > 0 && s < max),
      zeroPercent: pct((s) => s === 0),
    };
  });
}

/** Ketercapaian setiap indikator literasi = total skor indikator / total maksimum indikator × 100. */
export function indicatorAchievement(inst, results) {
  const rs = results.filter((r) => r.instrumentId === inst.id);
  const acc = {};
  for (const it of inst.items) {
    const key = it.indicator || 'Lainnya';
    acc[key] ??= { indicator: key, score: 0, max: 0 };
    for (const r of rs) {
      acc[key].score += itemScore(it, r.answers?.[it.id]);
      acc[key].max += itemMax(it);
    }
  }
  return Object.values(acc).map((x) => ({ ...x, percent: x.max ? round1((x.score / x.max) * 100) : 0 }));
}

/**
 * Perbandingan pretest–posttest per siswa (dicocokkan lewat kode siswa).
 * N-gain = (post − pre) / (100 − pre); null bila pre = 100.
 */
export function comparePrePost(pre, post, results) {
  const preMap = new Map(recapPerStudent(pre, results).map((r) => [r.studentCode, r.percent]));
  const rows = recapPerStudent(post, results)
    .filter((r) => preMap.has(r.studentCode))
    .map((r) => {
      const p = preMap.get(r.studentCode);
      return { studentCode: r.studentCode, pre: p, post: r.percent, gain: round1(r.percent - p), nGain: p < 100 ? Math.round(((r.percent - p) / (100 - p)) * 100) / 100 : null };
    });
  const avg = (k) => (rows.length ? round1(rows.reduce((s, r) => s + r[k], 0) / rows.length) : 0);
  return { rows, averagePre: avg('pre'), averagePost: avg('post'), averageGain: avg('gain') };
}

// ---------- CSV ----------

/** Satu sel CSV: diberi tanda kutip bila perlu; rumus spreadsheet dinetralkan (=, +, -, @). */
function cell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV dengan pemisah titik koma (cocok untuk Excel berbahasa Indonesia) + BOM agar huruf terbaca. */
export function toCsv(headers, rows) {
  const lines = [headers, ...rows].map((r) => r.map(cell).join(';'));
  return String.fromCharCode(0xfeff) + lines.join('\r\n');
}

export function studentRecapCsv(inst, results) {
  const headers = ['Kode siswa', 'Tanggal', ...inst.items.map((it) => `Soal ${it.number} (maks ${itemMax(it)})`), 'Total', 'Maks', 'Nilai (%)'];
  const rows = recapPerStudent(inst, results).map((r) => [r.studentCode, r.date, ...r.perItem.map((p) => p.score), r.total, r.max, r.percent]);
  return toCsv(headers, rows);
}

export function itemRecapCsv(inst, results) {
  const headers = ['Soal', 'Indikator', 'Skor maks', 'Jumlah siswa', 'Rata-rata', 'Rata-rata (%)', 'Skor penuh (%)', 'Sebagian (%)', 'Nol (%)'];
  const rows = recapPerItem(inst, results).map((r) => [r.number, INDICATORS[r.indicator] ?? r.indicator ?? '', r.max, r.n, r.average, r.averagePercent, r.fullPercent, r.partialPercent, r.zeroPercent]);
  return toCsv(headers, rows);
}

// ---------- Validasi impor ----------

/** Memeriksa instrumen hasil impor JSON; mengembalikan instrumen yang sudah dirapikan atau pesan error. */
export function validateInstrument(raw) {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Berkas bukan instrumen.' };
  if (typeof raw.title !== 'string' || !raw.title.trim()) return { ok: false, error: 'Instrumen harus punya judul.' };
  if (!Array.isArray(raw.items)) return { ok: false, error: 'Instrumen harus punya daftar soal (items).' };
  const items = [];
  for (const [i, it] of raw.items.entries()) {
    if (!it || typeof it.text !== 'string') return { ok: false, error: `Soal ke-${i + 1} tidak punya teks.` };
    const rubric = Array.isArray(it.rubric) ? it.rubric : [];
    for (const r of rubric) {
      if (!Number.isFinite(Number(r.maxScore)) || Number(r.maxScore) < 0) return { ok: false, error: `Skor maksimum rubrik soal ke-${i + 1} tidak valid.` };
    }
    items.push({
      id: it.id || newId('soal'),
      number: it.number ?? i + 1,
      text: it.text,
      topic: it.topic ?? '',
      indicator: INDICATORS[it.indicator] ? it.indicator : '',
      key: it.key ?? '',
      revisionNote: it.revisionNote ?? '',
      rubric: rubric.map((r) => ({ id: r.id || newId('tahap'), label: String(r.label ?? ''), maxScore: Number(r.maxScore), criteria: String(r.criteria ?? '') })),
    });
  }
  return {
    ok: true,
    instrument: {
      id: newId('ins'),
      title: raw.title.trim(),
      kind: ['pretest', 'posttest', 'latihan', 'lainnya'].includes(raw.kind) ? raw.kind : 'lainnya',
      status: raw.status === 'disetujui' ? 'disetujui' : 'draf',
      notes: raw.notes ?? '',
      items,
    },
  };
}
