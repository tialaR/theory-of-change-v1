import type { SVGProps } from 'react';

export type TdmIconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: TdmIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export function TdmArrowLeftIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
      <path d="M8.5 12H19" />
    </IconBase>
  );
}

export function TdmCloseIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="m6.5 6.5 11 11" />
      <path d="m17.5 6.5-11 11" />
    </IconBase>
  );
}

export function TdmDownloadIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v10" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
      <path d="M5 19h14" />
    </IconBase>
  );
}

export function TdmFileIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 3.5h7l4 4V20.5h-11z" />
      <path d="M13.5 3.5v4h4" />
      <path d="M9 12h6" />
      <path d="M9 15.5h6" />
    </IconBase>
  );
}

export function TdmImageIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m6.5 17 4.25-4.25 2.75 2.75 2-2 2 2" />
    </IconBase>
  );
}

export function TdmZoomInIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m14.75 14.75 4 4" />
      <path d="M10.5 8v5" />
      <path d="M8 10.5h5" />
    </IconBase>
  );
}

export function TdmZoomOutIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m14.75 14.75 4 4" />
      <path d="M8 10.5h5" />
    </IconBase>
  );
}

export function TdmCenterIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4H4v4" />
      <path d="M16 4h4v4" />
      <path d="M20 16v4h-4" />
      <path d="M8 20H4v-4" />
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  );
}

export function TdmResetIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 9V4.5L8.5 8" />
      <path d="M5.5 8a7 7 0 1 1-.25 7.5" />
    </IconBase>
  );
}

export function TdmPlusIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function TdmEyeIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 12s3.25-5.25 8.5-5.25S20.5 12 20.5 12 17.25 17.25 12 17.25 3.5 12 3.5 12Z" />
      <circle cx="12" cy="12" r="2.25" />
    </IconBase>
  );
}

export function TdmBookIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 4.5h5.25A2.75 2.75 0 0 1 13 7.25V20a3 3 0 0 0-3-3H5z" />
      <path d="M19 4.5h-3.25A2.75 2.75 0 0 0 13 7.25V20a3 3 0 0 1 3-3h3z" />
    </IconBase>
  );
}

export function TdmLoadingIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </IconBase>
  );
}

export function TdmAlertIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 2.75 20h18.5L12 3Z" />
      <path d="M12 9v5M12 17.25h.01" />
    </IconBase>
  );
}

export function TdmSearchIcon(props: TdmIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.25 16.25 4 4" />
      <path d="M8.5 9.25h5M8.5 12.25h3" />
    </IconBase>
  );
}
