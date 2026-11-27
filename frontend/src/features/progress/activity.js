// Teks & ikon untuk satu catatan aktivitas (dipakai halaman Riwayat dan Profil).
import worldsContent from '../../content/worlds.json';
import { GAMES } from '../games/games.js';

const worldName = (id) => worldsContent.worlds.find((w) => w.id === id)?.name ?? `World ${id}`;
const gameName = (id) => GAMES.find((g) => g.id === id)?.title ?? id;

export function describeActivity(a) {
  if (a.type === 'lesson') return { icon: '📖', text: `Menyelesaikan pelajaran ${worldName(a.worldId)}` };
  if (a.type === 'quiz') return { icon: '🏁', text: `Kuis ${worldName(a.worldId)} — nilai ${a.percent}%` };
  return { icon: '🎮', text: `Bermain ${gameName(a.gameId)} — skor ${a.score}` };
}

export const formatWhen = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
