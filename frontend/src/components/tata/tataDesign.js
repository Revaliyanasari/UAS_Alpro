// Satu sumber desain TATA untuk versi 2D (SVG) dan 3D (three.js) agar keduanya identik.
// Warna diambil dari token CSS (src/styles/tokens.css) saat dijalankan — tidak ada hex ganda.

export const TATA_STATES = ['idle', 'waving', 'talking', 'happy', 'confused', 'celebrating'];

/** Token warna yang dipakai TATA. */
export const TATA_COLOR_TOKENS = {
  body: '--teal-400',
  bodyShade: '--teal-500',
  screen: '--cream-50',
  ink: '--ink-900',
  cheek: '--peach-300',
  leaf: '--sage-500',
  stem: '--sage-700',
  foot: '--beige-300',
  tile: '--butter-300',
};

/** Membaca nilai warna token (untuk three.js yang tidak bisa memakai var()). */
export function readTataColors() {
  const style = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const out = {};
  for (const [key, token] of Object.entries(TATA_COLOR_TOKENS)) {
    out[key] = style?.getPropertyValue(token).trim() || '#888888';
  }
  return out;
}

// Proporsi tampak depan (satuan: lebar badan = 1). Dipakai SVG (dikali 120 px) dan 3D (satuan dunia).
export const TATA_SHAPE = {
  body: { width: 1, height: 0.92, depth: 0.82, radius: 0.24 },
  screen: { width: 0.7, height: 0.52, offsetY: 0.04, radius: 0.13 },
  eye: { radius: 0.06, offsetX: 0.15, offsetY: 0.08 },
  cheek: { rx: 0.075, ry: 0.045, offsetX: 0.26, offsetY: -0.06 },
  mouth: { width: 0.18, offsetY: -0.07 },
  stem: { height: 0.2 },
  leaf: { rx: 0.13, ry: 0.06, offsetX: 0.11 },
  arm: { length: 0.36, thickness: 0.12 },
  foot: { rx: 0.15, ry: 0.07, offsetX: 0.22 },
};
