// Spesifikasi visual 18 ekspresi TATA (orisinal). Setiap ekspresi = kombinasi bagian wajah & pose,
// digambar oleh Tata2D.jsx dalam satu SVG (tanpa file gambar tambahan → aplikasi tetap ringan).
// Nama & keterangan untuk siswa ada di src/content/tata-expressions.json.
//
// eyes : open | happy | closed | tight | wink | wide | star | heart | sleepy | narrow | lookUp | sad | uneven | down
// mouth: smile | grin | laugh | small | o | bigO | flat | wavy | frown | smirk | side | talk
// brows: none | raised | worried | focused | flat
// arms : rest | wave | up | chin | pointUp | hug | hips | cover | droop
// extra: daftar aksesori: sparks | question | bulb | zzz | hearts | sweat | tear | exclaim | dots | star | blush
// anim : breathe | hop | hopOnce | wave | bounce | shake | sway | float | pulse | tilt | droop | none
// base : state terdekat untuk versi 3D (hanya punya 6 state)

export const EXPRESSIONS = {
  happy: { eyes: 'happy', mouth: 'grin', brows: 'none', arms: 'rest', extra: [], anim: 'hopOnce', base: 'happy' },
  calm: { eyes: 'closed', mouth: 'small', brows: 'none', arms: 'rest', extra: [], anim: 'breathe', base: 'idle' },
  cheer: { eyes: 'happy', mouth: 'laugh', brows: 'none', arms: 'up', extra: ['sparks'], anim: 'hop', base: 'celebrating' },
  wave: { eyes: 'open', mouth: 'smile', brows: 'none', arms: 'wave', extra: [], anim: 'breathe', base: 'waving' },
  wink: { eyes: 'wink', mouth: 'smirk', brows: 'none', arms: 'rest', extra: ['star'], anim: 'bounce', base: 'happy' },
  love: { eyes: 'heart', mouth: 'smile', brows: 'none', arms: 'hug', extra: ['hearts'], anim: 'pulse', base: 'happy' },
  amazed: { eyes: 'star', mouth: 'o', brows: 'raised', arms: 'rest', extra: ['sparks'], anim: 'float', base: 'happy' },
  laugh: { eyes: 'tight', mouth: 'laugh', brows: 'none', arms: 'rest', extra: ['tear'], anim: 'shake', base: 'happy' },
  thinking: { eyes: 'lookUp', mouth: 'side', brows: 'raised', arms: 'chin', extra: ['dots'], anim: 'sway', base: 'idle' },
  idea: { eyes: 'wide', mouth: 'grin', brows: 'raised', arms: 'pointUp', extra: ['bulb'], anim: 'bounce', base: 'happy' },
  confused: { eyes: 'uneven', mouth: 'wavy', brows: 'worried', arms: 'rest', extra: ['question'], anim: 'tilt', base: 'confused' },
  surprised: { eyes: 'wide', mouth: 'bigO', brows: 'raised', arms: 'up', extra: ['exclaim'], anim: 'hopOnce', base: 'confused' },
  sad: { eyes: 'sad', mouth: 'frown', brows: 'worried', arms: 'droop', extra: ['tear'], anim: 'droop', base: 'confused' },
  sleepy: { eyes: 'sleepy', mouth: 'o', brows: 'none', arms: 'droop', extra: ['zzz'], anim: 'droop', base: 'idle' },
  shy: { eyes: 'happy', mouth: 'small', brows: 'worried', arms: 'cover', extra: ['blush'], anim: 'sway', base: 'happy' },
  disappointed: { eyes: 'down', mouth: 'flat', brows: 'flat', arms: 'droop', extra: ['sweat'], anim: 'none', base: 'confused' },
  focused: { eyes: 'narrow', mouth: 'flat', brows: 'focused', arms: 'rest', extra: [], anim: 'none', base: 'idle' },
  proud: { eyes: 'happy', mouth: 'smile', brows: 'raised', arms: 'hips', extra: ['star', 'sparks'], anim: 'bounce', base: 'happy' },
};

/** Urutan tampil di galeri (sesuai daftar permintaan). */
export const EXPRESSION_ORDER = [
  'happy', 'calm', 'cheer', 'wave', 'wink', 'love', 'amazed', 'laugh', 'thinking',
  'idea', 'confused', 'surprised', 'sad', 'sleepy', 'shy', 'disappointed', 'focused', 'proud',
];

/**
 * Nama state lama (dipakai sejak Fase 2) tetap berlaku agar tidak ada layar yang rusak.
 * 'talking' = wajah tenang dengan mulut bergerak.
 */
const LEGACY = {
  idle: { ...EXPRESSIONS.calm, eyes: 'open', mouth: 'smile', base: 'idle' },
  waving: EXPRESSIONS.wave,
  talking: { ...EXPRESSIONS.calm, eyes: 'open', mouth: 'talk', anim: 'none', base: 'talking' },
  celebrating: EXPRESSIONS.cheer,
};

export function resolveExpression(name) {
  return EXPRESSIONS[name] ?? LEGACY[name] ?? LEGACY.idle;
}

/** State 3D terdekat (Tata3D hanya mengenal idle/waving/talking/happy/confused/celebrating). */
export function baseStateOf(name) {
  return resolveExpression(name).base;
}
