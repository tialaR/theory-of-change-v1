import type { ReactNode } from 'react';

function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const previewIcons = {
  add: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  undo: <Icon><path d="M9 7 4 12l5 5" /><path d="M4 12h9a7 7 0 0 1 7 7" /></Icon>,
  redo: <Icon><path d="m15 7 5 5-5 5" /><path d="M20 12h-9a7 7 0 0 0-7 7" /></Icon>,
  save: <Icon><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></Icon>,
  connect: <Icon><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.9 7.2-3.7M8.3 13.1l7.2 3.7" /></Icon>,
  history: <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></Icon>,
  close: <Icon><path d="m6 6 12 12M18 6 6 18" /></Icon>,
  chevron: <Icon><path d="m9 6 6 6-6 6" /></Icon>,
  check: <Icon><path d="m5 12 4 4L19 6" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></Icon>,
  zoomIn: <Icon><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4M11 8v6M8 11h6" /></Icon>,
  zoomOut: <Icon><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4M8 11h6" /></Icon>,
  fit: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></Icon>,
  collapse: <Icon><path d="m8 10 4 4 4-4" /></Icon>,
  expand: <Icon><path d="m8 14 4-4 4 4" /></Icon>,
  cursor: <Icon><path d="m5 3 14 8-6 2-2 6Z" /></Icon>,
  lock: <Icon><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>,
  edit: <Icon><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>,
  duplicate: <Icon><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></Icon>,
  trash: <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></Icon>,
  cancel: <Icon><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></Icon>
};
