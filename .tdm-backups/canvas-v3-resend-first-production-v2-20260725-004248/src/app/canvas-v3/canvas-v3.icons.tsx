import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export const icons = {
  back: <Icon><path d="m15 18-6-6 6-6" /></Icon>,
  cursor: <Icon><path d="m5 3 14 8-6 2-2 6Z" /></Icon>,
  connect: <Icon><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="m8 11 8-4M8 13l8 4" /></Icon>,
  zoomIn: <Icon><circle cx="10" cy="10" r="6" /><path d="m14.5 14.5 5 5M10 7v6M7 10h6" /></Icon>,
  zoomOut: <Icon><circle cx="10" cy="10" r="6" /><path d="m14.5 14.5 5 5M7 10h6" /></Icon>,
  fit: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></Icon>,
  undo: <Icon><path d="M9 7 5 11l4 4" /><path d="M5 11h8a6 6 0 0 1 6 6" /></Icon>,
  redo: <Icon><path d="m15 7 4 4-4 4" /><path d="M19 11h-8a6 6 0 0 0-6 6" /></Icon>,
  save: <Icon><path d="M5 4h12l2 2v14H5Z" /><path d="M8 4v6h8V4M8 20v-6h8v6" /></Icon>,
  edit: <Icon><path d="m4 20 4-.8L18.7 8.5a2 2 0 0 0-2.8-2.8L5.2 16.4Z" /></Icon>,
  duplicate: <Icon><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></Icon>,
  trash: <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></Icon>,
  risk: <Icon><path d="M12 3 2.8 19h18.4Z" /><path d="M12 9v4M12 17h.01" /></Icon>,
  hypothesis: <Icon><path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .7-1.5 1.4-1.5 2.5h-4c0-1.1-.5-1.8-1.5-2.5Z" /></Icon>,
  close: <Icon><path d="m6 6 12 12M18 6 6 18" /></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r=".7" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r=".7" fill="currentColor" stroke="none" /></Icon>
};
