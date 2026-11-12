import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Tombol utama aplikasi.
 * - variant: 'primary' | 'secondary' | 'ghost'
 * - to: jika diisi, tombol berupa tautan navigasi (react-router)
 * - block: lebar penuh (default di ponsel untuk tombol utama)
 */
export default function Button({ variant = 'primary', to, block = false, className = '', children, ...rest }) {
  const cls = [styles.button, styles[variant], block ? styles.block : '', className].filter(Boolean).join(' ');
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
