// Suara TATA (Web Speech API), pemulihan audio yang tertahan, dan tur Beranda.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createVoice, pickVoice, toSpeech } from '../audio/voice.js';
import { createAudioEngine } from '../audio/engine.js';
import Tour from '../components/tour/Tour.jsx';
import LINES from '../content/tata-voice.json';

function fakeSynth(voices) {
  const spoken = [];
  const listeners = {};
  return {
    spoken,
    cancel: vi.fn(),
    speak: (u) => {
      spoken.push(u);
      u.onstart?.();
    },
    getVoices: () => voices,
    addEventListener: (e, fn) => (listeners[e] = fn),
    fire: (e) => listeners[e]?.(),
  };
}
class FakeUtterance {
  constructor(text) {
    this.text = text;
  }
}
const ID_VOICES = [
  { name: 'Microsoft Andika - Indonesian', lang: 'id-ID' },
  { name: 'Google Bahasa Indonesia', lang: 'id-ID' },
  { name: 'Microsoft Gadis Online (Natural) - Indonesian', lang: 'id-ID' },
  { name: 'Google US English', lang: 'en-US' },
];
const immediate = (fn) => fn();

describe('pemilihan suara TATA', () => {
  it('memilih suara Indonesia yang paling natural', () => {
    expect(pickVoice(ID_VOICES).name).toMatch(/Gadis Online \(Natural\)/);
  });
  it('tanpa suara Indonesia → null (TATA tidak memakai suara bahasa lain)', () => {
    expect(pickVoice([{ name: 'Google US English', lang: 'en-US' }])).toBeNull();
    expect(pickVoice([])).toBeNull();
  });
  it('notasi matematika dibacakan sebagai kata', () => {
    expect(toSpeech('x² + 5x = 6 ✔')).toBe('x kuadrat tambah 5x sama dengan 6');
    expect(toSpeech('a² − b²')).toBe('a kuadrat kurang b kuadrat');
  });
});

describe('suara TATA', () => {
  let synth;
  let clock;
  let voice;
  beforeEach(() => {
    synth = fakeSynth(ID_VOICES);
    clock = 0;
    voice = createVoice({ synth, Utterance: FakeUtterance, now: () => clock, later: immediate });
  });

  it('diam sebelum interaksi pertama; setelahnya berbicara dengan suara terpilih', () => {
    expect(voice.say('dashboard')).toBeNull();
    voice.activate();
    expect(voice.say('dashboard')).toBe(LINES.dashboard[0]);
    expect(synth.spoken[0].voice.name).toMatch(/Natural/);
    expect(synth.spoken[0].lang).toBe('id-ID');
    expect(voice.status()).toBe('ready');
  });

  it('sapaan pertama memakai kalimat dari pemilik aplikasi', () => {
    voice.activate();
    expect(voice.say('firstOpen')).toMatch(/^Halo, aku TATA! Teman belajar matematika kamu\./);
  });

  it('kalimat baru menghentikan kalimat sebelumnya (tidak bertumpuk)', () => {
    voice.activate();
    voice.say('lessonStart');
    const before = synth.cancel.mock.calls.length;
    voice.say('quizStart');
    expect(synth.cancel.mock.calls.length).toBeGreaterThan(before);
  });

  it('jeda per situasi mencegah pengulangan; kalimat bergiliran', () => {
    voice.activate();
    expect(voice.say('correct')).toBe(LINES.correct[0]);
    clock += 2000;
    expect(voice.say('correct')).toBeNull(); // masih dalam jeda
    clock += 20_000;
    expect(voice.say('correct')).toBe(LINES.correct[1]);
  });

  it('salah beruntun → TATA menawarkan bantuan (situasi kesulitan)', () => {
    voice.activate();
    expect(LINES.wrong).toContain(voice.say('wrong'));
    clock += 60_000;
    expect(LINES.struggling).toContain(voice.say('wrong'));
  });

  it('dimatikan di pengaturan → diam; ulangi kalimat terakhir; volume dipakai', () => {
    voice.activate();
    voice.setPrefs({ voiceVolume: 0.4 });
    voice.say('quizStart');
    expect(synth.spoken.at(-1).volume).toBeCloseTo(0.4);
    const count = synth.spoken.length;
    expect(voice.replay()).toBe(true);
    expect(synth.spoken.length).toBeGreaterThan(count);
    voice.setPrefs({ voiceOn: false });
    expect(voice.say('reward', { force: true })).toBeNull();
  });

  it('daftar suara dimuat belakangan (voiceschanged)', () => {
    const late = fakeSynth([]);
    const v = createVoice({ synth: late, Utterance: FakeUtterance, later: () => {} });
    expect(v.status()).toBe('checking');
    late.getVoices = () => ID_VOICES;
    late.fire('voiceschanged');
    expect(v.status()).toBe('ready');
  });

  it('browser tanpa Web Speech → status unsupported, tidak error', () => {
    const v = createVoice({});
    expect(v.status()).toBe('unsupported');
    v.activate();
    expect(v.say('dashboard')).toBeNull();
  });
});

