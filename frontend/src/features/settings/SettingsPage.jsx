import PageShell from '../../components/ui/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { useSettings } from '../../store/settingsStore.js';
import { useAiStatus } from '../ai/useAiStatus.js';
import aiCopy from '../../content/ai.json';
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

export default function SettingsPage() {
  const { motion, textSize, setMotion, setTextSize, aiEnabled, setAiEnabled } = useSettings();
  const ai = useAiStatus();
  const aiText = !ai
    ? aiCopy.settings.checking
    : ai.enabled
      ? aiCopy.settings.statusOk
      : ai.reason === 'not_configured'
        ? aiCopy.settings.statusNotConfigured
        : aiCopy.settings.statusOffline;
  return (
    <PageShell title="Pengaturan">
      <Card title="Ukuran tulisan">
        <fieldset className={styles.group}>
          <legend className="visually-hidden">Ukuran tulisan</legend>
          <Choice name="text" value="normal" current={textSize} onChange={setTextSize} label="Biasa" />
          <Choice name="text" value="large" current={textSize} onChange={setTextSize} label="Besar" hint="Tulisan 20% lebih besar" />
        </fieldset>
      </Card>
      <Card title="Animasi">
        <fieldset className={styles.group}>
          <legend className="visually-hidden">Animasi</legend>
          <Choice name="motion" value="system" current={motion} onChange={setMotion} label="Ikuti HP" hint="Sesuai pengaturan perangkat" />
          <Choice name="motion" value="reduced" current={motion} onChange={setMotion} label="Kurangi animasi" hint="Lebih tenang dan hemat baterai" />
          <Choice name="motion" value="full" current={motion} onChange={setMotion} label="Animasi penuh" />
        </fieldset>
      </Card>
      <p className={styles.note}>Pengaturan tersimpan otomatis di perangkat ini.</p>
      <Card title={aiCopy.settings.title}>
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
      </Card>
      <Card title="Kenali TATA">
        <Button to="/tata" variant="secondary" block>
          Galeri Ekspresi TATA
        </Button>
      </Card>
      <Card title="Untuk guru" tone="cream">
        <div className={styles.links}>
          <Button to="/lab" variant="secondary" block>
            Lab Pemeriksa Aljabar
          </Button>
          <Button to="/katalog" variant="secondary" block>
            Katalog Desain
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
