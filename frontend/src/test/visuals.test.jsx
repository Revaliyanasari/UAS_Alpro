// Ilustrasi SVG dunia & animasi penghargaan: tersedia untuk setiap dunia, memakai token desain, dekoratif.
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import WorldArt from '../components/art/WorldArt.jsx';
import RewardBurst from '../components/reward/RewardBurst.jsx';
import content from '../content/worlds.json';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

describe('ilustrasi dunia', () => {
  it.each(content.worlds.map((w) => [w.id, w.name]))('World %i (%s) punya ilustrasi SVG dekoratif', (id) => {
    const { container } = render(<WorldArt worldId={id} />);
    const svg = container.querySelector(`svg[data-world-art="${id}"]`);
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('rect, path, circle').length).toBeGreaterThan(4);
  });

  it('dunia tanpa ilustrasi → tidak merender apa pun (tidak ada gambar rusak)', () => {
    const { container } = render(<WorldArt worldId={99} />);
    expect(container.innerHTML).toBe('');
  });

  it('hanya memakai token warna (tanpa kode hex) — aturan desain proyek', () => {
    for (const f of ['../components/art/WorldArt.jsx', '../components/art/WorldArt.module.css', '../components/reward/RewardBurst.jsx', '../components/reward/RewardBurst.module.css']) {
      expect(read(f), f).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});

describe('animasi penghargaan', () => {
  it('menampilkan bintang yang diraih (menyala) dan sisanya redup, plus XP', () => {
    const { container } = render(<RewardBurst stars={2} xp={40} />);
    const burst = container.querySelector('[data-reward]');
    expect(burst.getAttribute('aria-hidden')).toBe('true'); // teks hasil tetap dibaca dari halaman
    const stars = burst.querySelectorAll('svg');
    expect(stars).toHaveLength(3);
    expect([...stars].filter((s) => s.getAttribute('class').includes('starOn'))).toHaveLength(2);
    expect(burst.textContent).toContain('+40 XP');
  });

  it('tanpa penghargaan → tidak tampil', () => {
    const { container } = render(<RewardBurst stars={0} xp={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('animasi ringan: hanya transform/opacity, berjalan sekali (tidak berulang terus)', () => {
    const css = read('../components/reward/RewardBurst.module.css');
    expect(css).not.toMatch(/infinite/);
    expect(css).toMatch(/pointer-events: none/);
    const keyframes = css.match(/@keyframes[\s\S]*?\n}\n/g).join('\n');
    expect(keyframes).not.toMatch(/\b(width|height|top|left|margin):/);
  });
});