describe('pemulihan audio yang tertahan', () => {
  function fakeContext() {
    const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {} });
    const node = () => ({ connect() {}, disconnect() {}, gain: param(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), frequency: param(), Q: param(), fftSize: 2048 });
    const ctx = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createGain: node,
      createDynamicsCompressor: node,
      createAnalyser: node,
      createOscillator: () => ({ ...node(), start() {}, stop() {}, type: '', frequency: param(), detune: param() }),
      createBiquadFilter: node,
      createBuffer: () => ({ getChannelData: () => new Float32Array(10) }),
      createBufferSource: () => ({ ...node(), start() {}, stop() {} }),
      resume: vi.fn(() => {
        ctx.state = 'running';
        return Promise.resolve();
      }),
      suspend: vi.fn(() => {
        ctx.state = 'suspended';
      }),
    };
    return ctx;
  }

  it('audio ditahan HP (interrupted) → perlu ketukan; resume() membangunkannya lagi', () => {
    const ctx = fakeContext();
    const engine = createAudioEngine(() => ctx);
    expect(engine.needsGesture()).toBe(true); // belum diaktifkan
    engine.unlock();
    expect(engine.needsGesture()).toBe(false);
    ctx.state = 'interrupted'; // mis. telepon masuk di iPhone
    expect(engine.needsGesture()).toBe(true);
    engine.resume();
    expect(ctx.resume).toHaveBeenCalled();
    expect(engine.needsGesture()).toBe(false);
  });

  it('tab tersembunyi tidak dianggap "perlu ketukan"; tidak dibangunkan saat tersembunyi', () => {
    const ctx = fakeContext();
    const engine = createAudioEngine(() => ctx);
    engine.unlock();
    ctx.resume.mockClear();
    engine.setHidden(true);
    expect(engine.needsGesture()).toBe(false);
    engine.resume();
    expect(ctx.resume).not.toHaveBeenCalled();
  });

  it('Tes musik memutar lagu sebentar walau halaman tanpa musik; TATA berbicara → musik diredam', () => {
    vi.useFakeTimers();
    const engine = createAudioEngine(() => fakeContext());
    engine.unlock();
    engine.setTrack(null);
    expect(engine.previewMusic(4000)).toBe(true);
    expect(engine.debug().track).toBe('map');
    engine.setSpeaking(true);
    expect(engine.debug().speaking).toBe(true);
    vi.advanceTimersByTime(4100);
    expect(engine.debug().track).toBeNull();
    engine.setPrefs({ musicOn: false });
    expect(engine.previewMusic()).toBe(false);
    vi.useRealTimers();
  });
});

describe('tur Beranda', () => {
  const steps = [
    { title: 'Satu', text: 'Langkah pertama.' },
    { target: '#t2', title: 'Dua', text: 'Langkah kedua.' },
    { title: 'Tiga', text: 'Langkah terakhir.' },
  ];

  it('bisa dilanjutkan, kembali, dan ditutup dengan Selesai', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <>
        <button id="t2">Target</button>
        <Tour steps={steps} onClose={onClose} />
      </>,
    );
    expect(screen.getByRole('dialog', { name: 'Satu' })).toHaveTextContent('Langkah 1 dari 3');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.getByRole('dialog', { name: 'Dua' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kembali' }));
    expect(screen.getByRole('dialog', { name: 'Satu' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.queryByRole('button', { name: 'Lewati tur' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Selesai' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Lewati, ✕, dan Esc menutup tur', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = render(<Tour steps={steps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Lewati tur' }));
    await user.click(screen.getByRole('button', { name: 'Tutup tur' }));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(3);
    unmount();
  });

  it('mengalah pada modal lain: tersembunyi selama ada dialog aria-modal, muncul lagi setelahnya', async () => {
    render(<Tour steps={steps} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Satu' })).toBeInTheDocument();
    const modal = document.createElement('div');
    modal.setAttribute('aria-modal', 'true');
    await act(async () => {
      document.body.appendChild(modal);
    });
    expect(screen.queryByRole('dialog', { name: 'Satu' })).toBeNull();
    await act(async () => {
      modal.remove();
    });
    expect(screen.getByRole('dialog', { name: 'Satu' })).toBeInTheDocument();
  });
});
