import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import SpeechBubble from '../../components/ui/SpeechBubble.jsx';
import Tata from '../../components/tata/Tata.jsx';
import { moodFor } from '../../components/tata/tataMood.js';
import { sfx } from '../../audio/index.js';
import WorldBackground from '../welcome/WorldBackground.jsx';
import { useStudents } from '../../store/studentStore.js';
import { useProfile } from '../../store/profileStore.js';
import { validateIdentity, CLASS_SUGGESTIONS } from './identity.js';
import copy from '../../content/student.json';
import styles from './IdentityPage.module.css';

const FIELDS = ['fullName', 'nickname', 'className', 'school', 'absen'];

function Field({ id, icon, label, hint, error, optional, children }) {
  return (
    <div className={[styles.field, error ? styles.hasError : ''].join(' ')}>
      <label htmlFor={id} className={styles.label}>
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
        {label}
        {optional && <span className={styles.optional}> ({copy.identity.optional})</span>}
      </label>
      {children}
      <span id={`${id}-msg`} className={error ? styles.error : styles.hint} role={error ? 'alert' : undefined}>
        {error || hint}
      </span>
    </div>
  );
}

/**
 * Identitas siswa. Mode:
 *  - baru  : siswa pertama kali (atau ?baru=1 untuk siswa lain di perangkat yang sama)
 *  - ubah  : ?ubah=1 dan ada siswa aktif → mengubah identitas TANPA mengubah progres
 * Setelah tersimpan, TATA menyapa dengan nama panggilan.
 */
export default function IdentityPage() {
  // Tunggu data siswa terbaca dari perangkat dulu; kalau tidak, formulir "ubah" yang dibuka langsung
  // (mis. setelah muat ulang) akan terisi kosong.
  const ready = useStudents((s) => s.ready);
  return ready ? <IdentityForm /> : null;
}

function IdentityForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const active = useStudents((s) => s.students[s.activeId]);
  const { createStudent, updateActive } = useStudents();
  const editing = params.get('ubah') === '1' && Boolean(active);
  const [form, setForm] = useState(() =>
    editing
      ? { fullName: active.fullName, nickname: active.nickname, className: active.className, school: active.school, absen: active.absen ?? '' }
      : { fullName: '', nickname: '', className: '', school: '', absen: '' },
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(null); // nama panggilan setelah tersimpan
  const [busy, setBusy] = useState(false);
  const refs = useRef({});

  const set = (key, v) => {
    const next = { ...form, [key]: v };
    setForm(next);
    if (submitted) setErrors(validateIdentity(next).errors); // umpan balik langsung setelah percobaan pertama
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const r = validateIdentity(form);
    setErrors(r.errors);
    if (!r.ok) {
      const first = FIELDS.find((f) => r.errors[f]);
      refs.current[first]?.focus();
      return;
    }
    setBusy(true);
    if (editing) updateActive(r.value);
    else await createStudent(r.value);
    setBusy(false);
    setSaved(r.value.nickname);
    sfx('tataHello'); // TATA menyapa siswa
  };

  if (saved) {
    const onboarded = useProfile.getState().onboardingDone;
    return (
      <div className={styles.screen}>
        <WorldBackground variant="welcome" />
        <main className={styles.greet}>
          <SpeechBubble tone="happy">
            {(editing ? copy.identity.greetingEdit : copy.identity.greeting).replace('{name}', saved)}
          </SpeechBubble>
          <div className={styles.greetTata}>
            <Tata state={moodFor('welcome')} size="md" />
          </div>
          {editing ? (
            <Button block onClick={() => navigate('/profil')}>
              {copy.identity.back}
            </Button>
          ) : (
            <Button block onClick={() => navigate(onboarded ? '/peta' : '/mulai')}>
              {copy.identity.go}
            </Button>
          )}
        </main>
      </div>
    );
  }

  const describe = (id) => ({ 'aria-describedby': `${id}-msg`, 'aria-invalid': Boolean(errors[id]) });
  const c = copy.identity;

  return (
    <div className={styles.screen}>
      <WorldBackground variant="welcome" />
      <main className={styles.content}>
        <header className={styles.hello}>
          <div className={styles.helloTata}>
            <Tata state={editing ? 'talking' : moodFor('welcome')} size="md" />
          </div>
          <div>
            <h1 className={styles.title}>{editing ? c.titleEdit : c.titleNew}</h1>
            <SpeechBubble tail="left">{editing ? c.tataEdit : c.tataNew}</SpeechBubble>
          </div>
        </header>

        <form className={styles.card} onSubmit={submit} noValidate aria-label="Identitas siswa">
          <Field id="fullName" icon="🧒" label={c.fullName} hint={c.fullNameHint} error={errors.fullName}>
            <input
              id="fullName"
              ref={(el) => (refs.current.fullName = el)}
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              autoComplete="name"
              maxLength={60}
              {...describe('fullName')}
            />
          </Field>
          <Field id="nickname" icon="😊" label={c.nickname} hint={c.nicknameHint} error={errors.nickname}>
            <input
              id="nickname"
              ref={(el) => (refs.current.nickname = el)}
              value={form.nickname}
              onChange={(e) => set('nickname', e.target.value)}
              autoComplete="nickname"
              maxLength={20}
              {...describe('nickname')}
            />
          </Field>
          <Field id="className" icon="🏫" label={c.className} hint={c.classHint} error={errors.className}>
            <div className={styles.chips} role="group" aria-label="Pilihan kelas">
              {CLASS_SUGGESTIONS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={[styles.chip, form.className === k ? styles.chipOn : ''].join(' ')}
                  aria-pressed={form.className === k}
                  onClick={() => set('className', k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <input
              id="className"
              ref={(el) => (refs.current.className = el)}
              value={form.className}
              onChange={(e) => set('className', e.target.value)}
              placeholder="atau tulis, mis. VII G"
              maxLength={12}
              {...describe('className')}
            />
          </Field>
          <Field id="school" icon="📍" label={c.school} hint={c.schoolHint} error={errors.school}>
            <input
              id="school"
              ref={(el) => (refs.current.school = el)}
              value={form.school}
              onChange={(e) => set('school', e.target.value)}
              autoComplete="organization"
              maxLength={80}
              {...describe('school')}
            />
          </Field>
          <Field id="absen" icon="🔢" label={c.absen} hint={c.absenHint} error={errors.absen} optional>
            <input
              id="absen"
              ref={(el) => (refs.current.absen = el)}
              className={styles.short}
              value={form.absen}
              onChange={(e) => set('absen', e.target.value.replace(/\D/g, '').slice(0, 2))}
              inputMode="numeric"
              {...describe('absen')}
            />
          </Field>

          {submitted && Object.keys(errors).length > 0 && <p className={styles.summary}>{c.fixErrors}</p>}
          <Button type="submit" block disabled={busy}>
            {editing ? c.submitEdit : c.submitNew} {!editing && '🚀'}
          </Button>
          <p className={styles.privacy}>🔒 {c.privacy}</p>
          {editing && (
            <Button variant="ghost" block onClick={() => navigate('/profil')}>
              Batal
            </Button>
          )}
        </form>
      </main>
    </div>
  );
}
