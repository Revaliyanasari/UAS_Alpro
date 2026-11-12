import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

/** Pemberitahuan singkat di bawah layar. Hilang otomatis setelah 4 detik atau saat diketuk. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((text, tone = 'neutral') => {
    clearTimeout(timer.current);
    setToast({ text, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} aria-live="polite">
        {toast && (
          <button key={toast.id} type="button" className={[styles.toast, styles[toast.tone]].join(' ')} onClick={hide}>
            {toast.text}
            <span className="visually-hidden"> (ketuk untuk menutup)</span>
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  return show;
}
