// Suara TATA memakai Web Speech API (speechSynthesis) bawaan browser — tanpa server, tanpa biaya.
// - Memilih suara berbahasa Indonesia yang paling natural (Natural/Online/Google lebih dulu).
//   Bila perangkat tidak punya suara Indonesia, TATA diam (tidak memakai logat bahasa lain).
// - Menangani daftar suara yang dimuat belakangan (event "voiceschanged").
// - Hanya satu kalimat pada satu waktu: kalimat baru menghentikan kalimat sebelumnya.
// - Jeda per situasi (cooldown) agar tidak berulang-ulang, misalnya saat menjawab beruntun.
// - Musik diredam saat TATA berbicara (onSpeaking → audio.setSpeaking).
// - Tidak berbicara sebelum interaksi pertama (aturan autoplay) dan berhenti saat tab disembunyikan.
import LINES from '../content/tata-voice.json';

// Jeda minimum (ms) sebelum situasi yang sama boleh diucapkan lagi.
const COOLDOWN = {
  firstOpen: 0,
  dashboard: 5 * 60_000,
  lessonStart: 60_000,
  quizStart: 60_000,
  correct: 12_000,
  wrong: 10_000,
  struggling: 30_000,
  reward: 8_000,
  worldUnlocked: 0,
  levelComplete: 0,
  tryAgainResult: 0,
  test: 0,
};
const STRUGGLE_AFTER = 2; // salah beruntun sebelum TATA menawarkan bantuan

