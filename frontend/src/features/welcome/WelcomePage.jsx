import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import WorldBackground from './WorldBackground.jsx';
import { useProfile } from '../../store/profileStore.js';
import { useStudents } from '../../store/studentStore.js';
import studentCopy from '../../content/student.json';
import copy from '../../content/onboarding.json';
import styles from './WelcomePage.module.css';

export default function WelcomePage() {
  // Siswa aktif di perangkat ini (identitas). Tanpa siswa aktif → isi identitas / pilih siswa dulu.
  const ready = useStudents((s) => s.ready);
  const student = useStudents((s) => s.students[s.activeId]);
  const hasStudents = useStudents((s) => Object.keys(s.students).length > 0);
  const onboardingDone = useProfile((s) => s.onboardingDone);
  const greeting = student ? copy.welcome.greetingReturning.replace('{name}', student.nickname) : copy.welcome.greeting;
  const startTo = student ? (onboardingDone ? '/beranda' : '/mulai') : hasStudents ? '/siswa' : '/identitas';

  return (
    <div className={styles.screen}>
      <WorldBackground variant="welcome" />
      <main className={styles.content}>
        <header className={styles.brand}>
          <h1 className={styles.title}>Algebra Adventure</h1>
          <p className={styles.tagline}>Exploring the World of Algebra</p>
        </header>

        <div className={styles.hero}>
          <SpeechBubble tail="left">{greeting}</SpeechBubble>
          <Tata state="waving" size="lg" />
        </div>

        <nav className={styles.actions} aria-label="Mulai">
          {ready && (
            <Button to={startTo} block>
              {student && onboardingDone ? 'Lanjutkan Petualangan' : 'Mulai Petualangan'}
            </Button>
          )}
          {ready && student && (
            <Button to="/siswa" variant="ghost">
              {studentCopy.welcome.notYou.replace('{name}', student.nickname)}
            </Button>
          )}
          <Button to="/pengaturan" variant="ghost">
            Pengaturan
          </Button>
        </nav>
      </main>
    </div>
  );
}
