import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type PublicIconButtonSharedProps = {
  'aria-label': string;
  children: ReactNode;
  className?: string;
};

export type PublicIconButtonAsButtonProps = PublicIconButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PublicIconButtonSharedProps | 'href' | 'aria-label'> & {
    href?: undefined;
  };

export type PublicIconButtonAsLinkProps = PublicIconButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof PublicIconButtonSharedProps | 'aria-label'> & {
    href: string;
  };

export type PublicIconButtonProps = PublicIconButtonAsButtonProps | PublicIconButtonAsLinkProps;
