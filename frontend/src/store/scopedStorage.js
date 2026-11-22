// Penyimpanan progres yang dipisah per siswa.
// Store progres (profileStore) selalu memakai nama "aa-profile"; lapisan ini mengubahnya menjadi
// "aa-profile:<idSiswa>" sesuai siswa yang sedang aktif, sehingga progres siswa tidak pernah tercampur.
// Tanpa siswa aktif (scope = null) dipakai kunci lama "aa-profile" (data sebelum ada fitur identitas).
import { idbStorage } from './storage.js';

let scope = null;

export function setProfileScope(studentId) {
  scope = studentId || null;
}

export function getProfileScope() {
  return scope;
}

export const scopedKey = (name, id = scope) => (id ? `${name}:${id}` : name);

export const scopedStorage = {
  getItem: (name) => idbStorage.getItem(scopedKey(name)),
  setItem: (name, value) => idbStorage.setItem(scopedKey(name), value),
  removeItem: (name) => idbStorage.removeItem(scopedKey(name)),
};