/** Ubah notasi matematika menjadi kata agar dibaca dengan benar ("x²" → "x kuadrat"). */
export function toSpeech(text) {
  return String(text ?? '')
    .replace(/\p{Extended_Pictographic}|️/gu, ' ')
    .replace(/\^2|²/g, ' kuadrat ')
    .replace(/\^3|³/g, ' pangkat tiga ')
    .replace(/\s[−-]\s|−/g, ' kurang ')
    .replace(/\+/g, ' tambah ')
    .replace(/[×·]/g, ' kali ')
    .replace(/=/g, ' sama dengan ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Skor kecocokan suara untuk TATA (semakin besar semakin baik). Bukan bahasa Indonesia → -1. */
export function scoreVoice(v) {
  const lang = String(v?.lang ?? '').toLowerCase().replace('_', '-');
  if (!lang.startsWith('id') && !lang.startsWith('in-')) return -1;
  const name = String(v.name ?? '');
  let score = 1;
  if (/natural/i.test(name)) score += 6;
  if (/online/i.test(name)) score += 4;
  if (/google/i.test(name)) score += 3;
  if (/gadis|female|wanita|damayanti/i.test(name)) score += 1; // suara lebih ringan cocok untuk TATA
  if (lang === 'id-id') score += 1;
  return score;
}

export function pickVoice(voices) {
  let best = null;
  let bestScore = -1;
  for (const v of voices ?? []) {
    const s = scoreVoice(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return bestScore > 0 ? best : null;
}

/** Pecah teks panjang menjadi kalimat (Chrome memotong ucapan panjang pada suara online). */
function chunks(text) {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function createVoice({ synth, Utterance, lines = LINES, now = () => Date.now(), later = (fn, ms) => setTimeout(fn, ms) } = {}) {
  const supported = Boolean(synth && Utterance);
  let voice = null;
  let ready = false; // daftar suara sudah dibaca
  let active = false; // sudah ada interaksi pengguna
  let hidden = false;
  let token = 0; // menandai ucapan terbaru (yang lama diabaikan)
  let lastText = '';
  let wrongStreak = 0;
  const lastAt = {};
  const lastIndex = {};
  const prefs = { voiceOn: true, voiceVolume: 0.9 };
  const speakingListeners = new Set();
  const changeListeners = new Set();
  let speaking = false;

  const setSpeaking = (on) => {
    if (speaking === on) return;
    speaking = on;
    speakingListeners.forEach((fn) => fn(on));
  };
  const changed = () => changeListeners.forEach((fn) => fn());

  function loadVoices() {
    if (!supported) return;
    const list = synth.getVoices?.() ?? [];
    if (list.length) {
      voice = pickVoice(list);
      ready = true;
      changed();
    }
  }
  if (supported) {
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
    // Beberapa browser tidak pernah mengirim "voiceschanged": anggap siap setelah 2 detik.
    later(() => {
      loadVoices();
      if (!ready) {
        ready = true;
        changed();
      }
    }, 2000);
  }

  function stop() {
    token += 1;
    if (supported) synth.cancel();
    setSpeaking(false);
  }

  /** Ucapkan teks. Mengembalikan true bila benar-benar dijadwalkan untuk diucapkan. */
  function speak(text, { force = false } = {}) {
    const spoken = toSpeech(text);
    if (!spoken || !supported || !voice || !prefs.voiceOn || hidden || (!active && !force)) return false;
    stop();
    lastText = text;
    const my = token;
    const parts = chunks(spoken);
    // Jeda singkat setelah cancel(): Chrome kadang mengabaikan speak() yang langsung menyusul cancel().
    later(() => {
      if (my !== token) return;
      parts.forEach((part, i) => {
        const u = new Utterance(part);
        u.voice = voice;
        u.lang = voice.lang || 'id-ID';
        u.pitch = 1.2; // sedikit lebih tinggi: karakter robot kecil yang ramah
        u.rate = 1;
        u.volume = Math.max(0, Math.min(1, prefs.voiceVolume));
        if (i === 0) u.onstart = () => my === token && setSpeaking(true);
        if (i === parts.length - 1) {
          u.onend = () => my === token && setSpeaking(false);
        }
        u.onerror = () => my === token && setSpeaking(false);
        synth.speak(u);
      });
    }, 60);
    return true;
  }

  /** Kalimat situasional (bergiliran, dengan jeda per situasi). Mengembalikan teks yang diucapkan atau null. */
  function say(situation, { force = false } = {}) {
    let key = situation;
    if (key === 'wrong') {
      wrongStreak += 1;
      if (wrongStreak >= STRUGGLE_AFTER) {
        key = 'struggling';
        wrongStreak = 0;
      }
    } else if (key === 'correct') {
      wrongStreak = 0;
    }
    const list = lines[key];
    if (!list?.length) return null;
    const t = now();
    if (!force && lastAt[key] != null && t - lastAt[key] < (COOLDOWN[key] ?? 10_000)) return null;
    if (key === 'firstOpen' && !force && lastAt.firstOpen != null) return null;
    const i = ((lastIndex[key] ?? -1) + 1) % list.length;
    const text = list[i];
    if (!speak(text, { force })) return null;
    lastIndex[key] = i;
    lastAt[key] = t;
    return text;
  }

  return {
    supported,
    speak,
    say,
    stop,
    /** Ulangi kalimat terakhir (tombol "Dengarkan lagi"). */
    replay: () => (lastText ? speak(lastText, { force: true }) : false),
    /** Dipanggil pada interaksi pertama pengguna. */
    activate: () => {
      active = true;
    },
    setPrefs(next) {
      Object.assign(prefs, next);
      if (!prefs.voiceOn) stop();
    },
    setHidden(isHidden) {
      hidden = Boolean(isHidden);
      if (hidden) stop();
    },
    onSpeaking(fn) {
      speakingListeners.add(fn);
      return () => speakingListeners.delete(fn);
    },
    subscribe(fn) {
      changeListeners.add(fn);
      return () => changeListeners.delete(fn);
    },
    /** 'checking' | 'ready' | 'no-voice' | 'unsupported' */
    status: () => (!supported ? 'unsupported' : !ready ? 'checking' : voice ? 'ready' : 'no-voice'),
    voiceName: () => voice?.name ?? null,
    isSpeaking: () => speaking,
    lastText: () => lastText,
  };
}

const hasWindow = typeof window !== 'undefined';
/** Satu suara TATA untuk seluruh aplikasi. */
export const tataVoice = createVoice({
  synth: hasWindow ? window.speechSynthesis : undefined,
  Utterance: hasWindow ? window.SpeechSynthesisUtterance : undefined,
});
