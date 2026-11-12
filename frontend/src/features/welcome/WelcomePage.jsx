import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import WorldBackground from './WorldBackground.jsx';
import { useProfile } from '../../store/profileStore.js';
import { useHydrated } from '../../hooks/useHydrated.js';
import copy from '../../content/onboarding.json';
import styles from './WelcomePage.module.css';

export default function WelcomePage() {
  const hydrated = useHydrated(useProfile);
  const { onboardingDone, nickname } = useProfile();
  const returning = hydrated && onboardingDone;
  const greeting = returning
    ? copy.welcome.greetingReturning.replace('{name}', nickname || 'penjelajah')
    : copy.welcome.greeting;

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
          {hydrated && (
            <Button to={returning ? '/peta' : '/mulai'} block>
              {returning ? 'Lanjutkan Petualangan' : 'Mulai Petualangan'}
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
