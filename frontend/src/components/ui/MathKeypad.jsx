import MathText from './MathText.jsx';
import styles from './MathKeypad.module.css';

const KEYS = ['7', '8', '9', 'x', '4', '5', '6', 'y', '1', '2', '3', '^2', '0', '(', ')', '+', '-', '·', ':'];

/**
 * Isian jawaban + papan ketik matematika di layar.
 * inputMode="none" mencegah keyboard HP muncul; di laptop siswa tetap bisa mengetik langsung.
 */
export default function MathKeypad({ value, onChange, onSubmit, label = 'Jawabanmu', submitLabel = 'Cek', disabled = false }) {
  const press = (k) => onChange(value + (k === '·' ? '*' : k));
  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className="visually-hidden">{label}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && onSubmit()}
          inputMode="none"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={label}
          disabled={disabled}
        />
        <span className={styles.preview} aria-hidden="true">
          {value ? <MathText>{value}</MathText> : ' '}
        </span>
      </label>
      <div className={styles.keys} role="group" aria-label="Papan ketik matematika">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} disabled={disabled} aria-label={k === '^2' ? 'kuadrat' : k}>
            {k === '^2' ? <MathText>□^2</MathText> : k === '-' ? '−' : k}
          </button>
        ))}
        <button type="button" onClick={() => onChange(value.slice(0, -1))} disabled={disabled} aria-label="Hapus satu">
          ⌫
        </button>
      </div>
      <button type="button" className={styles.submit} onClick={onSubmit} disabled={disabled || !value.trim()}>
        {submitLabel}
      </button>
    </div>
  );
}
