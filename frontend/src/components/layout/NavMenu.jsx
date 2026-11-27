import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Tata from '../tata/Tata.jsx';
import { MENU } from './menu.js';
import { useProfile } from '../../store/profileStore.js';
import styles from './Nav.module.css';

/** Isi menu: kartu siswa singkat + 5 kategori berwarna, tiap item punya ikon DAN label. */
export default function NavMenu({ onNavigate }) {
  const nickname = useProfile((s) => s.nickname);
  const xp = useProfile((s) => s.xp);
  const stars = useProfile((s) => Object.values(s.worlds).reduce((t, w) => t + (w.stars || 0), 0));

  return (
    <nav className={styles.menu} aria-label="Menu utama">
      <div className={styles.brand}>
        <span className={styles.brandTata}>
          <Tata state="happy" size="sm" label="" />
        </span>
        <span>
          <strong>Algebra Adventure</strong>
          {nickname && (
            <small>
              {nickname} · XP {xp} · ⭐ {stars}
            </small>
          )}
        </span>
      </div>
      {MENU.map((cat) => (
        <section key={cat.id} className={[styles.cat, styles[`cat-${cat.id}`]].join(' ')} aria-labelledby={`menu-${cat.id}`}>
          <h2 id={`menu-${cat.id}`} className={styles.catTitle}>
            {cat.label}
          </h2>
          <ul>
            {cat.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) => [styles.item, isActive && !it.to.includes('#') ? styles.active : ''].join(' ')}
                >
                  <span className={styles.itemIcon}>
                    <Icon name={it.icon} size={20} />
                  </span>
                  <span className={styles.itemText}>{it.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
