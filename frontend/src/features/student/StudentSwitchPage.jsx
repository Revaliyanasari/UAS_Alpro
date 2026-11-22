import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/ui/PageShell.jsx';
import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { useStudents } from '../../store/studentStore.js';
import copy from '../../content/student.json';
import styles from './StudentPages.module.css';

/** Perangkat dipakai bergantian: pilih siswa (progres masing-masing terpisah), tambah siswa baru, atau hapus. */
export default function StudentSwitchPage() {
  const navigate = useNavigate();
  const { activeId, switchTo, removeStudent, studentList } = useStudents();
  const ready = useStudents((s) => s.ready);
  const list = studentList();
  const c = copy.switch;

  const choose = async (id) => {
    await switchTo(id);
    navigate('/');
  };

  return (
    <PageShell title={c.title} backTo="/">
      <div className={styles.intro}>
        <span className={styles.introTata}>
          <Tata state="talking" size="sm" />
        </span>
        <SpeechBubble tail="left">{c.tata}</SpeechBubble>
      </div>
      {list.length === 0 && <p className={styles.muted}>{c.empty}</p>}
      <ul className={styles.list} aria-label="Daftar siswa di perangkat ini">
        {list.map((s) => (
          <li key={s.id} className={[styles.student, s.id === activeId ? styles.current : ''].join(' ')}>
            <button type="button" className={styles.pick} onClick={() => choose(s.id)} disabled={!ready} aria-label={`Belajar sebagai ${s.nickname}, kelas ${s.className}`}>
              <span className={styles.avatar} aria-hidden="true">
                {s.nickname.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{s.nickname}</strong>
                <small>
                  {s.className} · {s.school}
                </small>
              </span>
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`${c.remove} ${s.nickname}`}
              onClick={() => window.confirm(c.removeConfirm.replace('{name}', s.nickname)) && removeStudent(s.id)}
            >
              {c.remove}
            </button>
          </li>
        ))}
      </ul>
      <Button block to="/identitas?baru=1">
        {c.newStudent}
      </Button>
    </PageShell>
  );
}
