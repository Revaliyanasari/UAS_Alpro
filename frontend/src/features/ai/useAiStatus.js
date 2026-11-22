import { useEffect, useState } from 'react';
import { getAiStatus } from '../../services/aiClient.js';

// Status server AI diperiksa sekali per pemuatan aplikasi (hemat permintaan).
let cached = null;

/** Untuk pengujian: lupakan status yang tersimpan. */
export function resetAiStatusCache() {
  cached = null;
}

/** { enabled, reason } atau null selama memeriksa. */
export function useAiStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let alive = true;
    if (!cached) cached = getAiStatus();
    cached.then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);
  return status;
}
