// Pembaruan PWA: versi baru langsung dipakai, tetapi tidak memotong pelajaran/kuis/game.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hooks = {};
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (opts) => {
    Object.assign(hooks, opts);
    return { offlineReady: [false, () => {}], needRefresh: [false, () => {}], updateServiceWorker: () => {} };
  },
}));
const { default: UpdatePrompt } = await import('../pwa/UpdatePrompt.jsx');
// File dibaca dari folder frontend (vitest dijalankan di sana).
const VITE_CONFIG = readFileSync(resolve(process.cwd(), 'vite.config.js'), 'utf8');
const PROMPT_CSS = readFileSync(resolve(process.cwd(), 'src/pwa/UpdatePrompt.module.css'), 'utf8');

let reload;
let goTo;
function Nav() {
  goTo = useNavigate();
  return null;
}
function setPath(path) {
  window.history.replaceState(null, '', path);
}
const renderAt = (path) => {
  setPath(path);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Nav />
      <UpdatePrompt />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  reload = vi.fn();
  vi.stubGlobal('location', { ...window.location, reload, get pathname() { return window.history.state?.p ?? document.location.pathname; } });
});
afterEach(() => vi.unstubAllGlobals());

describe('pembaruan aplikasi (service worker)', () => {
  it('konfigurasi: versi baru langsung aktif (autoUpdate + skipWaiting + clientsClaim), cache lama dibersihkan', () => {
    const cfg = VITE_CONFIG;
    expect(cfg).toMatch(/registerType: 'autoUpdate'/);
    expect(cfg).toMatch(/skipWaiting: true/);
    expect(cfg).toMatch(/clientsClaim: true/);
    expect(cfg).toMatch(/cleanupOutdatedCaches: true/);
  });

  it('di halaman biasa (peta): langsung dimuat ulang ke versi baru', () => {
    renderAt('/peta');
    act(() => hooks.onNeedReload());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('saat kuis: TIDAK dimuat ulang; pemberitahuan tampil; dipasang setelah keluar dari kuis', async () => {
    renderAt('/kuis/1');
    act(() => hooks.onNeedReload());
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/Versi baru .* siap/);
    expect(screen.getByRole('button', { name: 'Perbarui sekarang' })).toBeInTheDocument();
    act(() => {
      setPath('/peta');
      goTo('/peta');
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('saat pelajaran: "Nanti" menyembunyikan pemberitahuan tanpa memuat ulang', async () => {
    const user = userEvent.setup();
    renderAt('/belajar/4');
    act(() => hooks.onNeedReload());
    await user.click(screen.getByRole('button', { name: 'Nanti' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(reload).not.toHaveBeenCalled();
  });

  it('pembaruan diperiksa saat aplikasi dibuka lagi dari latar belakang', () => {
    renderAt('/peta');
    const update = vi.fn(() => Promise.resolve());
    hooks.onRegisteredSW('/sw.js', { update });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(update).toHaveBeenCalled();
  });

  it('pemberitahuan melayang di lapisan teratas (tidak tertutup latar halaman)', () => {
    const css = PROMPT_CSS;
    expect(css).toMatch(/position: fixed/);
    expect(css).toMatch(/z-index: var\(--z-toast\)/);
  });
});
