// Penyimpanan lokal di IndexedDB (lewat idb-keyval) untuk zustand persist.
// Jika IndexedDB tidak tersedia (mode penyamaran, browser lama, atau lingkungan uji),
// otomatis memakai memori agar aplikasi tetap berjalan — hanya saja tidak tersimpan permanen.
import { get, set, del } from 'idb-keyval';

const memory = new Map();
const hasIndexedDB = () => typeof indexedDB !== 'undefined';

export const idbStorage = {
  async getItem(name) {
    if (!hasIndexedDB()) return memory.get(name) ?? null;
    try {
      return (await get(name)) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  async setItem(name, value) {
    memory.set(name, value);
    if (!hasIndexedDB()) return;
    try {
      await set(name, value);
    } catch {
      /* tetap tersimpan di memori */
    }
  },
  async removeItem(name) {
    memory.delete(name);
    if (!hasIndexedDB()) return;
    try {
      await del(name);
    } catch {
      /* abaikan */
    }
  },
};
