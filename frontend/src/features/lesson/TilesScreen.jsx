import { useState } from 'react';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import MathText from '../../components/ui/MathText.jsx';
import Button from '../../components/ui/Button.jsx';
import TataCoach from './TataCoach.jsx';
import { lessonCopy } from '../../content/lessons/index.js';
import styles from './Tiles.module.css';

/**
 * Algebra Tiles (World 2) dengan dua mode:
 *  - 'groups': bagi ubin sama rata ke beberapa kotak → menemukan faktor angka, mis. 4(2x² + 3x).
 *  - 'rows'  : susun ubin menjadi baris-baris setinggi x → persegi panjang 4x × (2x + 3) = 4x(2x + 3).
 * Memindah ubin: seret dari nampan ke kotak/baris, ATAU ketuk jenis ubin lalu ketuk kotak.
 * Ketuk ubin yang sudah dipasang untuk mengembalikannya ke nampan.
 */
const KINDS = { x2: 'x^2', x: 'x' };

function TrayTile({ kind, left, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: kind, disabled: left === 0 });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...attributes}
      {...listeners}
      className={[styles.trayItem, selected ? styles.selected : '', isDragging ? styles.dragging : ''].join(' ')}
      onClick={() => onSelect(kind)}
      disabled={left === 0}
      aria-pressed={selected}
      aria-label={`Ubin ${kind === 'x2' ? 'x kuadrat' : 'x'}, sisa ${left}`}
      data-tray={kind}
    >
      <span className={styles[`t-${kind}`]}>
        <MathText>{KINDS[kind]}</MathText>
      </span>
      <span className={styles.count}>× {left}</span>
    </button>
  );
}

function Lane({ index, mode, content, onPlace, onRemove, locked }) {
  const { setNodeRef, isOver } = useDroppable({ id: `lane-${index}` });
  const tiles = [...Array(content.x2).fill('x2'), ...Array(content.x).fill('x')];
  return (
    <div
      ref={setNodeRef}
      className={[styles.lane, styles[mode], isOver ? styles.over : ''].join(' ')}
      onClick={() => !locked && onPlace(index)}
      role="button"
      tabIndex={locked ? -1 : 0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !locked && onPlace(index)}
      aria-label={`${mode === 'rows' ? 'Baris' : 'Kotak'} ${index + 1}: ${content.x2} ubin x kuadrat dan ${content.x} ubin x`}
      data-lane={index}
    >
      {tiles.map((k, i) => (
        <button
          key={`${k}-${i}`}
          type="button"
          className={styles[`t-${k}`]}
          onClick={(e) => {
            e.stopPropagation();
            if (!locked) onRemove(index, k);
          }}
          aria-label={`Kembalikan ubin ${k === 'x2' ? 'x kuadrat' : 'x'}`}
          tabIndex={locked ? -1 : 0}
        />
      ))}
    </div>
  );
}

export default function TilesScreen({ screen, onDone }) {
  const empty = () => Array.from({ length: screen.count }, () => ({ x2: 0, x: 0 }));
  const [lanes, setLanes] = useState(empty);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState({ text: screen.prompt, tone: 'neutral' });
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const used = (k) => lanes.reduce((s, l) => s + l[k], 0);
  const left = { x2: screen.x2 - used('x2'), x: screen.x - used('x') };

  const place = (kind, laneIndex) => {
    if (done || !kind || left[kind] === 0) return;
    setLanes((ls) => ls.map((l, i) => (i === laneIndex ? { ...l, [kind]: l[kind] + 1 } : l)));
    if (left[kind] === 1) setSelected(null);
  };
  const remove = (laneIndex, kind) =>
    setLanes((ls) => ls.map((l, i) => (i === laneIndex ? { ...l, [kind]: l[kind] - 1 } : l)));

  const check = () => {
    if (left.x2 + left.x > 0) {
      setFirstTry(false);
      return setMsg({ text: lessonCopy.needAll, tone: 'confused' });
    }
    const same = lanes.every((l) => l.x2 === lanes[0].x2 && l.x === lanes[0].x);
    if (!same) {
      setFirstTry(false);
      return setMsg({ text: lessonCopy.notEqual, tone: 'confused' });
    }
    const { x2, x } = lanes[0];
    const inner = `${x2 === 1 ? '' : x2}${screen.mode === 'rows' ? 'x' : 'x²'} + ${x}${screen.mode === 'rows' ? '' : 'x'}`;
    setDone(true);
    setMsg({ text: screen.done.replaceAll('{inner}', inner), tone: 'happy' });
    onDone({ firstTry });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={({ active, over }) => over && place(active.id, Number(over.id.split('-')[1]))}>
      <div className={styles.board}>
        <div className={styles.tray} aria-label="Nampan ubin">
          {Object.keys(KINDS).map((k) => (
            <TrayTile key={k} kind={k} left={left[k]} selected={selected === k} onSelect={(id) => setSelected((c) => (c === id ? null : id))} />
          ))}
        </div>
        <div className={[styles.lanes, styles[`lanes-${screen.mode}`]].join(' ')}>
          {lanes.map((l, i) => (
            <Lane key={i} index={i} mode={screen.mode} content={l} locked={done} onPlace={(idx) => place(selected, idx)} onRemove={remove} />
          ))}
        </div>
        {!done && (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setLanes(empty())}>
              Ulang
            </Button>
            <Button onClick={check}>Periksa susunan</Button>
          </div>
        )}
        <TataCoach message={msg.text} tone={msg.tone} />
      </div>
    </DndContext>
  );
}
