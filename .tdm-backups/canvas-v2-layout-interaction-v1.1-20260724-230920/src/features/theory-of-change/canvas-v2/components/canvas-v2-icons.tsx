import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />;
}

export const icons = {
  undo: <Icon><path d="M9 7 4 12l5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/></Icon>,
  redo: <Icon><path d="m15 7 5 5-5 5"/><path d="M19 12h-8a6 6 0 0 0-6 6"/></Icon>,
  save: <Icon><path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/></Icon>,
  expand: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></Icon>,
  collapse: <Icon><path d="m8 8-5-5M16 8l5-5M8 16l-5 5M16 16l5 5"/></Icon>,
  cursor: <Icon><path d="m5 3 14 8-6 2-2 6z"/></Icon>,
  connect: <Icon><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 11 8-4M8 13l8 4"/></Icon>,
  fit: <Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14"/></Icon>,
  close: <Icon><path d="m6 6 12 12M18 6 6 18"/></Icon>,
  chevron: <Icon><path d="m9 18 6-6-6-6"/></Icon>,
  trash: <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></Icon>,
  duplicate: <Icon><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></Icon>,
  history: <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></Icon>,
};
