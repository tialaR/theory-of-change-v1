'use client';

import styles from './tdm-sidebar.module.sass';

export function SidebarToggleIcon({
  direction,
  className
}: {
  direction: 'left' | 'right';
  className?: string;
}) {
  const gradientId = `sidebarToggleGradient-${direction}`;

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={[styles.sidebarToggleSvg, className].filter(Boolean).join(' ')}
      fill="none"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        fill={`url(#${gradientId})`}
        stroke="rgba(255, 255, 255, 0.14)"
        strokeWidth="1.5"
      />
      {direction === 'right' ? (
        <>
          <path d="M38 4V60" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
          <path
            d="M27 22L37 32L27 42"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d="M22 4V60" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
          <path
            d="M38 22L28 32L38 42"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <defs>
        <linearGradient id={gradientId} x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a2a2c" />
          <stop offset="1" stopColor="#141416" />
        </linearGradient>
      </defs>
    </svg>
  );
}
