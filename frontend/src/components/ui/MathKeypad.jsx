import MathText from './MathText.jsx';
import styles from './MathKeypad.module.css';

const DEFAULT_VARS = ['x', 'y'];

/**
 * Huruf variabel yang dipakai soal (dari kunci pemeriksa: target/dividend/divisor), mis. ['p'] untuk p² − 16.
 * Dipakai agar papan ketik punya tombol variabel yang tepat — di HP keyboard biasa sengaja tidak muncul.
 */
export function varsOf(...checks) {
  const letters = new Set();
  for (const c of checks) {
    if (!c) continue;
    for (const field of [c.target, c.dividend, c.divisor]) for (const ch of String(field ?? '').match(/[a-z]/g) ?? []) letters.add(ch);
  }
  return [...letters].sort();
}

/** Dua tombol variabel: variabel soal lebih dulu, sisanya diisi x lalu y. */
export function keypadVars(vars = []) {
  return [...new Set([...vars, ...DEFAULT_VARS])].slice(0, 2); // tata letak 4 kolom: tepat dua tombol variabel
}

const keysFor = ([v1, v2]) => ['7', '8', '9', v1, '4', '5', '6', v2, '1', '2', '3', '^2', '0', '(', ')', '+', '-', '·', ':'];

/**
 * Isian jawaban + papan ketik matematika di layar.
 * inputMode="none" mencegah keyboard HP muncul; di laptop siswa tetap bisa mengetik langsung.
 */
export default function MathKeypad({ value, onChange, onSubmit, label = 'Jawabanmu', submitLabel = 'Cek', disabled = false, vars }) {
  const KEYS = keysFor(keypadVars(vars));
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
