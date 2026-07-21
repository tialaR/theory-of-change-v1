import type { SVGProps } from 'react';

export type TdmContextLabelIconProps = SVGProps<SVGSVGElement>;

const DEFAULT_STROKE = 1.5;

function baseProps(props: TdmContextLabelIconProps): SVGProps<SVGSVGElement> {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: DEFAULT_STROKE,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props
  };
}

/** Eye — prévia / observação */
export function ContextLabelEyeIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

/** BookOpen — guia de aprendizado */
export function ContextLabelBookOpenIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 6.5c-1.8-1.2-3.9-1.8-6.2-1.8H4v13.2h2.2c2.2 0 4.1.5 5.8 1.6 1.7-1.1 3.6-1.6 5.8-1.6H20V4.7h-1.8c-2.3 0-4.4.6-6.2 1.8Z" />
      <path d="M12 6.5v12.7" />
    </svg>
  );
}

/** LayoutGrid — exemplos */
export function ContextLabelLayoutGridIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.25" />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.25" />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.25" />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.25" />
    </svg>
  );
}

/** PanelsTopLeft — prévia das experiências */
export function ContextLabelPanelsIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2" />
      <path d="M3.75 9.25h16.5" />
      <path d="M9.25 9.25v11" />
    </svg>
  );
}

/** FileText — resultado */
export function ContextLabelFileTextIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M7 3.75h7.25L19.25 8.75v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
      <path d="M14.25 3.75V8.5h4.75" />
      <path d="M8.5 12.25h7" />
      <path d="M8.5 15.75h5" />
    </svg>
  );
}

/** GitBranch — relações causais */
export function ContextLabelGitBranchIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="6.5" cy="5.5" r="2" />
      <circle cx="6.5" cy="18.5" r="2" />
      <circle cx="17.5" cy="12" r="2" />
      <path d="M6.5 7.5v9" />
      <path d="M6.5 10.5c0 3 3.5 4.5 9 4.5" />
    </svg>
  );
}

/** Workflow — fluxo */
export function ContextLabelWorkflowIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.75" y="4" width="6.5" height="5" rx="1.25" />
      <rect x="13.75" y="9.5" width="6.5" height="5" rx="1.25" />
      <rect x="3.75" y="15" width="6.5" height="5" rx="1.25" />
      <path d="M10.25 6.5h2.2c1.4 0 2.3.9 2.3 2.3v1.7" />
      <path d="M10.25 17.5h2.2c1.4 0 2.3-.9 2.3-2.3v-1.7" />
    </svg>
  );
}

/** Network — visão do fluxo */
export function ContextLabelNetworkIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="5" cy="12" r="2.25" />
      <circle cx="12" cy="5.5" r="2.25" />
      <circle cx="19" cy="12" r="2.25" />
      <circle cx="12" cy="18.5" r="2.25" />
      <path d="M6.9 10.6 10.1 6.9" />
      <path d="M13.9 6.9 17.1 10.6" />
      <path d="M17.1 13.4 13.9 17.1" />
      <path d="M10.1 17.1 6.9 13.4" />
    </svg>
  );
}

/** Library — referências */
export function ContextLabelLibraryIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 4.5v15" />
      <path d="M9.5 4.5v15" />
      <path d="M14 5.25 19.5 4v14.25L14 19.5Z" />
    </svg>
  );
}

/** Compass — por que usar / marca */
export function ContextLabelCompassIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1Z" />
    </svg>
  );
}

/** Sparkles — alternativa / destaque */
export function ContextLabelSparklesIcon(props: TdmContextLabelIconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3.5 13.2 8.3 18 9.5 13.2 10.7 12 15.5 10.8 10.7 6 9.5l4.8-1.2Z" />
      <path d="M18.5 14.5 19.1 16.6 21.2 17.2 19.1 17.8 18.5 19.9 17.9 17.8 15.8 17.2l2.1-.6Z" />
    </svg>
  );
}
