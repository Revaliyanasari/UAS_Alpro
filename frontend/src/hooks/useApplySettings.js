import { useEffect, useState } from 'react';
import { useSettings, shouldReduceMotion } from '../store/settingsStore.js';

function systemReduced() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Menerapkan pengaturan ke elemen <html> (data-motion, data-text) agar berlaku di seluruh aplikasi. */
export function useApplySettings() {
  const motion = useSettings((s) => s.motion);
  const textSize = useSettings((s) => s.textSize);
  const [sysReduced, setSysReduced] = useState(systemReduced);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSysReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = shouldReduceMotion(motion, sysReduced) ? 'reduced' : 'full';
    root.dataset.text = textSize;
  }, [motion, textSize, sysReduced]);
}
