import styles from './IslandButton.module.css';

const TILE_SHAPES = {
  x2: <rect x="38" y="6" width="34" height="34" rx="3" fill="var(--tile-x2)" />,
  x: <rect x="49" y="6" width="10" height="34" rx="2" fill="var(--tile-x)" />,
  1: <rect x="47" y="28" width="12" height="12" rx="2" fill="var(--tile-1)" />,
};

/** Satu pulau di peta. Status: terkunci, terbuka (pulau saat ini menonjol), atau selesai. */
export default function IslandButton({ world, unlocked, completed, stars, current, onOpen }) {
  const status = completed ? 'Selesai' : unlocked ? 'Terbuka' : 'Terkunci';
  return (
    <button
      type="button"
      className={[styles.island, !unlocked ? styles.locked : '', current ? styles.current : ''].join(' ')}
      onClick={onOpen}
      aria-label={`World ${world.id}: ${world.name}. ${status}.`}
      data-world={world.id}
    >
      <svg viewBox="0 0 110 86" className={styles.art} aria-hidden="true">
        <path d="M8 42 Q55 54 102 42 L72 78 Q55 86 38 78 Z" fill="var(--beige-300)" />
        <ellipse cx="55" cy="42" rx="48" ry="10" fill="var(--sage-500)" />
        <ellipse cx="55" cy="40" rx="43" ry="7" fill="var(--mint-200)" />
        <g transform="translate(0 0)">{TILE_SHAPES[world.tile]}</g>
      </svg>
      <span className={styles.number}>{world.id}</span>
      <span className={styles.name}>{world.name}</span>
      <span className={styles.status}>
        {!unlocked ? '🔒 Terkunci' : completed ? `${'⭐'.repeat(stars)} Selesai` : current ? '▶ Mulai di sini' : 'Terbuka'}
      </span>
    </button>
  );
}
