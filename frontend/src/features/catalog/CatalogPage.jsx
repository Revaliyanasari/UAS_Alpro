import { useState } from 'react';
import PageShell from '../../components/ui/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import ProgressPath from '../../components/ui/ProgressPath.jsx';
import MathText from '../../components/ui/MathText.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import styles from './CatalogPage.module.css';

// Katalog design system (untuk pengembang & peninjau desain). Semua contoh di sini berfungsi.
const SWATCHES = [
  ['--sage-500', 'Sage'],
  ['--mint-200', 'Mint'],
  ['--teal-400', 'Toska'],
  ['--cream-50', 'Cream'],
  ['--beige-300', 'Beige'],
  ['--butter-300', 'Butter'],
  ['--peach-300', 'Peach'],
  ['--terra-500', 'Terakota'],
  ['--ink-900', 'Tinta'],
];

export default function CatalogPage() {
  const toast = useToast();
  const [step, setStep] = useState(2);

  return (
    <PageShell title="Katalog Desain" wide>
      <Card title="Warna">
        <ul className={styles.swatches}>
          {SWATCHES.map(([token, name]) => (
            <li key={token}>
              <span className={styles.swatch} style={{ background: `var(${token})` }} />
              <span>{name}</span>
              <code>{token}</code>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Ubin aljabar (warna tetap)">
        <div className={styles.tiles}>
          <span className={styles.tileX2}>
            <MathText>x^2</MathText>
          </span>
          <span className={styles.tileX}>
            <MathText>x</MathText>
          </span>
          <span className={styles.tile1}>1</span>
        </div>
      </Card>

      <Card title="Tipografi">
        <h1>Judul Dunia</h1>
        <h2>Judul Layar</h2>
        <p>Teks isi memakai Nunito 17 px agar mudah dibaca di layar kecil.</p>
        <p>
          Matematika: <MathText size="large">8x^2 + 12x = 4x(2x + 3)</MathText>
        </p>
      </Card>

      <Card title="Tombol">
        <div className={styles.stack}>
          <Button block onClick={() => toast('Tombol utama ditekan.', 'happy')}>
            Tombol utama
          </Button>
          <Button variant="secondary" block onClick={() => toast('Tombol kedua ditekan.')}>
            Tombol kedua
          </Button>
          <Button variant="ghost" onClick={() => toast('Tombol teks ditekan.')}>
            Tombol teks
          </Button>
          <Button disabled block>
            Tombol nonaktif
          </Button>
        </div>
      </Card>

      <Card title="Balon kata TATA">
        <div className={styles.stack}>
          <SpeechBubble>Halo! Aku TATA. Ayo kita mulai.</SpeechBubble>
          <SpeechBubble tone="happy">Tepat sekali!</SpeechBubble>
          <SpeechBubble tone="confused">Coba kalikan kembali, ya.</SpeechBubble>
        </div>
      </Card>

      <Card title="Jalan progres">
        <ProgressPath value={step} max={6} label="Langkah pelajaran" />
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Mundur
          </Button>
          <Button onClick={() => setStep((s) => Math.min(6, s + 1))}>Maju</Button>
        </div>
      </Card>

      <Card title="Pemberitahuan">
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => toast('Bagus! Jawabanmu benar.', 'happy')}>
            Contoh benar
          </Button>
          <Button variant="secondary" onClick={() => toast('Hampir! Coba cek lagi.', 'confused')}>
            Contoh coba lagi
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
