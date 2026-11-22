// Musik latar ORISINAL Algebra Adventure, digubah sebagai data (nada MIDI) dan dimainkan oleh mesin Web Audio.
// Tanpa file audio: 0 KB aset, bebas hak cipta, berjalan offline.
// Setiap lagu = 4 birama × 8 ketukan (seperdelapan), diulang terus. null = diam.
//
// Suasana:
//  welcome : C mayor, 104 bpm — ceria & menyambut (melodi + pad + bass)
//  map     : D mayor, 116 bpm — petualangan energik (arpeggio, bass memantul, shaker, melodi)
//  lesson  : F mayor, 66 bpm  — tenang untuk konsentrasi (pad lembut + lonceng jarang, TANPA melodi)
//  quiz    : G mayor, 96 bpm  — ringan & menyemangati (petikan arpeggio + shaker halus, tanpa melodi)

const _ = null;

export const TRACKS = {
  welcome: {
    bpm: 104,
    level: 1,
    chords: [
      [60, 64, 67],
      [57, 60, 64],
      [57, 60, 65],
      [55, 59, 62],
    ],
    bass: [36, 33, 41, 43],
    bassPattern: [1, _, _, _, 1, _, 1, _],
    pad: true,
    arp: false,
    shaker: false,
    melody: [
      72, _, 76, 79, 81, _, 79, _,
      76, _, 72, _, 74, 76, _, _,
      77, _, 76, 74, 72, _, 74, _,
      74, _, 71, _, 67, _, _, _,
    ],
  },
  map: {
    bpm: 116,
    level: 0.9,
    chords: [
      [62, 66, 69],
      [59, 62, 66],
      [59, 62, 67],
      [57, 61, 64],
    ],
    bass: [38, 35, 43, 45],
    bassPattern: [1, _, 1, _, 1, _, 1, 1],
    pad: false,
    arp: true,
    shaker: true,
    melody: [
      74, _, 78, _, 81, _, 78, 81,
      83, _, 81, _, 78, _, 76, _,
      79, _, 78, 76, 74, _, 76, _,
      76, _, 78, _, 81, _, _, _,
    ],
  },
  lesson: {
    bpm: 66,
    level: 0.55, // mode fokus: lebih pelan dari lagu lain
    chords: [
      [53, 57, 60, 64],
      [50, 53, 57, 60],
      [46, 50, 53, 57],
      [48, 52, 55, 60],
    ],
    bass: [29, 26, 34, 36],
    bassPattern: [1, _, _, _, _, _, _, _],
    pad: true,
    arp: false,
    shaker: false,
    bell: [
      72, _, _, _, _, _, _, _,
      _, _, _, _, 69, _, _, _,
      70, _, _, _, _, _, _, _,
      _, _, _, _, 67, _, _, _,
    ],
    melody: null,
  },
  quiz: {
    bpm: 96,
    level: 0.7,
    chords: [
      [55, 59, 62],
      [52, 55, 59],
      [52, 55, 60],
      [54, 57, 62],
    ],
    bass: [43, 40, 36, 38],
    bassPattern: [1, _, _, _, 1, _, _, _],
    pad: false,
    arp: true,
    arpEvery: 2, // petikan tiap seperempat (lebih tenang dari peta)
    shaker: true,
    shakerSoft: true,
    melody: null,
  },
};

export const midiToFreq = (m) => 440 * 2 ** ((m - 69) / 12);
