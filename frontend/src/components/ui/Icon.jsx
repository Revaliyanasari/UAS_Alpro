// Set ikon garis (stroke) yang seragam untuk navigasi. Satu gaya: 24×24, garis 2 px, sudut membulat.
// Dipakai bersama label teks (ikon tidak pernah berdiri sendiri tanpa keterangan).
const PATHS = {
  more: <><circle cx="12" cy="5" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="19" r="1.6" fill="currentColor" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /><path d="M8 7h7M8 10h5" /></>,
  map: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /><path d="M12 8v4l3 2" /></>,
  game: <><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 10v5M4.5 12.5h5" /><circle cx="16" cy="11.5" r="1" fill="currentColor" /><circle cx="18.5" cy="14" r="1" fill="currentColor" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  puzzle: <path d="M8 3h4v2a2 2 0 1 0 4 0V3h3a2 2 0 0 1 2 2v3h-2a2 2 0 1 0 0 4h2v4a2 2 0 0 1-2 2h-4v-2a2 2 0 1 0-4 0v2H5a2 2 0 0 1-2-2v-4h2a2 2 0 1 0 0-4H3V5a2 2 0 0 1 2-2z" />,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" /><path d="M12 13v4M8 21h8M9 17h6" /></>,
  medal: <><circle cx="12" cy="15" r="5" /><path d="M8 3l2.5 7M16 3l-2.5 7" /><path d="M12 13v4" /></>,
  chart: <><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="8" width="3" height="9" /><rect x="17" y="5" width="3" height="12" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4 4 0 0 0 7 0" /><path d="M9 9.5h.01M15 9.5h.01" strokeWidth="3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  teacher: <><rect x="3" y="4" width="18" height="11" rx="2" /><path d="M7 19h10M12 15v4" /><path d="M7 9l3 2 5-4" /></>,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" />
      <circle cx="12" cy="12" r="7" />
    </>
  ),
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  play: <path d="M7 4l13 8-13 8z" />,
  speaker: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
};

export default function Icon({ name, size = 24, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? null}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);
