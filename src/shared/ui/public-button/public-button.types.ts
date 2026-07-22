import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode
} from 'react';

export type PublicButtonVariant = 'primary' | 'text' | 'textCompact' | 'exportCompact';

export type PublicButtonSize = 'default' | 'hero';

type PublicButtonSharedProps = {
  variant?: PublicButtonVariant;
  size?: PublicButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
};

export type PublicButtonAsButtonProps = PublicButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PublicButtonSharedProps | 'href'> & {
    href?: undefined;
  };

export type PublicButtonAsLinkProps = PublicButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof PublicButtonSharedProps> & {
    href: string;
  };

export type PublicButtonProps = PublicButtonAsButtonProps | PublicButtonAsLinkProps;
