import { useState } from 'react';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import MathText from '../../components/ui/MathText.jsx';
import { pretty } from '../../components/ui/prettyMath.js';
import styles from './Activities.module.css';

/**
 * Papan sortir: kartu suku dipindah dari nampan ke keranjang.
 * Cara memindah (semua setara): seret kartu ke keranjang, ATAU ketuk kartu lalu ketuk keranjang
 * (juga bisa dengan Tab + Enter). Ketuk kartu di dalam keranjang untuk mengembalikannya.
 * Komponen ini hanya mengatur tampilan & pemindahan; penilaian dilakukan pemanggil.
 *
 * plain: kartu berisi kalimat biasa (aktivitas analisis tugas), bukan bentuk aljabar.
 * placement[i] = id keranjang untuk kartu ke-i, atau null bila masih di nampan.
 */
function Card({ index, expr, selected, onSelect, locked, plain }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `card-${index}`, disabled: locked });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...attributes}
      {...listeners}
      className={[styles.card, selected ? styles.cardSelected : '', isDragging ? styles.dragging : ''].join(' ')}
      onClick={() => onSelect(index)}
      disabled={locked}
      aria-pressed={selected}
      aria-label={`Kartu ${expr}`}
      data-card={index}
    >
      {plain ? pretty(expr) : <MathText>{expr}</MathText>}
    </button>
  );
}

function Bin({ bin, cards, onPlace, onReturn, locked, holding, plain }) {
  const { setNodeRef, isOver } = useDroppable({ id: `bin-${bin.id}` });
  return (
    <div
      ref={setNodeRef}
      className={[styles.bin, isOver ? styles.binOver : ''].join(' ')}
      onClick={() => !locked && onPlace(bin.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && !locked && onPlace(bin.id)}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={`Keranjang ${pretty(bin.label)}: ${cards.length} kartu`}
      data-bin={bin.id}
    >
      <span className={styles.binLabel}>{pretty(bin.label)}</span>
      <div className={styles.binCards}>
        {cards.map(({ expr, index }) => (
          <button
            key={index}
            type="button"
            className={styles.cardSmall}
            onClick={(e) => {
              e.stopPropagation();
              if (locked) return;
              // Sedang memegang kartu lain? Ketukan di dalam keranjang berarti "taruh di sini".
              if (holding) onPlace(bin.id);
              else onReturn(index);
            }}
            tabIndex={locked ? -1 : 0}
            aria-label={`Kembalikan kartu ${expr}`}
          >
            {plain ? pretty(expr) : <MathText>{expr}</MathText>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SortBoard({ items, bins, placement, onChange, locked = false, plain = false }) {
  const [selected, setSelected] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const move = (cardIndex, binId) => {
    if (locked || cardIndex === null || cardIndex === undefined) return;
    onChange(placement.map((p, i) => (i === cardIndex ? binId : p)));
    setSelected(null);
  };

  const trayCards = items.map((it, i) => ({ ...it, index: i })).filter((c) => placement[c.index] === null);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => over && move(Number(active.id.split('-')[1]), over.id.slice(4))}
    >
      <div className={styles.sortBoard}>
        <div className={styles.cardTray} aria-label="Nampan kartu">
          {trayCards.length === 0 ? (
            <span className={styles.trayEmpty}>Semua kartu sudah dipasang.</span>
          ) : (
            trayCards.map((c) => (
              <Card
                key={c.index}
                index={c.index}
                expr={c.expr}
                locked={locked}
                plain={plain}
                selected={selected === c.index}
                onSelect={(i) => setSelected((s) => (s === i ? null : i))}
              />
            ))
          )}
        </div>
        <div className={styles.bins}>
          {bins.map((b) => (
            <Bin
              key={b.id}
              bin={b}
              locked={locked}
              holding={selected !== null}
              plain={plain}
              cards={items.map((it, i) => ({ ...it, index: i })).filter((c) => placement[c.index] === b.id)}
              onPlace={(binId) => move(selected, binId)}
              onReturn={(i) => move(i, null)}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
