// Pembantu uji browser: menyiapkan siswa aktif + progresnya langsung di IndexedDB
// (format sama dengan yang ditulis aplikasi: aa-students dan aa-profile:<idSiswa>).

export const E2E_STUDENT = { id: 'siswa-e2e', fullName: 'Siswa Uji Browser', nickname: 'Uji', className: 'VII A', school: 'SMP Uji', absen: '' };

export async function setProfile(page, progress, student = E2E_STUDENT) {
  await page.goto('/');
  // Tunggu sesi aplikasi selesai dibuka (aplikasi menulis daftar siswa saat itu), baru tulis data uji,
  // agar data uji tidak tertimpa.
  await page.getByRole('link', { name: /Mulai Petualangan|Lanjutkan Petualangan/ }).waitFor();
  await page.waitForTimeout(200);
  await page.evaluate(
    async ({ progress, student }) => {
      const req = indexedDB.open('keyval-store');
      const db = await new Promise((res, rej) => {
        req.onupgradeneeded = () => req.result.createObjectStore('keyval');
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      await new Promise((res) => {
        const tx = db.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        store.put(JSON.stringify({ state: { students: { [student.id]: student }, activeId: student.id }, version: 1 }), 'aa-students');
        store.put(JSON.stringify({ state: { quizHistory: [], ...progress }, version: 1 }), `aa-profile:${student.id}`);
        tx.oncomplete = res;
      });
    },
    { progress, student },
  );
}
