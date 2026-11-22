// Validasi identitas siswa (tanpa React). Pesan memakai bahasa yang ramah anak.

export const CLASS_SUGGESTIONS = ['VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F'];

const NAME = /^[\p{L}][\p{L} .'-]*$/u; // huruf, spasi, titik, apostrof, tanda hubung
const tidy = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

/** "vii a" / "VIIA" / "7a" → "VII A" (bentuk lain dibiarkan apa adanya, cukup dirapikan). */
export function normalizeClass(raw) {
  const v = tidy(raw).toUpperCase();
  const m = v.match(/^(VII|7)\s*-?\s*([A-Z0-9]{1,2})$/);
  return m ? `VII ${m[2]}` : v;
}

/**
 * @param {{fullName, nickname, className, school, absen}} form
 * @returns {{ ok: boolean, errors: Record<string,string>, value: object }}
 */
export function validateIdentity(form) {
  const value = {
    fullName: tidy(form.fullName),
    nickname: tidy(form.nickname),
    className: normalizeClass(form.className),
    school: tidy(form.school),
    absen: tidy(form.absen),
  };
  const errors = {};

  if (!value.fullName) errors.fullName = 'Nama lengkapmu belum diisi, ya.';
  else if (value.fullName.length < 3) errors.fullName = 'Nama lengkap minimal 3 huruf.';
  else if (value.fullName.length > 60) errors.fullName = 'Nama lengkap terlalu panjang (maksimal 60 huruf).';
  else if (!NAME.test(value.fullName)) errors.fullName = 'Nama hanya boleh berisi huruf, ya.';

  if (!value.nickname) errors.nickname = 'Nama panggilanmu belum diisi. TATA ingin menyapamu!';
  else if (value.nickname.length > 20) errors.nickname = 'Nama panggilan maksimal 20 huruf.';
  else if (!NAME.test(value.nickname)) errors.nickname = 'Nama panggilan hanya boleh berisi huruf.';

  if (!value.className) errors.className = 'Kelasmu belum dipilih atau diisi.';
  else if (value.className.length > 12) errors.className = 'Tulis kelas dengan singkat, misalnya VII A.';

  if (!value.school) errors.school = 'Asal sekolahmu belum diisi.';
  else if (value.school.length > 80) errors.school = 'Nama sekolah terlalu panjang (maksimal 80 huruf).';

  if (value.absen) {
    const n = Number(value.absen);
    if (!Number.isInteger(n) || n < 1 || n > 99) errors.absen = 'Nomor absen berupa angka 1 sampai 99 (boleh dikosongkan).';
    else value.absen = String(n);
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}
