// Tanya TATA: riwayat selama sesi (per siswa & per topik), tombol "Coba lagi", tanpa jawaban buatan.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AskTata from '../features/ai/AskTata.jsx';
import { resetAiStatusCache } from '../features/ai/useAiStatus.js';
import { chatKey, loadChat } from '../features/ai/chatHistory.js';
import { useSettings } from '../store/settingsStore.js';
import { useProfile } from '../store/profileStore.js';
import { useStudents } from '../store/studentStore.js';

const ctx = { worldName: 'Lembah Aljabar', topic: 'FPB', task: 'Tentukan FPB dari 6x^2 dan 9x.' };
const QUOTA = 'TATA AI sedang istirahat (kuota habis). Pakai tombol petunjuk dulu, ya.';
const KEY_A = chatKey('siswa-a', 'pelajaran-Lembah Aljabar');

/** responses: berurutan; 'fail' = galat kuota, 'net' = jaringan putus, teks lain = jawaban AI. */
function mockFetch(responses) {
  const bodies = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      if (url === '/api/ai/status') return { ok: true, json: async () => ({ enabled: true }) };
      bodies.push(JSON.parse(init.body));
      const r = responses.shift();
      if (r === 'net') throw new TypeError('Failed to fetch');
      if (r === 'fail') return { ok: false, json: async () => ({ error: QUOTA }) };
      return { ok: true, json: async () => ({ reply: r }) };
    }),
  );
  return bodies;
}

async function openAndAsk(user, question) {
  await user.click(await screen.findByRole('button', { name: /Tanya TATA/ }));
  if (question) {
    await user.type(screen.getByLabelText('Pertanyaan untuk TATA'), question);
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
  }
}

beforeEach(() => {
  sessionStorage.clear();
  resetAiStatusCache();
  useSettings.setState({ aiEnabled: true });
  useProfile.setState({ nickname: 'Dimas' });
  useStudents.setState({ activeId: 'siswa-a' });
});
afterEach(() => vi.unstubAllGlobals());

describe('riwayat percakapan', () => {
  it('tetap ada setelah jendela ditutup & komponen dimuat ulang; batas pertanyaan tidak terisi ulang', async () => {
    mockFetch(['Berapa FPB dari 6 dan 9?']);
    const user = userEvent.setup();
    const { unmount } = render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Aku bingung FPB');
    expect(await screen.findByText('Berapa FPB dari 6 dan 9?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tutup Tanya TATA' }));
    unmount();

    render(<AskTata context={ctx} />);
    await openAndAsk(user);
    expect(screen.getByText('Aku bingung FPB')).toBeInTheDocument();
    expect(screen.getByText('Berapa FPB dari 6 dan 9?')).toBeInTheDocument();
    expect(screen.getByText(/Sisa pertanyaan: 14/)).toBeInTheDocument();
  });

  it('riwayat dikirim sebagai konteks pertanyaan berikutnya', async () => {
    const bodies = mockFetch(['Jawaban 1', 'Jawaban 2']);
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Tanya satu');
    await screen.findByText('Jawaban 1');
    await user.type(screen.getByLabelText('Pertanyaan untuk TATA'), 'Tanya dua');
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    await screen.findByText('Jawaban 2');
    expect(bodies[1].messages.map((m) => m.content)).toEqual(['Tanya satu', 'Jawaban 1', 'Tanya dua']);
  });

  it('tidak tercampur antarsiswa: siswa B tidak melihat percakapan siswa A', async () => {
    mockFetch(['Jawaban untuk A']);
    const user = userEvent.setup();
    const { unmount } = render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Pertanyaan rahasia A');
    await screen.findByText('Jawaban untuk A');
    unmount();

    useStudents.setState({ activeId: 'siswa-b' });
    render(<AskTata context={ctx} />);
    await openAndAsk(user);
    expect(screen.queryByText('Pertanyaan rahasia A')).toBeNull();
    expect(screen.queryByText('Jawaban untuk A')).toBeNull();
    expect(loadChat(KEY_A).messages).toHaveLength(2);
    expect(loadChat(chatKey('siswa-b', 'pelajaran-Lembah Aljabar')).messages).toHaveLength(0);
  });

  it('topik berbeda punya riwayat sendiri; Hapus percakapan mengosongkan riwayat', async () => {
    mockFetch(['Jawaban World 1']);
    const user = userEvent.setup();
    const { unmount } = render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Soal World 1');
    await screen.findByText('Jawaban World 1');
    unmount();
    const other = render(<AskTata context={{ ...ctx, worldName: 'Gua Rahasia Pemfaktoran' }} />);
    await openAndAsk(user);
    expect(screen.queryByText('Soal World 1')).toBeNull();
    other.unmount();

    render(<AskTata context={ctx} />);
    await openAndAsk(user);
    await user.click(screen.getByRole('button', { name: 'Hapus percakapan' }));
    expect(screen.queryByText('Soal World 1')).toBeNull();
    expect(loadChat(KEY_A).messages).toHaveLength(0);
  });
});

describe('Coba lagi', () => {
  it('kuota habis → pesan jujur + Coba lagi; TIDAK ada jawaban buatan; mengirim ulang pertanyaan yang sama', async () => {
    const bodies = mockFetch(['fail', 'Coba bagi 6 dan 9 dengan bilangan yang sama.']);
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Bagaimana cari FPB?');
    expect(await screen.findByRole('alert')).toHaveTextContent(/kuota habis/);
    expect(loadChat(KEY_A).messages).toEqual([{ role: 'user', content: 'Bagaimana cari FPB?' }]); // tanpa balasan buatan

    await user.click(screen.getByRole('button', { name: /Coba lagi/ }));
    expect(await screen.findByText('Coba bagi 6 dan 9 dengan bilangan yang sama.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(bodies[1].messages).toEqual([{ role: 'user', content: 'Bagaimana cari FPB?' }]); // tidak terduplikasi
  });

  it('jaringan putus → pertanyaan yang belum terjawab tetap bisa dicoba lagi setelah jendela dibuka ulang', async () => {
    mockFetch(['net', 'Jawaban setelah tersambung']);
    const user = userEvent.setup();
    const { unmount } = render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Halo TATA');
    expect(await screen.findByRole('alert')).toHaveTextContent(/Tidak bisa terhubung/);
    unmount();

    render(<AskTata context={ctx} />);
    await openAndAsk(user);
    expect(screen.getByRole('alert')).toHaveTextContent(/belum dijawab/);
    await user.click(screen.getByRole('button', { name: /Coba lagi/ }));
    expect(await screen.findByText('Jawaban setelah tersambung')).toBeInTheDocument();
  });

  it('pertanyaan baru setelah gagal: pertanyaan yang gagal tidak ikut terkirim', async () => {
    const bodies = mockFetch(['fail', 'Jawaban baru']);
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await openAndAsk(user, 'Pertanyaan pertama');
    await screen.findByRole('alert');
    await user.type(screen.getByLabelText('Pertanyaan untuk TATA'), 'Pertanyaan kedua');
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    await screen.findByText('Jawaban baru');
    expect(bodies[1].messages).toEqual([{ role: 'user', content: 'Pertanyaan kedua' }]);
  });
});
