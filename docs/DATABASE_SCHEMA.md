# Skema Database — Algebra Adventure

> Supabase (PostgreSQL, free tier). Revisi 12 Nov 2026: disederhanakan untuk uji coba terbatas — siswa memakai **auth anonim** (tanpa email/PIN), guru memakai email. Struktur IndexedDB di perangkat sejajar dengan tabel ini.

## 1. Diagram relasi

```
teachers 1───* classes 1───* students 1───* world_progress
                                  │  1───* activity_log
                                  │  1───* quiz_attempts
                                  │  1───* test_attempts 1───* test_responses 1───* step_scores
                                                                                     └── score_audit
rubric_steps (data rubrik terkunci, dirujuk oleh step_scores)
```

## 2. Tabel

**teachers** — id uuid PK (= `auth.users.id`), display_name text, created_at timestamptz.

**classes**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| teacher_id | uuid FK → teachers | |
| name | text | mis. "VII-A" |
| join_code | text unique | 6 karakter untuk siswa |
| pretest_required | boolean | default true |
| instrument_version | text | mis. `versi-b-rev1` |
| created_at | timestamptz | |

**students**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| class_id | uuid FK → classes | |
| auth_uid | uuid unique null | `auth.uid()` sesi anonim; dapat ditautkan ulang oleh guru |
| student_code | text | mis. "S01"; UNIQUE(class_id, student_code) |
| nickname | text null | nama panggilan, **bukan nama lengkap** |
| consent_confirmed | boolean | persetujuan wali dicatat guru |
| created_at | timestamptz | |

**world_progress** — PK (student_id, world_id); phase text; stars smallint 0–3; xp int; completed_at; updated_at.

**activity_log** (ringkas, untuk analisis penggunaan petunjuk)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| client_id | uuid PK | dibuat di perangkat → upsert idempoten |
| student_id | uuid FK | |
| item_id | text | mis. `w2-latihan-04` |
| event | text | `attempt`, `hint_opened`, `check_multiply`, `solved`, `solution_viewed` |
| detail | jsonb | mis. `{"hintLevel":2,"errorCode":"M1"}` |
| created_at | timestamptz | waktu di perangkat |

**quiz_attempts** — client_id PK, student_id, world_id, score, max_score, answers jsonb, finished_at.

**rubric_steps** (diisi dari dokumen instrumen yang disetujui; tidak dapat diubah aplikasi)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | text PK | mis. `versi-b-rev1:3:T2` |
| instrument_version | text | |
| item_no | smallint | 1–4 |
| step_no | smallint | |
| indicator | text | |
| description | text | |
| max_points | smallint | 1 atau 2 |

**test_attempts**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | dibuat di perangkat |
| student_id | uuid FK | |
| kind | text | `pretest` / `posttest`; UNIQUE(student_id, kind) |
| instrument_version | text | |
| started_at, submitted_at | timestamptz | |
| status | text | `in_progress` → `submitted` → `graded` |

**test_responses** — id uuid PK, attempt_id FK, item_no smallint, answer_text text, updated_at. Tidak dapat diubah setelah status `submitted` (dicek oleh RLS/trigger).

**step_scores**
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| response_id | uuid FK | PK (response_id, step_id) |
| step_id | text FK → rubric_steps | |
| points | smallint | trigger: 0 ≤ points ≤ rubric_steps.max_points |
| graded_by | uuid FK → teachers | |
| graded_at | timestamptz | |

**score_audit** — id, response_id, step_id, old_points, new_points, changed_by, changed_at (diisi otomatis oleh trigger).

## 3. Fungsi SQL (SECURITY DEFINER)

| Fungsi | Kegunaan |
|--------|----------|
| `join_class(join_code, student_code, nickname)` | Memvalidasi kode kelas; membuat/menolak siswa (kode siswa sudah dipakai sesi lain → ditolak, guru yang menautkan ulang) |
| `submit_test(attempt_id)` | Mengunci tes milik pemanggil |
| `relink_student(student_id)` | Hanya guru: melepas `auth_uid` lama agar siswa dapat bergabung lagi |

## 4. View laporan

- **v_test_results:** per siswa per tes — skor soal 1–4 (= skor indikator), total (maks 24), nilai = total/24 × 100, status.
- **v_ngain:** pretest_total, posttest_total, n_gain = (post − pre)/(24 − pre), NULL jika pre = 24.

## 5. Row Level Security

| Tabel | Siswa (sesi anonim) | Guru |
|-------|---------------------|------|
| students | baca baris sendiri | baca/ubah siswa di kelasnya |
| world_progress, activity_log, quiz_attempts | baca/tulis milik sendiri | baca kelasnya |
| test_attempts, test_responses | tulis milik sendiri selama `in_progress`; baca milik sendiri | baca kelasnya |
| step_scores, score_audit | baca skor sendiri jika status `graded` | tulis/baca kelasnya |
| rubric_steps | baca | baca |
| classes, teachers | — | milik sendiri |

Uji wajib: siswa A tidak dapat membaca data siswa B; pengguna tanpa sesi tidak dapat membaca apa pun (TESTING_PLAN SC-02, SC-03).

## 6. Penyimpanan lokal (IndexedDB)

| Kunci | Isi |
|-------|-----|
| `profile` | nickname, kode kelas/siswa, pengaturan audio & animasi |
| `progress` | world_progress + badge |
| `activity` | activity_log (maks 2.000 terakhir) |
| `quiz` | quiz_attempts |
| `tests` | test_attempts + responses (draf tersimpan otomatis) |
| `syncQueue` | item yang belum terkirim |

Tombol **Ekspor cadangan** (JSON/CSV) tersedia di pengaturan agar data tes tetap bisa diambil walau server tidak dapat dijangkau.
