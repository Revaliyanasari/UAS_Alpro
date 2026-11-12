import PageShell from '../../components/ui/PageShell.jsx';
import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';

export default function NotFoundPage() {
  return (
    <PageShell title="Halaman tidak ditemukan">
      <SpeechBubble tone="confused">Wah, jalan ini belum ada di peta. Ayo kembali ke awal.</SpeechBubble>
      <Button to="/" block style={{ marginTop: 'var(--space-5)' }}>
        Kembali ke awal
      </Button>
    </PageShell>
  );
}
