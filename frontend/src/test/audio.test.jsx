// Audio: tidak berbunyi sebelum interaksi, satu lagu saja, mute, lagu per halaman, preferensi tersimpan,
// gagal-aman bila Web Audio tidak ada, dan suara terpicu dari tombol & respons TATA.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createAudioEngine, audio } from '../audio/engine.js';
import { trackForPath } from '../audio/index.js';
import { TRACKS } from '../audio/music.js';
import AudioButton from '../audio/AudioButton.jsx';
import Button from '../components/ui/Button.jsx';
import TataCoach from '../features/lesson/TataCoach.jsx';
import { useSettings } from '../store/settingsStore.js';
import { idbStorage } from '../store/storage.js';

/** AudioContext tiruan: mencatat oscillator yang dibuat, tanpa speaker. */
function fakeContext() {
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  const node = (extra = {}) => ({ connect() {}, disconnect() {}, ...extra });
  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    state: 'suspended',
    destination: node(),
    oscillators: 0,
    createGain: () => node({ gain: param() }),
    createOscillator: () => {
      ctx.oscillators += 1;
      return node({ type: '', frequency: param(), detune: param(), start() {}, stop() {} });
    },
    createBiquadFilter: () => node({ type: '', frequency: param() }),
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }),
    createBufferSource: () => node({ buffer: null, start() {}, stop() {} }),
    resume() {
      ctx.state = 'running';
    },
    suspend() {
      ctx.state = 'suspended';
    },
  };
  return ctx;
}

describe('mesin audio', () => {
  let ctx;
  let engine;
  beforeEach(() => {
    vi.useFakeTimers();
    ctx = fakeContext();
    engine = createAudioEngine(() => ctx);
  });
  afterEach(() => vi.useRealTimers());

  it('tidak berbunyi sebelum interaksi pertama (aturan autoplay)', () => {
    engine.setTrack('welcome');
    expect(engine.play('tap')).toBe(false);
    vi.advanceTimersByTime(500);
    expect(engine.debug()).toMatchObject({ unlocked: false, track: null, desired: 'welcome' });
    expect(ctx.oscillators).toBe(0);
  });

  it('setelah interaksi: lagu halaman diputar & efek suara berbunyi', () => {
    engine.setTrack('welcome');
    expect(engine.unlock()).toBe(true);
    expect(ctx.state).toBe('running');
    vi.advanceTimersByTime(100);
    expect(engine.debug()).toMatchObject({ track: 'welcome', playing: 1 });
    expect(ctx.oscillators).toBeGreaterThan(0);
    expect(engine.play('correct')).toBe(true);
  });

  it('berganti halaman: hanya SATU lagu yang menjadwalkan nada (tidak bertumpuk)', () => {
    const set = vi.spyOn(globalThis, 'setInterval');
    const clear = vi.spyOn(globalThis, 'clearInterval');
    engine.unlock();
    for (const t of ['welcome', 'map', 'lesson', 'quiz', 'map', 'map']) engine.setTrack(t);
    expect(set.mock.calls.length - clear.mock.calls.length).toBe(1);
    expect(engine.debug()).toMatchObject({ track: 'map', playing: 1 });
  });

  it('mute musik menghentikan lagu; menyalakan lagi memutar lagu halaman ini', () => {
    engine.unlock();
    engine.setTrack('map');
    engine.setPrefs({ musicOn: false });
    expect(engine.debug().track).toBeNull();
    engine.setTrack('lesson'); // pindah halaman saat musik mati → tetap hening
    expect(engine.debug().track).toBeNull();
    engine.setPrefs({ musicOn: true });
    expect(engine.debug().track).toBe('lesson');
  });

  it('efek suara bisa dimatikan terpisah dari musik', () => {
    engine.unlock();
    engine.setPrefs({ sfxOn: false });
    expect(engine.play('star')).toBe(false);
    engine.setPrefs({ sfxOn: true });
    for (const name of ['tap', 'correct', 'tryAgain', 'xp', 'star', 'unlock', 'victory', 'tataHello', 'tataSoft']) {
      expect(engine.play(name), name).toBe(true);
    }
    expect(engine.play('tidak-ada')).toBe(false);
  });

  it('lagu kemenangan menurunkan volume musik sementara (tidak bertabrakan)', () => {
    engine.unlock();
    engine.setTrack('map');
    engine.play('victory');
    expect(engine.debug().ducked).toBe(true);
  });

  it('tab disembunyikan → suara berhenti; terlihat lagi → lanjut', () => {
    engine.unlock();
    engine.setHidden(true);
    expect(ctx.state).toBe('suspended');
    engine.setHidden(false);
    expect(ctx.state).toBe('running');
  });

  it('Web Audio tidak tersedia / gagal → diam, aplikasi tetap jalan', () => {
    const broken = createAudioEngine(() => {
      throw new Error('tidak didukung');
    });
    expect(broken.unlock()).toBe(false);
    expect(() => broken.setTrack('map')).not.toThrow();
    expect(broken.play('tap')).toBe(false);
    expect(broken.debug().available).toBe(false);
    expect(createAudioEngine(() => null).unlock()).toBe(false);
  });
});

