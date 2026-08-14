import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import styles from './tdm-surface.module.sass';

export type TdmSurfaceVariant = 'base' | 'raised' | 'elevated' | 'overlay' | 'interactive';
export type TdmSurfacePadding = 'none' | 'sm' | 'md' | 'lg';
export type TdmSurfaceRadius = 'sm' | 'md' | 'lg' | 'xl';

type TdmSurfaceTag = 'div' | 'section' | 'article' | 'aside';

const VARIANT_CLASS: Record<TdmSurfaceVariant, string> = {
  base: styles.variantBase,
  raised: styles.variantRaised,
  elevated: styles.variantElevated,
  overlay: styles.variantOverlay,
  interactive: styles.variantInteractive
};

const PADDING_CLASS: Record<TdmSurfacePadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg
};

const RADIUS_CLASS: Record<TdmSurfaceRadius, string> = {
  sm: styles.radiusSm,
  md: styles.radiusMd,
  lg: styles.radiusLg,
  xl: styles.radiusXl
};

const ALLOWED_TAGS = new Set<TdmSurfaceTag>(['div', 'section', 'article', 'aside']);

export type TdmSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: TdmSurfaceTag;
  variant?: TdmSurfaceVariant;
  padding?: TdmSurfacePadding;
  radius?: TdmSurfaceRadius;
  children?: ReactNode;
};

export function TdmSurface({
  as = 'div',
  variant = 'base',
  padding = 'md',
  radius = 'md',
  className = '',
  children,
  ...props
}: TdmSurfaceProps) {
  const Tag = (ALLOWED_TAGS.has(as) ? as : 'div') as ElementType;

  return (
    <Tag
      className={[
        styles.surface,
        VARIANT_CLASS[variant],
        PADDING_CLASS[padding],
        RADIUS_CLASS[radius],
        className
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
