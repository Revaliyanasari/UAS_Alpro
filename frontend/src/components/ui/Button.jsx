import { Link } from 'react-router-dom';
import { sfx } from '../../audio/index.js';
import styles from './Button.module.css';

/**
 * Tombol utama aplikasi.
 * - variant: 'primary' | 'secondary' | 'ghost'
 * - to: jika diisi, tombol berupa tautan navigasi (react-router)
 * - block: lebar penuh (default di ponsel untuk tombol utama)
 * - sound: bunyi ketuk singkat saat ditekan (default true; diam bila efek suara dimatikan)
 */
export default function Button({ variant = 'primary', to, block = false, className = '', sound = true, onClick, children, ...rest }) {
  const handleClick = (e) => {
    if (sound) sfx('tap');
    onClick?.(e);
  };
  const cls = [styles.button, styles[variant], block ? styles.block : '', className].filter(Boolean).join(' ');
  if (to) {
    return (
      <Link to={to} className={cls} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}