describe('lagu per halaman', () => {
  it('pembuka, peta, belajar, kuis', () => {
    expect(trackForPath('/')).toBe('welcome');
    expect(trackForPath('/identitas')).toBe('welcome');
    expect(trackForPath('/peta')).toBe('map');
    expect(trackForPath('/belajar/2')).toBe('lesson');
    expect(trackForPath('/kuis/1')).toBe('quiz');
    expect(trackForPath('/pengaturan')).toBeUndefined(); // lagu sebelumnya berlanjut
    expect(trackForPath('/guru')).toBeNull();
  });

  it('opsi hening saat belajar & kuis', () => {
    expect(trackForPath('/belajar/1', false)).toBeNull();
    expect(trackForPath('/kuis/1', false)).toBeNull();
    expect(trackForPath('/peta', false)).toBe('map');
  });

  it('lagu belajar lebih pelan & tanpa melodi agar tidak mengganggu konsentrasi', () => {
    expect(TRACKS.lesson.level).toBeLessThan(TRACKS.map.level);
    expect(TRACKS.lesson.melody).toBeNull();
    expect(TRACKS.quiz.melody).toBeNull();
    for (const t of Object.values(TRACKS)) {
      expect(t.chords).toHaveLength(4);
      if (t.melody) expect(t.melody).toHaveLength(32);
    }
  });
});

describe('pengaturan suara', () => {
  beforeEach(() => useSettings.setState({ musicOn: true, sfxOn: true, musicVolume: 0.5, sfxVolume: 0.7, focusMusic: true }));

  it('tombol speaker membuka panel; sakelar & volume tersimpan di perangkat', async () => {
    const user = userEvent.setup();
    render(<AudioButton />);
    await user.click(screen.getByRole('button', { name: 'Pengaturan suara' }));
    expect(screen.getByRole('dialog', { name: 'Suara' })).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Musik latar/));
    await user.click(screen.getByLabelText(/Efek suara/));
    expect(useSettings.getState()).toMatchObject({ musicOn: false, sfxOn: false });
    expect(screen.getByRole('button', { name: /suara mati/ })).toHaveTextContent('🔇');
    await user.click(screen.getByLabelText(/Musik latar/));
    const slider = screen.getByLabelText('Volume musik');
    fireEvent.change(slider, { target: { value: '60' } }); // jsdom tidak mensimulasikan tombol panah pada slider
    expect(useSettings.getState().musicVolume).toBeCloseTo(0.6);
    expect(await idbStorage.getItem('aa-settings')).toMatch(/"musicOn":true.*"sfxOn":false/);
  });
});

describe('suara dari interaksi', () => {
  afterEach(() => vi.restoreAllMocks());

  it('tombol berbunyi ketuk; bisa dimatikan per tombol', async () => {
    const play = vi.spyOn(audio, 'play');
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Button>Lanjut</Button>
        <Button sound={false}>Diam</Button>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(play).toHaveBeenCalledWith('tap');
    play.mockClear();
    await user.click(screen.getByRole('button', { name: 'Diam' }));
    expect(play).not.toHaveBeenCalled();
  });

  it('respons TATA: ceria saat benar, lembut saat belum tepat, diam untuk instruksi', () => {
    const play = vi.spyOn(audio, 'play');
    const { rerender } = render(<TataCoach message="Isi kotaknya." tone="neutral" />);
    expect(play).not.toHaveBeenCalled();
    rerender(<TataCoach message="Belum tepat." tone="confused" />);
    expect(play).toHaveBeenLastCalledWith('tryAgain');
    rerender(<TataCoach message="Tepat sekali!" tone="happy" />);
    expect(play).toHaveBeenLastCalledWith('correct');
  });
});
