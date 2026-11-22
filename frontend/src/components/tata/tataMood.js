// Memilih ekspresi TATA dari situasi belajar, agar TATA terasa hidup dan responsif.
// Prinsip (LEARNING_DESIGN §5.2 + RMT/MLE): TATA tidak pernah menghukum. Kesalahan dijawab dengan
// semangat → ajakan berpikir → empati, bukan wajah sedih/kecewa (dua ekspresi itu hanya di galeri).

/**
 * @param {string} event  situasi belajar
 * @param {object} [ctx]  { firstTry, attempt, percent }
 * @returns {string} nama ekspresi (lihat tataExpressions.js)
 */
export function moodFor(event, ctx = {}) {
  switch (event) {
    case 'welcome':
    case 'missionStart':
      return 'wave';
    case 'idle':
      return 'calm';
    case 'idleLong':
      return 'sleepy';
    case 'explain':
      return 'talking';
    case 'tip':
      return 'wink';
    case 'hint':
      return 'focused';
    case 'correct':
      return ctx.firstTry ? 'cheer' : 'happy';
    case 'wrong': {
      const n = ctx.attempt ?? 1;
      if (n <= 1) return 'love'; // "tidak apa-apa, ayo coba lagi"
      if (n === 2) return 'thinking'; // ajak berpikir bersama
      return 'confused'; // empati: saatnya minta petunjuk
    }
    case 'incomplete':
      return 'surprised';
    case 'solution':
      return 'idea';
    case 'discover':
      return 'amazed';
    case 'nameSaved':
      return 'shy';
    case 'lessonDone':
      return 'proud';
    case 'quizResult': {
      const p = ctx.percent ?? 0;
      if (p >= 100) return 'cheer';
      if (p >= 60) return 'proud';
      return 'love';
    }
    default:
      return 'calm';
  }
}

/** Ekspresi default dari nada umpan balik lama ('happy' | 'confused' | 'neutral'). */
export function moodFromTone(tone, hintShown = false) {
  if (tone === 'happy') return 'happy';
  if (tone === 'confused') return 'love';
  return hintShown ? 'focused' : 'talking';
}
