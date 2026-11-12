import { useState } from 'react';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import MathText from '../../components/ui/MathText.jsx';
import styles from './TileMatchActivity.module.css';

// Aktivitas: cocokkan ubin x², x, dan 1 dengan bingkai yang panjang sisinya sesuai.
// Tujuan pedagogis: siswa menemukan bahwa nama ubin = luasnya (x·x = x², x·1 = x, 1·1 = 1),
// dasar untuk menyusun persegi panjang dari ubin pada World 2.
// Cara memindah: seret (mouse/jari) ATAU ketuk ubin lalu ketuk bingkai (juga bisa dengan Tab + Enter/Spasi).

export const TILES = [
  { id: 'x', name: 'x', sides: ['x', '1'] },
  { id: 'x2', name: 'x^2', sides: ['x', 'x'] },
  { id: 'one', name: '1', sides: ['1', '1'] },
];
const FRAME_ORDER = ['x2', 'one', 'x']; // urutan bingkai berbeda dari ubin agar siswa membandingkan sisi

const announcements = {
  onDragStart: ({ active }) => `Ubin ${active.id} diangkat.`,
  onDragOver: ({ over }) => (over ? `Di atas bingkai.` : 'Di luar bingkai.'),
  onDragEnd: ({ over }) => (over ? 'Ubin dilepas di bingkai.' : 'Ubin dilepas.'),
  onDragCancel: () => 'Batal.',
};

function TileShape({ tile }) {
  return (
    <span className={[styles.tile, styles[`tile-${tile.id}`]].join(' ')}>
      <MathText>{tile.name}</MathText>
    </span>
  );
}

function DraggableTile({ tile, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tile.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={[styles.dragHandle, selected ? styles.selected : '', isDragging ? styles.dragging : ''].join(' ')}
      style={style}
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      aria-label={`Ubin ${tile.id === 'x2' ? 'x kuadrat' : tile.id === 'one' ? 'satu' : 'x'}`}
      data-tile={tile.id}
      onClick={() => onSelect(tile.id)}
    >
      <TileShape tile={tile} />
    </button>
  );
}

function Frame({ frameId, placedTile, shake, onPlace }) {
  const { setNodeRef, isOver } = useDroppable({ id: frameId });
  const tile = TILES.find((t) => t.id === frameId);
  const [top, left] = [tile.sides[1], tile.sides[0]];
  return (
    <div className={styles.frameWrap}>
      <span className={styles.sideTop}>
        <MathText>{top}</MathText>
      </span>
      <div className={styles.frameRow}>
        <span className={styles.sideLeft}>
          <MathText>{left}</MathText>
        </span>
        <button
          ref={setNodeRef}
          type="button"
          className={[styles.frame, styles[`frame-${frameId}`], isOver ? styles.over : '', shake ? styles.shake : '', placedTile ? styles.filled : ''].join(' ')}
          onClick={() => onPlace(frameId)}
          aria-label={`Bingkai ${left} kali ${top}${placedTile ? ', sudah terisi' : ''}`}
          data-frame={frameId}
          disabled={Boolean(placedTile)}
        >
          {placedTile && <TileShape tile={TILES.find((t) => t.id === placedTile)} />}
        </button>
      </div>
    </div>
  );
}

export default function TileMatchActivity({ copy, onComplete }) {
  const [placed, setPlaced] = useState({}); // { frameId: tileId }
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ text: copy.text, tone: 'neutral' });
  const [shakeFrame, setShakeFrame] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tryPlace = (tileId, frameId) => {
    if (!tileId || !frameId || placed[frameId]) return;
    if (tileId !== frameId) {
      setMessage({ text: copy.wrong, tone: 'confused' });
      setShakeFrame(frameId);
      setTimeout(() => setShakeFrame(null), 450);
      setSelected(null);
      return;
    }
    const next = { ...placed, [frameId]: tileId };
    setPlaced(next);
    setSelected(null);
    if (Object.keys(next).length === TILES.length) {
      setMessage({ text: copy.done, tone: 'happy' });
      onComplete?.();
    } else {
      setMessage({ text: copy.match, tone: 'happy' });
    }
  };

  const placedTiles = new Set(Object.values(placed));

  return (
    <DndContext
      sensors={sensors}
      accessibility={{ announcements }}
      onDragEnd={({ active, over }) => tryPlace(active.id, over?.id)}
    >
      <div className={styles.activity}>
        <div className={styles.frames}>
          {FRAME_ORDER.map((id) => (
            <Frame
              key={id}
              frameId={id}
              placedTile={placed[id]}
              shake={shakeFrame === id}
              onPlace={(frameId) => tryPlace(selected, frameId)}
            />
          ))}
        </div>

        <div className={styles.tray} aria-label="Ubin yang belum dipasang">
          {TILES.filter((t) => !placedTiles.has(t.id)).map((t) => (
            <DraggableTile
              key={t.id}
              tile={t}
              selected={selected === t.id}
              onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
            />
          ))}
        </div>

        <p className={[styles.message, styles[message.tone]].join(' ')} role="status" aria-live="polite">
          {message.text}
        </p>
        {Object.keys(placed).length < TILES.length && <p className={styles.tapHint}>{copy.tapHint}</p>}
      </div>
    </DndContext>
  );
}
