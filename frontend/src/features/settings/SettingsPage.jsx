import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useSettings } from '../../store/settingsStore.js';
import { useAiStatus } from '../ai/useAiStatus.js';
import aiCopy from '../../content/ai.json';
import AudioControls from '../../audio/AudioControls.jsx';
import { useStudents } from '../../store/studentStore.js';
import styles from './SettingsPage.module.css';

function Choice({ name, value, current, onChange, label, hint }) {
  return (
    <label className={[styles.choice, current === value ? styles.active : ''].join(' ')}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

/** Satu bagian pengaturan: ikon berwarna + judul + isi. */
function Section({ id, icon, title, tone, children }) {
  return (
    <section className={[styles.section, styles[`tone-${tone}`]].join(' ')} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <Icon name={icon} size={20} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { motion, textSize, setMotion, setTextSize, aiEnabled, setAiEnabled } = useSettings();
  const ai = useAiStatus();
  const hasStudent = useStudents((s) => Boolean(s.activeId));
  const aiText = !ai
    ? aiCopy.settings.checking
    : ai.enabled
      ? aiCopy.settings.statusOk
      : ai.reason === 'not_configured'
        ? aiCopy.settings.statusNotConfigured
        : aiCopy.settings.statusOffline;

  return (
    <AppLayout title="Pengaturan" icon="gear">
      <p className={styles.note}>Semua pengaturan tersimpan otomatis di perangkat ini.</p>
      <div className={styles.sections}>
        <Section id="set-suara" icon="speaker" title="Suara" tone="game">
          <AudioControls />
        </Section>

        <Section id="set-tampilan" icon="smile" title="Tampilan" tone="learn">
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Ukuran tulisan</legend>
            <Choice name="text" value="normal" current={textSize} onChange={setTextSize} label="Biasa" />
            <Choice name="text" value="large" current={textSize} onChange={setTextSize} label="Besar" hint="Tulisan 20% lebih besar" />
          </fieldset>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Animasi</legend>
            <Choice name="motion" value="system" current={motion} onChange={setMotion} label="Ikuti HP" hint="Sesuai pengaturan perangkat" />
            <Choice name="motion" value="reduced" current={motion} onChange={setMotion} label="Kurangi animasi" hint="Lebih tenang dan hemat baterai" />
            <Choice name="motion" value="full" current={motion} onChange={setMotion} label="Animasi penuh" />
          </fieldset>
        </Section>

        <Section id="set-ai" icon="chat" title={aiCopy.settings.title} tone="home">
          <p className={styles.aiStatus} role="status">
            {aiText}
          </p>
          {ai?.enabled && (
            <label className={[styles.choice, aiEnabled ? styles.active : ''].join(' ')}>
              <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} />
              <span>
                <strong>{aiCopy.settings.toggle}</strong>
                <small>{aiCopy.settings.quizNote}</small>
              </span>
            </label>
          )}
        </Section>

        <Section id="set-tata" icon="smile" title="Kenali TATA" tone="community">
          <div className={styles.links}>
            <Button to="/tata" variant="secondary" block>
              Galeri Ekspresi TATA
            </Button>
            {hasStudent && (
              <Button to="/beranda?tur=1" variant="secondary" block>
                Ulangi tur aplikasi
              </Button>
            )}
          </div>
        </Section>

        <Section id="set-guru" icon="teacher" title="Untuk guru" tone="other">
          <div className={styles.links}>
            <Button to="/guru" block>
              Modul Guru: instrumen, penilaian, laporan
            </Button>
            <Button to="/lab" variant="secondary" block>
              Lab Pemeriksa Aljabar
            </Button>
            <Button to="/katalog" variant="secondary" block>
              Katalog Desain
            </Button>
          </div>
        </Section>

        <Section id="set-info" icon="book" title="Tentang aplikasi" tone="learn">
          <dl className={styles.info}>
            <dt>Aplikasi</dt>
            <dd>Algebra Adventure — Exploring the World of Algebra</dd>
            <dt>Versi</dt>
            <dd>0.2.0</dd>
            <dt>Materi</dt>
            <dd>Pemfaktoran bentuk aljabar, SMP kelas VII (World 1–5 tersedia)</dd>
            <dt>Model belajar</dt>
            <dd>Rigorous Mathematical Thinking (RMT)</dd>
            <dt>Privasi</dt>
            <dd>Identitas & progres hanya tersimpan di perangkat ini. Tanya TATA tidak menerima identitasmu.</dd>
            <dt>Musik & suara</dt>
            <dd>Orisinal, dibuat dengan Web Audio API</dd>
          </dl>
        </Section>
      </div>
    </AppLayout>
  );
}
