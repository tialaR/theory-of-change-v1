import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export const icons = {
  back: <Icon><path d="m15 18-6-6 6-6" /></Icon>,
  save: <Icon><path d="M5 4h12l2 2v14H5z" /><path d="M8 4v6h8V4M8 20v-6h8v6" /></Icon>,
  history: <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></Icon>,
  undo: <Icon><path d="M9 7 4 12l5 5" /><path d="M4 12h9a6 6 0 0 1 6 6" /></Icon>,
  redo: <Icon><path d="m15 7 5 5-5 5" /><path d="M20 12h-9a6 6 0 0 0-6 6" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></Icon>,
  edit: <Icon><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z" /></Icon>,
  duplicate: <Icon><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></Icon>,
  trash: <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></Icon>,
  connect: <Icon><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="m8 11 8-4M8 13l8 4" /></Icon>,
  close: <Icon><path d="m6 6 12 12M18 6 6 18" /></Icon>,
  chevron: <Icon><path d="m9 18 6-6-6-6" /></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  zoomIn: <Icon><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M10 7v6M7 10h6" /></Icon>,
  zoomOut: <Icon><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M7 10h6" /></Icon>,
  fit: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></Icon>,
  columns: <Icon><rect x="3" y="5" width="5" height="14" rx="1" /><rect x="10" y="5" width="5" height="14" rx="1" /><rect x="17" y="5" width="4" height="14" rx="1" /></Icon>,
  center: <Icon><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3" /></Icon>,
  expand: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></Icon>,
  collapse: <Icon><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5" /></Icon>,
  guide: <Icon><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M8 20V7a3 3 0 0 0-3-3" /></Icon>,
  example: <Icon><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h5M7 12h10M7 16h7" /></Icon>,
  result: <Icon><path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-7" /></Icon>,
  risk: <Icon><path d="M12 3 2 20h20z" /><path d="M12 9v4M12 17h.01" /></Icon>,
  hypothesis: <Icon><path d="M9 18h6M10 22h4" /><path d="M8 14a6 6 0 1 1 8 0c-1.3.9-2 1.8-2 4h-4c0-2.2-.7-3.1-2-4Z" /></Icon>,
  menu: <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
};
