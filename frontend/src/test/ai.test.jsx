// AI Learning Assistant di frontend: tersembunyi bila server belum siap, tidak mengirim kunci jawaban,
// menangani jawaban & error. fetch ditiru — tidak ada panggilan internet.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import AskTata from '../features/ai/AskTata.jsx';
import { resetAiStatusCache } from '../features/ai/useAiStatus.js';
import { useSettings } from '../store/settingsStore.js';
import { useProfile } from '../store/profileStore.js';

function mockFetch({ enabled = true, chat }) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      calls.push({ url, init });
      if (url === '/api/ai/status') return { ok: true, json: async () => ({ enabled }) };
      return chat(init);
    }),
  );
  return calls;
}

beforeEach(() => {
  resetAiStatusCache();
  useSettings.setState({ aiEnabled: true });
  useProfile.setState({ nickname: 'Dimas', onboardingDone: true, xp: 0, worlds: {}, quizHistory: [] });
});
afterEach(() => vi.unstubAllGlobals());

const ctx = { worldName: 'Lembah Aljabar', topic: 'Giliranmu', task: 'Tentukan FPB dari 6x^2 dan 9x.' };

describe('Tanya TATA', () => {
  it('tersembunyi bila API key belum diisi di server', async () => {
    mockFetch({ enabled: false });
    render(<AskTata context={ctx} />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Tanya TATA/ })).not.toBeInTheDocument();
  });

  it('tersembunyi bila dimatikan di Pengaturan', async () => {
    mockFetch({ enabled: true });
    useSettings.setState({ aiEnabled: false });
    render(<AskTata context={ctx} />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Tanya TATA/ })).not.toBeInTheDocument();
  });

  it('mengirim pertanyaan + konteks soal (tanpa nama siswa), menampilkan jawaban', async () => {
    const calls = mockFetch({ chat: async () => ({ ok: true, json: async () => ({ reply: 'Berapa FPB dari 6 dan 9?' }) }) });
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await user.click(await screen.findByRole('button', { name: /Tanya TATA/ }));
    expect(screen.getByText(/Halo, Dimas!/)).toBeInTheDocument(); // sapaan personal, dibuat di perangkat
    await user.type(screen.getByLabelText('Pertanyaan untuk TATA'), 'Aku bingung FPB');
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(await screen.findByText('Berapa FPB dari 6 dan 9?')).toBeInTheDocument();
    const chat = calls.find((c) => c.url === '/api/ai/chat');
    const body = JSON.parse(chat.init.body);
    expect(body.messages).toEqual([{ role: 'user', content: 'Aku bingung FPB' }]);
    expect(body.context.task).toMatch(/FPB dari 6x\^2/);
    expect(chat.init.body).not.toMatch(/Dimas/); // nama panggilan tidak dikirim ke AI
    expect(chat.init.body).not.toMatch(/Siswa Uji Coba|SMP Uji|VII A/); // identitas lain juga tidak
    expect(screen.getByText(/Sisa pertanyaan: 14/)).toBeInTheDocument();
  });

  it('error server ditampilkan dengan pesan ramah (fallback ke petunjuk)', async () => {
    mockFetch({ chat: async () => ({ ok: false, json: async () => ({ error: 'TATA AI sedang istirahat (kuota habis). Pakai tombol petunjuk 💡 dulu, ya.' }) }) });
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await user.click(await screen.findByRole('button', { name: /Tanya TATA/ }));
    await user.click(screen.getByRole('button', { name: 'Beri aku petunjuk kecil.' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/kuota habis/);
  });

  it('jaringan putus → pesan tidak bisa terhubung', async () => {
    mockFetch({
      chat: async () => {
        throw new TypeError('Failed to fetch');
      },
    });
    const user = userEvent.setup();
    render(<AskTata context={ctx} />);
    await user.click(await screen.findByRole('button', { name: /Tanya TATA/ }));
    await user.click(screen.getByRole('button', { name: 'Aku belum paham soal ini.' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Tidak bisa terhubung/);
  });

  it('tampil di pelajaran, tidak tampil di kuis', async () => {
    mockFetch({ chat: async () => ({ ok: true, json: async () => ({ reply: 'ok' }) }) });
    const { unmount } = render(
      <MemoryRouter initialEntries={['/belajar/1']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('button', { name: /Tanya TATA/ })).toBeInTheDocument();
    unmount();
    useProfile.setState({ worlds: { 1: { lessonDone: true } } });
    render(
      <MemoryRouter initialEntries={['/kuis/1']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Soal 1 dari 5/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tanya TATA/ })).not.toBeInTheDocument();
  });

  it('Pengaturan menjelaskan bahwa AI belum dikonfigurasi', async () => {
    mockFetch({ enabled: false });
    render(
      <MemoryRouter initialEntries={['/pengaturan']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/API key AI belum diisi/)).toBeInTheDocument();
  });
});
