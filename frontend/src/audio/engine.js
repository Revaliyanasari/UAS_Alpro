// AudioManager tunggal (TECHNICAL_ARCHITECTURE §10): kanal musik & efek, volume per kanal.
// - Tidak ada suara sebelum interaksi pertama (unlock dipanggil dari ketukan/tombol).
// - Hanya SATU lagu yang berjalan; berganti lagu memakai crossfade halus.
// - Berhenti saat tab disembunyikan, lanjut saat terlihat lagi.
// - Bila browser/HP menahan audio (pindah aplikasi, telepon, layar terkunci), audio dibangunkan lagi
//   pada ketukan berikutnya; UI dapat menampilkan tombol "Aktifkan suara" (lihat needsGesture/subscribe).
// - Jika Web Audio tidak tersedia/gagal, semua fungsi menjadi diam (aplikasi tetap jalan).
import { TRACKS, midiToFreq } from './music.js';

const LOOKAHEAD = 0.15; // detik penjadwalan ke depan
const TICK_MS = 30;
const FADE_IN = 1.2;
const FADE_OUT = 0.8;
// Penguat per kanal (dinaikkan agar lebih jelas; limiter mencegah pecah). Musik tetap lebih pelan dari efek.
const MUSIC_GAIN = 1.0;
const SFX_GAIN = 1.35;

