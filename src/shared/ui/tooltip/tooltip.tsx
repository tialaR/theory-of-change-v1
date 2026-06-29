import { HTMLAttributes, ReactNode } from 'react';

export function Tooltip({ children, title, ...props }: HTMLAttributes<HTMLSpanElement> & { title: ReactNode }) {
  return (
    <span title={typeof title === 'string' ? title : undefined} {...props}>
      {children}
    </span>
  );
}
