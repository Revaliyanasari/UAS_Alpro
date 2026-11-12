import styles from './Card.module.css';

/** Kartu materi: satu ide per kartu. tone: 'plain' | 'mint' | 'cream' */
export default function Card({ tone = 'plain', title, children, className = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag className={[styles.card, styles[tone], className].filter(Boolean).join(' ')} {...rest}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </Tag>
  );
}
