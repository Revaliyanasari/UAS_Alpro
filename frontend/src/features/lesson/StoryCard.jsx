import { pretty } from '../../components/ui/prettyMath.js';
import styles from './Activities.module.css';

/**
 * Konteks soal cerita (literasi matematis): cerita ≤ 3 kalimat + panel lipat
 * "Yang diketahui / Yang ditanya" (LEARNING_DESIGN §4.2) agar siswa belajar memilah informasi.
 */
export default function StoryCard({ story, known, asked }) {
  if (!story) return null;
  return (
    <div className={styles.story}>
      <p className={styles.storyText}>
        <span aria-hidden="true">📖 </span>
        {pretty(story)}
      </p>
      {(known || asked) && (
        <details className={styles.fold}>
          <summary>Yang diketahui &amp; yang ditanya</summary>
          {known && (
            <>
              <strong>Diketahui:</strong>
              <ul>
                {known.map((k) => (
                  <li key={k}>{pretty(k)}</li>
                ))}
              </ul>
            </>
          )}
          {asked && (
            <p>
              <strong>Ditanya:</strong> {pretty(asked)}
            </p>
          )}
        </details>
      )}
    </div>
  );
}
