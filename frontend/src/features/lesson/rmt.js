// Penerapan Rigorous Mathematical Thinking (RMT) di pemutar pelajaran.
// Sumber: ringkasan buku Kinard & Kozulin dari dosen (lihat docs/RMT_DESIGN.md dan src/content/rmt.json).
import rmt from '../../content/rmt.json';

/**
 * Fase fungsi kognitif (Input / Elaborasi / Output — Bab 4 §3) yang dilatih sebuah layar.
 * Bawaan per jenis layar; file konten boleh menimpa lewat screen.rmt.phase.
 */
const DEFAULT_PHASE = {
  info: 'input',
  example: 'input',
  identify: 'input',
  sort: 'elaborasi',
  commonFactors: 'elaborasi',
  factorPairs: 'elaborasi',
  tiles: 'elaborasi',
  board: 'elaborasi',
  divider: 'elaborasi',
  faded: 'elaborasi',
  order: 'elaborasi',
  choice: 'elaborasi',
  input: 'output',
  reflect: 'output',
  cutSlide: 'elaborasi',
};

export function phaseOf(screen) {
  return screen.rmt?.phase ?? DEFAULT_PHASE[screen.type] ?? null;
}

export function phaseInfo(phase) {
  return phase ? rmt.phases[phase] : null;
}

/** Fase kognitif yang perlu diperiksa untuk sebuah kode kesalahan (diagnosis RMT, Bab 5 §4). */
export function diagnoseError(code) {
  return rmt.errorPhase[code] ?? null;
}