export function createAudioEngine(createContext = defaultContext) {
  let ctx = null;
  let master, limiter, analyser, musicBus, sfxBus;
  let noise = null;
  let available = true;
  let unlocked = false;
  let current = null; // { name, gain, timer, step, nextTime }
  let desired = null; // lagu yang seharusnya diputar (walau musik dimatikan / belum unlock)
  const prefs = { musicOn: true, sfxOn: true, musicVolume: 0.7, sfxVolume: 0.85 };
  let duckUntil = 0;
  let hidden = false;
  let previewing = false; // "Tes musik" di Pengaturan: putar lagu petualangan sebentar
  let previewTimer = null;
  let speaking = false; // TATA sedang berbicara → musik diredam
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  function ensure() {
    if (ctx || !available) return Boolean(ctx);
    try {
      ctx = createContext();
      if (!ctx) throw new Error('no ctx');
      master = ctx.createGain();
      master.gain.value = 1;
      // Limiter: menahan puncak saat beberapa suara berbunyi bersamaan → lebih keras tanpa pecah (clipping).
      limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 4;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.2;
      master.connect(limiter);
      limiter.connect(ctx.destination);
      // Alat ukur puncak sinyal keluaran (untuk uji "tidak pecah").
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      limiter.connect(analyser);
      musicBus = ctx.createGain();
      sfxBus = ctx.createGain();
      musicBus.connect(master);
      sfxBus.connect(master);
      applyVolumes();
      // Keadaan konteks berubah (mis. diinterupsi iOS) → beri tahu UI agar tombol "Aktifkan suara" muncul.
      ctx.onstatechange = emit;
      return true;
    } catch {
      available = false;
      ctx = null;
      return false;
    }
  }

  function applyVolumes() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const level = current ? TRACKS[current.name].level : 1;
    const voiceDuck = speaking ? 0.35 : 1;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setTargetAtTime(prefs.musicOn ? prefs.musicVolume * level * MUSIC_GAIN * voiceDuck : 0, t, 0.08);
    sfxBus.gain.setTargetAtTime(prefs.sfxOn ? prefs.sfxVolume * SFX_GAIN : 0, t, 0.03);
  }

  // ---------- instrumen ----------
  function voice({ freq, start, dur, type = 'triangle', gain = 0.1, attack = 0.01, release = 0.2, bus, cutoff = 0, detune = 0 }) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    let out = osc;
    if (cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      osc.connect(f);
      out = f;
    }
    out.connect(g);
    g.connect(bus);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.setTargetAtTime(0, start + Math.max(attack, dur - release), release / 3);
    osc.start(start);
    osc.stop(start + dur + release + 0.05);
  }

  function noiseHit(start, gain, bus, dur = 0.05) {
    if (!noise) {
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    const g = ctx.createGain();
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  // ---------- sequencer musik ----------
  function scheduleStep(track, step, t, bus, stepDur) {
    const bar = Math.floor(step / 8) % 4;
    const beat = step % 8;
    const chord = track.chords[bar];
    if (track.pad && beat === 0) {
      for (const n of chord) {
        voice({ freq: midiToFreq(n), start: t, dur: stepDur * 8, type: 'sine', gain: 0.045, attack: 0.35, release: 0.7, bus, cutoff: 1400 });
        voice({ freq: midiToFreq(n), start: t, dur: stepDur * 8, type: 'triangle', gain: 0.02, attack: 0.4, release: 0.7, bus, cutoff: 900, detune: 7 });
      }
    }
    if (track.bassPattern[beat]) {
      voice({ freq: midiToFreq(track.bass[bar]), start: t, dur: stepDur * 1.6, type: 'triangle', gain: 0.13, attack: 0.008, release: 0.15, bus, cutoff: 700 });
    }
    if (track.arp && beat % (track.arpEvery ?? 1) === 0) {
      const n = chord[(beat / (track.arpEvery ?? 1)) % chord.length] + 12;
      voice({ freq: midiToFreq(n), start: t, dur: stepDur * 0.9, type: 'triangle', gain: 0.045, attack: 0.005, release: 0.18, bus, cutoff: 3000 });
    }
    if (track.shaker && beat % 2 === 1) noiseHit(t, track.shakerSoft ? 0.012 : 0.02, bus);
    const m = track.melody?.[step % 32];
    if (m) voice({ freq: midiToFreq(m), start: t, dur: stepDur * 1.8, type: 'square', gain: 0.022, attack: 0.01, release: 0.25, bus, cutoff: 2200 });
    const b = track.bell?.[step % 32];
    if (b) {
      voice({ freq: midiToFreq(b), start: t, dur: stepDur * 4, type: 'sine', gain: 0.05, attack: 0.005, release: 1.2, bus });
      voice({ freq: midiToFreq(b + 12), start: t, dur: stepDur * 2, type: 'sine', gain: 0.012, attack: 0.005, release: 0.8, bus });
    }
  }

  function startTrack(name) {
    const track = TRACKS[name];
    const gain = ctx.createGain();
    gain.connect(musicBus);
    const t0 = ctx.currentTime + 0.05;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(1, t0 + FADE_IN);
    const inst = { name, gain, step: 0, nextTime: t0, timer: null };
    const stepDur = 60 / track.bpm / 2;
    inst.timer = setInterval(() => {
      while (inst.nextTime < ctx.currentTime + LOOKAHEAD) {
        scheduleStep(track, inst.step, inst.nextTime, gain, stepDur);
        inst.step = (inst.step + 1) % 32;
        inst.nextTime += stepDur;
      }
    }, TICK_MS);
    current = inst;
    applyVolumes();
  }

  function stopCurrent() {
    if (!current) return;
    const inst = current;
    current = null;
    clearInterval(inst.timer); // berhenti menjadwalkan nada baru → tidak pernah ada dua lagu berjalan
    const t = ctx.currentTime;
    inst.gain.gain.cancelScheduledValues(t);
    inst.gain.gain.setValueAtTime(inst.gain.gain.value, t);
    inst.gain.gain.linearRampToValueAtTime(0, t + FADE_OUT);
    setTimeout(() => inst.gain.disconnect(), (FADE_OUT + 1.5) * 1000);
  }

  function sync() {
    if (!unlocked || !ctx) return;
    const want = prefs.musicOn ? (desired ?? (previewing ? 'map' : null)) : null;
    if ((current?.name ?? null) === want) return;
    stopCurrent();
    if (want && TRACKS[want]) startTrack(want);
  }

  // ---------- efek suara (semua singkat, ≤ 1,5 detik) ----------
  const SFX = {
    tap: (t) => voice({ freq: 880, start: t, dur: 0.04, type: 'sine', gain: 0.08, release: 0.04, bus: sfxBus }),
    correct: (t) => {
      voice({ freq: midiToFreq(76), start: t, dur: 0.1, type: 'triangle', gain: 0.16, release: 0.12, bus: sfxBus });
      voice({ freq: midiToFreq(83), start: t + 0.09, dur: 0.18, type: 'triangle', gain: 0.16, release: 0.25, bus: sfxBus });
    },
    tryAgain: (t) => {
      // lembut & rendah, tidak "menghukum"
      voice({ freq: midiToFreq(67), start: t, dur: 0.12, type: 'sine', gain: 0.1, release: 0.15, bus: sfxBus });
      voice({ freq: midiToFreq(64), start: t + 0.12, dur: 0.2, type: 'sine', gain: 0.09, release: 0.25, bus: sfxBus });
    },
    xp: (t) => {
      voice({ freq: midiToFreq(88), start: t, dur: 0.06, type: 'square', gain: 0.05, release: 0.05, bus: sfxBus, cutoff: 4000 });
      voice({ freq: midiToFreq(93), start: t + 0.06, dur: 0.12, type: 'square', gain: 0.05, release: 0.15, bus: sfxBus, cutoff: 4000 });
    },
    star: (t) => {
      [84, 88, 91, 96].forEach((n, i) => voice({ freq: midiToFreq(n), start: t + i * 0.07, dur: 0.12, type: 'sine', gain: 0.12, release: 0.4, bus: sfxBus }));
      noiseHit(t + 0.28, 0.03, sfxBus, 0.25);
    },
    unlock: (t) => {
      [67, 71, 74, 79, 83].forEach((n, i) => voice({ freq: midiToFreq(n), start: t + i * 0.06, dur: 0.1, type: 'triangle', gain: 0.1, release: 0.25, bus: sfxBus }));
      voice({ freq: midiToFreq(86), start: t + 0.32, dur: 0.4, type: 'sine', gain: 0.1, release: 0.6, bus: sfxBus });
    },
    victory: (t) => {
      duck(2.4);
      [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36]].forEach(([n, d]) =>
        voice({ freq: midiToFreq(n), start: t + d, dur: 0.14, type: 'square', gain: 0.06, release: 0.12, bus: sfxBus, cutoff: 3000 }),
      );
      [72, 76, 79, 84].forEach((n) => voice({ freq: midiToFreq(n), start: t + 0.55, dur: 0.9, type: 'triangle', gain: 0.07, attack: 0.02, release: 0.6, bus: sfxBus }));
      voice({ freq: midiToFreq(48), start: t + 0.55, dur: 0.9, type: 'triangle', gain: 0.14, release: 0.5, bus: sfxBus });
    },
    // suara khas TATA: "bip-bup" robot kecil yang ramah
    tataHello: (t) => {
      voice({ freq: midiToFreq(79), start: t, dur: 0.07, type: 'sine', gain: 0.12, release: 0.06, bus: sfxBus });
      voice({ freq: midiToFreq(86), start: t + 0.09, dur: 0.1, type: 'sine', gain: 0.12, release: 0.1, bus: sfxBus });
      voice({ freq: midiToFreq(91), start: t + 0.2, dur: 0.12, type: 'sine', gain: 0.1, release: 0.15, bus: sfxBus });
    },
    tataSoft: (t) => {
      voice({ freq: midiToFreq(74), start: t, dur: 0.12, type: 'sine', gain: 0.09, release: 0.12, bus: sfxBus });
      voice({ freq: midiToFreq(79), start: t + 0.14, dur: 0.22, type: 'sine', gain: 0.08, release: 0.3, bus: sfxBus });
    },
  };

  function duck(seconds) {
    if (!ctx || !prefs.musicOn) return;
    const t = ctx.currentTime;
    const level = current ? TRACKS[current.name].level : 1;
    const normal = prefs.musicVolume * level * MUSIC_GAIN;
    duckUntil = t + seconds;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setTargetAtTime(normal * 0.25, t, 0.05);
    musicBus.gain.setTargetAtTime(normal, t + seconds, 0.4);
  }

  return {
    /** Panggil dari interaksi pengguna pertama (aturan autoplay browser). */
    unlock() {
      if (!ensure()) return false;
      // iPhone/iPad: tanpa ini Web Audio ikut bisu saat saklar senyap aktif (Safari 17+).
      try {
        if (typeof navigator !== 'undefined' && navigator.audioSession) navigator.audioSession.type = 'playback';
      } catch {
        /* tidak didukung: abaikan */
      }
      unlocked = true;
      this.resume();
      sync();
      emit();
      return true;
    },
    /** Bangunkan audio yang tertahan. Aman dipanggil di setiap ketukan (tidak berbuat apa-apa bila sudah jalan). */
    resume() {
      if (!ctx || !unlocked || hidden) return;
      if (ctx.state !== 'running' && ctx.state !== 'closed') {
        try {
          const r = ctx.resume?.();
          r?.then?.(emit, emit);
        } catch {
          /* ditolak di luar ketukan: dicoba lagi pada ketukan berikutnya */
        }
      }
    },
    /** true = perlu ketukan pengguna agar suara bisa terdengar (belum diaktifkan atau tertahan browser). */
    needsGesture() {
      if (!available) return false;
      if (!unlocked || !ctx) return true;
      return !hidden && ctx.state !== 'running';
    },
    /** Berlangganan perubahan keadaan audio (untuk tombol "Aktifkan suara"). */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** "Tes musik": bila halaman ini tanpa musik, putar lagu petualangan selama ms. */
    previewMusic(ms = 4000) {
      if (!unlocked || !ctx || !prefs.musicOn) return false;
      this.resume();
      clearTimeout(previewTimer);
      previewing = true;
      sync();
      previewTimer = setTimeout(() => {
        previewing = false;
        sync();
      }, ms);
      return true;
    },
    /** TATA mulai/berhenti berbicara: musik diredam agar suaranya jelas. */
    setSpeaking(on) {
      speaking = Boolean(on);
      applyVolumes();
    },
    /** Lagu yang diinginkan halaman ini (null = tanpa musik). Aman dipanggil berulang. */
    setTrack(name) {
      desired = name && TRACKS[name] ? name : null;
      sync();
    },
    setPrefs(next) {
      Object.assign(prefs, next);
      if (ctx) {
        applyVolumes();
        sync();
      }
    },
    play(name) {
      if (!unlocked || !ctx || !prefs.sfxOn || !SFX[name]) return false;
      this.resume();
      try {
        SFX[name](ctx.currentTime + 0.01);
        return true;
      } catch {
        return false;
      }
    },
    /** Tab disembunyikan → hentikan semua suara; terlihat lagi → lanjut. */
    setHidden(isHidden) {
      hidden = Boolean(isHidden);
      if (!ctx) return;
      if (hidden) ctx.suspend?.();
      else this.resume();
      emit();
    },
    /** Puncak sinyal keluaran (0..1, 1 = batas pecah) selama `ms` milidetik — untuk uji kejernihan. */
    async measurePeak(ms = 1500) {
      if (!analyser) return null;
      const buf = new Float32Array(analyser.fftSize);
      let peak = 0;
      const end = Date.now() + ms;
      while (Date.now() < end) {
        analyser.getFloatTimeDomainData(buf);
        for (const v of buf) peak = Math.max(peak, Math.abs(v));
        await new Promise((r) => setTimeout(r, 20));
      }
      return peak;
    },
    /** Untuk pengujian & diagnosis (tanpa data pribadi). */
    debug: () => ({ available, unlocked, hidden, speaking, previewing, state: ctx?.state ?? null, track: current?.name ?? null, desired, playing: current ? 1 : 0, ducked: ctx ? ctx.currentTime < duckUntil : false, ...prefs }),
  };
}

function defaultContext() {
  const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
  return AC ? new AC() : null;
}

/** Satu mesin audio untuk seluruh aplikasi. */
export const audio = createAudioEngine();
