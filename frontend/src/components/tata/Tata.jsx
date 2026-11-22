import { Component, lazy, Suspense } from 'react';
import Tata2D from './Tata2D.jsx';
import { baseStateOf } from './tataExpressions.js';
import { useSettings, shouldReduceMotion } from '../../store/settingsStore.js';
import styles from './Tata.module.css';

const Tata3D = lazy(() => import('./Tata3D.jsx'));

function webglAvailable() {
  if (typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function prefersReduced() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Jika 3D gagal (driver grafis, memori), tampilkan 2D — siswa tidak pernah melihat layar kosong.
class Fallback3D extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Karakter TATA. 3D hanya untuk ukuran besar ('lg') bila perangkat mendukung WebGL
 * dan animasi tidak dikurangi; selain itu 2D. Tampilan & warna keduanya sama (tataDesign.js).
 * size: 'lg' | 'md' | 'sm'   state: salah satu dari 18 ekspresi (tataExpressions.js) atau state lama
 * (idle | waving | talking | happy | confused | celebrating). Versi 3D memakai state dasar terdekat.
 */
export default function Tata({ state = 'idle', size = 'md', label = 'TATA, teman belajarmu' }) {
  const motion = useSettings((s) => s.motion);
  const use3D = size === 'lg' && !shouldReduceMotion(motion, prefersReduced()) && webglAvailable();
  const flat = <Tata2D state={state} label={label} />;
  return (
    <div className={[styles.tata, styles[size]].join(' ')} data-state={state}>
      {use3D ? (
        <Fallback3D fallback={flat}>
          <Suspense fallback={flat}>
            <Tata3D state={baseStateOf(state)} label={label} />
          </Suspense>
        </Fallback3D>
      ) : (
        flat
      )}
    </div>
  );
}
