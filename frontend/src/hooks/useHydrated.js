import { useEffect, useState } from 'react';

/** true setelah store zustand-persist selesai membaca data dari IndexedDB (mencegah tampilan berkedip). */
export function useHydrated(store) {
  const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated());
  useEffect(() => {
    if (store.persist.hasHydrated()) setHydrated(true);
    return store.persist.onFinishHydration(() => setHydrated(true));
  }, [store]);
  return hydrated;
}
