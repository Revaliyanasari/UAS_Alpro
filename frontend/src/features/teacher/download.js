/** Mengunduh teks sebagai berkas (CSV/JSON) langsung dari browser — tanpa server. */
export function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nama berkas aman: huruf kecil, tanda hubung, + tanggal. */
export function fileSlug(title) {
  const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'data';
  return `${slug}-${new Date().toISOString().slice(0, 10)}`;
}

/** Membaca berkas JSON yang dipilih guru. */
export function readJsonFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve({ ok: true, data: JSON.parse(String(reader.result)) });
      } catch {
        resolve({ ok: false, error: 'Berkas bukan JSON yang valid.' });
      }
    };
    reader.onerror = () => resolve({ ok: false, error: 'Berkas tidak bisa dibaca.' });
    reader.readAsText(file);
  });
}
